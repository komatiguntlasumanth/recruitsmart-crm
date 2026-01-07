import urllib.request
import json

url = "http://localhost:8081/api/auth/login"
payload = {
    "email": "komatiguntlasumanths@admin.com",
    "password": "Test@123"
}
headers = {
    "Content-Type": "application/json"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response Body: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Error Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
