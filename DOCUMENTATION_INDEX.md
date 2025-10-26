# Grand Archive Meta - Documentation Index

Complete index of all project documentation.

## Quick Start

New to the project? Start here:

1. **[README.md](README.md)** - Project overview and quick start
2. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Set up your development environment
3. **[CONTRIBUTING.md](CONTRIBUTING.md)** - Learn how to contribute

## Core Documentation

### Overview Documents

- **[README.md](README.md)** - Main project documentation
  - Project overview
  - Features
  - Architecture diagram
  - Technology stack
  - Quick start guide
  - Project structure

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
  - High-level architecture
  - Component details
  - Data flow diagrams
  - Database schema
  - Security architecture
  - Scalability considerations

### Setup & Development

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development guide
  - Local development setup
  - Running services
  - Development workflow
  - Testing strategies
  - Debugging tips
  - Common tasks

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide
  - Prerequisites
  - MongoDB Atlas setup
  - AWS infrastructure deployment
  - Backend deployment
  - Frontend deployment (Vercel)
  - DNS configuration
  - Verification steps

### API Documentation

- **[API.md](API.md)** - Complete API reference
  - Endpoint specifications
  - Request/response examples
  - Error handling
  - Rate limiting
  - Authentication (future)
  - SDK examples

### Contributing

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
  - Code of conduct
  - Development workflow
  - Coding standards
  - Commit guidelines
  - Pull request process
  - Reporting bugs

## Component Documentation

### Backend

Located in `backend/`:

- **[backend/README.md](backend/README.md)** - Backend overview
  - Technology stack
  - Project structure
  - Getting started
  - API clients
  - Scheduled jobs
  - Building & deployment

- **[backend/.env.example](backend/.env.example)** - Environment variables
  - MongoDB configuration
  - AWS settings
  - API keys
  - Feature flags

### Frontend

Located in `frontend/`:

- **[frontend/README.md](frontend/README.md)** - Frontend overview
  - Technology stack
  - Project structure
  - Getting started
  - Pages overview
  - Component structure
  - Building & deployment

- **[frontend/.env.local.example](frontend/.env.local.example)** - Environment variables
  - API configuration
  - Site settings
  - Analytics (optional)

### Infrastructure

Located in `infrastructure/`:

- **[infrastructure/README.md](infrastructure/README.md)** - Infrastructure overview
  - AWS resources
  - CloudFormation/Terraform
  - Cost estimates
  - Setup instructions
  - Monitoring
  - Destroying resources

## Configuration Files

### Docker

- **[docker-compose.yml](docker-compose.yml)** - Local development services
  - MongoDB
  - Mongo Express (web UI)
  - Optional backend/frontend containers

### Scripts

- **[scripts/mongo-init.js](scripts/mongo-init.js)** - MongoDB initialization
  - Create collections
  - Create indexes
  - Set up database structure

### Project Meta

- **[LICENSE](LICENSE)** - MIT License
- **[.gitignore](.gitignore)** - Git ignore rules

## Documentation by Use Case

### I want to...

#### Run the project locally
1. Read: [DEVELOPMENT.md](DEVELOPMENT.md)
2. Use: [docker-compose.yml](docker-compose.yml)
3. Configure: `backend/.env.example`, `frontend/.env.local.example`

#### Deploy to production
1. Read: [DEPLOYMENT.md](DEPLOYMENT.md)
2. Setup: MongoDB Atlas
3. Deploy: AWS (CloudFormation)
4. Deploy: Frontend (Vercel)

#### Understand the architecture
1. Read: [ARCHITECTURE.md](ARCHITECTURE.md)
2. Read: [README.md](README.md) - Architecture section
3. Review: Component READMEs

#### Use the API
1. Read: [API.md](API.md)
2. Test: Use provided examples
3. Integrate: Choose SDK or direct HTTP

#### Contribute code
1. Read: [CONTRIBUTING.md](CONTRIBUTING.md)
2. Setup: [DEVELOPMENT.md](DEVELOPMENT.md)
3. Follow: Coding standards
4. Submit: Pull request

#### Add a new feature
1. Review: [CONTRIBUTING.md](CONTRIBUTING.md)
2. Create: Feature branch
3. Implement: Follow coding standards
4. Test: Write tests
5. Document: Update relevant docs
6. Submit: Pull request

#### Fix a bug
1. Report: Create GitHub issue
2. Reproduce: Follow steps in issue
3. Fix: Create bug fix branch
4. Test: Verify fix works
5. Submit: Pull request

## External Resources

### Technology Documentation

**Backend**:
- [Micronaut Framework](https://docs.micronaut.io/)
- [Kotlin Language](https://kotlinlang.org/docs/)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [AWS Lambda Guide](https://docs.aws.amazon.com/lambda/)

**Frontend**:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com/docs/primitives)

**Infrastructure**:
- [AWS CloudFormation](https://docs.aws.amazon.com/cloudformation/)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Vercel Documentation](https://vercel.com/docs)

### Community

- **GitHub**: [Repository](https://github.com/yourusername/grand-archive-meta)
- **Issues**: [Bug reports & features](https://github.com/yourusername/grand-archive-meta/issues)
- **Discussions**: [Q&A and community](https://github.com/yourusername/grand-archive-meta/discussions)
- **Discord**: [Community server](#) (link)

## Documentation Status

Last updated: 2024-01-15

| Document | Status | Last Updated |
|----------|--------|--------------|
| README.md | Complete | 2024-01-15 |
| ARCHITECTURE.md | Complete | 2024-01-15 |
| DEVELOPMENT.md | Complete | 2024-01-15 |
| DEPLOYMENT.md | Complete | 2024-01-15 |
| API.md | Complete | 2024-01-15 |
| CONTRIBUTING.md | Complete | 2024-01-15 |
| backend/README.md | Complete | 2024-01-15 |
| frontend/README.md | Complete | 2024-01-15 |
| infrastructure/README.md | Complete | 2024-01-15 |

## Maintenance

This documentation is maintained by the Grand Archive Meta team. If you find any issues or have suggestions:

1. Open a GitHub issue
2. Submit a pull request
3. Contact maintainers

---

**Questions?** See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get help.
