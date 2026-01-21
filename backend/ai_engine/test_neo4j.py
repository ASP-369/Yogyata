#!/usr/bin/env python3

import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

def test_connection():
    uri = os.environ.get("NEO4J_URI", "neo4j://127.0.0.1:7687")
    user = os.environ.get("NEO4J_USER", "yogyata")
    password = os.environ.get("NEO4J_PASSWORD", "password")
    
    print(f"Testing connection to: {uri}")
    print(f"Username: {user}")
    print(f"Password: {'*' * len(password)}")
    
    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        with driver.session() as session:
            result = session.run("RETURN 'Hello Neo4j!' as message")
            record = result.single()
            print(f"✅ Connection successful!")
            print(f"Response: {record['message']}")
            
            # Test database list
            result = session.run("SHOW DATABASES")
            databases = [record["name"] for record in result]
            print(f"Available databases: {databases}")
            
        driver.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Check if Neo4j Desktop is running")
        print("2. Create a database in Neo4j Desktop")
        print("3. Verify username/password")
        print("4. Try password: 'neo4j', 'password', or empty string")

if __name__ == "__main__":
    test_connection()