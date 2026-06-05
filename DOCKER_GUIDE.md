# Docker Setup Guide for Interview AI Backend

## Overview
This guide explains the Docker setup for the Interview AI Backend application.

### Files Overview
- **Dockerfile**: Multi-stage optimized production image
- **.dockerignore**: Excludes unnecessary files from build context
- **docker-compose.yml**: Orchestrates backend, MongoDB, and networking

## Quick Start

### 1. Build and Run with Docker Compose
```bash
cd interview-ai-yt

# Create .env file with required variables
cp Backend/.env.example Backend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### 2. Build Standalone Backend Image
```bash
cd Backend
docker build -t interview-ai-backend:latest .
docker run -p 3000:3000 --env-file .env interview-ai-backend:latest
```

### 3. Verify Services
```bash
# Check running containers
docker-compose ps

# Test backend health
curl http://localhost:3000/health

# Access MongoDB
mongosh "mongodb://admin:password@localhost:27017/interview-ai?authSource=admin"
```

## Docker Best Practices Implemented

✅ **Multi-stage Build**: Reduces final image size by ~40%
✅ **Alpine Linux**: Lightweight base image (20MB vs 150MB+)
✅ **Production Dependencies**: Uses `npm ci --only=production`
✅ **Non-root User**: Runs as `nodejs:nodejs` for security
✅ **Health Checks**: Built-in health monitoring
✅ **Layer Caching**: Optimized for faster rebuilds
✅ **Environment Management**: Flexible configuration via .env

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://mongo:27017/interview-ai` | MongoDB connection string |
| `JWT_SECRET` | - | Secret key for JWT (CHANGE IN PRODUCTION) |
| `GEMINI_API_KEY` | - | Google Gemini API key |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `production` | Environment mode |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend CORS origin |

## Production Deployment

### Environment Variables (Production)
1. Set strong `JWT_SECRET`
2. Use secure `MONGO_ROOT_PASSWORD`
3. Configure actual `GEMINI_API_KEY`
4. Update `FRONTEND_URL` to your domain

### Scaling
```bash
# Scale backend to multiple instances
docker-compose up -d --scale backend=3

# Note: Load balance with Nginx or use Docker Swarm
```

## Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml
docker-compose down
docker-compose up -d
```

### MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongo

# Verify credentials in .env file
```

### Health Check Failing
```bash
# View container logs
docker logs interview-ai-backend

# Check if server is responding
docker exec interview-ai-backend curl http://localhost:3000
```

## Clean Up
```bash
# Stop services
docker-compose down

# Remove volumes (caution: deletes data)
docker-compose down -v

# Remove images
docker image rm interview-ai-backend
docker image rm mongo:7-alpine
```

## Performance Tips

1. **Use Volume Mounts for Development**: Hot-reload changes without rebuild
2. **Enable BuildKit for Faster Builds**:
   ```bash
   DOCKER_BUILDKIT=1 docker build -t interview-ai-backend:latest .
   ```
3. **Monitor Resource Usage**:
   ```bash
   docker stats
   ```

## Security Considerations

⚠️ **DO NOT** commit `.env` file with real credentials
- Rotate JWT_SECRET regularly
- Use strong MongoDB passwords
- Keep API keys in secure vaults (AWS Secrets Manager, HashiCorp Vault)
- Enable Docker security scanning before production

