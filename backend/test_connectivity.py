import urllib.request
import json

# Test if backend is accessible
try:
    req = urllib.request.Request("http://localhost:8081/api/auth/register", 
                                 data=json.dumps({
                                     "email": "newuser@gmail.com",
                                     "password": "Test@123",
                                     "username": "NewUser"
                                 }).encode('utf-8'),
                                 headers={'Content-Type': 'application/json'},
                                 method='POST')
    
    with urllib.request.urlopen(req) as response:
        print("✓ Backend is accessible")
        print(f"Status: {response.getcode()}")
        body = json.loads(response.read().decode('utf-8'))
        print(f"Response: {json.dumps(body, indent=2)}")
except urllib.error.HTTPError as e:
    print(f"✗ HTTP Error: {e.code}")
    try:
        print(f"Body: {e.read().decode('utf-8')}")
    except:
        pass
except Exception as e:
    print(f"✗ Connection Error: {e}")
    print("Backend might not be running or not ready yet")
