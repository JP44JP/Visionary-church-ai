# VisionaryChurch-AI Deployment Guide

Complete deployment infrastructure for the VisionaryChurch-AI SaaS platform. This guide covers everything from local development to production deployment with auto-scaling capabilities supporting 1 to 5,000+ churches.

## 🏗️ Architecture Overview

The platform is designed as a cloud-native, multi-tenant SaaS application with:

- **Frontend**: Next.js React application with TypeScript
- **Backend**: Node.js/Express API with TypeScript
- **Database**: PostgreSQL with tenant isolation
- **Cache**: Redis for session storage and caching
- **Queue**: BullMQ for background job processing
- **Storage**: AWS S3 for file uploads
- **Monitoring**: Prometheus, Grafana, and ELK stack
- **Orchestration**: Kubernetes with auto-scaling
- **CI/CD**: GitHub Actions with automated deployments

## 📁 Project Structure

```
VisionaryChurch-ai/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # GitHub Actions CI/CD pipeline
├── k8s/                             # Kubernetes manifests
│   ├── namespace.yml
│   ├── configmap.yml
│   ├── secrets.yml
│   ├── deployment.yml
│   ├── service.yml
│   ├── ingress.yml
│   └── hpa.yml
├── terraform/                       # Infrastructure as Code
│   ├── main.tf
│   ├── iam.tf
│   ├── ssl.tf
│   └── monitoring.tf
├── monitoring/                      # Observability configuration
│   ├── prometheus.yml
│   └── alerting-rules.yml
├── scripts/                         # Deployment automation
│   ├── deploy.sh
│   └── db-migrate.sh
├── Dockerfile                       # Container image definition
├── docker-compose.yml              # Local development setup
├── package.json                     # Dependencies and scripts
├── .env.example                     # Environment variables template
└── deployment-config.yml           # Docker Compose for production
```

## 🚀 Quick Start

### 1. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/visionary-church-ai.git
cd visionary-church-ai

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start local development environment
docker-compose up -d

# Run database migrations
npm run migrate:dev

# Seed initial data
npm run seed

