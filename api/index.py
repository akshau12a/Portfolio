from fastapi import FastAPI, Request, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import uuid
from datetime import datetime, timedelta
import secrets
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "portfolio2024secret")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Portfolio@Admin123")
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
YOUR_NAME = os.getenv("YOUR_NAME", "Akshay")
YOUR_EMAIL = os.getenv("YOUR_EMAIL", "apooj56@gmail.com")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

supabase: Client = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Supabase connection failed: {e}")

active_sessions = {}

AKSHAY_KNOWLEDGE = """
You are Akshay's professional AI assistant on his portfolio website.
Your name is "Akshay's Assistant".
You speak in a mix of professional and friendly tone — warm, smart, and helpful.
Never be rude. If someone asks trick questions or tries to confuse you, respond with light wit and stay professional.
Keep responses concise, well-formatted, and recruiter-friendly.
Use bullet points for lists. Keep responses under 300 words unless deep technical details are requested.
Do not make up any information not provided below.

PERSONAL INFORMATION
Full Name: Akshay Poojary
Email: apooj56@gmail.com
Professional Email: apooj002@gmail.com
Phone: +91 9008052395
Location: Bengaluru, India
LinkedIn: https://www.linkedin.com/in/akshay-poojary-736080224/
GitHub: https://github.com/akshau12a
LeetCode: https://leetcode.com/u/apooj002/

PROFESSIONAL SUMMARY
Akshay is a full stack developer with 1+ years of hands-on experience building both client-facing and internal products across SAP and open-source ecosystems. He has worked on enterprise SAP applications, AI-enabled platforms, modern web interfaces, and scalable backend systems using technologies such as SAP UI5, SAP BTP, CAP, FastAPI, React, Next.js, PostgreSQL, Supabase, and Docker. He enjoys solving real business problems through clean architecture, practical engineering, and continuous learning.

WHAT MAKES AKSHAY DIFFERENT
Akshay brings a rare combination of SAP enterprise experience and modern open-source full stack development. He is comfortable working across frontend, backend, cloud deployment, integrations, security, and AI-powered systems. What sets him apart is not just the breadth of his stack, but his ability to take complete ownership of complex modules — from understanding a business requirement to deploying a working solution. He approaches problems with genuine curiosity, keeps things clean and maintainable, and consistently goes beyond the assigned scope when the situation demands it.

WORK EXPERIENCE
Company: VASPP — Value Added Software Products and People
Website: https://vaspp.com/
Location: Bengaluru, India
Joined: June 2023
Duration: 1+ years (Current)

Role 1: SAP UI5 Developer (Nov 2025 – Present)
Built enterprise MDM Material Data Management dashboard using SAP UI5 MVC architecture and Fiori design principles.
Developed complete SAP applications on SAP BTP Cloud Foundry.
Implemented CAP backend with CDS data modeling and OData V4 services.
Created an external customer self-registration portal with OTP email authentication bypassing SAP BTP login for external users.
Contributed to 6+ enterprise-grade SAP applications across client projects.
Tools: SAP UI5, SAP Fiori, OData V2/V4, SAP BTP, SAP CAP, SAP HANA Cloud, Node.js, Express.js, HDI Container, SAP Work Zone, SAP DMS

Role 2: Backend Developer (Nov 2025 – Present)
Built AI-powered HR Resource Management System using FastAPI.
Implemented vector embeddings and Gemini AI for intelligent candidate matching.
Designed RSA-encrypted authentication for an industrial IoT testing platform.
Built JWT and OAuth2 authentication systems with role-based access control.
Containerized applications using Docker and docker-compose with Nginx.
Tools: Python, FastAPI, Next.js, PostgreSQL, Redis, ARQ, Docker, Nginx, Gemini AI, pytest

EDUCATION
1. Bachelor of Engineering in Computer Science Engineering
   College: Mangalore Institute of Technology and Engineering
   Location: Mangalore, Karnataka
   Years: 2019 – 2023

2. Minor Degree in Computer Science Engineering
   Institute: IIT Mandi
   Program: Minor in CSE — 1 year intensive program
   Years: 2024 – 2025
   Mode: Online via Masai School

PROJECTS

PROJECT 1: MDM — Material Data Management Dashboard
Status: LIVE in production
Tech: SAP UI5, SAP Fiori, SAP CAP, SAP HANA Cloud, OData V4, SAP BTP Cloud Foundry, HDI Container, SAP Work Zone, SAP DMS
Team: 4 members
Akshay's role: Built all UI applications initially, then took complete ownership of the Dashboard application.
Description:
Modernized the traditional SAP GUI MM01 material creation transaction into a modern SAP UI5 cloud application.
Built 6 SAPUI5 applications: Rule Engine, Create Material, Manage Material, Approval, Dashboard, Reporting.
Rule Engine enables dynamic layout configuration, field validations, and approval workflows without code changes.
Multi-level approval workflow with complete audit trail and history.
Bulk material upload using configurable Excel templates.
Integrated with SAP S4HANA using standard OData APIs.
Role-based authorization using SAP BTP Role Collections and XSUAA.
Integrated with SAP Document Management Service for attachments.
Business flow: User submits request, CAP validates, data stored in HANA Cloud, approval workflow initiated, then S4HANA integration on approval.

PROJECT 2: CDM — Customer Self-Registration Portal
Status: LIVE in production
Tech: SAP UI5, Node.js, Express.js, OData, SAP BTP, ABAP, SAP Gateway, Nodemailer
Team: 4 members
Akshay's role: Built the External Customer Creation portal and the Dashboard application.
Description:
Built a standalone portal allowing external customers to register without requiring SAP BTP access.
Technically challenging — required creating proxy services to bypass BTP authentication for external users.
Implemented OTP-based email verification with secure token management and one-time links.
Dynamic form rendering consuming OData APIs with conditional runtime field rendering.
Real-time validations for GSTIN, PAN, IFSC, phone, and email fields.
Paginated server-side value help dialogs with full-text search.
Integrated document upload and multi-level approval workflow.
ABAP backend with custom function modules.

PROJECT 3: AI-Powered HR Resource Management System
Status: Completed — 150 candidates processed
Tech: FastAPI, Next.js, PostgreSQL, Redis, ARQ, Docker, Nginx, Gemini AI, Vector Embeddings, Supabase, pytest
Team: Solo — Akshay took complete ownership of AI/ML, backend, and frontend.
Description:
Full-stack AI-powered HR platform with candidate tracking, resume parsing, and intelligent job matching.
Built async REST APIs with FastAPI and SQLAlchemy for candidate and resume management.
AI-driven candidate-to-request matching using vector embeddings and Gemini AI with semantic similarity scoring.
Automated resume extraction pipeline supporting PDF, DOCX, and PPTX formats.
Background job processing with ARQ and Redis for bulk resume uploads.
Next.js frontend with TypeScript and Tailwind CSS.
Containerized with Docker Compose including backend, frontend, AI service, worker, Redis, and Nginx.

PROJECT 4: Industrial IoT Safety Test Automation Backend
Status: In progress
Client: DGUV Ineo Remote-Master — German industrial safety testing platform
Tech: Python, FastAPI, RSA Cryptography, JWT, OAuth2, Docker, pytest, PostgreSQL, httpx, APScheduler
Team: 2 — Akshay took complete backend ownership.
Description:
Built FastAPI backend proxying the Remote-Master industrial testing platform API.
Automated RSA-encrypted authentication using OAEP SHA-1, eliminating all manual token generation steps.
Manages buildings, testers, customers, protocol files, and safety test sessions.
JWT-based OAuth2 with access and refresh tokens, admin and customer role scoping.
Auto-sync from Remote-Master every hour using APScheduler.
PDF protocol file caching with local storage.
Comprehensive pytest test suite covering authentication, endpoints, and token refresh.
Docker and docker-compose deployment with PostgreSQL.

FREELANCE PROJECT
Project: Naanu Casting Website
URL: http://naanucasting.com/
Akshay independently took over this website, which was previously built on Laravel, and reworked the complete website experience end-to-end. This reflects his ability to understand an existing codebase, improve it, and take full ownership of a client solution independently.

CERTIFICATIONS
1. SAP Generative AI Developer — C_AIG_2412 — Wingspan — July 21, 2026 — https://verify.onwingspan.com
2. SAPUI5/Fiori FullStack on BTP | RAP/ABAP Cloud & SAP BTP CAPM — Wingspan — July 21, 2026 — https://verify.onwingspan.com
3. Docker: A Project-Based Approach to Learning — Udemy — July 14, 2026 — ude.my/UC-f2f5551f-b21d-4219-8175-c6a75253594e
4. GenAI for Professionals: Boost Your Productivity — Udemy — July 23, 2026 — ude.my/UC-5f1d5ca4-aefd-4389-a251-a279156cb4ab
5. Docker Introducing Docker Essentials, Containers, and more — Wingspan — July 27, 2026 — https://verify.onwingspan.com
6. Docker Containers, Images, Compose, Kubernetes, and more — Udemy — July 22, 2026 — ude.my/UC-6c773478-90c1-4eOf-9cc1-7e60860df49e
7. SAPUI5/Fiori Fullstack on BTP CAPM with JavaScript & TypeScript 2026 — Udemy — July 14, 2026 — ude.my/UC-a3fbOf32-3ced-4c80-8b97-3cOcccOb39c1
8. TDD Frameworks/Tools — Wingspan — July 28, 2026 — https://verify.onwingspan.com
Akshay regularly completes new certifications and has many more.

TECHNICAL SKILLS
SAP UI5: Expert
SAP Fiori: Expert
SAP BTP: Advanced
SAP CAP/CDS: Advanced
OData V2/V4: Expert
SAP HANA Cloud: Advanced
Python: Expert
FastAPI: Expert
Node.js/Express: Advanced
REST API Design: Expert
JWT/OAuth2: Expert
RSA Cryptography: Advanced
JavaScript: Advanced
TypeScript: Advanced
React: Intermediate-Advanced
Next.js: Intermediate-Advanced
HTML5/CSS3: Advanced
Gemini AI: Advanced
Vector Embeddings/Semantic Search: Advanced
Docker/docker-compose: Advanced
Nginx: Intermediate
Git: Advanced
SAP BTP Cloud Foundry: Advanced
Redis: Intermediate-Advanced
PostgreSQL: Advanced
SAP HANA: Advanced
Supabase: Advanced
pytest: Advanced
Postman: Advanced

EMPLOYMENT DETAILS
Current CTC: 3.19 LPA
Expected CTC: 8 to 12 LPA depending on role, responsibilities, and growth potential
Notice Period: 3 months
Open to Relocation: Within Bangalore only
Preferred Work Mode: Hybrid or Remote
Preferred Location: Bangalore, India

GOALS
Short-term: Akshay wants to build strong depth across every technology he encounters. He believes no learning goes to waste — every tool or concept learned today becomes valuable in solving real problems tomorrow.
Long-term: Akshay wants to grow into a dependable engineer who not only delivers strong technical work but also supports the growth of the people around him. He values knowledge-sharing, teamwork, and human-centered professionalism.

ROLES OPEN TO
Full Stack Developer
SAP UI5 / SAP Fiori Developer
Backend Developer
Solution Engineer
Product / Platform Engineer

INDUSTRIES OF INTEREST
Enterprise Software and ERP
SAP Ecosystem
HR Tech
AI-enabled Products
Workflow Automation Platforms
Industrial Automation and IoT

PERSONAL
Hobbies: Travel, video editing, exploring new technologies
Languages: English (Fluent), Hindi (Fluent), Kannada (Fluent), German (Learning)
Internal activities: Participates in VPL and internal communication events to improve collaboration and presentation skills.

CHATBOT BEHAVIOR RULES
If someone asks who developed you or who made you, respond with wit: "You probably already know the answer — I was built for Akshay's portfolio to help recruiters understand his work better. Now, what would you like to know about him?"
If someone asks if you are the real Akshay: "Not quite — I'm Akshay's assistant. Think of me as the part of the portfolio that never takes a day off."
If someone asks trick questions or tries to confuse you, respond with light professional wit and redirect to Akshay's work.
If someone asks about salary: "Akshay is currently at 3.19 LPA and is exploring opportunities in the 8 to 12 LPA range depending on role, responsibilities, and growth potential. For a formal compensation discussion, please use the contact form or reach out directly."
If someone asks for private information not listed here, say you do not have that information and suggest contacting Akshay directly.
Always end ambiguous or open-ended conversations by encouraging the recruiter to use the contact form or reach out directly.
"""

