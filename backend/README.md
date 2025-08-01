# AI-Persona Backend

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A secure, scalable, and enterprise-grade multi-tenant backend for the AI-Persona SaaS platform. Features comprehensive authentication, user lifecycle management, security hardening, audit logging, and automated cleanup systems.

## 🚀 Features

### 🔐 Enhanced Authentication & User Management

- **Multi-Tenant Authentication**: Local (email/password) and Google OAuth authentication
- **Account Lifecycle Management**: PENDING_VERIFY → ACTIVE → DEACTIVATED → PENDING_DELETION
- **Email Verification**: 24-hour TTL verification tokens with resend capability
- **Password Reset**: Secure token-based password reset with 1-hour TTL
- **Session Management**: Device tracking, session revocation, and token rotation
- **Account Lockout**: Automatic lockout after failed login attempts (10 attempts → 15 min)
- **GDPR Compliance**: Account deletion with 30-day grace period

### 🛡️ Security Hardening

- **Password Strength Validation**: Score-based validation (minimum score 3)
- **Rate Limiting**: Per-endpoint and per-IP rate limiting
- **Input Validation**: Comprehensive validation with express-validator
- **Security Headers**: Helmet.js with CSP, HSTS, XSS protection
- **Audit Logging**: Complete event trail with IP, user agent, and trace IDs

### 🏢 Workspace & Role Management

- **Workspace Isolation**: Strict tenant boundaries with domain-based assignment
- **Role-Based Access Control**: ADMIN and MEMBER roles with workspace-scoped permissions
- **Admin Operations**: User activation/deactivation, role promotion/demotion
- **Workspace Statistics**: User counts, activity metrics, and usage analytics

### 📊 Monitoring & Observability

- **Prometheus Metrics**: Authentication events, performance metrics, and business KPIs
- **Health Checks**: Database connectivity and service health monitoring
- **Structured Logging**: Winston JSON logs with request trace IDs
- **Audit Events**: Complete user action history with event categorization

### 🔄 Automation & Cleanup

- **Automated Cleanup Jobs**: Cron-based cleanup for unverified users and expired sessions
- **Token Management**: Automatic cleanup of expired verification and reset tokens
- **Session Cleanup**: Regular cleanup of expired sessions
- **Account Lifecycle**: Automated account state management

### 📧 Email Services

- **Transactional Emails**: Verification, password reset, and notification emails
- **SMTP Integration**: Configurable SMTP with Nodemailer
- **Email Templates**: Professional HTML email templates
- **Delivery Tracking**: Email send success/failure logging

### 📚 API & Documentation

