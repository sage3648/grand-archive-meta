# Grand Archive Meta

A comprehensive web application for tracking Grand Archive TCG metagame data, tournament results, and deck performance analytics.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

Grand Archive Meta is a dual-component platform that aggregates and analyzes competitive data from the Grand Archive TCG ecosystem. The platform provides:

- **Tournament Data**: Official tournament decklists, standings, and results
- **Meta Analysis**: Format-specific meta percentages, deck popularity, and win rates
- **Card Analytics**: Card usage trends, pricing data, and performance metrics
- **Deck Building Tools**: Browse top-performing decklists and analyze card choices

This platform serves competitive players, content creators, and the broader Grand Archive community with data-driven insights.

## Features

### Core Features

- **Meta Dashboard**: Real-time meta percentages by format (Constructed, Limited, etc.)
- **Deck Browser**: Search and filter tournament-winning decklists
- **Hero Performance**: Win rates, usage statistics, and matchup data
- **Card Search**: Comprehensive card database with pricing integration
- **Performance Trends**: Track card and deck performance over time
- **Responsive Design**: Mobile-optimized interface for on-the-go access

### Analytics Features

- **Deck Archetypes**: Automatic archetype identification and tracking
- **Matchup Analysis**: Head-to-head statistics between heroes and deck types
- **Meta Snapshots**: Historical meta data for trend analysis
- **Card Usage**: Track which cards are performing best in competitive play

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Meta Page  │ │  Decks Page  │ │  Cards Page  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                   │
│  Deployed on: Vercel (CDN + Edge Functions)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              AWS API Gateway (REST API)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                Backend (Kotlin/Micronaut)                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  API Lambda  │ │  Scrapers    │ │  Schedulers  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                   │
│  Deployed on: AWS Lambda                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MongoDB Atlas                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │    Decks     │ │    Cards     │ │  Meta Data   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

For a detailed architecture overview, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI (shadcn/ui)
- **Charts**: Recharts
- **Internationalization**: next-intl
- **Deployment**: Vercel

### Backend
- **Language**: Kotlin
- **Framework**: Micronaut 4.2
- **Runtime**: AWS Lambda (Java 17)
- **Build Tool**: Gradle
- **API**: RESTful JSON API

### Database
- **Primary Database**: MongoDB Atlas
- **Collections**:
  - `decks` - Tournament decklists
  - `deck-cards` - Card breakdowns
  - `card-reference` - Centralized card database
  - `meta-snapshots` - Historical meta data

### Infrastructure
- **Cloud Provider**: AWS
- **API Gateway**: AWS API Gateway (REST)
- **Compute**: AWS Lambda
- **Scheduling**: AWS EventBridge
- **IaC**: AWS CloudFormation
- **CI/CD**: GitHub Actions

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js**: v20.x or higher
- **Java**: JDK 17 (for backend development)
- **Gradle**: 8.x (or use included wrapper)
- **Git**: For version control

### For Deployment
- **AWS Account**: With appropriate IAM permissions
- **MongoDB Atlas Account**: Free tier is sufficient
- **Vercel Account**: For frontend deployment (optional, can use AWS)
- **Domain Name**: For production deployment (optional)

### Development Tools (Recommended)
- **Docker**: For local MongoDB instance
- **Postman/Insomnia**: For API testing
- **IntelliJ IDEA**: For backend Kotlin development
- **VS Code**: For frontend development

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/grand-archive-meta.git
cd grand-archive-meta
```

### 2. Start Local Services

Using Docker Compose (recommended):

```bash
# Start MongoDB locally
docker-compose up -d
```

### 3. Start the Backend

```bash
cd backend
./gradlew run
```

The API will be available at `http://localhost:8080`

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 5. Verify Setup

Open your browser to `http://localhost:3000` and you should see the Grand Archive Meta homepage.

For detailed development setup, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Project Structure

```
grand-archive-meta/
├── backend/                    # Kotlin/Micronaut backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/        # Source code
│   │   │   │   ├── api/       # REST API controllers
│   │   │   │   ├── lambda/    # Lambda handlers
│   │   │   │   ├── scraper/   # Data scrapers
│   │   │   │   ├── service/   # Business logic
│   │   │   │   └── model/     # Data models
│   │   │   └── resources/     # Configuration files
│   │   └── test/              # Unit and integration tests
│   ├── build.gradle.kts       # Gradle build configuration
│   └── README.md              # Backend documentation
│
├── frontend/                   # Next.js frontend
│   ├── app/                   # Next.js app directory
│   │   ├── (pages)/           # Page routes
│   │   ├── api/               # API routes (if any)
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   └── features/          # Feature-specific components
│   ├── lib/                   # Utility functions
│   ├── public/                # Static assets
│   ├── styles/                # Global styles
│   ├── package.json           # Node.js dependencies
│   └── README.md              # Frontend documentation
│
├── infrastructure/            # AWS infrastructure
│   ├── cloudformation.yml     # CloudFormation template
│   └── README.md              # Infrastructure documentation
│
├── docs/                      # Additional documentation
│   ├── api/                   # API specifications
│   └── guides/                # How-to guides
│
├── .github/                   # GitHub configuration
│   └── workflows/             # CI/CD workflows
│
├── docker-compose.yml         # Local development services
├── ARCHITECTURE.md            # System architecture
├── DEPLOYMENT.md              # Deployment guide
├── DEVELOPMENT.md             # Development guide
├── API.md                     # API documentation
├── LICENSE                    # MIT License
└── README.md                  # This file
```

