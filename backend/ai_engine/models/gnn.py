# models/gnn.py
# ============================================================
# Hybrid Recommendation Model: GNN + Collaborative + Content-Based
# ============================================================

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, GATConv, global_mean_pool
from torch_geometric.data import Data


class AdmissionGNN(nn.Module):
    """
    Graph Neural Network for student-college matching.
    Uses GCN layers to learn node embeddings from the KG structure.
    """
    
    def __init__(self, num_features, hidden_dim=128, num_classes=1):
        super().__init__()
        
        self.conv1 = GCNConv(num_features, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, hidden_dim)
        
        # graph_emb + pair_emb
        self.lin1 = nn.Linear(hidden_dim * 2, hidden_dim)
        self.lin2 = nn.Linear(hidden_dim, num_classes)
    
    def forward(self, x, edge_index, batch, student_college_pairs):
        # GNN layers
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.2, training=self.training)
        x = F.relu(self.conv2(x, edge_index))
        
        # Graph embedding
        graph_emb = global_mean_pool(x, batch)
        
        # Fix pair shape
        if student_college_pairs.dim() == 1:
            student_college_pairs = student_college_pairs.unsqueeze(0)
        
        if student_college_pairs.size(0) != graph_emb.size(0):
            student_college_pairs = student_college_pairs.repeat(graph_emb.size(0), 1)
        
        # Combine
        combined = torch.cat([graph_emb, student_college_pairs], dim=1)
        
        x = F.relu(self.lin1(combined))
        x = torch.sigmoid(self.lin2(x))
        
        return x.squeeze(-1)
    
    def get_embeddings(self, x, edge_index, batch):
        """Get graph embeddings for explainability."""
        x = F.relu(self.conv1(x, edge_index))
        x = F.relu(self.conv2(x, edge_index))
        return global_mean_pool(x, batch)


