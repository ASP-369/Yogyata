# api.py
# ============================================================
# FastAPI Backend with Explainable Recommendations
# ============================================================

import numpy as np
import torch
import pandas as pd
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import sys
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Resolve paths relative to this file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))

# Add this directory to path so internal imports like 'from kg.builder' work inside 'models'
if CURRENT_DIR not in sys.path:
    sys.path.append(CURRENT_DIR)

from models.gnn import AdmissionGNN, HybridRecommender, SkillGapAnalyzer
from kg.builder import KGBuilder
from models.kg_logic import KGRecommender

load_dotenv(os.path.join(ROOT_DIR, ".env"))

app = FastAPI(
    title="KG College Recommender",
    description="Privacy-preserving college recommendations",
    version="2.0.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve UI
app.mount("/static", StaticFiles(directory=os.path.join(ROOT_DIR, "static")), name="static")


# -------------------------------------------------
# Pydantic Models
# -------------------------------------------------
class StudentInput(BaseModel):
    gpa: float
    test_score: int
    skills: List[str]
    institution: Optional[str] = None


class RecommendationResponse(BaseModel):
    recommendations: List[dict]
    skill_explanation: Optional[dict] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class StudentProfile(BaseModel):
    username: str
    gpa: Optional[float] = None
    test_score: Optional[int] = None
    skills: List[str] = []
    aspirations: List[str] = []

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "student"
    gpa: Optional[float] = None
    test_score: Optional[int] = None
    skills: List[str] = []
    aspirations: List[str] = []


# -------------------------------------------------
# Model & Explainer Initialization
# -------------------------------------------------
NUM_FEATURES = 4
HIDDEN_DIM = 128
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = AdmissionGNN(
    num_features=NUM_FEATURES,
    hidden_dim=HIDDEN_DIM,
).to(DEVICE)
model.eval()

# Load FL weights
if os.path.exists(os.path.join(CURRENT_DIR, "fl_global_model.npz")):
    try:
        weights = np.load(os.path.join(CURRENT_DIR, "fl_global_model.npz"), allow_pickle=True)
        params = [torch.tensor(weights[f"arr_{i}"]) for i in range(len(weights.files))]
        
        state_dict = model.state_dict()
        new_state_dict = {}
        
        for (key, _), param in zip(state_dict.items(), params):
            new_state_dict[key] = param.to(DEVICE)
        
        model.load_state_dict(new_state_dict, strict=False)
        print("[OK] Global FL model loaded")
    except Exception as e:
        print(f"[ERROR] Failed to load model weights: {e}")
else:
    print("[WARNING] fl_global_model.npz not found -- using random weights")

# Hybrid & Skill Gap Components
SKILL_LIST = [
    "Python", "React", "Node.js", "Machine Learning", "Data Science", "SQL", 
    "AWS", "Docker", "VLSI", "Embedded", "IoT", "EV", "Robotics", 
    "Blockchain", "CyberSecurity", "Cloud", "Business", "Communication"
]
COLLEGE_LIST = ["MIT", "Stanford", "Oxford", "IIT_Delhi", "NUS", "PES_University", "RV_College"]

hybrid_model = HybridRecommender(
    gnn_model=model,
    num_colleges=len(COLLEGE_LIST),
    num_skills=len(SKILL_LIST),
    embed_dim=128
).to(DEVICE)
hybrid_model.eval()

gap_analyzer = SkillGapAnalyzer(num_skills=len(SKILL_LIST)).to(DEVICE)
gap_analyzer.eval()

# Knowledge Graph
try:
    kg = KGBuilder()
    kg_recommender = KGRecommender() # Initialize our new logic
    print("[OK] Connected to Neo4j and initialized KGRecommender")
except Exception as e:
    print(f"[WARNING] Could not connect to Neo4j: {e}")
    kg = None
    kg_recommender = None



# -------------------------------------------------
# Supabase Auth
# -------------------------------------------------
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid Token")
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

def get_or_create_user_profile(user_id: str, email: str):
    users = []
    users_path = os.path.join(CURRENT_DIR, "users.json")
    if os.path.exists(users_path):
        with open(users_path, "r") as f:
            try:
                users = json.load(f)
            except:
                users = []
    
    # Find user by Supabase ID (we'll store it as 'id' or 'username' for compatibility)
    # Using 'username' field to store the ID for now to minimize refactoring
    for u in users:
        if u.get("username") == user_id or u.get("id") == user_id:
            return u
            
    # Create new profile if not exists
    new_user = {
        "id": user_id,
        "username": user_id, # Linking Supabase ID to username field
        "email": email,
        "gpa": 3.5, # Default placeholder
        "test_score": 1200,
        "skills": ["Python", "Machine Learning"],
        "aspirations": []
    }
    users.append(new_user)
    with open(users_path, "w") as f:
        json.dump(users, f, indent=4)
    return new_user

def update_user_profile(user_id: str, data: dict):
    users = []
    users_path = os.path.join(CURRENT_DIR, "users.json")
    if os.path.exists(users_path):
        with open(users_path, "r") as f:
            users = json.load(f)
            
    for u in users:
        if u.get("username") == user_id or u.get("id") == user_id:
            u.update(data)
            with open(users_path, "w") as f:
                json.dump(users, f, indent=4)
            return u
    return None

# -------------------------------------------------
# Routes
# -------------------------------------------------
@app.get("/", response_class=HTMLResponse)
async def read_root():
    return FileResponse(os.path.join(ROOT_DIR, "static/index.html"))



# -------------------------------------------------
# Auth Routes (Removed - Handled by Supabase)
# -------------------------------------------------
# Legacy login/register routes removed.



@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": os.path.exists(os.path.join(CURRENT_DIR, "fl_global_model.npz")),
        "neo4j_connected": kg is not None,
    }


