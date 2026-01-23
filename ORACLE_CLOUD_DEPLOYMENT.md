# Oracle Cloud Deployment Guide

This guide will help you deploy the RecruitSmart CRM application to Oracle Cloud using Docker.

## Prerequisites

1. **Oracle Cloud Account**: Sign up at [cloud.oracle.com](https://cloud.oracle.com)
2. **Always Free Tier**: Oracle offers 4 ARM CPUs with 24GB RAM forever free
3. **Git installed** on your local machine
4. **SSH client** (built into Windows 10+, macOS, Linux)

## Step 1: Create Oracle Cloud Instance

### 1.1 Sign Up and Create Compute Instance

1. Go to Oracle Cloud Console
2. Navigate to **Compute** → **Instances** → **Create Instance**
3. Configure your instance:
   - **Name**: `recruitsmart-server`
   - **Image**: Ubuntu 22.04 (Canonical)
   - **Shape**: VM.Standard.A1.Flex (ARM-based, Always Free)
   - **OCPUs**: 4 (use all available free tier)
   - **Memory**: 24 GB (use all available free tier)
   - **Boot Volume**: 200 GB (max free tier)

### 1.2 Configure Networking

1. **Create or select VCN** (Virtual Cloud Network)
2. **Save your SSH keys**: Download the private key file (`.key` or `.pem`)
3. **Note the Public IP**: You'll see this after instance creation

### 1.3 Configure Firewall Rules

1. Go to **Networking** → **Virtual Cloud Networks** → Your VCN → **Security Lists**
2. Add **Ingress Rules**:
   - **Port 80** (HTTP) - Source: 0.0.0.0/0
   - **Port 8080** (Backend API) - Source: 0.0.0.0/0
   - **Port 22** (SSH) - Source: 0.0.0.0/0

## Step 2: Connect to Your Server

### Windows (PowerShell)
```powershell
# Set correct permissions on SSH key
icacls "path\to\your-key.key" /inheritance:r /grant:r "%username%:R"

# Connect to server
ssh -i "path\to\your-key.key" ubuntu@YOUR_PUBLIC_IP
```

### macOS/Linux
```bash
# Set correct permissions
chmod 400 ~/path/to/your-key.key

# Connect to server
ssh -i ~/path/to/your-key.key ubuntu@YOUR_PUBLIC_IP
```

## Step 3: Install Docker on Oracle Server

Once connected via SSH, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
exit
```

Reconnect via SSH after logging out.

## Step 4: Configure Server Firewall

```bash
# Allow HTTP, HTTPS, and backend API
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## Step 5: Deploy Your Application

### 5.1 Transfer Code to Server

**Option A: Using Git (Recommended)**
```bash
# Install git if not present
sudo apt install git -y

# Clone your repository
git clone https://github.com/YOUR_USERNAME/recruitsmart-crm.git
cd recruitsmart-crm
```

**Option B: Using SCP from your local machine**
```bash
# From your local machine (not on the server)
scp -i "path\to\your-key.key" -r c:\Projects\crmapplication ubuntu@YOUR_PUBLIC_IP:~/recruitsmart-crm
```

### 5.2 Configure Environment Variables

```bash
# Navigate to project directory
cd ~/recruitsmart-crm

# Create .env file from example
cp .env.example .env

# Edit the .env file
nano .env
```

Update these values in `.env`:
```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=your-strong-root-password
MYSQL_DATABASE=recruitsmart_db
MYSQL_USER=recruitsmart
MYSQL_PASSWORD=your-strong-database-password

# Backend Configuration
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random
FRONTEND_URL=http://YOUR_PUBLIC_IP

# Frontend Configuration
VITE_API_URL=http://YOUR_PUBLIC_IP:8080
```

**Replace `YOUR_PUBLIC_IP` with your actual Oracle instance public IP.**

Save and exit (Ctrl+X, then Y, then Enter).

### 5.3 Build and Start the Application

```bash
# Build and start all containers
docker-compose up -d --build

# This will:
# 1. Build the Spring Boot backend
# 2. Build the React frontend
# 3. Start MySQL database
# 4. Start all services
```

### 5.4 Monitor Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## Step 6: Access Your Application

1. **Frontend**: `http://YOUR_PUBLIC_IP`
2. **Backend API**: `http://YOUR_PUBLIC_IP:8080`
3. **Health Check**: `http://YOUR_PUBLIC_IP:8080/actuator/health`

## Step 7: Verify Deployment

1. Open your browser and go to `http://YOUR_PUBLIC_IP`
2. You should see the RecruitSmart login page
3. Try registering a new account
4. Test login functionality

## Useful Commands

### Managing the Application

```bash
# Stop all containers
docker-compose down

# Restart all containers
docker-compose restart

# View resource usage
docker stats

# Update application (after code changes)
git pull
docker-compose up -d --build

# View database
docker exec -it recruitsmart-mysql mysql -u recruitsmart -p
```

### Troubleshooting

```bash
# Check if containers are running
docker ps

# View all logs
docker-compose logs

# Restart a specific service
docker-compose restart backend

# Remove all containers and volumes (CAUTION: deletes database)
docker-compose down -v

# Check disk space
df -h

# Check memory usage
free -h
```

## Setting Up a Domain (Optional)

If you want to use a custom domain instead of the IP address:

1. Purchase a domain from a registrar (Namecheap, GoDaddy, etc.)
2. Add an **A Record** pointing to your Oracle instance public IP
3. Update `.env` file with your domain:
   ```bash
   FRONTEND_URL=http://yourdomain.com
   VITE_API_URL=http://yourdomain.com:8080
   ```
4. Rebuild: `docker-compose up -d --build`

## Security Recommendations

1. **Change default passwords** in `.env` file
2. **Use HTTPS** with Let's Encrypt (requires domain)
3. **Regular backups** of MySQL data:
   ```bash
   docker exec recruitsmart-mysql mysqldump -u recruitsmart -p recruitsmart_db > backup.sql
   ```
4. **Keep system updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Cost Monitoring

Oracle Cloud Always Free tier includes:
- ✅ 4 ARM CPUs (24GB RAM) - **FREE FOREVER**
- ✅ 200GB Boot Volume - **FREE FOREVER**
- ✅ 10TB Outbound Data Transfer/month - **FREE**

Your application should run completely free within these limits!

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure firewall rules are configured correctly
4. Check Oracle Cloud security lists allow traffic on ports 80 and 8080
