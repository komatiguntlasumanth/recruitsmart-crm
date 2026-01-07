import urllib.request
import json
import time

API_URL = "http://localhost:8081/api/auth/register"

def test_registration(test_name, email, password, username, expected_role, expected_enabled):
    """Test user registration with expected outcomes"""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")
    print(f"Email: {email}")
    print(f"Expected Role: {expected_role}")
    print(f"Expected Enabled: {expected_enabled}")
    print("-" * 60)
    
    payload = {
        "email": email,
        "password": password,
        "username": username
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(API_URL, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            body = json.loads(response.read().decode('utf-8'))
            user = body.get('user', {})
            actual_role = user.get('role')
            actual_enabled = user.get('enabled')
            has_token = bool(body.get('token'))
            
            print(f"✓ Registration successful")
            print(f"Actual Role: {actual_role}")
            print(f"Actual Enabled: {actual_enabled}")
            print(f"Token provided: {has_token}")
            
            # Verify expectations
            if actual_role == expected_role and actual_enabled == expected_enabled:
                print(f"✓ TEST PASSED")
                return True
            else:
                print(f"✗ TEST FAILED - Mismatch in expectations")
                return False
                
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        try:
            error_body = e.read().decode('utf-8')
            print(f"Error: {error_body}")
            # If user already exists, that's okay for this test
            if e.code == 400 and "already registered" in error_body:
                print(f"ℹ User already exists (this is okay for verification)")
                return None
        except:
            pass
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

# Run comprehensive tests
print("\n" + "="*60)
print("ACCESS CONTROL VERIFICATION TESTS")
print("="*60)

results = []

# Test 1: Student with Gmail
results.append(test_registration(
    "Student Registration (@gmail.com)",
    f"test.student.{int(time.time())}@gmail.com",
    "Test@123",
    "TestStudent",
    "ROLE_STUDENT",
    True
))

time.sleep(0.5)

# Test 2: HR Registration
results.append(test_registration(
    "HR Registration (@hr.com) - Should be DISABLED",
    f"test.hr.{int(time.time())}@hr.com",
    "Test@123",
    "TestHR",
    "ROLE_HR",
    False  # Should be disabled pending approval
))

time.sleep(0.5)

# Test 3: Fake Admin (should become Student)
results.append(test_registration(
    "Fake Admin Registration (@admin.com domain but wrong email)",
    f"fake.admin.{int(time.time())}@admin.com",
    "Test@123",
    "FakeAdmin",
    "ROLE_STUDENT",  # Should default to STUDENT
    True
))

time.sleep(0.5)

# Test 4: Another domain (should be Student)
results.append(test_registration(
    "Other Domain Registration (@example.com)",
    f"test.user.{int(time.time())}@example.com",
    "Test@123",
    "TestExample",
    "ROLE_STUDENT",  # Should default to STUDENT
    True
))

# Summary
print("\n" + "="*60)
print("TEST SUMMARY")
print("="*60)
passed = sum(1 for r in results if r is True)
failed = sum(1 for r in results if r is False)
skipped = sum(1 for r in results if r is None)

print(f"Passed: {passed}")
print(f"Failed: {failed}")
print(f"Skipped (already exists): {skipped}")
print(f"Total: {len(results)}")

if failed == 0:
    print("\n✓ ALL TESTS PASSED - Access Control is working correctly!")
else:
    print("\n✗ SOME TESTS FAILED - Please review")
