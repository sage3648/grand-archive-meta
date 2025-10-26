# Contributing to Grand Archive Meta

Thank you for your interest in contributing to Grand Archive Meta! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Questions](#questions)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

### Our Standards

- Be welcoming and inclusive
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Found a bug? Please create an issue with:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, versions)

### Suggesting Enhancements

Have an idea? Open an issue with:
- Clear description of the enhancement
- Use cases and benefits
- Potential implementation approach
- Any relevant examples or mockups

### Code Contributions

1. **Pick an issue** or create a new one
2. **Fork the repository**
3. **Create a feature branch**
4. **Make your changes**
5. **Test thoroughly**
6. **Submit a pull request**

## Getting Started

### Prerequisites

Install required tools:
- Node.js 20+
- Java 17 (for backend)
- Gradle 8+
- Docker (optional)

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/your-username/grand-archive-meta.git
cd grand-archive-meta

# Add upstream remote
git remote add upstream https://github.com/original/grand-archive-meta.git

# Start MongoDB
docker-compose up -d mongodb

# Backend setup
cd backend
cp .env.example .env
./gradlew build
./gradlew run

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Development Workflow

### 1. Sync with Upstream

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation

### 4. Test Your Changes

```bash
# Backend tests
cd backend
./gradlew test

# Frontend tests (if applicable)
cd frontend
npm test

# Manual testing
# Test all affected functionality
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
# See commit guidelines below
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
# Then create PR on GitHub
```

## Coding Standards

### Backend (Kotlin)

**File Organization**:
- One class per file
- Package structure: `com.grandarchive.meta.{module}`
- Test files mirror main source structure

**Naming**:
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Private fields: `_camelCase`

**Code Style**:
```kotlin
// Good
class DeckService(
    private val repository: DeckRepository,
    private val logger: Logger
) {
    fun findByHero(hero: String): List<Deck> {
        logger.info("Finding decks for hero: $hero")
        return repository.findByHero(hero)
    }
}

// Bad
class deckService {
    fun FindByHero(Hero: String): List<Deck> {
        return repository.findByHero(Hero)
    }
}
```

**Best Practices**:
- Prefer `val` over `var`
- Use data classes for DTOs
- Add KDoc for public APIs
- Keep functions focused and small
- Use meaningful variable names

### Frontend (TypeScript/React)

**File Organization**:
- Components in `components/` directory
- Group by feature: `components/features/meta/`
- Shared components in `components/shared/`

**Naming**:
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Types: `PascalCase` or `camelCase.ts`

**Code Style**:
```tsx
// Good
interface DeckCardProps {
  deck: Deck
  onSelect?: (deck: Deck) => void
}

export function DeckCard({ deck, onSelect }: DeckCardProps) {
  return (
    <Card onClick={() => onSelect?.(deck)}>
      <CardTitle>{deck.name}</CardTitle>
    </Card>
  )
}

// Bad
export default function card(props: any) {
  return <div onClick={props.onClick}>{props.deck.name}</div>
}
```

**Best Practices**:
- Use TypeScript for type safety
- Prefer functional components
- Extract logic into custom hooks
- Use meaningful component names
- Add JSDoc for complex functions

### Documentation

- Update README.md if needed
- Add JSDoc/KDoc comments
- Update API.md for API changes
- Include code examples

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(api): add deck filtering by element

Add support for filtering decks by element type (Fire, Water, etc.)
in the /api/decklists endpoint.

Closes #123
```

```bash
fix(meta): correct win rate calculation

Win rates were incorrectly calculated when decks had no placement data.
Now properly handles missing data.

Fixes #456
```

### Scope

Optional, indicates what part of the codebase:
- `api`: Backend API
- `frontend`: Frontend application
- `meta`: Meta analysis features
- `cards`: Card database features
- `scraper`: Data scraping
- `docs`: Documentation

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Branch is up to date with main

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123
Related to #456

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated Checks**: CI must pass
2. **Code Review**: At least one approval required
3. **Testing**: Reviewer may test changes
4. **Feedback**: Address review comments
5. **Approval**: Once approved, maintainer will merge

### After PR is Merged

- Delete your feature branch
- Pull latest changes from upstream
- Update your fork

```bash
git checkout main
git pull upstream main
git push origin main
git branch -d feature/your-feature-name
```

## Reporting Bugs

### Before Reporting

- Check existing issues
- Try latest version
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g., macOS 14.0]
 - Browser: [e.g., Chrome 120]
 - Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## Suggesting Enhancements

### Enhancement Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context, mockups, or examples.
```

## Questions

### Getting Help

- **Documentation**: Check README and other docs
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Discord**: Join community server
- **Email**: Contact maintainers

### Communication Channels

- **GitHub Issues**: Bug reports, features
- **GitHub Discussions**: General questions
- **Discord**: Real-time chat
- **Email**: Private matters

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Grand Archive Meta!