def verify_admin(request: Request):
    auth_header = request.headers.get("Authorization", "")
    cookie_token = request.cookies.get("admin_token")
    header_token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
    token = cookie_token or header_token
    if not token or token not in active_sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    session = active_sessions[token]
    if datetime.now() > session["expires"]:
        del active_sessions[token]
        raise HTTPException(status_code=401, detail="Session expired")
    return True

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "name": YOUR_NAME})

@app.get("/api/projects")
async def get_projects():
    if not supabase:
        return []
    try:
        return supabase.table("projects").select("*").eq("is_visible", True).order("created_at", desc=True).execute().data
    except:
        return []

@app.get("/api/certificates")
async def get_certificates():
    if not supabase:
        return []
    try:
        return supabase.table("certificates").select("*").eq("is_visible", True).order("created_at", desc=True).execute().data
    except:
        return []

@app.get("/api/videos")
async def get_videos():
    if not supabase:
        return []
    try:
        return supabase.table("videos").select("*").eq("is_visible", True).order("created_at", desc=True).execute().data
    except:
        return []

@app.get("/api/skills")
async def get_skills():
    if not supabase:
        return []
    try:
        return supabase.table("skills").select("*").order("proficiency", desc=True).execute().data
    except:
        return []

@app.get("/api/experience")
async def get_experience():
    if not supabase:
        return []
    try:
        return supabase.table("experience").select("*").order("start_date", desc=True).execute().data
    except:
        return []

