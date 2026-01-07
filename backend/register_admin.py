import urllib.request
import json

# Register admin user
url = "http://localhost:8081/api/auth/register"
email = "komatiguntlasumanths@admin.com"
password = "Asish@999"
username = "Admin"

payload = {
    "email": email,
    "password": password,
    "username": username
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')

print(f"Registering admin user...")
print(f"Email: {email}")
print(f"Username: {username}")
print("-" * 60)

try:
    with urllib.request.urlopen(req) as response:
        print(f"✓ Registration successful!")
        print(f"Status: {response.getcode()}")
        body = json.loads(response.read().decode('utf-8'))
        user = body.get('user', {})
        print(f"\nUser created:")
        print(f"  Email: {user.get('email')}")
        print(f"  Username: {user.get('username')}")
        print(f"  Role: {user.get('role')}")
        print(f"  Enabled: {user.get('enabled')}")
        print(f"  Token: {'Provided' if body.get('token') else 'Not provided'}")
        
        if user.get('role') == 'ROLE_ADMIN' and user.get('enabled'):
            print(f"\n✓ Admin account created successfully!")
            print(f"You can now login with these credentials.")
        else:
            print(f"\n⚠ Warning: Role is {user.get('role')}, expected ROLE_ADMIN")
            
except urllib.error.HTTPError as e:
    print(f"✗ Registration failed - HTTP {e.code}")
    try:
        error_body = e.read().decode('utf-8')
        print(f"Error: {error_body}")
        if "already registered" in error_body:
            print("\n⚠ Admin user already exists!")
            print("Try logging in instead.")
    except:
        pass
except Exception as e:
    print(f"✗ Error: {e}")
    print("\n⚠ Backend might not be running on localhost:8081")
    print("If you deployed to Railway/Vercel, go to that URL and register there.")
