# fl_client.py
# ============================================================
# Federated Learning Client with Differential Privacy
# Each client represents an institution training on local data
# ============================================================

import flwr as fl
import torch
import torch.nn.functional as F
from torch_geometric.loader import DataLoader
import numpy as np

from models.gnn import AdmissionGNN, kg_to_pyg_data
from kg.builder import KGBuilder
from privacy_config import PRIVACY_CONFIG, INSTITUTIONS, FL_CONFIG

# Try to import Opacus for differential privacy
try:
    from opacus import PrivacyEngine
    from opacus.utils.batch_memory_manager import BatchMemoryManager
    OPACUS_AVAILABLE = True
except ImportError:
    OPACUS_AVAILABLE = False
    print("⚠️ Opacus not installed. Running without differential privacy.")


class StudentClient(fl.client.NumPyClient):
    """
    Federated learning client for an institution.
    Trains on local student data with optional differential privacy.
    """
    
    def __init__(self, client_id, institution=None):
        self.client_id = client_id
        self.institution = institution or INSTITUTIONS[client_id % len(INSTITUTIONS)]
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        print(f"🏛️ Client {client_id} ({self.institution}) initializing...")
        
        self.kg = KGBuilder()
        
        # Load institution-specific data
        self.train_loader, self.val_loader = self.prepare_data()
        
        # Infer input feature dimension
        sample = next(iter(self.train_loader))
        num_features = sample.x.shape[1]
        
        # Initialize model
        self.model = AdmissionGNN(
            num_features=num_features,
            hidden_dim=128,
            num_classes=1,
        ).to(self.device)
        
        # Optimizer (will be wrapped by PrivacyEngine if DP enabled)
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=0.01)
        
        # Differential Privacy setup
        self.dp_enabled = PRIVACY_CONFIG["enabled"] and OPACUS_AVAILABLE
        self.epsilon_spent = 0.0
        
        if self.dp_enabled:
            self._setup_differential_privacy()
    
    def _setup_differential_privacy(self):
        """Initialize Opacus PrivacyEngine for DP-SGD."""
        self.privacy_engine = PrivacyEngine()
        
        # Make model, optimizer, and data loader private
        self.model, self.optimizer, self.train_loader = self.privacy_engine.make_private(
            module=self.model,
            optimizer=self.optimizer,
            data_loader=self.train_loader,
            noise_multiplier=PRIVACY_CONFIG["noise_multiplier"],
            max_grad_norm=PRIVACY_CONFIG["max_grad_norm"],
        )
        
        print(f"🔒 DP enabled for {self.institution}: ε={PRIVACY_CONFIG['target_epsilon']}, δ={PRIVACY_CONFIG['target_delta']}")
    
    def prepare_data(self):
        """Load data from KG, filtered by institution if possible."""
        with self.kg.driver.session() as session:
            # Try to filter by institution
            query = self.kg.get_graph_embedding_query(institution=self.institution)
            result = session.run(query)
            data_list = kg_to_pyg_data(list(result))
        
        if len(data_list) == 0:
            # Fallback: load all data if institution filter returns empty
            with self.kg.driver.session() as session:
                result = session.run(self.kg.get_graph_embedding_query())
                data_list = kg_to_pyg_data(list(result))
        
        if len(data_list) == 0:
            raise ValueError(f"No data returned from KG for {self.institution}")
        
        n = len(data_list)
        perm = torch.randperm(n)
        
        train_size = int(0.7 * n)
        val_size = int(0.15 * n)
        
        train_data = [data_list[i] for i in perm[:train_size]]
        val_data = [data_list[i] for i in perm[train_size:train_size + val_size]]
        
        print(f"📊 {self.institution}: {len(train_data)} train, {len(val_data)} val samples")
        
        return (
            DataLoader(train_data, batch_size=FL_CONFIG["batch_size"], shuffle=True),
            DataLoader(val_data, batch_size=FL_CONFIG["batch_size"]),
        )
    
    def get_parameters(self, config):
        """Return model parameters as numpy arrays."""
        return [p.cpu().detach().numpy() for p in self.model.parameters()]
    
    def set_parameters(self, parameters):
        """Set model parameters from numpy arrays."""
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v).to(self.device) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=False)
    
    def fit(self, parameters, config):
        """Train on local data with differential privacy."""
        self.set_parameters(parameters)
        self.model.train()
        
        num_epochs = config.get("local_epochs", 3)
        total_loss = 0.0
        num_batches = 0
        
        for epoch in range(num_epochs):
            for batch in self.train_loader:
                batch = batch.to(self.device)
                
                self.optimizer.zero_grad()
                out = self.model(
                    batch.x,
                    batch.edge_index,
                    batch.batch,
                    batch.pairs,
                )
                
                loss = F.binary_cross_entropy(out, batch.y)
                loss.backward()
                self.optimizer.step()
                
                total_loss += loss.item()
                num_batches += 1
        
        # Calculate epsilon spent (if DP enabled)
        metrics = {
            "institution": self.institution,
            "loss": total_loss / max(num_batches, 1),
        }
        
        if self.dp_enabled:
            self.epsilon_spent = self.privacy_engine.get_epsilon(
                delta=PRIVACY_CONFIG["target_delta"]
            )
            metrics["epsilon"] = self.epsilon_spent
            print(f"🔐 {self.institution}: ε = {self.epsilon_spent:.2f}")
        
        return self.get_parameters({}), len(self.train_loader.dataset), metrics
    
    def evaluate(self, parameters, config):
        """Evaluate model on validation data."""
        self.set_parameters(parameters)
        self.model.eval()
        
        correct, total = 0, 0
        total_loss = 0.0
        
        with torch.no_grad():
            for batch in self.val_loader:
                batch = batch.to(self.device)
                out = self.model(
                    batch.x,
                    batch.edge_index,
                    batch.batch,
                    batch.pairs,
                )
                
                loss = F.binary_cross_entropy(out, batch.y)
                total_loss += loss.item()
                
                pred = (out > 0.5).float()
                correct += (pred == batch.y).sum().item()
                total += batch.y.size(0)
        
        acc = correct / max(total, 1)
        avg_loss = total_loss / max(len(self.val_loader), 1)
        
        return avg_loss, total, {
            "accuracy": acc,
            "institution": self.institution,
        }