## Development Setup

### Backend Development

1. **Configure Environment**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

2. **Build the Project**:
   ```bash
   ./gradlew build
   ```

3. **Run Tests**:
   ```bash
   ./gradlew test
   ```

4. **Run Locally**:
   ```bash
   ./gradlew run
   ```

See [backend/README.md](backend/README.md) for more details.

### Frontend Development

1. **Configure Environment**:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

See [frontend/README.md](frontend/README.md) for more details.

## Deployment

The application uses a multi-stage deployment process:

1. **Infrastructure**: Deploy AWS resources using CloudFormation
2. **Backend**: Build and deploy Lambda functions
3. **Frontend**: Deploy to Vercel or AWS

### Quick Deployment

```bash
# Deploy infrastructure
cd infrastructure
aws cloudformation deploy \
  --template-file cloudformation.yml \
  --stack-name grand-archive-meta \
  --parameter-overrides MongoDBConnectionString=$MONGODB_URI \
  --capabilities CAPABILITY_IAM

# Deploy backend
cd ../backend
./gradlew shadowJar
aws lambda update-function-code \
  --function-name grand-archive-meta-api \
  --zip-file fileb://build/libs/grand-archive-meta-0.1-all.jar

# Deploy frontend
cd ../frontend
vercel --prod
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Environment Variables

### Backend (.env)

```bash
# MongoDB
MONGODB_CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/grand-archive

# AWS (for local development)
AWS_REGION=us-east-1
```

### Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

For complete environment variable documentation, see the `.env.example` files in each directory.

## API Documentation

The backend exposes a RESTful JSON API. Key endpoints include:

### Meta Analysis
- `GET /api/meta/format/{format}` - Get meta percentages
- `GET /api/meta/snapshot` - Get current meta snapshot

### Decklists
- `GET /api/decklists` - List recent decklists
- `GET /api/decklists/hero/{hero}/format/{format}` - Get decks by hero
- `GET /api/deckcards/{deckName}` - Get deck card breakdown

### Cards
- `GET /api/card-reference/search?q={query}` - Search cards
- `GET /api/card-reference/id/{id}` - Get card details
- `GET /api/card-reference/usage-trends` - Get card usage trends

### Events
- `GET /api/events` - List tournament events
- `GET /api/events/{eventId}` - Get event details

For complete API documentation, see [API.md](API.md).

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and commit: `git commit -m "Add your feature"`
4. **Push to your fork**: `git push origin feature/your-feature-name`
5. **Open a Pull Request**

### Development Guidelines

- Write clear, descriptive commit messages
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Code Style

- **Backend**: Follow Kotlin coding conventions
- **Frontend**: Use ESLint and Prettier configurations
- **Commits**: Use conventional commit format (feat:, fix:, docs:, etc.)

## Testing

### Backend Tests

```bash
cd backend
./gradlew test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
# Start all services
docker-compose up -d

# Run integration tests
npm run test:integration
```

## Troubleshooting

### Common Issues

**Backend won't start**:
- Verify MongoDB connection string is correct
- Ensure port 8080 is not in use
- Check Java version (must be 17)

**Frontend API calls fail**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running on expected port
- Review CORS settings in backend

**Deployment fails**:
- Verify AWS credentials are configured
- Check IAM permissions for CloudFormation/Lambda
- Ensure MongoDB Atlas allows connections from AWS IPs

For more troubleshooting tips, see [DEVELOPMENT.md](DEVELOPMENT.md#troubleshooting).

## Performance

The application is optimized for performance:

- **Cold Start**: ~1-2s (with Lambda SnapStart)
- **Warm Response**: ~100-300ms
- **Frontend**: Server-side rendering with edge caching
- **Database**: Indexed queries for fast meta lookups

## Security

- API uses HTTPS in production
- MongoDB connections use TLS
- Secrets managed via AWS Secrets Manager
- CORS configured for production domains only

## Roadmap

- [ ] User authentication and saved decklists
- [ ] Deck builder with AI suggestions
- [ ] Advanced matchup analysis
- [ ] Tournament organizer tools
- [ ] Mobile app (React Native)
- [ ] GraphQL API option

## Support

- **Documentation**: See docs in this repository
- **Issues**: Submit via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community server (link)

## Acknowledgments

- Grand Archive TCG for the amazing game
- The competitive community for data and feedback
- Open source libraries that power this platform

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with** by the Grand Archive community

**Questions?** Open an issue or join our Discord
