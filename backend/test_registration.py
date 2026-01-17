import urllib.request
import json
import random
import string
import time

API_URL = "http://localhost:8080/api/auth/register"

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

# 1. Admin Registration (Should fail if already exists, but we use random to be sure)
admin_rand = generate_random_string()
register("Admin Test", "komatiguntlasumanths@admin.com", "Test@123", f"SuperAdmin_{admin_rand}")

# 2. HR Registration
hr_rand = generate_random_string()
register("HR Test", f"hr_{hr_rand}@hr.com", "Test@123", f"HR_User_{hr_rand}")

# 3. Student Registration (Gmail)
student_rand = generate_random_string()
register("Student Test", f"student_{student_rand}@gmail.com", "Test@123", f"Student_User_{student_rand}")

# 4. Fake Admin Registration (Should be Student)
fake_rand = generate_random_string()
register("Fake Admin Test", f"fake_{fake_rand}@admin.com", "Test@123", f"Fake_Admin_{fake_rand}")
