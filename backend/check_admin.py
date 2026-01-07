import urllib.request
import json

# First try to login to see if admin already exists
login_url = "http://localhost:8081/api/auth/login"
register_url = "http://localhost:8081/api/auth/register"
email = "komatiguntlasumanths@admin.com"
password = "Asish@999"

print("Step 1: Testing if admin can login (already exists)...")
print("-" * 60)

login_payload = {"email": email, "password": password}
data = json.dumps(login_payload).encode('utf-8')
req = urllib.request.Request(login_url, data=data, headers={'Content-Type': 'application/json'}, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("✓ Admin already exists and login works!")
        body = json.loads(response.read().decode('utf-8'))
        user = body.get('user', {})
        print(f"Email: {user.get('email')}")
        print(f"Role: {user.get('role')}")
        print(f"Enabled: {user.get('enabled')}")
        print("\n✓✓ SOLUTION: Admin account is ready! You can login now.")
        exit(0)
except urllib.error.HTTPError as e:
    print(f"Login failed: HTTP {e.code}")
    try:
        error_body = e.read().decode('utf-8')
        if error_body:
            error_data = json.loads(error_body)
            message = error_data.get('message', '')
            print(f"Message: {message}")
            
            if "not registered" in message:
                print("\n✓ Admin doesn't exist. Proceeding to register...")
                print("-" * 60)
                
                # Try to register
                print("\nStep 2: Registering admin user...")
                register_payload = {"email": email, "password": password, "username": "Admin"}
                data = json.dumps(register_payload).encode('utf-8')
                req = urllib.request.Request(register_url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
                
                try:
                    with urllib.request.urlopen(req) as response:
                        print("✓ Registration successful!")
                        body = json.loads(response.read().decode('utf-8'))
                        user = body.get('user', {})
                        print(f"Email: {user.get('email')}")
                        print(f"Role: {user.get('role')}")
                        print(f"Enabled: {user.get('enabled')}")
                        print("\n✓✓ SOLUTION: Admin account created! You can login now.")
                        exit(0)
                except urllib.error.HTTPError as reg_error:
                    print(f"✗ Registration failed: HTTP {reg_error.code}")
                    try:
                        print(f"Error: {reg_error.read().decode('utf-8')}")
                    except:
                        print("Empty response - this is a Spring Security filter issue")
                        print("\n⚠ WORKAROUND: Try accessing the frontend at http://localhost:5173")
                        print("   and register there through the UI instead.")
                    exit(1)
            elif "Invalid" in message or "password" in message:
                print(f"\n✗ ISSUE: Admin exists but password doesn't match!")
                print(f"   The stored password is different from 'Asish@999'")
                print(f"\n   SOLUTIONS:")
                print(f"   1. Try the correct password if you remember it")
                print(f"   2. Or manually update the password in the database")
                exit(1)
        else:
            print("Empty error response")
    except Exception as parse_error:
        print(f"Could not parse error: {parse_error}")
        
except Exception as e:
    print(f"✗ Connection error: {e}")
    print("\n⚠ Backend might not be ready yet. Wait a few seconds and try again.")
    exit(1)
