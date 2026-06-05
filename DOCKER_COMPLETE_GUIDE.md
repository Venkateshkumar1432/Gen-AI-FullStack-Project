# Full Stack Docker Setup Guide - Interview AI

Complete guide for running the entire Interview AI application (Frontend + Backend + MongoDB) using Docker.

## 📁 Project Structure
```
interview-ai-yt/
├── Frontend/
│   ├── Dockerfile           # Vite React app build + Nginx serve
│   ├── nginx.conf          # Nginx configuration
│   ├── .dockerignore       # Files to exclude from Docker build
│   └── .env.example        # Environment variables template
├── Backend/
│   ├── Dockerfile          # Node.js Express API
│   ├── .dockerignore       # Files to exclude from Docker build
│   └── .env.example        # Environment variables template
├── docker-compose.yml      # Orchestrates all services
└── DOCKER_COMPLETE_GUIDE.md (this file)
```

## 🚀 Quick Start

### 1. Clone & Setup
```bash
cd interview-ai-yt

# Copy environment files
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

### 2. Update .env Files with Your Secrets
```bash
# Backend/.env
MONGODB_URI=mongodb://admin:password@mongo:27017/interview-ai?authSource=admin
JWT_SECRET=your_strong_secret_key_here
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost

# Frontend/.env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start All Services
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### 4. Verify Services
```bash
# Check container status
docker-compose ps

# Output should show:
# NAME                      STATUS
# interview-ai-frontend     Up (healthy)
# interview-ai-backend      Up (healthy)
# interview-ai-mongo        Up (healthy)
```

### 5. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000/api
- **MongoDB**: mongodb://admin:password@localhost:27017/interview-ai

## 📋 Service Details

### Frontend (React + Vite + Nginx)
| Component | Details |
|-----------|---------|
| **Port** | 80 (HTTP) |
| **Server** | Nginx (Alpine) |
| **Build Base** | Node 20-Alpine |
| **Final Size** | ~5MB |
| **Features** | SPA routing, gzip compression, security headers |

**Key Features:**
- ✅ Multi-stage build (optimized size)
- ✅ Gzip compression enabled
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Static asset caching (1 year)
- ✅ SPA routing with fallback to index.html
- ✅ Health checks

### Backend (Node.js + Express)
| Component | Details |
|-----------|---------|
| **Port** | 3000 |
| **Runtime** | Node 20-Alpine |
| **Framework** | Express 5 |
| **Features** | JWT auth, Gemini AI, PDF parsing, YouTube processing |

**Key Features:**
- ✅ Production dependencies only
- ✅ Non-root user execution
- ✅ Health checks
- ✅ Environment configuration

### MongoDB
| Component | Details |
|-----------|---------|
| **Port** | 27017 |
| **Image** | mongo:7-alpine |
| **Storage** | Named volumes (persistent) |
| **Auth** | Admin user + password |

**Volumes:**
- `mongo_data`: Database files
- `mongo_config`: Configuration

## 🛑 Stop & Cleanup

### Stop Services (Keep Data)
```bash
docker-compose stop
```

### Stop & Remove Containers (Keep Data)
```bash
docker-compose down
```

### Stop & Remove Everything (Delete Data)
```bash
docker-compose down -v
```

### Remove Images
```bash
docker-compose down --rmi all
```

## 🔧 Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Follow specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Enter Container Shell
```bash
# Backend (Node)
docker exec -it interview-ai-backend sh

# Frontend (Nginx)
docker exec -it interview-ai-frontend sh

# MongoDB
docker exec -it interview-ai-mongo mongosh
```

### Restart Services
```bash
# Restart specific service
docker-compose restart backend

# Restart all
docker-compose restart
```

### Rebuild Images
```bash
# Rebuild frontend
docker-compose build frontend

# Rebuild backend
docker-compose build backend

# Rebuild all
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### Scale Services
```bash
# Run 3 backend instances (requires load balancing)
docker-compose up -d --scale backend=3
```

## 🔐 Security Best Practices

### Environment Variables
⚠️ **NEVER commit .env files with real secrets**

For production:
1. Use secure secret management:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Docker Secrets (if using Swarm)

2. Rotate secrets regularly:
   - Change JWT_SECRET
   - Update MongoDB passwords
   - Regenerate API keys

### Docker Security
- ✅ Non-root user execution (frontend & backend)
- ✅ Alpine Linux base (minimal attack surface)
- ✅ No privileged containers
- ✅ Health checks enabled

### Network Security
- ✅ Internal Docker network (isolated)
- ✅ Only necessary ports exposed
- ✅ CORS configured for frontend
- ✅ HTTPS ready (add reverse proxy like Traefik)

## 📊 Monitoring & Debugging

### Container Stats
```bash
# Real-time resource usage
docker stats

