# Grand Archive Meta - Development Guide

Complete guide for setting up and contributing to the Grand Archive Meta project.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Running Services Locally](#running-services-locally)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style Guidelines](#code-style-guidelines)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Debugging](#debugging)
- [Common Development Tasks](#common-development-tasks)
- [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites

Install the required tools:

```bash
# macOS (using Homebrew)
brew install node        # Node.js 20.x
brew install openjdk@17  # Java 17
brew install gradle      # Gradle 8.x
brew install docker      # Docker Desktop
brew install git         # Git

# Verify installations
node --version    # v20.x.x
java --version    # 17.x.x
gradle --version  # 8.x
docker --version  # 24.x.x
```

### Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/grand-archive-meta.git
cd grand-archive-meta

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Set Up MongoDB Locally

**Option 1: Docker (Recommended)**

```bash
# Start MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7
```

**Option 2: Docker Compose (Easiest)**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Option 3: MongoDB Atlas**

Use a free M0 cluster for development (see DEPLOYMENT.md for setup).

### Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Edit .env with your MongoDB connection
# For local Docker MongoDB:
# MONGODB_CONNECTION_STRING=mongodb://admin:password@localhost:27017/grand-archive?authSource=admin

# Build the project
./gradlew build

# Run the application
./gradlew run
```

Backend will start on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Start development server
npm run dev
```

Frontend will start on `http://localhost:3000`

### Verify Setup

```bash
# Test backend
curl http://localhost:8080/api/health

# Test frontend
open http://localhost:3000

# Check browser console for errors
```

## Running Services Locally

### Full Stack Development

Run all services together:

```bash
# Terminal 1: MongoDB
docker-compose up mongodb

# Terminal 2: Backend
cd backend
./gradlew run --continuous  # Auto-reload on changes

# Terminal 3: Frontend
cd frontend
npm run dev  # Hot reload enabled by default
```

### Backend Only

```bash
cd backend

# Run with auto-reload
./gradlew run --continuous

# Or run tests on file change
./gradlew test --continuous
```

### Frontend Only

```bash
cd frontend

# Development server
npm run dev

# With Turbopack (faster)
npm run dev --turbo
```

### Database Tools

**MongoDB Compass** (GUI):
1. Download from [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://admin:password@localhost:27017`
3. Browse collections and data

**mongosh** (CLI):
```bash
# Connect to local MongoDB
docker exec -it mongodb mongosh -u admin -p password

# Switch to database
use grand-archive

# List collections
show collections

# Query data
db.decks.find().limit(5)
```

## Development Workflow

### 1. Pick an Issue

Browse [GitHub Issues](https://github.com/yourusername/grand-archive-meta/issues) or create a new one.

### 2. Create Feature Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-deck-filters

# Or for bug fixes
git checkout -b fix/meta-calculation-error
```

### 3. Make Changes

Edit code, test locally, commit frequently:

```bash
# Make changes
# Test changes

# Stage and commit
git add .
git commit -m "feat: add deck filtering by element"
```

### 4. Test Changes

```bash
# Backend tests
cd backend
./gradlew test

# Frontend tests (if implemented)
cd frontend
npm test

# Integration tests
npm run test:integration
```

### 5. Push and Create PR

```bash
# Push branch
git push origin feature/add-deck-filters

# Create pull request on GitHub
# Fill in PR template
```

## Testing

### Backend Tests

**Run All Tests**:
```bash
cd backend
./gradlew test
```

**Run Specific Test Class**:
```bash
./gradlew test --tests "com.grandarchive.meta.service.MetaServiceTest"
```

**Run Tests with Coverage**:
```bash
./gradlew test jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

**Integration Tests**:
```bash
# Requires MongoDB running
./gradlew integrationTest
```

### Frontend Tests

**Unit Tests** (if implemented):
```bash
cd frontend
npm test
```

**E2E Tests** (if implemented):
```bash
# Start dev server first
npm run dev

# In another terminal
npm run test:e2e
```

### Manual Testing

**API Endpoints**:
```bash
# Health check
curl http://localhost:8080/api/health

# Get meta data
curl http://localhost:8080/api/meta/format/Constructed

# Get decklists
curl "http://localhost:8080/api/decklists?limit=5"

# Get card details
curl http://localhost:8080/api/card-reference/id/GA-001
```

**Frontend Pages**:
- Home: http://localhost:3000
- Meta: http://localhost:3000/meta
- Decks: http://localhost:3000/decks
- Cards: http://localhost:3000/cards

### Test Data

**Seed Database**:
```bash
# Create test data script
cd backend/src/test/resources
# Run seed script (create one if needed)
```

## Code Style Guidelines

### Backend (Kotlin)

**Naming Conventions**:
- Classes: `PascalCase` (e.g., `MetaService`)
- Functions: `camelCase` (e.g., `calculateMetaPercentages`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_LIMIT`)
- Private variables: `camelCase` with `_` prefix (e.g., `_repository`)

**Code Style**:
```kotlin
// Good
class MetaService(
    private val repository: MetaRepository,
    private val logger: Logger
) {
    fun calculateMeta(format: String): MetaSnapshot {
        logger.info("Calculating meta for format: $format")
        return repository.findByFormat(format)
    }
}

// Bad
class metaService {
    fun CalculateMeta(Format: String): MetaSnapshot {
        return repository.findByFormat(Format)
    }
}
```

**Best Practices**:
- Use data classes for DTOs
- Prefer `val` over `var`
- Use Kotlin coroutines for async operations
- Add KDoc comments for public APIs
- Keep functions small and focused

### Frontend (TypeScript/React)

**Naming Conventions**:
- Components: `PascalCase` (e.g., `DeckCard`)
- Hooks: `camelCase` with `use` prefix (e.g., `useDebounce`)
- Functions: `camelCase` (e.g., `fetchMetaData`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_URL`)

**Code Style**:
```tsx
// Good
interface DeckCardProps {
  deck: Deck
  onClick?: () => void
}

export function DeckCard({ deck, onClick }: DeckCardProps) {
  return (
    <Card onClick={onClick}>
      <CardHeader>
        <CardTitle>{deck.name}</CardTitle>
      </CardHeader>
    </Card>
  )
}

// Bad
export default function deckCard(props: any) {
  return <div onClick={props.onClick}>{props.deck.name}</div>
}
```

**Best Practices**:
- Use TypeScript for type safety
- Prefer functional components over class components
- Use React hooks (useState, useEffect, etc.)
- Extract reusable logic into custom hooks
- Add JSDoc comments for complex functions

### Linting

**Backend**:
```bash
cd backend
./gradlew ktlintCheck  # Check
./gradlew ktlintFormat # Auto-fix
```

**Frontend**:
```bash
cd frontend
npm run lint           # Check
npm run lint:fix       # Auto-fix
```

## Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(api): add deck filtering by element
fix(meta): correct win rate calculation
docs(readme): update installation instructions
style(frontend): format code with prettier
refactor(scraper): simplify tournament parsing
test(service): add meta service unit tests
chore(deps): update dependencies
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Branch Naming

```bash
# Features
feature/deck-filtering
feature/hero-statistics

# Bugs
fix/meta-calculation
fix/api-timeout

# Chores
chore/update-dependencies
chore/improve-logging
```

### Rebasing

Keep your branch up to date:

```bash
# Update main
git checkout main
git pull origin main

# Rebase feature branch
git checkout feature/your-feature
git rebase main

# If conflicts, resolve them
git add .
git rebase --continue

# Force push (if already pushed)
git push --force-with-lease
```

## Pull Request Process

### 1. Create PR

1. Push your branch to GitHub
2. Open Pull Request from your branch to `main`
3. Fill out PR template:
   - Description of changes
   - Related issue(s)
   - Testing performed
   - Screenshots (if UI changes)

### 2. PR Requirements

Before requesting review:
- [ ] Tests pass locally
- [ ] Code is linted
- [ ] Documentation updated
- [ ] No console errors
- [ ] PR description is complete

### 3. Code Review

- Address review comments
- Push additional commits
- Re-request review after changes

### 4. Merge

Once approved:
- Squash and merge (preferred)
- Use descriptive merge commit message
- Delete branch after merge

## Debugging

### Backend Debugging

**IntelliJ IDEA**:
1. Open `backend` in IntelliJ IDEA
2. Set breakpoints in code
3. Run → Debug 'LocalApplication'
4. Use debugger to step through code

**Logs**:
```bash
# View logs
cd backend
./gradlew run

# Logs appear in console
# Adjust log level in src/main/resources/logback.xml
```

**Remote Debugging** (Lambda):
```bash
# Enable debug logs
aws lambda update-function-configuration \
  --function-name grand-archive-meta-api \
  --environment Variables={LOG_LEVEL=DEBUG}

# View logs
aws logs tail /aws/lambda/grand-archive-meta-api --follow
```

### Frontend Debugging

**Browser DevTools**:
1. Open Chrome/Firefox DevTools (F12)
2. Go to Sources tab
3. Find source file and set breakpoints
4. Reload page to hit breakpoints

**React DevTools**:
1. Install React DevTools extension
2. Open DevTools → React tab
3. Inspect component props and state

**Network Debugging**:
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Inspect API requests and responses

## Common Development Tasks

### Add New API Endpoint

**Backend**:
```kotlin
// 1. Create controller method
@Get("/api/heroes")
fun getHeroes(): List<Hero> {
    return heroService.findAll()
}

// 2. Add service method
fun findAll(): List<Hero> {
    return repository.find().into(mutableListOf())
}

// 3. Test
curl http://localhost:8080/api/heroes
```

**Frontend**:
```typescript
// 1. Add API function
export async function fetchHeroes(): Promise<Hero[]> {
  return apiClient<Hero[]>('/api/heroes')
}

// 2. Use in component
const heroes = await fetchHeroes()
```

### Add New Database Collection

```kotlin
// 1. Create model
data class Hero(
    val id: String,
    val name: String,
    val element: String
)

// 2. Create repository
class HeroRepository(private val database: MongoDatabase) {
    private val collection = database.getCollection<Hero>("heroes")

    fun findAll(): List<Hero> = collection.find().toList()
}

// 3. Add indexes (if needed)
collection.createIndex(Indexes.ascending("name"))
```

### Add New Frontend Page

```bash
# 1. Create page file
cd frontend/app/(pages)
mkdir heroes
cd heroes
touch page.tsx

# 2. Add content
# 3. Add navigation link in header
# 4. Test at http://localhost:3000/heroes
```

## Troubleshooting

### Backend Won't Start

**Error**: `Address already in use`
```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
./gradlew run -Dmicronaut.server.port=8081
```

**Error**: `MongoDB connection failed`
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Start if not running
docker-compose up -d mongodb

# Verify connection string in .env
```

### Frontend Won't Start

**Error**: `EADDRINUSE: address already in use`
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

**Error**: `Cannot find module`
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Tests Failing

```bash
# Backend: Clean and rebuild
cd backend
./gradlew clean build

# Frontend: Clear cache
cd frontend
rm -rf .next
npm run build
```

### Hot Reload Not Working

**Backend**:
```bash
# Use continuous mode
./gradlew run --continuous
```

**Frontend**:
```bash
# Restart dev server
npm run dev
```

---

## Additional Resources

- [Micronaut Documentation](https://docs.micronaut.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Kotlin Documentation](https://kotlinlang.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Getting Help

- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community server
- **Email**: maintainers@example.com

Happy coding!