- **OpenAPI/Swagger**: Complete API documentation with examples
- **GraphQL Support**: Apollo Server with GraphQL playground
- **RESTful APIs**: Comprehensive REST API with proper HTTP status codes
- **Interactive Docs**: Swagger UI for API exploration

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Development](#development)
- [Security](#security)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org/))
- **npm** or **yarn** package manager
- **Docker** (optional, for containerized deployment)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-org/AI-Persona.git
cd AI-Persona/backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.template .env
# Edit .env with your configuration

# 4. Set up database
npm run migrate
npm run generate

# 5. Start development server
npm run dev
```

### Docker Deployment

```bash
# 1. Clone and navigate
git clone https://github.com/your-org/AI-Persona.git
cd AI-Persona/backend

# 2. Set up environment
cp .env.template .env
# Edit .env with production values

# 3. Start with Docker Compose
docker-compose up --build -d

# 4. Apply database migrations
docker-compose exec backend npm run migrate
```

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Email Service │
│   (React/Vue)   │◄──►│   (Express)     │◄──►│   (SMTP)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   (Primary DB)  │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cron Jobs     │
                       │   (Cleanup)     │
                       └─────────────────┘
```

### Enhanced Multi-Tenant Architecture

- **Workspace Isolation**: Each tenant has a dedicated workspace with domain-based assignment
- **User Lifecycle Management**: Complete account lifecycle from registration to deletion
- **Security Boundaries**: Cross-workspace access prevention with audit logging
- **Automated Cleanup**: Scheduled jobs for maintaining data hygiene
- **Scalable Design**: Horizontal scaling support with stateless application design

### Technology Stack

| Component          | Technology         | Version | Purpose                   |
| ------------------ | ------------------ | ------- | ------------------------- |
| **Runtime**        | Node.js            | 18+     | JavaScript runtime        |
| **Framework**      | Express.js         | 4.18+   | Web application framework |
| **Database**       | PostgreSQL         | 13+     | Primary database          |
| **ORM**            | Prisma             | 6.12+   | Database toolkit          |
| **Authentication** | JWT + Passport     | 9.0+    | Token-based auth          |
| **Email**          | Nodemailer         | 7.0+    | Transactional emails      |
| **Documentation**  | Swagger/OpenAPI    | 3.0.3   | API documentation         |
| **GraphQL**        | Apollo Server      | 3.13+   | GraphQL API               |
| **Security**       | Helmet + CORS      | Latest  | Security headers          |
| **Logging**        | Winston            | 3.17+   | Structured logging        |
| **Rate Limiting**  | express-rate-limit | 8.0+    | API rate limiting         |
| **Validation**     | express-validator  | 7.0+    | Input validation          |
| **Cron Jobs**      | node-cron          | 3.0+    | Scheduled tasks           |
| **Metrics**        | Custom Prometheus  | -       | Application metrics       |

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: `http://localhost:3000/docs/swagger.yaml`
- **GraphQL Playground**: `http://localhost:3000/graphql`
- **Health Check**: `http://localhost:3000/api/auth/health`
- **Metrics**: `http://localhost:3000/metrics`

### Enhanced Authentication Endpoints

#### Account Lifecycle Management

```http
POST /api/auth/register                    # User registration with validation
POST /api/auth/login                       # User authentication with lockout
POST /api/auth/refresh                     # Token refresh with rotation
POST /api/auth/logout                      # Secure logout with session cleanup
GET  /api/auth/verify-email               # Email verification (24h TTL)
POST /api/auth/resend-verification        # Resend verification (rate limited)
POST /api/auth/request-password-reset     # Password reset request
POST /api/auth/reset-password             # Password reset with validation
```

#### Session Management

```http
GET    /api/auth/sessions                  # List user sessions
DELETE /api/auth/sessions/:sessionId      # Revoke specific session
```

#### Account Management

```http
POST /api/auth/deactivate                 # Deactivate account
POST /api/auth/delete-account             # Request GDPR deletion
```

#### System Endpoints

```http
GET  /api/auth/health                     # Health check
GET  /metrics                             # Prometheus metrics
GET  /metrics/json                        # JSON metrics
POST /metrics/reset                       # Reset metrics (admin only)
```

### User Management Endpoints

```http
GET  /api/users/me                        # Get user profile
PUT  /api/users/me                        # Update profile
PUT  /api/users/me/password               # Change password
GET  /api/users/stats                     # User statistics
```

### Admin Operations

```http
GET  /api/admin/users                     # List workspace users
GET  /api/admin/users/:id                 # Get user details
POST /api/admin/users/:id/activate        # Activate user
POST /api/admin/users/:id/deactivate      # Deactivate user
POST /api/admin/users/:id/promote         # Promote to admin
POST /api/admin/users/:id/demote          # Demote to member
GET  /api/admin/stats                     # Workspace statistics
```

### Persona & Chat Endpoints

```http
GET  /api/personas                        # List all personas
GET  /api/personas/:id                    # Get persona details
GET  /api/personas/stats                  # Persona statistics

POST /api/conversations                   # Create conversation
GET  /api/conversations                   # List user conversations
GET  /api/conversations/public            # List public conversations
GET  /api/conversations/:id               # Get conversation details
PUT  /api/conversations/:id/toggle-visibility # Toggle public/private
DELETE /api/conversations/:id             # Delete conversation

POST /api/messages                        # Send user message
POST /api/messages/response               # Send persona response
POST /api/messages/:messageId/reactions   # Add reaction
DELETE /api/messages/:messageId/reactions # Remove reaction
```

### Folder Management

```http
POST /api/folders                         # Create folder
GET  /api/folders                         # List user folders
GET  /api/folders/:id                     # Get folder details
PUT  /api/folders/:id                     # Update folder
DELETE /api/folders/:id                   # Delete folder
POST /api/folders/:id/items              # Add item to folder
DELETE /api/folders/:id/items             # Remove item from folder
PUT  /api/folders/:id/reorder             # Reorder folder items
```

### Shareable Links

```http
POST /api/shareable-links                 # Create shareable link
GET  /api/shareable-links                 # List user links
GET  /api/shareable-links/:id             # Get link details
DELETE /api/shareable-links/:id           # Delete link
GET  /api/shareable-links/share/:token    # Public access (no auth)
```

### Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

For workspace-scoped operations, include the workspace ID:

```http
x-workspace-id: <workspace_id>
```

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
SESSION_SECRET="your-session-secret"
BCRYPT_SALT_ROUNDS=12
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OAUTH_CALLBACK_URL="https://yourdomain.com/api/auth/google/callback"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
APP_BASE_URL="https://yourdomain.com"

# Security
CORS_ORIGIN="https://yourdomain.com"

# Logging
LOG_LEVEL="info"
```

### Environment-Specific Configurations

#### Development

```bash
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN="http://localhost:3000"
```

#### Production

```bash
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN="https://yourdomain.com"
```

## 🚀 Deployment

### Docker Deployment

#### Production Dockerfile

```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run generate
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose

```yaml
version: "3.8"
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/aipersona
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: aipersona
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Cloud Deployment

#### AWS ECS/Fargate

```bash
# Build and push Docker image
docker build -t ai-persona-backend .
docker tag ai-persona-backend:latest your-registry/ai-persona-backend:latest
docker push your-registry/ai-persona-backend:latest

# Deploy with AWS CLI
aws ecs update-service --cluster ai-persona-cluster --service backend-service --force-new-deployment
```

#### Google Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy ai-persona-backend \
  --image gcr.io/your-project/ai-persona-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Heroku

```bash
# Deploy to Heroku
heroku create ai-persona-backend
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=$(heroku config:get DATABASE_URL)
git push heroku main
```

### Database Migration

```bash
# Apply migrations
npm run migrate

# Generate Prisma client
npm run generate

# Reset database (development only)
npm run migrate:reset
```

## 🛠️ Development

### Project Structure

```
backend/
├── docs/                    # API documentation
│   └── swagger.yaml        # OpenAPI specification
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── src/                    # Application source code
│   ├── config/            # Configuration management
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Express middlewares
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── validationMiddleware.js
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   ├── cronService.js
│   │   └── metricsService.js
│   ├── utils/             # Utility functions
│   ├── graphql/           # GraphQL implementation
│   ├── app.js            # Express app setup
│   └── index.js          # Application entry point
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Multi-container setup
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run start            # Start production server

# Database
npm run migrate          # Apply database migrations
npm run generate         # Generate Prisma client

# Code Quality
npm run lint             # Run ESLint (placeholder)
npm run test             # Run tests (placeholder)
```

### Development Workflow

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-org/AI-Persona.git
   cd AI-Persona/backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment**

   ```bash
   cp .env.template .env
   # Edit .env with your local configuration
   ```

4. **Set Up Database**

   ```bash
   npm run migrate
   npm run generate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔒 Security

### Enhanced Security Features

- **Authentication**: JWT tokens with refresh mechanism and rotation
- **Authorization**: Role-based access control (RBAC) with workspace scoping
- **Rate Limiting**: Per-endpoint rate limiting with configurable limits
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js with comprehensive security headers
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Password Security**: bcrypt with configurable salt rounds and strength validation
- **Workspace Isolation**: Strict tenant boundaries with audit logging
- **Account Lockout**: Automatic lockout after failed attempts
- **Session Management**: Device tracking and session revocation
- **Input Validation**: Comprehensive validation with sanitization

### Security Best Practices

1. **Environment Variables**: All secrets stored in environment variables
2. **HTTPS Only**: Enforce HTTPS in production
3. **Regular Updates**: Keep dependencies updated
4. **Access Logging**: Comprehensive access logging with Morgan
5. **Error Handling**: Secure error handling without information leakage
6. **Audit Logging**: Complete event trail for security monitoring
7. **Rate Limiting**: Prevent brute force and abuse attacks
8. **Input Validation**: Prevent injection and validation attacks

### Security Headers

```javascript
// Security headers configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

## 📊 Monitoring

### Metrics & Observability

- **Prometheus Metrics**: Authentication events, performance metrics, and business KPIs
- **Health Checks**: Database connectivity and service health monitoring
- **Structured Logging**: Winston JSON logs with request trace IDs
- **Audit Events**: Complete user action history with event categorization

### Available Metrics

```bash
# Authentication Metrics
auth_register_total
auth_login_success_total
auth_login_failed_total
auth_logout_total
auth_refresh_total
auth_verify_email_total

# User Lifecycle Metrics
user_deactivated_total
user_deletion_requested_total
user_reactivated_total

# Session Metrics
session_created_total
session_revoked_total
session_expired_total

# Security Metrics
account_locked_total
failed_login_attempts_total

# Cleanup Metrics
cleanup_unverified_users_total
cleanup_pending_deletion_users_total
cleanup_expired_sessions_total
```

### Monitoring Endpoints

```http
GET /api/auth/health          # Health check
GET /metrics                  # Prometheus metrics
GET /metrics/json             # JSON metrics
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connection
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('Connected')).catch(console.error)"
```

#### Email Configuration Issues

```bash
# Test email configuration
node -e "const emailService = require('./src/services/emailService'); emailService.testEmailConfig().then(console.log).catch(console.error)"
```

#### Authentication Issues

```bash
# Check JWT configuration
node -e "const jwt = require('jsonwebtoken'); console.log('JWT Secret length:', process.env.JWT_SECRET?.length || 0)"
```

#### Cron Job Issues

```bash
# Check cron job status
curl -s http://localhost:3000/metrics/json | jq '.counters | keys | map(select(test("cleanup")))'
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

### Log Analysis

```bash
# View application logs
npm run dev | grep -E "(error|warn|info)"

# Check audit logs
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.auditEvent.findMany({ take: 10, orderBy: { createdAt: 'desc' } }).then(console.log).catch(console.error)"
```

### Performance Issues

1. **Database Queries**: Check Prisma query logs
2. **Memory Usage**: Monitor Node.js memory usage
3. **CPU Usage**: Check for CPU-intensive operations
4. **Network Latency**: Monitor API response times
5. **Session Management**: Check session cleanup performance

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. **Fork the Repository**

   ```bash
   git clone https://github.com/your-username/AI-Persona.git
   cd AI-Persona/backend
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**

   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation
   - Add audit logging for new features

4. **Run Tests**

   ```bash
   npm run test
   npm run lint
   ```

5. **Submit Pull Request**
   - Provide clear description of changes
   - Include relevant tests
   - Update documentation if needed

### Code Standards

- **ESLint**: Follow the configured ESLint rules (when implemented)
- **Prettier**: Use Prettier for code formatting (when implemented)
- **Conventional Commits**: Use conventional commit messages
- **Documentation**: Update API documentation for new endpoints
- **Audit Logging**: Add audit events for security-relevant operations

### Pull Request Process

1. **Create Issue**: Describe the problem or feature
2. **Fork Repository**: Create your fork
3. **Create Branch**: Create feature branch
4. **Make Changes**: Implement your changes
5. **Add Tests**: Include relevant tests
6. **Update Docs**: Update documentation
7. **Submit PR**: Create pull request with description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### Getting Help

- **Documentation**: Check the [docs/](docs/) folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: Contact the maintainers

### Community

- **GitHub**: [https://github.com/your-org/AI-Persona](https://github.com/your-org/AI-Persona)
- **Discord**: [Join our Discord server](https://discord.gg/ai-persona)
- **Twitter**: [@AI_Persona](https://twitter.com/AI_Persona)

### Commercial Support

For enterprise support, custom development, or consulting services, please contact us at support@ai-persona.com.

---

**Made with ❤️ by the AI-Persona Team**