# Specific container
docker stats interview-ai-backend
```

### Check Network
```bash
# Inspect network
docker network inspect interview-ai-yt_interview-ai-network

# Test connectivity
docker exec interview-ai-backend ping mongo
```

### Database Connection Test
```bash
# Connect to MongoDB
docker exec -it interview-ai-mongo mongosh -u admin -p password

# Inside mongosh shell
show dbs
use interview-ai
db.users.findOne()
```

### API Health Check
```bash
# From host
curl http://localhost:3000

# From container
docker exec interview-ai-backend curl http://backend:3000
```

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] Update all environment variables in .env files
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Change MongoDB password
- [ ] Verify API keys are valid
- [ ] Test all services locally first
- [ ] Review security settings
- [ ] Set up log aggregation
- [ ] Configure backups for MongoDB

### Production .env Example
```bash
# Backend/.env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/interview-ai
JWT_SECRET=very-strong-random-string-min-32-chars
GEMINI_API_KEY=your-prod-key
FRONTEND_URL=https://yourdomain.com

# Frontend/.env
VITE_API_URL=https://api.yourdomain.com/api
```

### Using Docker Swarm (for production clustering)
```bash
# Initialize Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml interview-ai

# Scale backend
docker service scale interview-ai_backend=3
```

### Using Kubernetes (Enterprise)
```bash
# Export docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml

# Deploy
kubectl apply -f .
```

## 🐛 Troubleshooting

### Frontend Shows Blank Page
```bash
# Check Nginx logs
docker logs interview-ai-frontend

# Verify build artifacts exist
docker exec interview-ai-frontend ls -la /usr/share/nginx/html

# Clear browser cache
# Open DevTools > Application > Clear Storage
```

### Backend Connection Refused
```bash
# Check if service is running
docker-compose ps

# View logs
docker-compose logs backend

# Verify port is not in use
netstat -an | grep 3000 (Linux/Mac)
netstat -ano | findstr :3000 (Windows)
```

### MongoDB Connection Issues
```bash
# Check MongoDB health
docker-compose logs mongo

# Verify credentials
docker exec interview-ai-mongo mongosh -u admin -p password

# Check persistent volumes
docker volume ls
docker volume inspect interview-ai-yt_mongo_data
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Find and update the ports section:
services:
  frontend:
    ports:
      - "8080:80"  # Changed from 80:80
  backend:
    ports:
      - "3001:3000"  # Changed from 3000:3000
```

## 📚 Docker Commands Reference

```bash
# Build
docker-compose build                    # Build all services
docker-compose build --no-cache         # Rebuild without cache

# Start/Stop
docker-compose up -d                    # Start in background
docker-compose down                     # Stop and remove containers
docker-compose restart                  # Restart services

# Logs
docker-compose logs -f                  # Follow all logs
docker-compose logs -f backend          # Follow backend logs
docker-compose logs --tail=50 mongo     # Last 50 lines

# Execute
docker exec -it container-name sh       # Enter container shell
docker exec container-name command      # Run command in container

# Manage
docker-compose ps                       # List containers
docker-compose config                   # View resolved config
docker volume ls                        # List volumes
docker network ls                       # List networks
```

## 🎯 Performance Tips

### For Development
- Enable volume mounts for hot-reload:
```yaml
volumes:
  - ./Frontend/src:/app/src
  - ./Backend/src:/app/src
```

- Use `docker-compose.dev.yml` for development-specific settings

### For Production
- Disable volume mounts
- Enable read-only filesystem where possible
- Use proper logging drivers (json-file, splunk, etc.)
- Set resource limits:
```yaml
resources:
  limits:
    cpus: '1'
    memory: 512M
  reservations:
    cpus: '0.5'
    memory: 256M
```

### BuildKit (Faster Builds)
```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Build with BuildKit
docker-compose build
```

## 📖 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Documentation](https://vitejs.dev/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

## ❓ FAQ

**Q: How do I access MongoDB from outside Docker?**
A: MongoDB is exposed on `localhost:27017`. Use connection string: `mongodb://admin:password@localhost:27017/interview-ai?authSource=admin`

**Q: Can I run just the backend without frontend?**
A: Yes! Run: `docker-compose up backend mongo` (skips frontend)

**Q: How do I update my code after changes?**
A: 
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

**Q: How do I backup MongoDB data?**
A: 
```bash
docker exec interview-ai-mongo mongodump --out /backup --username admin --password password
docker cp interview-ai-mongo:/backup ./backup
```

**Q: Is it safe to expose MongoDB on port 27017?**
A: No. In production, don't expose MongoDB. Access it only from backend container within the network.

---

**Last Updated**: June 2026  
**Docker Version**: 20.10+  
**Docker Compose Version**: 1.29+
