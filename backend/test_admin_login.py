import urllib.request
import json
import sys

# Test login endpoint
url = "http://localhost:8081/api/auth/login"
email = "komatiguntlasumanths@admin.com"
password = "Asish@999"

payload = {
    "email": email,
    "password": password
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')

print(f"Testing login for: {email}")
print(f"URL: {url}")
print("-" * 60)

try:
    with urllib.request.urlopen(req) as response:
        print(f"✓ Login successful!")
        print(f"Status: {response.getcode()}")
        body = json.loads(response.read().decode('utf-8'))
        print(f"Response: {json.dumps(body, indent=2)}")
        sys.exit(0)
except urllib.error.HTTPError as e:
    print(f"✗ Login failed - HTTP {e.code}")
    try:
        error_body = e.read().decode('utf-8')
        if error_body:
            print(f"Error response: {error_body}")
            error_data = json.loads(error_body)
            print(f"Message: {error_data.get('message', 'No message')}")
        else:
            print("⚠ Empty response body - This is the 'Unexpected end of JSON input' error!")
            print("The backend is returning an empty response instead of JSON")
    except Exception as parse_error:
        print(f"Could not parse error: {parse_error}")
    sys.exit(1)
except Exception as e:
    print(f"✗ Connection error: {e}")
    print("Backend might not be running")
    sys.exit(1)