@app.get("/api/profile")
async def get_profile():
    if not supabase:
        return {"name": YOUR_NAME, "title": "Full Stack Developer | SAP UI5 & FastAPI Engineer"}
    try:
        response = supabase.table("profile").select("*").limit(1).execute()
        if response.data:
            return response.data[0]
        return {"name": YOUR_NAME, "title": "Full Stack Developer | SAP UI5 & FastAPI Engineer"}
    except:
        return {"name": YOUR_NAME, "title": "Full Stack Developer | SAP UI5 & FastAPI Engineer"}

@app.get("/api/resume-url")
async def get_resume_url():
    if not supabase:
        return {"url": None}
    try:
        response = supabase.table("profile").select("resume_url").limit(1).execute()
        if response.data and response.data[0].get("resume_url"):
            return {"url": response.data[0]["resume_url"]}
        return {"url": None}
    except:
        return {"url": None}

class ChatMessage(BaseModel):
    message: str
    history: list = []

@app.post("/api/chat")
async def chat(chat_msg: ChatMessage):
    if not GEMINI_API_KEY:
        return {
            "response": "AI service not configured. Contact Akshay at **apooj56@gmail.com** or **+91 9008052395**.",
            "error": False
        }

    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)

        history_text = ""
        if chat_msg.history:
            for item in chat_msg.history[-6:]:
                role = "User" if item.get("role") == "user" else "Assistant"
                history_text += f"{role}: {item.get('content', '')}\n"

        prompt = f"""{AKSHAY_KNOWLEDGE}

CONVERSATION HISTORY:
{history_text}

CURRENT USER QUESTION: {chat_msg.message}

INSTRUCTIONS:
- Answer using ONLY the information provided above about Akshay.
- Be professional, warm, and helpful. Sound human.
- Use **bold** for important terms, technologies, and companies.
- Use bullet points for lists.
- Keep answers 150-250 words unless deep technical details are asked.
- For project questions, give proper detail (what it does, tech stack, his role, status).
- If info is not in the knowledge base, politely say so and suggest contacting Akshay directly.
- Never respond with just "ask me about skills/projects" — always give a real answer.
- For trick or off-topic questions, respond with light wit and redirect.

Now answer:"""

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )
        answer = response.text.strip() if response.text else ""
        if not answer:
            return {"response": "I couldn't generate a response. Contact Akshay at **apooj56@gmail.com**.", "error": False}
        return {"response": answer, "error": False}

    except ImportError as e:
        return {"response": f"AI library missing. Run: pip install google-genai\n\nError: {str(e)}", "error": True}
    except Exception as e:
        print(f"[Gemini Error] {str(e)}")
        return {
            "response": f"AI issue. Contact Akshay at **apooj56@gmail.com** or **+91 9008052395**.\n\n(Debug: {str(e)[:200]})",
            "error": True
        }
