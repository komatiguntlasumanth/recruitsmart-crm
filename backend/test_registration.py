import urllib.request
import json
import random
import string
import time

API_URL = "http://localhost:8081/api/auth/register"

def generate_random_string(length=5):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def register(description, email, password, username):
    print(f"\n[{description}] Registering {email}...")
    payload = {
        "email": email,
        "password": password,
        "username": username
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(API_URL, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.getcode()}")
            body = json.loads(response.read().decode('utf-8'))
            user = body.get('user', {})
            print(f"Role: {user.get('role')}")
            print(f"Enabled: {user.get('enabled')}")
            print(f"Token: {'Present' if body.get('token') else 'Missing'}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        try:
            print(f"Body: {e.read().decode('utf-8')}")
        except:
            pass
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(1)

# 1. Admin Registration 
register("Admin Test", "komatiguntlasumanths@admin.com", "Test@123", "SuperAdmin")

# 2. HR Registration
rand_hr = f"hr_{generate_random_string()}@hr.com"
register("HR Test", rand_hr, "Test@123", "HR_User")

# 3. Student Registration (Gmail)
rand_student = f"student_{generate_random_string()}@gmail.com"
register("Student Test", rand_student, "Test@123", "Student_User")

# 4. Fake Admin Registration (Should be Student)
rand_fake = f"fake_{generate_random_string()}@admin.com"
register("Fake Admin Test", rand_fake, "Test@123", "Fake_Admin")
