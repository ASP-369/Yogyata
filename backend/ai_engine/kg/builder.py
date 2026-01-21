from neo4j import GraphDatabase
import pandas as pd

import os
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# Data is now in ai_engine/data. This file is in ai_engine/kg/
AI_ENGINE_DIR = os.path.dirname(CURRENT_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(AI_ENGINE_DIR, "..", "..", "..", ".env"))

class KGBuilder:
    """
    Knowledge Graph Builder for Student-College-Skill relationships.
    Supports institution-based filtering for federated learning.
    """
    
    def __init__(self, uri=None, user=None, password=None):
        self.uri = uri or os.environ.get("NEO4J_URI", "bolt://localhost:7687")
        self.user = user or os.environ.get("NEO4J_USER", "neo4j")
        self.password = password or os.environ.get("NEO4J_PASSWORD", "your_password")
        self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
    
    def create_schema(self):
        """Create unique constraints for KG entities."""
        with self.driver.session() as session:
            session.run("CREATE CONSTRAINT student_id IF NOT EXISTS FOR (s:Student) REQUIRE s.student_id IS UNIQUE")
            session.run("CREATE CONSTRAINT college_name IF NOT EXISTS FOR (c:College) REQUIRE c.name IS UNIQUE")
            session.run("CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (k:Skill) REQUIRE k.name IS UNIQUE")
            session.run("CREATE CONSTRAINT institution_name IF NOT EXISTS FOR (i:Institution) REQUIRE i.name IS UNIQUE")
            session.run("CREATE CONSTRAINT course_name IF NOT EXISTS FOR (co:Course) REQUIRE co.course_name IS UNIQUE")
    
    def load_data(self):
        """Load students, colleges, institutions, and courses into the KG."""
        students = pd.read_csv(os.path.join(AI_ENGINE_DIR, 'data/students.csv'))
        colleges = pd.read_csv(os.path.join(AI_ENGINE_DIR, 'data/colleges.csv'))
        try:
            courses = pd.read_csv(os.path.join(AI_ENGINE_DIR, 'data/courses.csv'))
        except FileNotFoundError:
            courses = None
        
        # Try to load institutions if exists
        try:
            institutions = pd.read_csv(os.path.join(AI_ENGINE_DIR, 'data/institutions.csv'))
        except FileNotFoundError:
            institutions = None
        
        with self.driver.session() as session:
            # Load institutions
            if institutions is not None:
                for _, row in institutions.iterrows():
                    session.run("""
                        MERGE (i:Institution {name: $name})
                        SET i.region = $region, 
                            i.avg_gpa = $avg_gpa, 
                            i.avg_test = $avg_test,
                            i.focus_skills = $focus_skills
                    """, 
                    name=row['institution'], 
                    region=row['region'],
                    avg_gpa=row['avg_gpa'],
                    avg_test=row['avg_test'],
                    focus_skills=row['focus_skills'])
            
            # Load colleges and requirements
            for _, row in colleges.iterrows():
                session.run("""
                    MERGE (c:College {name: $name})
                    SET c.min_gpa = $min_gpa, c.min_test = $min_test, c.region = $region
                    WITH c, split($skills, '|') as req_skills
                    UNWIND req_skills as skill
                    MERGE (k:Skill {name: skill})
                    MERGE (c)-[:REQUIRES]->(k)
                """, 
                name=row['college'], 
                min_gpa=row['min_gpa'], 
                min_test=row['min_test'], 
                skills=row['required_skills'],
                region=row.get('region', 'Unknown'))
            
            # Load Courses
            if courses is not None:
                for _, row in courses.iterrows():
                    session.run("""
                        MERGE (co:Course {course_name: $name})
                        SET co.level = $level, co.duration = $duration
                        
                        WITH co
                        MATCH (c:College {name: $college})
                        MERGE (c)-[:OFFERS]->(co)
                        
                        WITH co
                        UNWIND split($tags, '|') as skill_name
                        MERGE (k:Skill {name: skill_name})
                        MERGE (co)-[:TEACHES]->(k)
                    """,
                    name=row['course_name'],
                    college=row['college'],
                    level=row['level'],
                    duration=row['duration'],
                    tags=row['tags'])

            # Load students and connections
            for _, row in students.iterrows():
                institution = row.get('institution', 'Unknown')
                
                # Add ASPIRES_TO relationship
                college_pref = row.get('college_pref')

                session.run("""
                    MERGE (s:Student {student_id: $id})
                    SET s.gpa = $gpa, 
                        s.test_score = $test_score,
                        s.institution = $institution,
                        s.region = $region
                    WITH s, split($skills, '|') as student_skills
                    UNWIND student_skills as skill
                    MERGE (k:Skill {name: skill})
                    MERGE (s)-[:HAS_SKILL]->(k)
                """, 
                id=row['student_id'], 
                gpa=row['gpa'], 
                test_score=row['test_score'], 
                skills=row['skills'],
                institution=institution,
                region=row.get('region', 'Unknown'))
                
                # Link student to institution
                session.run("""
                    MATCH (s:Student {student_id: $id})
                    MERGE (i:Institution {name: $institution})
                    MERGE (s)-[:ENROLLED_AT]->(i)
                """, id=row['student_id'], institution=institution)

                # Link student to aspiring college
                if college_pref:
                    session.run("""
                        MATCH (s:Student {student_id: $id})
                        MERGE (c:College {name: $pref})
                        MERGE (s)-[:ASPIRES_TO]->(c)
                    """, id=row['student_id'], pref=college_pref)
                
                # Create admission edges for training
                if row['admitted']:
                    session.run("""
                        MATCH (s:Student {student_id: $id}), (c:College {name: $college})
                        MERGE (s)-[:ADMITTED_TO]->(c)
                    """, id=row['student_id'], college=row['college_pref'])
    
    def get_graph_embedding_query(self, institution=None):
        """
        Return query for graph embeddings, optionally filtered by institution.
        
        Args:
            institution: Filter by institution name (for federated learning)
        """
        if institution:
            return f"""
            MATCH (s:Student {{institution: '{institution}'}})-[r]->(n)
            RETURN s.student_id as student, 
                   collect({{
                       neighbor: n.name, 
                       type: type(r), 
                       gpa: s.gpa, 
                       test: s.test_score,
                       institution: s.institution
                   }}) as features
            """
        else:
            return """
            MATCH (s:Student)-[r]->(n)
            RETURN s.student_id as student, 
                   collect({
                       neighbor: n.name, 
                       type: type(r), 
                       gpa: s.gpa, 
                       test: s.test_score,
                       institution: s.institution
                   }) as features
            """
    
    def get_colleges_with_skills(self):
        """Get all colleges with their required skills."""
        query = """
        MATCH (c:College)-[:REQUIRES]->(k:Skill)
        RETURN c.name as college, 
               c.min_gpa as min_gpa, 
               c.min_test as min_test,
               c.region as region,
               collect(k.name) as required_skills
        """
        with self.driver.session() as session:
            result = session.run(query)
            return [dict(record) for record in result]
    
    def get_institution_stats(self):
        """Get statistics for each institution."""
        query = """
        MATCH (s:Student)-[:ENROLLED_AT]->(i:Institution)
        RETURN i.name as institution,
               count(s) as student_count,
               avg(s.gpa) as avg_gpa,
               avg(s.test_score) as avg_test
        """
        with self.driver.session() as session:
            result = session.run(query)
            return {r['institution']: dict(r) for r in result}


# Usage
if __name__ == "__main__":
    builder = KGBuilder()
    builder.create_schema()
    builder.load_data()
    print("✅ KG built: Students → Skills → Colleges → Institutions")
    
    # Print institution stats
    stats = builder.get_institution_stats()
    for inst, data in stats.items():
        print(f"   {inst}: {data['student_count']} students, GPA={data['avg_gpa']:.2f}")
