# Starting the RecruitSmart Application

## Frontend ✅ RUNNING
The React frontend is successfully running at: **http://localhost:5173/**

## Backend ✅ RUNNING

The Spring Boot backend is successfully running at: **http://localhost:8080/**

### Fast Startup (Using Wrapper)
1. Open terminal in `backend` folder
2. Run: `.\mvnw.cmd spring-boot:run`

### Option 1: Install Maven (Global)
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract to a directory (e.g., `C:\Program Files\Apache\maven`)
3. Add Maven's `bin` folder to your system PATH:
   - Right-click "This PC" → Properties → Advanced System Settings
   - Click "Environment Variables"
   - Under "System Variables", find "Path" and click "Edit"
   - Add: `C:\Program Files\Apache\maven\bin`
4. Open a new terminal and run:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

### 🏃‍♂️ How to Run (Daily Routine)

**1. Start the Backend**
Open a terminal in the `backend` folder and run:
```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-24'; .\mvnw.cmd spring-boot:run
```

**2. Start the Frontend**
Open a new terminal in the `frontend` folder and run:
```powershell
npm run dev
```

The app will be available at: **http://localhost:5173/**

## Expected Result
Both servers are currently running:
- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:8080/

The application will be fully functional with:
- User registration with OTP verification
- Secure login with BCrypt password hashing
- JWT-based authentication
- Role-based access control (Manager, Sales Rep, Student)
- Lead management with ML scoring
- Pipeline visualization
- Lead-to-customer conversion

## Troubleshooting
- If the frontend shows API errors, ensure the backend is running on port 8080
- Check that Java 17+ is installed: `java -version`
- Verify Maven is installed: `mvn -version`