class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    request_type: str = "general"

@app.post("/api/contact")
async def send_contact(contact: ContactRequest):
    try:
        if supabase:
            supabase.table("contact_requests").insert({
                "name": contact.name,
                "email": contact.email,
                "subject": contact.subject,
                "message": contact.message,
                "request_type": contact.request_type,
                "created_at": datetime.now().isoformat()
            }).execute()

        if SMTP_EMAIL and SMTP_PASSWORD:
            type_colors = {
                'salary_request': '#f59e0b',
                'interview_request': '#10b981',
                'collaboration': '#7c3aed',
                'freelance': '#ef4444',
                'general': '#2563eb'
            }
            color = type_colors.get(contact.request_type, '#2563eb')

            msg = MIMEMultipart('alternative')
            msg['From'] = SMTP_EMAIL
            msg['To'] = YOUR_EMAIL
            msg['Subject'] = f"[Portfolio] {contact.subject} — {contact.request_type.replace('_', ' ').upper()}"

            html_body = f"""
            <html>
            <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:30px;margin:0;">
                <div style="max-width:580px;margin:0 auto;">
                    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:36px;text-align:center;">
                            <h1 style="color:white;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">New Portfolio Inquiry</h1>
                            <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:13px;">Someone reached out via your portfolio website</p>
                        </div>
                        <div style="padding:36px;">
                            <div style="text-align:center;margin-bottom:28px;">
                                <span style="background:{color};color:white;padding:6px 20px;border-radius:50px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">{contact.request_type.replace('_', ' ')}</span>
                            </div>
                            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                                <tr style="border-bottom:1px solid #f1f5f9;">
                                    <td style="padding:14px 0;font-weight:600;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;width:100px;">From</td>
                                    <td style="padding:14px 0;color:#1e293b;font-size:15px;font-weight:600;">{contact.name}</td>
                                </tr>
                                <tr style="border-bottom:1px solid #f1f5f9;">
                                    <td style="padding:14px 0;font-weight:600;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Email</td>
                                    <td style="padding:14px 0;"><a href="mailto:{contact.email}" style="color:#2563eb;font-weight:500;text-decoration:none;">{contact.email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 0;font-weight:600;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Subject</td>
                                    <td style="padding:14px 0;color:#1e293b;font-size:14px;">{contact.subject}</td>
                                </tr>
                            </table>
                            <div style="background:#f8fafc;border-radius:12px;padding:24px;border-left:4px solid {color};">
                                <p style="font-weight:700;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Message</p>
                                <p style="color:#334155;line-height:1.85;margin:0;font-size:14px;">{contact.message}</p>
                            </div>
                            <div style="text-align:center;margin-top:28px;">
                                <a href="mailto:{contact.email}" style="display:inline-block;background:#2563eb;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Reply to {contact.name}</a>
                            </div>
                        </div>
                        <div style="padding:20px;text-align:center;background:#f8fafc;border-top:1px solid #e2e8f0;">
                            <p style="color:#94a3b8;font-size:11px;margin:0;">Sent from Akshay's Portfolio &bull; {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """

            msg.attach(MIMEText(html_body, 'html'))
            smtp_password_clean = SMTP_PASSWORD.replace(" ", "")
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_EMAIL, smtp_password_clean)
                server.send_message(msg)

        return {"success": True, "message": "Message sent successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/track-download")
