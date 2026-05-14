# 🐳 Docker Deployment Guide

Complete guide for containerizing and deploying the ESG Platform using Docker.

## Prerequisites

- Docker installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (included with Docker Desktop)
- Basic Docker knowledge

## Project Structure

```
esg-platform/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   └── app.py
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── src/
├── docker-compose.yml
└── nginx.conf
```

## Step 1: Create Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# Use official Python runtime as build stage
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health', timeout=5)"

# Run Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
```

Create `backend/.dockerignore`:

```
__pycache__
*.pyc
.git
.gitignore
.env.local
venv
.venv
*.egg-info
.pytest_cache
uploads/*
esg_platform.db
```

## Step 2: Create Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Create directory for uploads served through nginx
RUN mkdir -p /usr/share/nginx/html/uploads

# Expose port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/.dockerignore`:

```
node_modules
.git
.gitignore
npm-debug.log
build
.env.local
.DS_Store
public
```

## Step 3: Create Nginx Configuration

Create `nginx.conf` (in root directory):

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name _;

        # Frontend routes
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API proxy to backend
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 120s;
        }

        # Backend direct (no /api/ prefix)
        location ~ ^/(auth|upload|analysis|reports|company-scores|blockchain-history|anomalies|chat|shap)/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 120s;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## Step 4: Create Docker Compose Configuration

Create `docker-compose.yml` (in root directory):

```yaml
version: '3.8'

services:
  # Backend Flask Application
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: esg-backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/esg_platform.db:/app/esg_platform.db
    environment:
      - FLASK_ENV=production
      - FLASK_DEBUG=0
    depends_on:
      - db
    networks:
      - esg-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend React Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: esg-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - esg-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Database (optional - for future PostgreSQL migration)
  db:
    image: postgres:15-alpine
    container_name: esg-db
    environment:
      POSTGRES_DB: esg_platform
      POSTGRES_USER: esg_user
      POSTGRES_PASSWORD: secure_password_change_me
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - esg-network
    restart: unless-stopped
    # Uncomment when ready to use PostgreSQL
    # ports:
    #   - "5432:5432"

volumes:
  postgres_data:

networks:
  esg-network:
    driver: bridge
```

## Step 5: Update App Configuration

Modify `backend/app.py` to support Docker:

```python
# Add health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

# Update CORS configuration for Nginx
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    )
```

## Step 6: Build and Run

### Build Images

```bash
# Build all containers
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Run Containers

```bash
# Start all services
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up -d backend
```

### Monitor

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container health
docker-compose ps
```

### Stop

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (careful - deletes data!)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

## Production Deployment

### AWS EC2 Deployment

```bash
# 1. SSH into EC2 instance
ssh -i key.pem ubuntu@ec2-instance-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Install Docker Compose
sudo apt install docker-compose

# 4. Clone your repository
git clone https://github.com/yourusername/esg-platform.git
cd esg-platform

# 5. Create environment file
cat > .env << EOF
FLASK_ENV=production
POSTGRES_PASSWORD=$(openssl rand -base64 32)
EOF

# 6. Run with Docker Compose
docker-compose up -d

# 7. Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure:
   - Auto-deploy on push
   - Environment variables
   - Health checks
3. Deploy

### Heroku with Docker

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Deploy
heroku container:push web
heroku container:release web

# View logs
heroku logs --tail
```

## Environment Variables

Create `.env` file:

```env
# Flask
FLASK_ENV=production
FLASK_DEBUG=0

# Database
DATABASE_URL=postgresql://esg_user:password@db:5432/esg_platform
SQLITE_DB_PATH=esg_platform.db

# API
API_HOST=0.0.0.0
API_PORT=5000

# Frontend
REACT_APP_API_URL=http://localhost

# Security
SECRET_KEY=your-very-secure-secret-key-here
```

## Database Migration (SQLite → PostgreSQL)

```bash
# 1. Export SQLite data
sqlite3 esg_platform.db .dump > backup.sql

# 2. Create PostgreSQL database
createdb -h localhost -U esg_user esg_platform

# 3. Import data
psql -h localhost -U esg_user esg_platform < backup.sql

# 4. Update connection string in app.py
# OLD: sqlite3.connect('esg_platform.db')
# NEW: psycopg2.connect('postgresql://user:pass@db:5432/esg_platform')
```

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
docker logs esg-backend
```

### Port already in use
```bash
# Find process on port 5000
lsof -i :5000
# Find process on port 80
lsof -i :80

# Kill process
kill -9 <PID>
```

### Network issues
```bash
# Check network
docker network ls
docker network inspect esg-network

# Restart network
docker network rm esg-network
docker-compose down && docker-compose up -d
```

### Database connection error
```bash
# Check db service
docker-compose logs db

# Verify credentials in .env
# Test connection
docker-compose exec db psql -U esg_user -d esg_platform
```

## Performance Optimization

### Backend
- Use Gunicorn workers: `--workers 4`
- Enable caching with Redis (future)
- Use CDN for static files

### Frontend
- Production build is optimized
- Gzip compression enabled
- Browser caching configured
- Lazy loading for images

### Database
- Add indexes on frequently queried fields
- Use connection pooling
- Regular backups

## Monitoring

### Check Status
```bash
docker-compose ps
docker stats
```

### Logs
```bash
docker-compose logs --tail 100 backend
docker-compose logs --follow frontend
```

### Health Checks
```bash
curl localhost/health
curl localhost:5000/health
```

## Backup Strategy

```bash
# Backup volumes
docker run --rm -v esg-platform_postgres_data:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/postgres_backup.tar.gz /data

# Restore
docker run --rm -v esg-platform_postgres_data:/data \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/postgres_backup.tar.gz -C /
```

## Security Checklist

- [ ] Change default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for attacks
- [ ] Use private registries for images
- [ ] Implement rate limiting
- [ ] Regular backups
- [ ] Database encryption at rest

---

**Ready to deploy!** 🚀

Next: Choose your hosting platform and deploy!