@app.get("/colleges")
async def get_colleges():
    """Get all colleges with their requirements."""
    colleges_path = os.path.join(CURRENT_DIR, "data/colleges.csv")
    if not os.path.exists(colleges_path):
        raise HTTPException(status_code=404, detail="colleges.csv not found")
    
    colleges = pd.read_csv(colleges_path)
    return colleges.to_dict(orient="records")


@app.get("/institutions")
async def get_institutions():
    """Get all participating institutions."""
    institutions_path = os.path.join(CURRENT_DIR, "data/institutions.csv")
    if os.path.exists(institutions_path):
        institutions = pd.read_csv(institutions_path)
        return institutions.to_dict(orient="records")
    return []


@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_colleges(student_data: StudentInput):
    """
    Get personalized college recommendations with explanations.
    
    Returns top colleges ranked by match score with:
    - Skill gap analysis
    - GPA/test score evaluation
    - Confidence level
    """
    try:
        gpa = student_data.gpa
        test_score = student_data.test_score
        skills = student_data.skills
        skill_count = len(skills)
        
        # Create graph features
        x = torch.tensor([[gpa, test_score, float(skill_count), 1.0]], dtype=torch.float)
        edge_index = torch.tensor([[0], [0]], dtype=torch.long)
        batch_vec = torch.zeros(1, dtype=torch.long)
        pair_dim = HIDDEN_DIM
        pairs = torch.zeros((1, pair_dim), device=DEVICE)
        
        # Move to device
        x = x.to(DEVICE)
        edge_index = edge_index.to(DEVICE)
        batch_vec = batch_vec.to(DEVICE)
        
        # Model inference
        with torch.no_grad():
            score = model(x, edge_index, batch_vec, pairs)
        
        student_quality_score = score.item()
        
        # Load colleges
        colleges_path = os.path.join(CURRENT_DIR, "data/colleges.csv")
        if not os.path.exists(colleges_path):
            raise HTTPException(status_code=404, detail="colleges.csv not found")
        
        colleges = pd.read_csv(colleges_path)
        
        # Score and rank colleges
        # Score and rank colleges
        results = []
        student_skill_vec = torch.tensor([[1.0 if s in skills else 0.0 for s in SKILL_LIST]], dtype=torch.float, device=DEVICE)
        
        for _, row in colleges.iterrows():
            college = row['college']
            region = row.get('region', 'Unknown')
            
            # Safe parsing for numerical values
            min_gpa = row['min_gpa'] if pd.notna(row['min_gpa']) else 0.0
            min_test = row['min_test'] if pd.notna(row['min_test']) else 0
            
            # Ensure float/int types
            min_gpa = float(min_gpa)
            min_test = int(min_test) if min_test != 0 else 0
            required_skills = row['required_skills'].split('|') if isinstance(row['required_skills'], str) else []
            
            # --- Common Calculations ---
            matched_skills = set(skills) & set(required_skills)
            skill_match_ratio = len(matched_skills) / max(len(required_skills), 1)
            
            # --- Regional Logic ---
            if region == 'India':
                # 1. Indian Colleges: Cutoff-Centric
                # Strict penalties for missing cutoffs
                gpa_diff = gpa - min_gpa
                test_diff = test_score - min_test
                
                # Base Score from Test Score (Primary)
                score = 0
                
                if test_diff < 0:
                    score -= 500  # Huge penalty for missing test cutoff
                else:
                    score += 50 + (test_diff / 10) # Bonus for exceeding cutoff
                
                if gpa_diff < 0:
                    score -= 100 # Penalty for GPA
                else:
                    score += gpa_diff * 20
                
                # Tiny bonus for skills (5%)
                score += skill_match_ratio * 5
                
                # Display Probability (Sigmoid-ish)
                if score < 0:
                    combined_prob = 0.1
                else:
                    combined_prob = 0.5 + (0.5 * (score / 100))
                    combined_prob = min(combined_prob, 0.99)

            else:
                # 2. Foreign Colleges: Holistic / Existing Hybrid Logic
                
                # Hybrid Inference (GNN etc)
                hybrid_score_val = 0.5
                if college in COLLEGE_LIST:
                    college_idx = COLLEGE_LIST.index(college)
                    college_id_tensor = torch.tensor([college_idx], device=DEVICE)
                    
                    with torch.no_grad():
                        pairs = torch.zeros((1, 128), device=DEVICE)
                        h_score, _ = hybrid_model(x, edge_index, batch_vec, pairs, college_id_tensor, student_skill_vec)
                        hybrid_score_val = h_score.item()

                # Gaps
                gpa_gap = gpa - min_gpa
                test_gap = (test_score - min_test) / 400.0
                avg_gap = (gpa_gap * 0.7) + (test_gap * 0.3)
                
                # Scoring
                prestige_score = min_gpa * 10
                skill_bonus = skill_match_ratio * 15 # High weight for skills
                
                if avg_gap < -0.1:
                    penalty = 50 + (abs(avg_gap) * 20)
                elif avg_gap > 1.0:
                    penalty = 5
                else:
                    penalty = 0
                
                final_score = prestige_score - penalty + (student_quality_score * 5) + (hybrid_score_val * 10) + skill_bonus
                
                # Prob
                features_prob = 1 / (1 + np.exp(-(avg_gap * 3 + 0.5)))
                combined_prob = (features_prob * 0.4) + (skill_match_ratio * 0.3) + (student_quality_score * 0.1) + (hybrid_score_val * 0.2)
                score = final_score

            results.append({
                "college": college,
                "score": score,
                "display_prob": combined_prob,
                "min_gpa": row['min_gpa'],
                "min_test": row['min_test'],
                "required_skills": required_skills,
                "region": region,
            })
        
        # Sort by score top 10
        top_k = sorted(results, key=lambda x: x['score'], reverse=True)[:10]
        
        # Skill Gap Explanation for the top match
        skill_explanation = None
        if top_k:
            best_match = top_k[0]
            student_skill_vec = torch.tensor([[1.0 if s in skills else 0.0 for s in SKILL_LIST]], device=DEVICE)
            college_req_vec = torch.tensor([[1.0 if s in best_match["required_skills"] else 0.0 for s in SKILL_LIST]], device=DEVICE)
            

            # Use KG Recommender for Explanation if available
            if kg_recommender:
                # Get the skills required by the best match college
                analysis = kg_recommender.analyze_gaps_for_skills(skills, [best_match["college"]])
                if analysis:
                    # Translate KG result to the expected UI format
                    # KG returns: {college, missing, overlap, match_ratio}
                    data = analysis[0]
                    explanations = []
                    for s in data["missing"]:
                        explanations.append(f"❌ Missing: {s}")
                    for s in data["overlap"]:
                        explanations.append(f"✅ Matched: {s}")
                    
                    skill_explanation = {
                        "match_score": data["match_ratio"],
                        "skill_breakdown": explanations,
                        "gap_count": len(data["missing"])
                    }
            
            # Fallback to Neural Gap Analyzer if KG fails or not available
            if skill_explanation is None:
                with torch.no_grad():
                     skill_explanation = gap_analyzer.explain_gaps(student_skill_vec, college_req_vec)

        # Format results for UI
        ui_results = []
        for rec in top_k:
            ui_results.append({
                "college": rec["college"],
                "score": rec["display_prob"],
                "min_gpa": rec["min_gpa"],
                "region": rec["region"],
                "required_skills": rec["required_skills"]
            })
        
        return RecommendationResponse(
            recommendations=ui_results,
            skill_explanation=skill_explanation
        )
    
    except Exception as e:
        print(f"[ERROR] Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------
# Pydantic Models for Weighted Recs
# -------------------------------------------------
class CourseRecRequest(BaseModel):
    skills: List[str]
    pref_institution: Optional[str] = None
    institution_weight: float = 0.5
    pref_duration: Optional[str] = None  # short, medium, long
    duration_weight: float = 0.5

class JobAnalysisRequest(BaseModel):
    job_description: str
    user_skills: List[str]


# Expanded Skill Knowledge Base for NLP
ALL_KNOWN_SKILLS = {
    # Programming Languages
    "python", "java", "cpp", "c++", "c#", "javascript", "typescript", "ruby", "php", "swift", "kotlin", "go", "rust",
    # Web Development
    "react", "angular", "vue", "node", "nodejs", "html", "css", "django", "flask", "fastapi", "spring", "asp.net",
    # Data Science & ML
    "machine learning", "ml", "data science", "ds", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
    "pandas", "numpy", "scikit-learn", "sql", "nosql", "mongodb", "postgresql", "mysql",
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "ansible", "linux", "bash",
    # General/Soft Skills
    "leadership", "communication", "problem solving", "agile", "scrum", "project management", "research", "teamwork"
}

import re

# ... (inside analyze_job)

@app.post("/analyze/job")
async def analyze_job(request: JobAnalysisRequest):
    """
    Analyze a job description to find matching and missing skills.
    """
    try:
        jd_text = request.job_description.lower()
        
        # Simple NLP: Keyword Extraction
        # In a real app, use SpaCy or a specialized NER model
        found_skills = set()
        
        # Check for each known skill in the text
        for skill in ALL_KNOWN_SKILLS:
            # Use regex word boundaries to avoid partial matches
            # e.g. avoid matching "go" in "algorithms" or "c" in "class"
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, jd_text):
                found_skills.add(skill)
                
        # Normalize user skills for comparison
        user_skills_norm = {s.lower() for s in request.user_skills}
        
        # Calculate Overlap
        matched = found_skills & user_skills_norm
        missing = found_skills - user_skills_norm
        
        # Calculate Score
        total_required = len(found_skills)
        if total_required == 0:
            match_score = 0
            # If no skills found, maybe suggest it's a generic job or parsing failed
            if len(jd_text) > 100:
                match_score = 100 # Assume if we cant find tech skills, maybe user is fine? Or 0.
                # Let's default to a neutral message in UI if empty
        else:
            match_score = (len(matched) / total_required) * 100
            
        return {
            "found_skills": list(found_skills),
            "matched_skills": list(matched),
            "missing_skills": list(missing),
            "match_score": round(match_score, 1)
        }

    except Exception as e:
        print(f"[ERROR] JD Analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend/courses")