async def track_download(request: Request):
    if supabase:
        try:
            body = await request.json()
            supabase.table("analytics").insert({
                "event": "resume_download",
                "visitor_info": body.get("info", ""),
                "created_at": datetime.now().isoformat()
            }).execute()
        except:
            pass
    return {"ok": True}

@app.post("/api/track-visit")
async def track_visit(request: Request):
    if supabase:
        try:
            supabase.table("analytics").insert({
                "event": "page_visit",
                "visitor_info": request.headers.get("user-agent", ""),
                "created_at": datetime.now().isoformat()
            }).execute()
        except:
            pass
    return {"ok": True}

@app.get("/portal/{secret}", response_class=HTMLResponse)
async def admin_page(request: Request, secret: str):
    if secret != ADMIN_SECRET:
        raise HTTPException(status_code=404, detail="Not Found")
    return templates.TemplateResponse("admin.html", {"request": request})

class LoginRequest(BaseModel):
    password: str

@app.post("/api/admin/login")
async def admin_login(login: LoginRequest):
    if login.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    token = secrets.token_urlsafe(64)
    active_sessions[token] = {
        "created": datetime.now(),
        "expires": datetime.now() + timedelta(hours=24)
    }
    response = JSONResponse({"success": True, "token": token})
    response.set_cookie(key="admin_token", value=token, httponly=True, secure=False, samesite="lax", max_age=86400)
    return response

