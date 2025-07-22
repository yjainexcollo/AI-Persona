# AI-Persona Backend

A secure, scalable, and enterprise-grade multi-tenant backend for the AI-Persona SaaS platform.  
Supports modular authentication (local, OAuth, SSO-ready), strict workspace/user isolation, robust RBAC, and AI persona integration.

---

## 📁 Folder Structure

```
backend/
  docs/                # API documentation (Swagger/OpenAPI)
  prisma/              # Prisma schema and migrations
  src/                 # Application source code
    config/            # App and third-party configuration (env, passport, etc.)
    controllers/       # Route controllers (REST & GraphQL)
    middlewares/       # Express middlewares (auth, RBAC, error handling, etc.)
    routes/            # API route definitions
    services/          # Business logic (multi-tenancy, auth, invites, etc.)
    utils/             # Utility functions (JWT, logging, password, etc.)
    validations/       # Input validation schemas
    graphql/           # GraphQL schema, resolvers, and context
    app.js             # Express app setup
    index.js           # App entry point
  package.json         # Project dependencies and scripts
  Dockerfile           # Docker build instructions
  docker-compose.yml   # Multi-container orchestration
  .env.template        # Example environment variables
  README.md            # Project documentation
```

---

## 🏢 Multi-Tenancy & AI Persona

- **Multi-Tenancy:** Each company/tenant has its own isolated workspace. Users are assigned to workspaces by email domain. All data access is strictly scoped to the current workspace.
- **Workspace Isolation:** No cross-workspace data access is possible. All business logic enforces tenant boundaries.
- **AI Personas:** Each workspace can have one or more AI personas (assistants/chatbots), fully isolated per workspace.

---

## 🚀 Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/your-org/AI-Persona.git
cd AI-Persona/backend
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

- Copy `.env.template` to `.env` and fill in the required values.
- For local development, use the `localhost` DATABASE_URL.
- For Docker, use the `db` hostname in DATABASE_URL.

```sh
cp .env.template .env
```

### 4. Run the Backend Locally

```sh
npm run dev
```

_This uses nodemon for hot-reloading (if configured)._

### 5. Run with Docker

```sh
docker-compose up --build
```

- The backend will be available at [http://localhost:3000](http://localhost:3000)
- PostgreSQL will be available at `localhost:5432` (user: `postgres`, password: `postgres`)

---

## 🛠️ Environment Variables

See `.env.template` for all required variables.  
Key variables include:

- `PORT`: Port for the backend server
- `DATABASE_URL`: PostgreSQL connection string (local or Docker)
- `JWT_SECRET`: Secret for JWT signing
- `SESSION_SECRET`: Secret for session encryption
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: For Google OAuth
- `OAUTH_CALLBACK_URL`: OAuth callback endpoint
- `EMAIL_API_KEY` / `EMAIL_FROM`: For transactional email
- `CORS_ORIGIN`: Allowed CORS origins

---

## 🐳 Docker & Database

- The `docker-compose.yml` file sets up both the backend and a PostgreSQL database.
- Data is persisted in a Docker volume (`db_data`).
- The backend service uses the `.env` file for configuration.
- For production, remove code/node_modules volume mounts and use a secrets manager for sensitive values.

---

## 🧩 Prisma ORM

- Prisma schema is located in `prisma/schema.prisma`.
- To apply migrations:
  ```sh
  npm run migrate
  ```
- To generate Prisma client:
  ```sh
  npm run generate
  ```

---

## 📚 API Documentation

- API docs are maintained in `docs/swagger.yaml` (OpenAPI 3.0.3).
- View interactive docs at `/docs` when the backend is running.
- Both REST and GraphQL APIs are documented.

---

## 🔐 Authentication, RBAC & Security

- **Authentication:** Local (email/password), OAuth (Google, Microsoft), and SSO-ready via Passport.js.
- **RBAC:** Role-based access control (admin, member, guest, etc.) enforced via middleware and services.
- **Workspace Context:** All requests are scoped to a workspace for strict tenant isolation.
- **Security:**
  - Uses helmet, CORS, and rate limiting.
  - All sensitive data is loaded from environment variables.
  - Centralized error handling and logging.

---

## 🕸️ API Endpoints

- **GraphQL:** [http://localhost:3000/graphql](http://localhost:3000/graphql)
- **REST Health Check:** [http://localhost:3000/health](http://localhost:3000/health)
- **Swagger Docs:** [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 📜 Available NPM Scripts

- `npm start` — Start the server in production mode
- `npm run dev` — Start the server with nodemon for development
- `npm run migrate` — Run Prisma migrations
- `npm run generate` — Generate Prisma client
- `npm run lint` — Lint the codebase (add linter setup as needed)
- `npm test` — Run tests (add test setup as needed)

---

## 🤝 Contributing

1. Fork the repo and create your branch.
2. Commit your changes and open a pull request.
3. Ensure all tests pass and code is linted.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Best Practices

- Never commit your real `.env` file or secrets.
- Use strong, unique secrets for JWT and session management.
- Keep dependencies up to date.
- Write tests for all business logic, authentication, and multi-tenancy flows.
- Document any architectural or security decisions in the `docs/` folder.
- Centralized, robust logging and error handling using the logger utility and Express middleware.
- Enforce DRY, modularity, and separation of concerns throughout the codebase.

---

## 📞 Support

For questions or support, open an issue or contact the maintainers.
