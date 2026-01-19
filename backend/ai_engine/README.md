# Yogyata AI Engine

This directory contains the core AI and Machine Learning components of the system, including the Knowledge Graph (Neo4j), Federated Learning (Flower), and the FastAPI backend.

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.9+**
- **Neo4j Desktop** (Running on `bolt://localhost:7687`)
- **Virtual Environment** (Recommended)

### 2. Setup
Navigate to this directory and install dependencies:
```bash
cd Yogyata/backend/ai_engine
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Configuration
Ensure the project root `.env` file contains your Neo4j credentials:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

---

## 🛠️ Main Components

### 1. AI API (`api.py`)
The primary interface for the frontend and Node.js backend to get recommendations and skill analysis.
- **Run**: `python api.py`
- **Port**: `8000`
- **Docs**: `http://localhost:8000/docs`

### 2. Federated Learning Pipeline (`run_demo.py`)
Orchestrates a full training cycle across multiple simulated institutions.
- **Run**: `python run_demo.py`
- **Logic**: 
  1. Checks Neo4j connection.
  2. Builds the Knowledge Graph from `data/`.
  3. Launches a central `fl_server.py`.
  4. Launches 7 concurrent `fl_client.py` instances (one per institution).
  5. Saves the aggregated `fl_global_model.npz`.

### 3. Knowledge Graph (`kg/builder.py`)
Handles data ingestion from CSV files into Neo4j.
- Run standalone to rebuild the graph: `python kg/builder.py`

---

## 📂 Project Structure
- **/data**: CSV datasets for students, colleges, and courses.
- **/kg**: Graph construction and Cypher query logic.
- **/models**: Neural Network definitions (GNN, Hybrid Recommender).
- **fl_server / fl_client**: Federated learning protocol implementation.
- **users.json**: Local storage for user profile traits and skill preferences.