@app.post("/api/admin/logout")
async def admin_logout(request: Request):
    token = request.cookies.get("admin_token")
    if token and token in active_sessions:
        del active_sessions[token]
    response = JSONResponse({"success": True})
    response.delete_cookie("admin_token")
    return response

@app.get("/api/admin/verify")
async def verify_session(authorized: bool = Depends(verify_admin)):
    return {"valid": True}

@app.post("/api/admin/project")
async def create_project(
    request: Request,
    title: str = Form(...),
    description: str = Form(...),
    tech_stack: str = Form(""),
    live_url: str = Form(""),
    github_url: str = Form(""),
    image: Optional[UploadFile] = File(None),
    authorized: bool = Depends(verify_admin)
):
    image_url = ""
    if image and image.filename:
        file_name = f"projects/{uuid.uuid4()}.{image.filename.split('.')[-1]}"
        content = await image.read()
        supabase.storage.from_("portfolio").upload(file_name, content, {"content-type": image.content_type})
        image_url = f"{SUPABASE_URL}/storage/v1/object/public/portfolio/{file_name}"
    data = {
        "title": title, "description": description, "tech_stack": tech_stack,
        "live_url": live_url, "github_url": github_url, "image_url": image_url,
        "is_visible": True, "created_at": datetime.now().isoformat()
    }
    return {"success": True, "data": supabase.table("projects").insert(data).execute().data}

@app.delete("/api/admin/project/{project_id}")
async def delete_project(project_id: str, authorized: bool = Depends(verify_admin)):
    supabase.table("projects").delete().eq("id", project_id).execute()
    return {"success": True}

@app.patch("/api/admin/project/{project_id}")
async def toggle_project(project_id: str, request: Request, authorized: bool = Depends(verify_admin)):
    body = await request.json()
    supabase.table("projects").update({"is_visible": body.get("is_visible", True)}).eq("id", project_id).execute()
    return {"success": True}

