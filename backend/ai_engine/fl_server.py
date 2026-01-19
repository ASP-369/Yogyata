# fl_server.py
# ============================================================
# Federated Learning Server with Privacy-Aware Aggregation
# ============================================================

import flwr as fl
import numpy as np
from typing import List, Tuple, Optional, Dict
from flwr.common import Parameters, Scalar, FitRes, EvaluateRes
from flwr.server.client_proxy import ClientProxy

from privacy_config import FL_CONFIG, INSTITUTIONS


class PrivacyAwareFedAvg(fl.server.strategy.FedAvg):
    """
    FedAvg strategy with privacy budget tracking and per-institution metrics.
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.round_metrics = []
        self.institution_epsilon = {inst: 0.0 for inst in INSTITUTIONS}
    
    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, FitRes]],
        failures: List[BaseException],
    ) -> Tuple[Optional[Parameters], Dict[str, Scalar]]:
        """Aggregate model updates and track privacy metrics."""
        
        if not results:
            return None, {}
        
        # Log per-client metrics
        print(f"\n📊 Round {server_round} Results:")
        print("-" * 50)
        
        round_data = {"round": server_round, "clients": []}
        
        for client_proxy, fit_res in results:
            metrics = fit_res.metrics or {}
            institution = metrics.get("institution", "Unknown")
            epsilon = metrics.get("epsilon", "N/A")
            loss = metrics.get("loss", "N/A")
            
            if isinstance(epsilon, float):
                self.institution_epsilon[institution] = epsilon
            
            client_info = {
                "institution": institution,
                "epsilon": epsilon,
                "loss": loss,
                "samples": fit_res.num_examples,
            }
            round_data["clients"].append(client_info)
            
            print(f"  🏛️ {institution:15} | ε: {epsilon if isinstance(epsilon, str) else f'{epsilon:.2f}':>6} | Loss: {loss if isinstance(loss, str) else f'{loss:.4f}':>8} | Samples: {fit_res.num_examples}")
        
        self.round_metrics.append(round_data)
        print("-" * 50)
        
        # Standard FedAvg aggregation
        aggregated_parameters, metrics = super().aggregate_fit(
            server_round, results, failures
        )
        
        # Save global model
        if aggregated_parameters is not None:
            print(f"💾 Saving global model at round {server_round}")
            np.savez(
                "fl_global_model.npz",
                *fl.common.parameters_to_ndarrays(aggregated_parameters)
            )
        
        # Add aggregated metrics
        metrics["avg_epsilon"] = np.mean([
            c["epsilon"] for c in round_data["clients"] 
            if isinstance(c["epsilon"], float)
        ]) if any(isinstance(c["epsilon"], float) for c in round_data["clients"]) else 0.0
        
        return aggregated_parameters, metrics
    
    def aggregate_evaluate(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, EvaluateRes]],
        failures: List[BaseException],
    ) -> Tuple[Optional[float], Dict[str, Scalar]]:
        """Aggregate evaluation results."""
        
        if not results:
            return None, {}
        
        # Calculate global accuracy
        total_correct = 0
        total_samples = 0
        
        for _, eval_res in results:
            metrics = eval_res.metrics or {}
            accuracy = metrics.get("accuracy", 0.0)
            total_correct += accuracy * eval_res.num_examples
            total_samples += eval_res.num_examples
        
        global_acc = total_correct / max(total_samples, 1)
        
        print(f"\n🎯 Round {server_round} Evaluation:")
        print(f"   Global Accuracy: {global_acc:.2%}")
        
        return global_acc, {"accuracy": global_acc}


def create_strategy():
    """Create FL strategy with privacy-aware aggregation."""
    return PrivacyAwareFedAvg(
        fraction_fit=FL_CONFIG["fraction_fit"],
        fraction_evaluate=FL_CONFIG["fraction_evaluate"],
        min_fit_clients=FL_CONFIG["min_clients"],
        min_evaluate_clients=FL_CONFIG["min_clients"],
        min_available_clients=FL_CONFIG["min_clients"],
    )


if __name__ == "__main__":
    print(f"🌸 Starting Flower Server...")
    print(f"   Address: {FL_CONFIG['server_address']}")
    print(f"   Rounds: {FL_CONFIG['num_rounds']}")
    print(f"   Institutions: {', '.join(INSTITUTIONS)}")
    
    fl.server.start_server(
        server_address=FL_CONFIG["server_address"],
        config=fl.server.ServerConfig(num_rounds=FL_CONFIG["num_rounds"]),
        strategy=create_strategy(),
    )
