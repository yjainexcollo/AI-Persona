# 🧪 AI-Persona Backend Testing Setup Guide

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (for development)

### 2. Initial Setup

```bash
# Clone and navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy test environment file
cp env.test.example .env.test

# Start test database
docker-compose -f docker-compose.test.yml up -d

# Setup test database
npm run test:setup

# Run tests
npm test
```

## 📋 Test Environment Structure

```
backend/
├── __tests__/                    # Test directory
│   ├── unit/                     # Unit tests
│   │   ├── controllers/          # Controller tests
│   │   ├── services/             # Service tests
│   │   ├── middlewares/          # Middleware tests
│   │   └── utils/                # Utility tests
│   ├── integration/              # Integration tests
│   │   ├── auth/                 # Auth flow tests
│   │   ├── workspace/            # Workspace tests
│   │   ├── persona/              # Persona tests
│   │   └── database/             # Database tests
│   ├── e2e/                      # End-to-end tests
│   │   ├── api/                  # API tests
│   │   └── workflows/            # Workflow tests
│   ├── helpers/                  # Test utilities
│   └── setup/                    # Test setup
├── scripts/
│   └── setup-tests.sh           # Test setup script
├── docker-compose.test.yml      # Test database
└── env.test.example             # Test environment template
```

## 🛠️ Configuration

### Test Database

The test environment uses a separate PostgreSQL database:

- **Host**: localhost:5433
- **Database**: aipersona_test
- **User**: test
- **Password**: test

### Environment Variables

Create `.env.test` with the following variables:

```bash
# Copy from env.test.example
cp env.test.example .env.test

# Edit as needed
nano .env.test
```

## 🧪 Running Tests

### All Tests

```bash
npm test
```

### Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Specific modules
npm run test:auth
npm run test:persona
npm run test:workspace
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Coverage with watch mode
npm run test:watch
```

## 📊 Test Coverage Goals

| Module                | Target | Current |
| --------------------- | ------ | ------- |
| Authentication        | 90%    | -       |
| User Management       | 85%    | -       |
| Workspace Operations  | 80%    | -       |
| Persona & Chat        | 85%    | -       |
| Security & Validation | 90%    | -       |

## 🔧 Test Utilities

### Global Test Utilities

```javascript
// Create test user
const user = await global.testUtils.createTestUser({
  email: "test@example.com",
  role: "ADMIN",
});

// Create test token
const token = global.testUtils.createTestToken(user);

// Create test persona
const persona = await global.testUtils.createTestPersona({
  name: "Test Persona",
});

// Create test conversation
const conversation = await global.testUtils.createTestConversation(
  user.id,
  persona.id
);
```

### Database Access

```javascript
// Direct database access
const users = await global.testPrisma.user.findMany();

// Clean up after tests
await global.testUtils.cleanupTestData();
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check if test database is running
docker ps | grep aipersona_test_db

# Start test database
docker-compose -f docker-compose.test.yml up -d

# Wait for database to be ready
sleep 10
```

#### 2. Environment Variables Missing

```bash
# Copy test environment
cp env.test.example .env.test

# Check required variables
cat .env.test | grep TEST_DATABASE_URL
```

#### 3. Test Timeouts

```bash
# Increase timeout in package.json
"testTimeout": 60000

# Or run with longer timeout
npm test -- --testTimeout=60000
```

#### 4. Mock Issues

```javascript
// Ensure mocks are properly set up
jest.mock("../../../src/services/emailService");
jest.mock("../../../src/services/breachCheckService");
```

### Debug Mode

```bash
# Run with debug output
DEBUG=* npm test

# Run specific test with verbose output
npm test -- --verbose --testNamePattern="specific test name"
```

## 📝 Writing Tests

### Unit Test Example

```javascript
describe("AuthService", () => {
  describe("register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "TestPassword123!",
        name: "Test User",
      };

      const result = await authService.register(userData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
    });
  });
});
```

### Integration Test Example

```javascript
describe("POST /api/auth/register", () => {
  it("should register a new user and create workspace", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "newuser@example.com",
        password: "TestPassword123!",
        name: "New User",
      })
      .expect(201);

    expect(response.body.status).toBe("success");
  });
});
```

### E2E Test Example

```javascript
describe("User Registration Workflow", () => {
  it("should complete full user registration workflow", async () => {
    // Step 1: Register user
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: "workflow@example.com",
        password: "TestPassword123!",
        name: "Workflow User",
      })
      .expect(201);

    // Step 2: Verify email
    // Step 3: Login
    // Step 4: Access protected endpoints
  });
});
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: aipersona_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5433:5432
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:setup
      - run: npm run test:ci
```

## 📚 Best Practices

### Test Organization

1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows

### Test Data Management

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Fixtures**: Use consistent test data

### Mocking Strategy

1. **External APIs**: Mock email, webhook services
2. **Database**: Use real test database
3. **File System**: Mock file operations in unit tests

### Performance

1. **Fast Tests**: Keep tests under 30 seconds
2. **Parallel Execution**: Use Jest's parallel execution
3. **Database**: Use transactions for cleanup

## 🎯 Next Steps

1. **Run Initial Tests**: `npm test`
2. **Check Coverage**: `npm run test:coverage`
3. **Add More Tests**: Follow the examples above
4. **Set Up CI/CD**: Integrate with your CI/CD pipeline
5. **Monitor Coverage**: Maintain coverage goals

## 📞 Support

For issues with the testing setup:

1. Check the troubleshooting section above
2. Review the test documentation in `__tests__/README.md`
3. Check Jest and Supertest documentation
4. Create an issue in the project repository