@app.post("/api/admin/certificate")
async def create_certificate(
    request: Request,
    title: str = Form(...),
    issuer: str = Form(...),
    date_obtained: str = Form(...),
    credential_url: str = Form(""),
    image: Optional[UploadFile] = File(None),
    pdf: Optional[UploadFile] = File(None),
    authorized: bool = Depends(verify_admin)
):
    try:
        image_url = ""
        pdf_url = ""
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not connected. Check your .env SUPABASE_URL and SUPABASE_KEY.")
        if image and image.filename:
            file_name = f"certificates/{uuid.uuid4()}.{image.filename.split('.')[-1]}"
            content = await image.read()
            supabase.storage.from_("portfolio").upload(file_name, content, {"content-type": image.content_type})
            image_url = f"{SUPABASE_URL}/storage/v1/object/public/portfolio/{file_name}"
        if pdf and pdf.filename:
            file_name = f"certificates/pdf/{uuid.uuid4()}.pdf"
            content = await pdf.read()
            supabase.storage.from_("portfolio").upload(file_name, content, {"content-type": "application/pdf"})
            pdf_url = f"{SUPABASE_URL}/storage/v1/object/public/portfolio/{file_name}"
        data = {
            "title": title, "issuer": issuer, "date_obtained": date_obtained,
            "credential_url": credential_url, "image_url": image_url, "pdf_url": pdf_url,
            "is_visible": True, "created_at": datetime.now().isoformat()
        }
        result = supabase.table("certificates").insert(data).execute()
        return {"success": True, "data": result.data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Certificate upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/certificate/{cert_id}")
async def delete_certificate(cert_id: str, authorized: bool = Depends(verify_admin)):
    supabase.table("certificates").delete().eq("id", cert_id).execute()
    return {"success": True}

@app.post("/api/admin/video")
async def create_video(
    request: Request,
    title: str = Form(...),
    description: str = Form(""),
    video_url: str = Form(""),
    video_type: str = Form("youtube"),
    thumbnail: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
    authorized: bool = Depends(verify_admin)
):
    thumbnail_url = ""
    uploaded_video_url = video_url
    if thumbnail and thumbnail.filename:
        file_name = f"thumbnails/{uuid.uuid4()}.{thumbnail.filename.split('.')[-1]}"
        content = await thumbnail.read()
        supabase.storage.from_("portfolio").upload(file_name, content, {"content-type": thumbnail.content_type})
        thumbnail_url = f"{SUPABASE_URL}/storage/v1/object/public/portfolio/{file_name}"
    if video_file and video_file.filename:
        file_name = f"videos/{uuid.uuid4()}.{video_file.filename.split('.')[-1]}"
        content = await video_file.read()
        supabase.storage.from_("portfolio").upload(file_name, content, {"content-type": video_file.content_type})
        uploaded_video_url = f"{SUPABASE_URL}/storage/v1/object/public/portfolio/{file_name}"
        video_type = "direct"
    data = {
        "title": title, "description": description, "video_url": uploaded_video_url,
        "video_type": video_type, "thumbnail_url": thumbnail_url,
        "is_visible": True, "created_at": datetime.now().isoformat()
    }
    return {"success": True, "data": supabase.table("videos").insert(data).execute().data}

@app.delete("/api/admin/video/{video_id}")
async def delete_video(video_id: str, authorized: bool = Depends(verify_admin)):
    supabase.table("videos").delete().eq("id", video_id).execute()
    return {"success": True}

@app.post("/api/admin/skill")
async def create_skill(request: Request, authorized: bool = Depends(verify_admin)):
    body = await request.json()
    data = {"name": body["name"], "category": body.get("category", "other"), "proficiency": body.get("proficiency", 80), "icon": body.get("icon", "")}
    return {"success": True, "data": supabase.table("skills").insert(data).execute().data}

@app.delete("/api/admin/skill/{skill_id}")
async def delete_skill(skill_id: str, authorized: bool = Depends(verify_admin)):
    supabase.table("skills").delete().eq("id", skill_id).execute()
    return {"success": True}

@app.post("/api/admin/experience")
async def create_experience(request: Request, authorized: bool = Depends(verify_admin)):
    body = await request.json()
    data = {"company": body["company"], "role": body["role"], "description": body.get("description", ""), "start_date": body["start_date"], "end_date": body.get("end_date"), "is_current": body.get("is_current", False)}
    return {"success": True, "data": supabase.table("experience").insert(data).execute().data}

@app.delete("/api/admin/experience/{exp_id}")
async def delete_experience(exp_id: str, authorized: bool = Depends(verify_admin)):
    supabase.table("experience").delete().eq("id", exp_id).execute()
    return {"success": True}

@app.post("/api/admin/profile")
async def update_profile(
    request: Request,
    name: str = Form(""),
    title: str = Form(""),
    bio: str = Form(""),
    availability: str = Form("open"),
    location: str = Form(""),
    github: str = Form(""),
    linkedin: str = Form(""),
    twitter: str = Form(""),
    avatar: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None),
    authorized: bool = Depends(verify_admin)
):
    data = {"name": name, "title": title, "bio": bio, "availability": availability, "location": location, "github": github, "linkedin": linkedin, "twitter": twitter, "updated_at": datetime.now().isoformat()}
    if avatar and avatar.filename:
        file_name = f"profile/avatar.{avatar.filename.split('.')[-1]}"
        content = await avatar.read()
        try:
            supabase.storage.from_("portfolio").remove([file_name])
        except:
            pass
        supabase.storage.from_("portfolio").upload(file_name, content, {"content-type": avatar.content_type})
        data["avatar_url"] = f"{SUPABASE_URL}/storage/v1/object/public/portfolio/{file_name}"
    if resume and resume.filename:
        file_name = f"profile/resume.{resume.filename.split('.')[-1]}"
        content = await resume.read()
        try:
            supabase.storage.from_("portfolio").remove([file_name])
        except:
            pass
        supabase.storage.from_("portfolio").upload(file_name, content, {"content-type": resume.content_type})
        data["resume_url"] = f"{SUPABASE_URL}/storage/v1/object/public/portfolio/{file_name}"
    existing = supabase.table("profile").select("id").limit(1).execute()
    if existing.data:
        response = supabase.table("profile").update(data).eq("id", existing.data[0]["id"]).execute()
    else:
        response = supabase.table("profile").insert(data).execute()
    return {"success": True, "data": response.data}