@app.post("/recommend/courses")
async def recommend_courses_weighted(request: CourseRecRequest):
    """
    Recommend courses based on skills and weighted preferences.
    """
    try:
        courses_path = os.path.join(CURRENT_DIR, "data/courses.csv")
        if not os.path.exists(courses_path):
            return {"analysis": "No course data found.", "courses": []}
        
        courses_df = pd.read_csv(courses_path)
        student_skills = set(request.skills)
        
        # --- Generate Analysis ---
        top_skills = list(student_skills)[:3]
        analysis_text = f"Based on your profile, we prioritized courses matching {', '.join(top_skills)}."
        
        if request.pref_institution:
            analysis_text += f" We boosted courses from {request.pref_institution} as requested."
        
        if request.pref_duration:
            analysis_text += f" We also prioritized {request.pref_duration} duration courses."

        results = []
        for _, row in courses_df.iterrows():
            # 1. Skill Score
            course_tags = set(row['tags'].split('|'))
            match_count = len(student_skills & course_tags)
            skill_score = match_count / max(len(course_tags), 1)
            
            # 2. Institution Score
            inst_score = 0.0
            if request.pref_institution:
                 if row['college'] == request.pref_institution:
                     inst_score = 1.0
            
            # 3. Duration Score
            dur_score = 0.0
            if request.pref_duration:
                # Parse duration "12 weeks" -> 12
                try:
                    weeks = int(row['duration'].split()[0])
                    if request.pref_duration == 'short' and weeks < 8:
                        dur_score = 1.0
                    elif request.pref_duration == 'medium' and 8 <= weeks <= 12:
                        dur_score = 1.0
                    elif request.pref_duration == 'long' and weeks > 12:
                        dur_score = 1.0
                except:
                    pass # Invalid duration format, ignore
            
            # Weighted Final Score
            # Skill matches are foundational (weight 2.0)
            # Preferences adjust the ranking
            
            final_score = (skill_score * 2.0) + \
                          (inst_score * request.institution_weight) + \
                          (dur_score * request.duration_weight)
            
            results.append({
                "course_name": row['course_name'],
                "college": row['college'],
                "level": row['level'],
                "score": round(final_score, 2),
                "duration": row['duration'],
                "matches": list(student_skills & course_tags)
            })
        
        # Sort by score
        top_courses = sorted(results, key=lambda x: x['score'], reverse=True)[:10]
        
        return {
            "analysis": analysis_text,
            "courses": top_courses
        }

    except Exception as e:
        print(f"[ERROR] Course Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))





# -------------------------------------------------
# Student Profile & Personalized Routes
# -------------------------------------------------

@app.get("/student/profile/me")
async def get_my_profile(user=Depends(get_current_user)):
    """Get profile for the authenticated user."""
    profile = get_or_create_user_profile(user.id, user.email)
    return profile


@app.post("/student/profile")
async def update_student_profile(profile_data: StudentProfile, user=Depends(get_current_user)):
    """Update profile for the authenticated user."""
    # Note: Logic slightly adjusted to ignore the username in body and use token instead
    data = {
        "gpa": profile_data.gpa,
        "test_score": profile_data.test_score,
        "skills": profile_data.skills,
        "aspirations": profile_data.aspirations
    }
    updated = update_user_profile(user.id, data)
    
    if not updated:
        # Should not happen if get_or_create works, but just in case
        get_or_create_user_profile(user.id, user.email)
        update_user_profile(user.id, data)
        
    return {"status": "success", "message": "Profile updated"}





@app.post("/recommend/me/colleges", response_model=RecommendationResponse)
async def recommend_me_colleges(user=Depends(get_current_user)):
    """
    Get personalized recommendations for the authenticated user.
    """
    profile = get_or_create_user_profile(user.id, user.email)
    
    gpa = profile.get("gpa")
    test_score = profile.get("test_score")
    skills = profile.get("skills", [])
    
    if gpa is None or test_score is None:
        raise HTTPException(status_code=400, detail="GPA and Test Score are required. Please update your profile.")

    student_input = StudentInput(
        gpa=gpa,
        test_score=test_score,
        skills=skills,
        institution=None
    )
    return await recommend_colleges(student_input)


@app.post("/recommend/me/courses")
async def recommend_me_courses(user=Depends(get_current_user)):
    """
    Recommend courses for the authenticated user based on their profile aspirations.
    """
    try:
        profile = get_or_create_user_profile(user.id, user.email)
        aspirations = profile.get("aspirations", [])
        skills = profile.get("skills", [])

        if not aspirations:
             # Fallback to general skill based recommendations if no aspirations
            return await recommend_courses_weighted(CourseRecRequest(skills=skills))

        colleges_path = os.path.join(CURRENT_DIR, "data/colleges.csv")
        if not os.path.exists(colleges_path):
             return []
        
        colleges_df = pd.read_csv(colleges_path)
        student_skills = set(skills)
        target_skills_needed = set()

        # KG-Driven Logic
        if kg_recommender:
            # 1. Identify missing skills for aspiring colleges
            # We check gaps for ALL aspirated colleges
            gap_data = kg_recommender.analyze_gaps_for_skills(skills, aspirations)
            
            all_missing = set()
            for d in gap_data:
                all_missing.update(d["missing"])
            
            target_skills_needed = all_missing
        else:
            # Fallback (old logic)
            # Identify missing skills for all aspiring colleges
            for college_name in profile.aspirations:
                college_row = colleges_df[colleges_df['college'] == college_name]
                if not college_row.empty:
                    req_skills = college_row.iloc[0]['required_skills']
                    if isinstance(req_skills, str):
                        req_set = set(req_skills.split('|'))
                        missing = req_set - student_skills
                        target_skills_needed.update(missing)

        if not target_skills_needed:
             # If no missing skills for aspirations, recommend advanced courses in current skills
             return await recommend_courses_weighted(CourseRecRequest(skills=skills))
        
        if kg_recommender:
            # 2. Find courses using KG
            kg_courses = kg_recommender.recommend_courses_for_gaps(list(target_skills_needed))
            
            # Translate KG format to UI format
            recommendations = []
            for c in kg_courses:
                recommendations.append({
                    "course_name": c["course"],
                    "college": c["college"],
                    "level": c["level"],
                    "score": len(c["teaches_skills"]), # Simple score based on coverage
                    "duration": c["duration"],
                    "reason": f"Teaches needed skills: {', '.join(c['teaches_skills'])}"
                })
            
            return recommendations
        
        # Fallback to CSV scanning
        # Find courses that teach the missing skills
        courses_path = os.path.join(CURRENT_DIR, "data/courses.csv")
        if not os.path.exists(courses_path):
            return []
            
        courses_df = pd.read_csv(courses_path)
        recommendations = []
        
        for _, row in courses_df.iterrows():
            course_tags = set(row['tags'].split('|'))
            # Check if course covers any needed skills
            overlap = target_skills_needed & course_tags
            
            if overlap:
                score = len(overlap)  # Simple score: how many missing skills it covers
                
                # Boost if course is from an aspiring college
                if row['college'] in aspirations:
                    score += 2.0
                
                recommendations.append({
                    "course_name": row['course_name'],
                    "college": row['college'],
                    "level": row['level'],
                    "score": score,
                    "duration": row['duration'],
                    "reason": f"Teaches needed skills: {', '.join(overlap)}"
                })
                
        # Sort by score
        top_courses = sorted(recommendations, key=lambda x: x['score'], reverse=True)[:5]
        return top_courses

    except Exception as e:
        print(f"[ERROR] My Course Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/privacy-status")
async def get_privacy_status():
    """Get current differential privacy status."""
    from privacy_config import PRIVACY_CONFIG
    
    return {
        "dp_enabled": PRIVACY_CONFIG["enabled"],
        "target_epsilon": PRIVACY_CONFIG["target_epsilon"],
        "target_delta": PRIVACY_CONFIG["target_delta"],
        "noise_multiplier": PRIVACY_CONFIG["noise_multiplier"],
        "max_grad_norm": PRIVACY_CONFIG["max_grad_norm"],
    }


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
