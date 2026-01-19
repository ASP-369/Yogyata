# privacy_config.py
# ============================================================
# Configuration for Differential Privacy and Institutions
# ============================================================

# List of institutional clients
INSTITUTIONS = [
    "RV_College",
    "PES_University", 
    "IIT_Delhi",
    "Stanford",
    "Oxford",
    "MIT",
    "NUS"
]

# Institution-specific characteristics for data generation
INSTITUTION_PROFILES = {
    "RV College": {
        "region": "India",
        "gpa_mean": 3.0,
        "gpa_std": 0.4,
        "test_mean": 1100,
        "test_std": 150,
        "focus_skills": ["Docker", "AWS", "Python"],
        "num_students": 200,
    },
    "PES University": {
        "region": "India",
        "gpa_mean": 3.1,
        "gpa_std": 0.4,
        "test_mean": 1150,
        "test_std": 150,
        "focus_skills": ["Python", "React", "DS"],
        "num_students": 250,
    },
    "IIT Delhi": {
        "region": "India",
        "gpa_mean": 3.5,
        "gpa_std": 0.3,
        "test_mean": 1350,
        "test_std": 120,
        "focus_skills": ["ML", "DS", "Python"],
        "num_students": 300,
    },
    "Stanford": {
        "region": "USA",
        "gpa_mean": 3.7,
        "gpa_std": 0.25,
        "test_mean": 1500,
        "test_std": 80,
        "focus_skills": ["ML", "DS", "AWS"],
        "num_students": 350,
    },
    "Oxford": {
        "region": "UK",
        "gpa_mean": 3.6,
        "gpa_std": 0.3,
        "test_mean": 1450,
        "test_std": 100,
        "focus_skills": ["Python", "DS", "React"],
        "num_students": 300,
    },
    "MIT": {
        "region": "USA",
        "gpa_mean": 3.8,
        "gpa_std": 0.2,
        "test_mean": 1550,
        "test_std": 60,
        "focus_skills": ["ML", "DS", "React"],
        "num_students": 400,
    },
    "NUS": {
        "region": "Singapore",
        "gpa_mean": 3.4,
        "gpa_std": 0.35,
        "test_mean": 1400,
        "test_std": 110,
        "focus_skills": ["React", "AWS", "Docker"],
        "num_students": 280,
    },
}

# Differential Privacy Configuration
PRIVACY_CONFIG = {
    # Target epsilon (lower = more private, but less accurate)
    "target_epsilon": 8.0,
    
    # Target delta (probability of privacy breach)
    "target_delta": 1e-5,
    
    # Maximum gradient norm for clipping
    "max_grad_norm": 1.0,
    
    # Noise multiplier for Gaussian mechanism
    "noise_multiplier": 1.1,
    
    # Whether DP is enabled
    "enabled": False,
}

# Federated Learning Configuration
FL_CONFIG = {
    "server_address": "127.0.0.1:9090",
    "num_rounds": 5,
    "min_clients": 3,
    "fraction_fit": 1.0,
    "fraction_evaluate": 1.0,
    "local_epochs": 3,
    "learning_rate": 0.01,
    "batch_size": 8,
}

# Model Configuration
MODEL_CONFIG = {
    "hidden_dim": 128,
    "num_features": 4,
    "num_classes": 1,
}