# Start development server
npm run dev
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/church_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AWS (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET=your-s3-bucket

# OpenAI (for AI chat features)
OPENAI_API_KEY=sk-your-openai-key

# Email Service (Resend)
RESEND_API_KEY=re_your-resend-key

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## 🛠️ Infrastructure Setup

### 1. AWS Infrastructure with Terraform

```bash
# Initialize Terraform
cd terraform
terraform init

# Plan infrastructure changes
terraform plan -var="environment=production"

# Apply infrastructure
terraform apply -var="environment=production"
```

This creates:
- VPC with public/private subnets across 3 AZs
- RDS PostgreSQL with read replicas
- ElastiCache Redis cluster
- ECS Fargate cluster with auto-scaling
- Application Load Balancer with SSL
- S3 buckets for storage and logs
- CloudWatch monitoring and alarms
- IAM roles and security groups

### 2. Kubernetes Deployment

```bash
# Create namespace
kubectl apply -f k8s/namespace.yml

# Create secrets (replace with actual values)
kubectl create secret generic church-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=REDIS_URL="redis://..." \
  --from-literal=JWT_SECRET="..." \
  --namespace=visionary-church

# Apply configuration
kubectl apply -f k8s/configmap.yml

# Deploy application
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml
kubectl apply -f k8s/ingress.yml
kubectl apply -f k8s/hpa.yml

# Check deployment status
kubectl get pods -n visionary-church
```

### 3. Automated Deployment Script

```bash
# Deploy to staging
./scripts/deploy.sh --environment staging --tag v1.0.0

# Deploy to production
./scripts/deploy.sh --environment production --tag v1.0.0

# Dry run to see what would be deployed
./scripts/deploy.sh --dry-run --environment production

# Rollback if needed
./scripts/deploy.sh --rollback --environment production
```

## 🎯 CI/CD Pipeline

The GitHub Actions pipeline includes:

1. **Security Scanning**: Trivy vulnerability scans
2. **Code Quality**: ESLint, TypeScript checking
3. **Testing**: Unit tests with coverage reporting
4. **Build & Push**: Docker image to GitHub Container Registry
5. **Deploy to Staging**: Automatic deployment on `develop` branch
6. **Deploy to Production**: Automatic deployment on `main` branch
7. **Smoke Tests**: Health checks after deployment
8. **Notifications**: Slack notifications for deployment status

### Pipeline Triggers

- **Pull Request**: Runs tests and security scans
- **Push to develop**: Deploys to staging environment
- **Push to main**: Deploys to production environment

### Required Secrets

Configure these secrets in GitHub:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
STAGING_URL
PRODUCTION_URL
SLACK_WEBHOOK_URL
```

## 📊 Monitoring & Observability

### 1. Prometheus Metrics

The application exposes metrics at `/metrics` endpoint:

- HTTP request duration and count
- Database connection pool metrics  
- Queue length and processing time
- Custom business metrics (user logins, tenant activity)

### 2. Alerting Rules

Comprehensive alerting for:
- Application downtime
- High error rates
- Resource utilization
- Database performance
- Queue backlogs
- Security incidents

### 3. Logging

Structured JSON logs with:
- Request/response logging
- Error tracking
- Performance metrics
- Audit trails for tenant operations

### 4. Health Checks

Multiple health check endpoints:
- `/health` - Basic application health
- `/ready` - Readiness probe for Kubernetes
- `/metrics` - Prometheus metrics

## 🔒 Security Configuration

### 1. SSL/TLS

- Automatic SSL certificate provisioning via Let's Encrypt
- TLS 1.2+ enforcement
- HSTS headers
- Secure cipher suites

### 2. Network Security

- Private subnets for application and database
- Security groups with minimal required access
- WAF for DDoS protection and attack mitigation

### 3. Application Security

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting per endpoint
- Input validation and sanitization
- SQL injection protection via Prisma ORM

### 4. Data Protection

- Database encryption at rest
- Redis encryption in transit and at rest
- S3 bucket encryption
- Secrets management via AWS Parameter Store

## 📈 Auto-Scaling Configuration

### 1. Horizontal Pod Autoscaler (HPA)

- Scales based on CPU (70%) and memory (80%) utilization
- Custom metrics: HTTP requests/second, database connections
- Min replicas: 5 (production), 2 (staging)
- Max replicas: 100 (production), 20 (staging)

### 2. Database Scaling

- Read replicas for query distribution
- Connection pooling with pgBouncer
- Automatic failover to standby instances

### 3. Cache Scaling

- Redis cluster with multiple nodes
- Automatic sharding for large datasets
- Memory-based eviction policies

## 🗄️ Database Management

### 1. Multi-Tenant Architecture

- Shared database with schema-per-tenant isolation
- Tenant routing via subdomain detection
- Automated tenant provisioning

### 2. Migrations

```bash
# Run migrations
./scripts/db-migrate.sh migrate --environment production

# Create new migration
./scripts/db-migrate.sh create --name "add-new-feature"

# Set up new tenant
./scripts/db-migrate.sh tenant-setup --tenant-id church-001

# Check migration status
./scripts/db-migrate.sh status
```

### 3. Backups

- Automated daily backups with 30-day retention
- Point-in-time recovery capability
- Cross-region backup replication

## 🔧 Environment Management

### Development
- Local Docker Compose setup
- Hot reloading for rapid development
- In-memory database for testing

### Staging
- Mirrors production architecture
- Automatic deployment from `develop` branch
- Integration testing environment

### Production
- Multi-AZ deployment for high availability
- Auto-scaling based on demand
- 99.9% uptime SLA target

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations reviewed
- [ ] Security scan passed
- [ ] Load testing completed
- [ ] Backup verified

### Deployment
- [ ] CI/CD pipeline green
- [ ] Canary deployment successful
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Documentation updated

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User acceptance testing
- [ ] Rollback plan confirmed

## 🚨 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check database connectivity
kubectl exec -it deployment/church-api -- psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool
kubectl logs deployment/church-api | grep "database"
```

**High Memory Usage**
```bash
# Check memory usage
kubectl top pods -n visionary-church

# Scale up if needed
kubectl scale deployment church-api --replicas=10
```

**SSL Certificate Issues**
```bash
# Check certificate status
kubectl describe certificate church-tls-secret -n visionary-church

# Force renewal
kubectl delete certificate church-tls-secret -n visionary-church
```

### Emergency Procedures

**Complete Rollback**
```bash
./scripts/deploy.sh --rollback --environment production
```

**Scale Down (Emergency)**
```bash
kubectl scale deployment church-api --replicas=1 -n visionary-church
```

**Database Restore**
```bash
# Restore from backup
pg_restore -d $DATABASE_URL /path/to/backup.sql
```

## 📞 Support & Maintenance

### Monitoring Dashboard
- Grafana: https://grafana.visionarychurch.ai
- Prometheus: https://prometheus.visionarychurch.ai
- Kibana: https://kibana.visionarychurch.ai

### Log Locations
- Application logs: `/app/logs/`
- Audit logs: CloudWatch Logs
- Error tracking: Sentry

### Performance Targets
- API response time: < 200ms (95th percentile)
- Database query time: < 100ms (average)
- Uptime: 99.9%
- Error rate: < 0.1%

### Capacity Planning
- Current capacity: 1,000 churches
- Scale to: 5,000+ churches
- Database: Auto-scaling storage
- Compute: Auto-scaling instances

---

## 🎉 Ready to Scale!

This deployment infrastructure is production-ready and can handle growth from 1 church to 5,000+ churches with:

- **Zero-downtime deployments**
- **Automatic scaling**
- **Comprehensive monitoring**
- **Disaster recovery**
- **Security best practices**

The platform is built with modern DevOps practices and can be easily maintained and scaled as your business grows.

For additional support or questions, please refer to the monitoring dashboards or contact the platform team.