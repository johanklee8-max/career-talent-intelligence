"""Deterministic synthetic career exploration; no validated suitability scores."""
from pydantic import BaseModel, Field
from typing import Literal

class DemoRequest(BaseModel):
    ambition: Literal['impact', 'technical', 'leadership'] = 'impact'
    environment: Literal['remote', 'hybrid', 'onsite'] = 'hybrid'
    skills: list[Literal['Python', 'SQL', 'Research', 'Communication', 'Project management']] = Field(default_factory=lambda: ['Python', 'Research'], max_length=5)
    model_config = {'extra': 'forbid'}

DEMO = {'name': 'Alex Example · synthetic profile', 'experience': ['Research coordinator · Example Lab · 2021–2024', 'Operations analyst · Example Cooperative · 2024–2026'], 'education': ['BSc Information Systems · Fictional University'], 'skills': ['Python', 'Research'], 'languages': ['English'], 'qualifications': [], 'source': 'Synthetic fixture, not extracted from a real CV'}

def career_profile(req):
    return {**DEMO, 'skills': req.skills, 'ambition': req.ambition, 'environment': req.environment}

def career_matching(profile):
    roles = [('Data analyst', ['Python', 'SQL'], 'direct'), ('Research operations specialist', ['Research', 'Project management'], 'adjacent'), ('Climate data coordinator', ['Research', 'Python', 'Communication'], 'unconventional')]
    return [{'role': r, 'category': c, 'evidence': [s for s in ss if s in profile['skills']], 'gaps': [s for s in ss if s not in profile['skills']], 'explanation': f"Explore {r} through a small portfolio project and an informational interview. Ambition: {profile['ambition']}; working preference: {profile['environment']}.", 'status': 'Career hypothesis; no vacancy or suitability claim'} for r,ss,c in roles]

def opportunity_discovery(profile):
    return [r for r in career_matching(profile) if r['category'] == 'unconventional']

def company_research():
    return {'status': 'Live research not connected', 'companies': [], 'sources': [], 'guidance': 'Verify company facts and vacancies on official sites before adding them. No hiring contacts are inferred.'}

def outreach_generator(profile, role):
    skill = ', '.join(profile['skills']) or '[add demonstrated skills]'
    return {'email': f"Subject: Exploring {role}\n\nHello [verified recipient],\n\nI am exploring {role} opportunities. My synthetic demo background includes {skill}. I would value a short conversation about your team’s work and the skills you look for.\n\nBest,\nAlex Example", 'linkedin': f"Hello [verified recipient], I’m exploring {role} and would appreciate learning about your work. Would you be open to a short conversation?", 'follow_up': 'Hello [verified recipient], following up on my earlier note. If a conversation is not possible, a relevant public resource would be appreciated.', 'status': 'Editable synthetic draft; never sent automatically'}

def interview_preparation(role):
    return {'role': role, 'company_briefing': 'No verified company supplied. Review its official website, products, annual report and role description.', 'learning_sheet': ['Explain one project with evidence of your contribution.', 'Practice a role-relevant task and document assumptions.', 'Compare the published role requirements with demonstrated skills.'], 'behavioral_questions': ['Describe a time you resolved uncertainty.', 'How did you measure the outcome of a project?'], 'interviewer_questions': ['What outcomes define success in the first 90 days?', 'How does the team support learning?'], 'status': 'General preparation template, not company-specific research'}

def application_tracker():
    return [{'role': 'Research operations specialist', 'company': 'Example Lab (fictional)', 'status': 'Researching', 'follow_up': ''}]

def analyze(req):
    profile = career_profile(req)
    matches = career_matching(profile)
    return {'profile': profile, 'matches': matches, 'research': company_research(), 'outreach': outreach_generator(profile, matches[0]['role']), 'interview': interview_preparation(matches[0]['role'])}