class HybridRecommender(nn.Module):
    """
    Hybrid Recommendation Engine combining:
    1. GNN-based graph learning
    2. Collaborative filtering (latent factors)
    3. Content-based skill matching
    """
    
    def __init__(self, gnn_model, num_colleges=7, num_skills=6, embed_dim=64):
        super().__init__()
        
        self.gnn = gnn_model
        self.num_colleges = num_colleges
        self.num_skills = num_skills
        
        # Collaborative Filtering: college embeddings
        self.college_embed = nn.Embedding(num_colleges, embed_dim)
        
        # Content-Based: skill matching layer
        self.skill_encoder = nn.Sequential(
            nn.Linear(num_skills, embed_dim),
            nn.ReLU(),
            nn.Linear(embed_dim, embed_dim),
        )
        
        # Attention weights for hybrid combination
        self.attention = nn.Sequential(
            nn.Linear(embed_dim * 3, 3),
            nn.Softmax(dim=-1),
        )
        
        # Final scoring layer
        self.scorer = nn.Sequential(
            nn.Linear(embed_dim * 3, embed_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(embed_dim, 1),
            nn.Sigmoid(),
        )
    
    def forward(self, x, edge_index, batch, pairs, college_ids, skill_vector):
        """
        Args:
            x: Node features
            edge_index: Graph edges
            batch: Batch indices
            pairs: Student-college pair embeddings
            college_ids: Target college indices [batch_size]
            skill_vector: Binary skill vectors [batch_size, num_skills]
        """
        # 1. GNN component
        gnn_emb = self.gnn.get_embeddings(x, edge_index, batch)
        
        # 2. Collaborative component
        collab_emb = self.college_embed(college_ids)
        
        # 3. Content-based component
        content_emb = self.skill_encoder(skill_vector)
        
        # Combine with attention
        combined = torch.cat([gnn_emb, collab_emb, content_emb], dim=1)
        
        # Get attention weights
        attn_weights = self.attention(combined)
        
        # Weighted combination
        gnn_weighted = gnn_emb * attn_weights[:, 0:1]
        collab_weighted = collab_emb * attn_weights[:, 1:2]
        content_weighted = content_emb * attn_weights[:, 2:3]
        
        hybrid_emb = torch.cat([gnn_weighted, collab_weighted, content_weighted], dim=1)
        
        # Final score
        score = self.scorer(hybrid_emb)
        
        return score.squeeze(-1), attn_weights
    
    def get_component_scores(self, x, edge_index, batch, pairs, college_ids, skill_vector):
        """Get individual component scores for explainability."""
        gnn_emb = self.gnn.get_embeddings(x, edge_index, batch)
        collab_emb = self.college_embed(college_ids)
        content_emb = self.skill_encoder(skill_vector)
        
        combined = torch.cat([gnn_emb, collab_emb, content_emb], dim=1)
        attn_weights = self.attention(combined)
        
        return {
            "gnn_weight": attn_weights[:, 0].item() if attn_weights.size(0) == 1 else attn_weights[:, 0].tolist(),
            "collaborative_weight": attn_weights[:, 1].item() if attn_weights.size(0) == 1 else attn_weights[:, 1].tolist(),
            "content_weight": attn_weights[:, 2].item() if attn_weights.size(0) == 1 else attn_weights[:, 2].tolist(),
        }


class SkillGapAnalyzer(nn.Module):
    """
    Analyzes skill gaps between student and college requirements.
    Provides contribution scores per skill.
    """
    
    def __init__(self, num_skills=6, hidden_dim=32):
        super().__init__()
        
        self.skill_names = ["Python", "ML", "DS", "React", "Docker", "AWS"]
        
        # Per-skill importance weights (learnable)
        self.skill_importance = nn.Parameter(torch.ones(num_skills))
        
        # Gap analyzer
        self.gap_net = nn.Sequential(
            nn.Linear(num_skills * 2, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, num_skills),
            nn.Sigmoid(),
        )
    
    def forward(self, student_skills, college_requirements):
        """
        Args:
            student_skills: Binary tensor [batch, num_skills]
            college_requirements: Binary tensor [batch, num_skills]
        
        Returns:
            gap_scores: Per-skill gap importance [batch, num_skills]
            match_score: Overall match score [batch]
        """
        # Direct skill overlap
        overlap = student_skills * college_requirements
        
        # Skills student has but college doesn't require
        surplus = student_skills * (1 - college_requirements)
        
        # Skills college requires but student lacks
        gaps = (1 - student_skills) * college_requirements
        
        # Combine for analysis
        combined = torch.cat([student_skills, college_requirements], dim=1)
        gap_importance = self.gap_net(combined)
        
        # Weighted match score
        weighted_overlap = (overlap * self.skill_importance).sum(dim=1)
        weighted_requirement = (college_requirements * self.skill_importance).sum(dim=1)
        match_score = weighted_overlap / (weighted_requirement + 1e-6)
        
        return gap_importance, match_score, {
            "overlap": overlap,
            "surplus": surplus,
            "gaps": gaps,
        }
    
    def explain_gaps(self, student_skills, college_requirements):
        """Generate human-readable skill gap explanation."""
        gap_importance, match_score, details = self(student_skills, college_requirements)
        
        explanations = []
        for i, skill in enumerate(self.skill_names):
            if details["gaps"][0, i] > 0:
                explanations.append(f"❌ Missing: {skill}")
            elif details["overlap"][0, i] > 0:
                explanations.append(f"✅ Matched: {skill}")
            elif details["surplus"][0, i] > 0:
                explanations.append(f"➕ Extra: {skill}")
        
        return {
            "match_score": match_score.item(),
            "skill_breakdown": explanations,
            "gap_count": details["gaps"].sum(dim=1).item(),
        }


# ---------------------------------------------------------
# Neo4j → PyTorch Geometric converter
# ---------------------------------------------------------
def kg_to_pyg_data(neo4j_query_result):
    """Convert Neo4j query results to PyG Data objects."""
    data_list = []
    
    for record in neo4j_query_result:
        features = record.get("features", [])
        
        skill_count = len(features)
        
        gpa = features[0].get("gpa", 0.0) if skill_count else 0.0
        test = features[0].get("test", 0.0) if skill_count else 0.0
        institution = features[0].get("institution", "") if skill_count else ""
        
        x = torch.tensor(
            [[gpa, test, float(skill_count), 1.0]],
            dtype=torch.float
        )
        
        edge_index = torch.tensor([[0], [0]], dtype=torch.long)
        
        # Pair embedding placeholder
        pairs = torch.zeros((1, 128), dtype=torch.float)
        
        y = torch.tensor([1.0])
        
        data = Data(
            x=x,
            edge_index=edge_index,
            pairs=pairs,
            y=y,
        )
        
        # Store metadata for explainability
        data.institution = institution
        data.gpa = gpa
        data.test_score = test
        
        data_list.append(data)
    
    return data_list
