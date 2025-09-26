# Deployment Guide

This guide covers different deployment options for the Java Search Engine.

## Table of Contents
1. [Docker Compose Deployment (Recommended)](#docker-compose-deployment)
2. [Manual Deployment](#manual-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Production Configuration](#production-configuration)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Docker Compose Deployment

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ available memory
- 10GB+ available disk space

### Production Deployment

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd search-engine
   ```

2. **Configure environment variables:**
   ```bash
   # Create .env file
   cat > .env << EOF
   DB_USERNAME=searchengine_user
   DB_PASSWORD=your_secure_password
   SEARCH_INDEX_DIR=/data/lucene-index
   JAVA_OPTS=-Xmx2g -Xms1g
   EOF
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Verify deployment:**
   ```bash
   # Check container status
   docker-compose ps
   
   # Check logs
   docker-compose logs -f
   
   # Test the application
   curl http://localhost:8080/actuator/health
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Database: localhost:5432

### Development Deployment

For development with hot reloading:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Scaling Services

Scale backend instances:
```bash
docker-compose up -d --scale backend=3
```

Scale with load balancer:
```bash
# Add nginx load balancer configuration
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

---

## Manual Deployment

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 12+ (optional, can use H2)
- 4GB+ RAM
- 10GB+ disk space

### Backend Deployment

1. **Build the application:**
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```

2. **Configure database:**
   ```sql
   -- Create database and user
   CREATE DATABASE searchengine;
   CREATE USER searchengine_user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE searchengine TO searchengine_user;
   ```

3. **Set environment variables:**
   ```bash
   export SPRING_PROFILES_ACTIVE=prod
   export DB_USERNAME=searchengine_user
   export DB_PASSWORD=password
   export SEARCH_INDEX_DIR=/opt/searchengine/lucene-index
   export JAVA_OPTS="-Xmx2g -Xms1g"
   ```

4. **Run the application:**
   ```bash
   java $JAVA_OPTS -jar target/java-search-engine-1.0.0.jar
   ```

5. **Setup as system service (Linux):**
   ```bash
   # Create service file
   sudo tee /etc/systemd/system/search-engine.service > /dev/null <<EOF
   [Unit]
   Description=Java Search Engine
   After=network.target
   
   [Service]
   Type=simple
   User=searchengine
   WorkingDirectory=/opt/searchengine
   Environment=SPRING_PROFILES_ACTIVE=prod
   Environment=DB_USERNAME=searchengine_user
   Environment=DB_PASSWORD=password
   Environment=SEARCH_INDEX_DIR=/opt/searchengine/lucene-index
   ExecStart=/usr/bin/java -Xmx2g -Xms1g -jar java-search-engine-1.0.0.jar
   Restart=on-failure
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   # Enable and start service
   sudo systemctl enable search-engine
   sudo systemctl start search-engine
   ```

### Frontend Deployment

1. **Build the frontend:**
   ```bash
   cd frontend
   npm ci --production
   npm run build
   ```

2. **Configure web server (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/search-engine;
       index index.html;

       # Handle client-side routing
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests
       location /api/ {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }

       # Static assets caching
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Deploy frontend files:**
   ```bash
   sudo cp -r build/* /var/www/search-engine/
   sudo nginx -s reload
   ```

---

## Cloud Deployment

### AWS Deployment

#### Using EC2 with Docker Compose

1. **Launch EC2 instance:**
   - Instance type: t3.medium or larger
   - OS: Amazon Linux 2
   - Security groups: Allow ports 22, 80, 443, 3000, 8080

2. **Install Docker:**
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -a -G docker ec2-user
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Deploy application:**
   ```bash
   git clone <repository-url>
   cd search-engine
   docker-compose up -d
   ```

#### Using ECS (Elastic Container Service)

1. **Create task definitions for backend and frontend**
2. **Set up Application Load Balancer**
3. **Configure RDS for PostgreSQL**
4. **Use EFS for persistent Lucene index storage**

### Google Cloud Platform

#### Using Compute Engine with Docker

Similar to AWS EC2 deployment.

#### Using Cloud Run

1. **Build and push Docker images:**
   ```bash
   # Build images
   docker build -f backend.Dockerfile -t gcr.io/PROJECT_ID/search-engine-backend .
   docker build -f frontend.Dockerfile -t gcr.io/PROJECT_ID/search-engine-frontend .
   
   # Push to Google Container Registry
   docker push gcr.io/PROJECT_ID/search-engine-backend
   docker push gcr.io/PROJECT_ID/search-engine-frontend
   ```

2. **Deploy to Cloud Run:**
   ```bash
   # Deploy backend
   gcloud run deploy search-engine-backend \
     --image gcr.io/PROJECT_ID/search-engine-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   
   # Deploy frontend
   gcloud run deploy search-engine-frontend \
     --image gcr.io/PROJECT_ID/search-engine-frontend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Microsoft Azure

#### Using Container Instances

1. **Create resource group:**
   ```bash
   az group create --name search-engine-rg --location eastus
   ```

2. **Deploy containers:**
   ```bash
   az container create \
     --resource-group search-engine-rg \
     --name search-engine-backend \
     --image your-registry/search-engine-backend:latest \
     --cpu 2 --memory 4 \
     --ports 8080 \
     --environment-variables SPRING_PROFILES_ACTIVE=prod
   ```

---

## Production Configuration

### Security Configuration

1. **Enable HTTPS:**
   ```nginx
   server {
       listen 443 ssl http2;
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       # SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
   }
   ```

2. **Configure application security:**
   ```properties
   # application-prod.properties
   
   # Security
   server.ssl.enabled=true
   server.ssl.key-store=classpath:keystore.p12
   server.ssl.key-store-password=${KEYSTORE_PASSWORD}
   server.ssl.key-store-type=PKCS12
   
   # CORS
   app.cors.allowed-origins=https://yourdomain.com
   
   # Rate limiting
   app.rate-limit.requests-per-minute=1000
   ```

3. **Database security:**
   ```properties
   # Use encrypted connections
   spring.datasource.url=jdbc:postgresql://localhost:5432/searchengine?sslmode=require
   
   # Connection pooling
   spring.datasource.hikari.maximum-pool-size=20
   spring.datasource.hikari.minimum-idle=5
   ```

### Performance Optimization

1. **JVM tuning:**
   ```bash
   export JAVA_OPTS="-Xmx4g -Xms2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
   ```

2. **Lucene index optimization:**
   ```properties
   # Lucene configuration
   search.index.ram-buffer-size=256
   search.index.max-buffered-docs=1000
   search.index.merge-factor=10
   ```

3. **Database tuning:**
   ```sql
   -- PostgreSQL configuration
   ALTER SYSTEM SET shared_buffers = '256MB';
   ALTER SYSTEM SET effective_cache_size = '1GB';
   ALTER SYSTEM SET maintenance_work_mem = '64MB';
   ```

### Logging Configuration

```properties
# application-prod.properties

# Logging levels
logging.level.com.searchengine=INFO
logging.level.org.springframework=WARN
logging.level.org.apache.lucene=WARN

# Log files
logging.file.name=/var/log/searchengine/application.log
logging.file.max-size=100MB
logging.file.max-history=30

# Log format
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

---

## Monitoring and Maintenance

### Health Checks

1. **Application health endpoint:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. **Custom health checks:**
   ```bash
   # Check search functionality
   curl "http://localhost:8080/api/search?q=test"
   
   # Check document count
   curl "http://localhost:8080/api/documents/stats"
   ```

### Monitoring Setup

1. **Prometheus metrics:**
   ```properties
   # Enable Prometheus endpoint
   management.endpoints.web.exposure.include=health,info,metrics,prometheus
   management.metrics.export.prometheus.enabled=true
   ```

2. **Log monitoring:**
   ```yaml
   # docker-compose.monitoring.yml
   version: '3.8'
   services:
     prometheus:
       image: prom/prometheus:latest
       ports:
         - "9090:9090"
       volumes:
         - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
     
     grafana:
       image: grafana/grafana:latest
       ports:
         - "3001:3000"
       environment:
         - GF_SECURITY_ADMIN_PASSWORD=admin
   ```

### Backup Strategy

1. **Database backup:**
   ```bash
   # Daily backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   pg_dump -h localhost -U searchengine searchengine > backup_$DATE.sql
   
   # Keep only last 7 days
   find /backup -name "backup_*.sql" -mtime +7 -delete
   ```

2. **Lucene index backup:**
   ```bash
   # Backup Lucene index
   tar -czf lucene_index_backup_$(date +%Y%m%d).tar.gz /data/lucene-index/
   ```

3. **Automated backup with cron:**
   ```bash
   # Add to crontab
   0 2 * * * /opt/searchengine/scripts/backup.sh
   ```

### Maintenance Tasks

1. **Index optimization:**
   ```bash
   # Weekly index optimization
   curl -X POST "http://localhost:8080/api/documents/reindex"
   ```

2. **Log rotation:**
   ```bash
   # Configure logrotate
   /var/log/searchengine/*.log {
       daily
       missingok
       rotate 30
       compress
       notifempty
       create 644 searchengine searchengine
   }
   ```

3. **System updates:**
   ```bash
   # Update system packages
   sudo yum update -y  # Amazon Linux
   sudo apt update && sudo apt upgrade -y  # Ubuntu
   
   # Update Docker images
   docker-compose pull
   docker-compose up -d --no-deps
   ```

### Troubleshooting

Common deployment issues and solutions:

1. **OutOfMemoryError:**
   - Increase JVM heap size
   - Monitor memory usage
   - Optimize index settings

2. **Database connection issues:**
   - Check connection pool settings
   - Verify database credentials
   - Monitor connection count

3. **Slow search performance:**
   - Optimize Lucene index
   - Check system resources
   - Analyze query patterns

4. **Docker container issues:**
   - Check container logs
   - Verify resource limits
   - Monitor disk space

---

This deployment guide covers the most common deployment scenarios. Choose the option that best fits your infrastructure and requirements.