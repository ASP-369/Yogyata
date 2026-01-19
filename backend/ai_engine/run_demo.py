# run_demo.py
# ============================================================
# End-to-end orchestration for Privacy-Preserving FL Recommender
# 
# Pipeline:
# 1. Check Neo4j
# 2. Generate data for 7 institutions
# 3. Build Knowledge Graph
# 4. Start Flower server
# 5. Start 7 Flower clients (one per institution)
# 6. Verify global model saved
# 7. Start FastAPI
# ============================================================

import sys
import os
import time
import threading
import subprocess
import flwr as fl

# Resolve paths relative to this file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))

from kg.builder import KGBuilder
from fl_client import StudentClient
# from data.generate import generate_student_data, generate_college_kg, generate_institutions_metadata
from privacy_config import FL_CONFIG, INSTITUTIONS

SERVER_ADDR = FL_CONFIG["server_address"]
NUM_CLIENTS = len(INSTITUTIONS)
MODEL_PATH = os.path.join(CURRENT_DIR, "fl_global_model.npz")


# ------------------------------------------------------------
# 1. Check Neo4j
# ------------------------------------------------------------
def check_neo4j():
    try:
        kg = KGBuilder()
        with kg.driver.session() as session:
            session.run("RETURN 1")
        print("✅ Neo4j is running")
    except Exception as e:
        print("❌ Neo4j is NOT running.")
        print("   Please start Neo4j on bolt://localhost:7687")
        print("   Error:", e)
        sys.exit(1)


# ------------------------------------------------------------
# 2. Start Flower client for an institution
# ------------------------------------------------------------
def start_client(cid: int, institution: str):
    print(f"🔹 Starting client {cid} ({institution})")
    try:
        client = StudentClient(cid, institution)
        fl.client.start_numpy_client(
            server_address=SERVER_ADDR,
            client=client,
        )
        print(f"✅ Client {cid} ({institution}) finished")
    except Exception as e:
        print(f"❌ Client {cid} ({institution}) failed: {e}")


# ------------------------------------------------------------
# MAIN PIPELINE
# ------------------------------------------------------------
if __name__ == "__main__":
    
    print("\n" + "=" * 60)
    print("🚀 Privacy-Preserving KG College Recommender – Full Pipeline")
    print("=" * 60)
    print(f"📍 Institutions: {', '.join(INSTITUTIONS)}")
    print(f"🔒 Differential Privacy: Enabled (ε=8.0, δ=1e-5)")
    print("=" * 60 + "\n")
    
    # Step 1: Neo4j
    print("📡 Step 1: Checking Neo4j connection...")
    check_neo4j()
    
    # Step 2: Generate data
    print("\n📊 Step 2: Checking institutional data...")
    
    if os.path.exists(os.path.join(CURRENT_DIR, "data/students.csv")) and \
       os.path.exists(os.path.join(CURRENT_DIR, "data/colleges.csv")):
        print("   ✅ Data files found (skipping generation)")
    else:
        print(f"   ❌ Data files MISSING at {os.path.join(CURRENT_DIR, 'data')}! Please restore data/generate.py to regenerate them.")
        sys.exit(1)
    
    # Step 3: Build KG
    print("\n🕸️ Step 3: Building Knowledge Graph...")
    builder = KGBuilder()
    builder.create_schema()
    builder.load_data()
    print("   ✅ Knowledge Graph ready")
    
    # Print institution stats
    try:
        stats = builder.get_institution_stats()
        for inst, data in stats.items():
            print(f"      {inst}: {data['student_count']} students, avg GPA={data['avg_gpa']:.2f}")
    except Exception as e:
        print(f"   ⚠️ Could not load institution stats: {e}")
    
    # Remove old model if exists
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
        print("\n🧹 Removed old global model")
    
    # Step 4: Start Flower server
    print("\n🌸 Step 4: Starting Flower server...")
    server_proc = subprocess.Popen([sys.executable, "fl_server.py"])
    
    # Give server time to bind port
    time.sleep(5)
    
    # Step 5: Start clients (one per institution)
    print(f"\n👥 Step 5: Starting {NUM_CLIENTS} federated clients...")
    threads = []
    for cid, institution in enumerate(INSTITUTIONS):
        t = threading.Thread(target=start_client, args=(cid, institution))
        t.start()
        threads.append(t)
        time.sleep(0.5)  # Stagger client starts
    
    for t in threads:
        t.join()
    
    print("\n✅ Federated training complete")
    
    # Step 6: Verify model saved
    if not os.path.exists(MODEL_PATH):
        print("❌ Global model was NOT saved. FL failed.")
        server_proc.terminate()
        sys.exit(1)
    
    print(f"💾 Global model saved at: {MODEL_PATH}")
    
    # Step 7: Start FastAPI
    print("\n🌐 Step 7: Starting FastAPI server...")
    api_proc = subprocess.Popen([
        sys.executable, "-m", "uvicorn",
        "api:app",
        "--host", "127.0.0.1",
        "--port", "8000"
    ])
    
    print("\n" + "=" * 60)
    print("🎉 SYSTEM READY")
    print("=" * 60)
    print("👉 API available at: http://127.0.0.1:8000")
    print("👉 POST /recommend to get college recommendations")
    print("👉 GET /fairness-report for fairness metrics")
    print("👉 GET /privacy-status for DP configuration")
    print("=" * 60 + "\n")
    
    # Keep running
    try:
        server_proc.wait()
        print("ℹ️ FL Server finished. Keeping API alive...")
        api_proc.wait()
    except KeyboardInterrupt:
        print("\n⏹️ Shutting down...")
        server_proc.terminate()
        api_proc.terminate()
