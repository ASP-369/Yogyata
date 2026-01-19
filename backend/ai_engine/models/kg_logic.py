from kg.builder import KGBuilder

class KGRecommender:
    """
    Pure Graph-based Recommender using Cypher queries.
    Handles Skill Gap Analysis and Course Recommendations.
    """
    
    def __init__(self):
        self.kg = KGBuilder()

    def analyze_skill_gaps(self, username, target_colleges):
        """
        Identify missing skills for a student relative to their aspiring colleges.
        
        Args:
            username: Student's username (corresponds to student_id or username in DB)
            target_colleges: List of college names the student aspires to.
        
        Returns:
            dict: {college: {missing_skills: [], match_score: float}}
        """
        # Note: In a real app we'd map username to student_id. 
        # For this demo, let's assume we pass skills directly or match by ID if we had it.
        # Since the API passes a list of skills for the current user session, 
        # let's write a query that takes provided skills and compares against colleges.
        pass 
        # Actually, let's implement the method that takes a list of skills as input,
        # so it works for both logged-in users and guest users (if we support that).

    def analyze_gaps_for_skills(self, student_skills, target_colleges=None):
        """
        Analyze gaps based on a transient list of skills (e.g. from frontend state).
        """
        with self.kg.driver.session() as session:
            # 1. Find skills required by all colleges (or specific targets)
            # We treat the input student_skills as a list of strings
            
            # If targets are provided, filter. Else return all top colleges?
            # Let's assume targets are optional.
            
            query = """
            MATCH (c:College)-[:REQUIRES]->(req:Skill)
            WHERE ($target_colleges IS NULL OR c.name IN $target_colleges)
            RETURN c.name as college, collect(req.name) as required
            """
            
            result = session.run(query, target_colleges=target_colleges)
            
            # Post-process in Python
            output = []
            student_skill_set = set(student_skills)
            
            for record in result:
                college = record["college"]
                required = set(record["required"])
                
                overlap = list(required & student_skill_set)
                missing = list(required - student_skill_set)
                total_req = len(required)
                match_ratio = len(overlap) / total_req if total_req > 0 else 0
                
                output.append({
                    "college": college,
                    "overlap": overlap,
                    "missing": missing,
                    "match_ratio": match_ratio
                })
            
            # Sort by match ratio
            output.sort(key=lambda x: x["match_ratio"], reverse=True)
            return output

    def recommend_courses_for_gaps(self, missing_skills):
        """
        Find courses that teach the missing skills.
        """
        if not missing_skills:
            return []
            
        with self.kg.driver.session() as session:
            query = """
            UNWIND $missing_skills as skill_name
            MATCH (co:Course)-[:TEACHES]->(k:Skill {name: skill_name})
            MATCH (provider:College)-[:OFFERS]->(co)
            
            RETURN co.course_name as course,
                   provider.name as college,
                   co.duration as duration,
                   co.level as level,
                   collect(k.name) as teaches_skills
            ORDER BY size(teaches_skills) DESC
            LIMIT 5
            """
            result = session.run(query, missing_skills=missing_skills)
            return [dict(record) for record in result]

    def get_skill_path(self, student_skills, target_college):
        """
        Trace the path from Student checks -> ASPIRES_TO -> College -> REQUIRES -> Skill
        And find Course -> TEACHES -> Skill
        """
        with self.kg.driver.session() as session:
            query = """
            MATCH (c:College {name: $target})
            MATCH (c)-[:REQUIRES]->(req:Skill)
            WHERE NOT req.name IN $skills
            
            OPTIONAL MATCH (co:Course)-[:TEACHES]->(req)
            OPTIONAL MATCH (provider:College)-[:OFFERS]->(co)
            
            RETURN req.name as missing_skill,
                   collect(DISTINCT {
                       course: co.course_name, 
                       provider: provider.name
                   }) as recommended_courses
            """
            result = session.run(query, target=target_college, skills=student_skills)
            return [dict(record) for record in result]
