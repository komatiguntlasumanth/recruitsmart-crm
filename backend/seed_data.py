import urllib.request
import json
import time
import random
import sys
import os

# Get BASE_URL from env or arg, default to localhost
BASE_URL = os.environ.get("BASE_URL") or (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080")

def make_request(path, method="GET", payload=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(payload).encode('utf-8') if payload else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"HTTP Error on {method} {url}: {e.code} - {error_body}")
        try:
            return json.loads(error_body)
        except:
            return None
    except Exception as e:
        print(f"Error on {method} {url}: {e}")
        return None

def seed():
    ts = int(time.time())
    print(f"--- Starting Data Seeding on {BASE_URL} --- (TS: {ts})")
    
    # 1. Register/Login as Manager (@manager.com is auto-enabled)
    hr_email = f"manager_seed_{ts}@manager.com"
    hr_password = "Test@123"
    print(f"Registering HR (Manager role): {hr_email}...")
    
    reg_res = make_request("/api/auth/register", "POST", {
        "email": hr_email, 
        "password": hr_password, 
        "username": f"Manager_{ts}"
    })
    
    print(f"Logging in HR: {hr_email}...")
    hr_login = make_request("/api/auth/login", "POST", {"email": hr_email, "password": hr_password})
    if not hr_login:
        print("  HR login failed. Aborting.")
        return
    hr_token = hr_login.get("token")
    print("  ✓ HR authenticated.")

    # 2. Create Jobs
    job_titles = ["Software Engineer", "Frontend Developer", "Backend Developer", "Product Manager", "UI Designer"]
    created_jobs = []
    print(f"Creating {len(job_titles)} jobs...")
    for title in job_titles:
        job_payload = {
            "title": title,
            "companyName": "RecruitSmart Corp",
            "description": f"We are looking for a skilled {title} to join our growing team.",
            "location": "Remote",
            "salary": "15 LPA - 25 LPA",
            "designation": title,
            "level": "Mid-Senior",
            "status": "OPEN",
            "jobType": "JOB"
        }
        job = make_request("/api/jobs", "POST", job_payload, hr_token)
        if job:
            created_jobs.append(job)
            print(f"  ✓ Created Job: {title}")

    # 3. Create Students and Apply
    print("Registering students and creating applications...")
    for i in range(1, 11):
        stu_email = f"student_s_{ts}_{i}@gmail.com"
        stu_pass = "Test@123"
        
        # Register/Login student
        make_request("/api/auth/register", "POST", {"email": stu_email, "password": stu_pass, "username": f"Student_S_{i}"})
        stu_login = make_request("/api/auth/login", "POST", {"email": stu_email, "password": stu_pass})
        
        if stu_login:
            stu_token = stu_login.get("token")
            # Apply to 2-3 random jobs
            apps_to_make = random.sample(created_jobs, random.randint(2, 3))
            for job in apps_to_make:
                app = make_request(f"/api/applications/apply/{job.get('id')}", "POST", token=stu_token)
                if app:
                    print(f"    ✓ Student {i} applied to {job.get('title')}")
                    
                    # Randomly update status as HR (60% chance)
                    if random.random() > 0.4:
                        status = random.choice(["SHORTLISTED", "REJECTED", "HIRED", "INTERVIEW"])
                        make_request(f"/api/applications/{app.get('id')}/status", "PUT", {"status": status}, hr_token)
                        print(f"      ⭐ Updated status to: {status}")

    print("\n--- Seeding Complete! ---")
    print(f"Login with: {hr_email} / {hr_password}")
    print("Important: App.jsx must allow ROLE_MANAGER to see the ManagerDashboard.")

if __name__ == "__main__":
    seed()
