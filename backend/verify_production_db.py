import urllib.request
import json
import time

def check_health(url):
    print(f"Checking health at: {url} ...")
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.getcode() == 200:
                body = json.loads(response.read().decode('utf-8'))
                print("✓ Production Backend is UP!")
                print(f"Response: {json.dumps(body, indent=2)}")
                return True
            else:
                print(f"✗ Unexpected status code: {response.getcode()}")
    except urllib.error.HTTPError as e:
        print(f"✗ HTTP Error {e.code}: {e.reason}")
        try:
            print(f"Body: {e.read().decode('utf-8')}")
        except:
            pass
    except Exception as e:
        print(f"✗ Connection Error: {e}")
    return False

if __name__ == "__main__":
    prod_url = "https://recruitsmart-crm-production.up.railway.app/actuator/health"
    
    print("--- Production Database Initialization Verification ---")
    print("Waiting for backend to spin up...")
    
    # Simple retry loop
    for i in range(5):
        if check_health(prod_url):
            print("\nSUCCESS: Production database is initialized and online.")
            break
        print(f"Retry {i+1}/5 in 10 seconds...")
        time.sleep(10)
    else:
        print("\nFAILURE: Backend is still not reachable. Please check Railway logs.")
