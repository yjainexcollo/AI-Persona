# AI-Persona Backend

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A secure, scalable, and enterprise-grade multi-tenant backend for the AI-Persona SaaS platform. Supports modular authentication (local, OAuth), strict workspace/user isolation, robust RBAC, and comprehensive API documentation.

## 🚀 Features

- **🔐 Multi-Tenant Authentication**: Local (email/password) and Google OAuth authentication
- **🏢 Workspace Isolation**: Strict tenant boundaries with domain-based workspace assignment
- **👥 Role-Based Access Control**: Admin and Member roles with workspace-scoped permissions
- **📧 Email Verification**: Secure email verification with token-based validation
- **🔄 Account Reactivation**: Automatic account reactivation for deactivated users
- **🔒 Security**: JWT tokens, rate limiting, CORS, and comprehensive security headers
- **📊 Logging**: Structured logging with Winston
- **📚 API Documentation**: Complete OpenAPI/Swagger documentation
- **🕸️ GraphQL Support**: Basic GraphQL setup with Apollo Server
- **🐳 Docker Ready**: Production-ready Docker configuration
- **📧 Email Service**: SMTP-based email sending with Nodemailer

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Development](#development)
- [Security](#security)
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
```

### Multi-Tenant Architecture

- **Workspace Isolation**: Each tenant has a dedicated workspace with domain-based assignment
- **Data Segregation**: All database queries are scoped to the user's workspace
- **Security Boundaries**: Cross-workspace access is prevented at the application layer
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

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: `http://localhost:3000/docs/swagger.yaml`
- **GraphQL Playground**: `http://localhost:3000/graphql`

### Core Endpoints

#### Authentication

```http
POST /api/auth/register          # User registration
POST /api/auth/login            # User authentication
POST /api/auth/refresh          # Token refresh
GET  /api/auth/verify-email     # Email verification
POST /api/auth/resend-verification # Resend verification (rate limited)
POST /api/auth/request-password-reset # Password reset request
POST /api/auth/reset-password   # Password reset
GET  /api/auth/google           # Google OAuth
GET  /api/auth/google/callback  # OAuth callback
```

#### User Management

```http
GET  /api/users/me              # Get user profile
PUT  /api/users/me              # Update profile
PUT  /api/users/me/password     # Change password
POST /api/users/me/deactivate   # Deactivate account
GET  /api/users/workspace       # Get workspace users
```

#### Admin Operations

```http
GET  /api/admin/users           # List workspace users
GET  /api/admin/users/:id       # Get user details
POST /api/admin/users/:id/activate   # Activate user
POST /api/admin/users/:id/deactivate # Deactivate user
GET  /api/admin/stats           # Workspace statistics
DELETE /api/admin/workspace/:id # Delete workspace
```

#### System

```http
GET  /health                    # Health check
GET  /graphql                   # GraphQL endpoint
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
JWT_EXPIRES_IN=1d
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
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
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

### Security Features

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Per-endpoint rate limiting (resend verification)
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Password Security**: bcrypt with configurable salt rounds
- **Workspace Isolation**: Strict tenant boundaries

### Security Best Practices

1. **Environment Variables**: All secrets stored in environment variables
2. **HTTPS Only**: Enforce HTTPS in production
3. **Regular Updates**: Keep dependencies updated
4. **Access Logging**: Comprehensive access logging with Morgan
5. **Error Handling**: Secure error handling without information leakage

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

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

### Log Analysis

```bash
# View application logs
npm run dev | grep -E "(error|warn|info)"
```

### Performance Issues

1. **Database Queries**: Check Prisma query logs
2. **Memory Usage**: Monitor Node.js memory usage
3. **CPU Usage**: Check for CPU-intensive operations
4. **Network Latency**: Monitor API response times

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