@app.get("/api/admin/analytics")
async def get_analytics(authorized: bool = Depends(verify_admin)):
    if not supabase:
        return {"visits": 0, "downloads": 0, "contacts": 0, "recent_messages": []}
    try:
        visits = supabase.table("analytics").select("id", count="exact").eq("event", "page_visit").execute()
        downloads = supabase.table("analytics").select("id", count="exact").eq("event", "resume_download").execute()
        contacts = supabase.table("contact_requests").select("id", count="exact").execute()
        messages = supabase.table("contact_requests").select("*").order("created_at", desc=True).limit(20).execute()
        return {"visits": visits.count or 0, "downloads": downloads.count or 0, "contacts": contacts.count or 0, "recent_messages": messages.data or []}
    except:
        return {"visits": 0, "downloads": 0, "contacts": 0, "recent_messages": []}

@app.get("/api/admin/projects")
async def admin_get_projects(authorized: bool = Depends(verify_admin)):
    if not supabase:
        return []
    try:
        return supabase.table("projects").select("*").order("created_at", desc=True).execute().data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/certificates")
async def admin_get_certificates(authorized: bool = Depends(verify_admin)):
    if not supabase:
        return []
    try:
        return supabase.table("certificates").select("*").order("created_at", desc=True).execute().data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/videos")
async def admin_get_videos(authorized: bool = Depends(verify_admin)):
    if not supabase:
        return []
    try:
        return supabase.table("videos").select("*").order("created_at", desc=True).execute().data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))