# Grand Archive Meta - Frontend

A modern, responsive web application built with Next.js 15 and React 19 for tracking Grand Archive TCG meta data.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Pages Overview](#pages-overview)
- [Component Structure](#component-structure)
- [Styling](#styling)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Performance Optimization](#performance-optimization)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

The frontend is a server-side rendered (SSR) Next.js application that provides a fast, SEO-friendly interface for browsing Grand Archive meta data, decklists, and card information.

### Key Features

- **Server-Side Rendering**: Fast initial page loads and excellent SEO
- **Edge Caching**: Leverages Vercel's edge network for global performance
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Built-in dark mode support with system preference detection
- **Type Safety**: Full TypeScript coverage
- **Accessibility**: WCAG 2.1 AA compliant

## Technology Stack

- **Framework**: Next.js 15.2 (App Router)
- **React**: 19.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI (shadcn/ui)
- **Charts**: Recharts 2.15
- **Icons**: Lucide React
- **Internationalization**: next-intl
- **Analytics**: Vercel Analytics & Speed Insights
- **Deployment**: Vercel

## Features

### Core Features

- **Meta Dashboard**: Real-time meta percentages and deck popularity
- **Deck Browser**: Search, filter, and browse tournament-winning decklists
- **Card Database**: Comprehensive card search with pricing
- **Hero Statistics**: Performance metrics and matchup data
- **Performance Trends**: Historical data and trend analysis
- **Deck Viewer**: Detailed deck analysis with card breakdowns

### User Experience

- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Fast Navigation**: Client-side routing with prefetching
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: Keyboard navigation and screen reader support

## Project Structure

```
frontend/
├── app/                        # Next.js App Router
│   ├── (pages)/               # Page routes
│   │   ├── page.tsx           # Home page
│   │   ├── meta/              # Meta analysis pages
│   │   │   └── page.tsx
│   │   ├── decks/             # Deck browser
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── cards/             # Card database
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── heroes/            # Hero statistics
│   │   │   └── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   │
│   ├── api/                   # API routes (if needed)
│   │   └── revalidate/
│   │       └── route.ts
│   │
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   └── providers.tsx          # Context providers
│
├── components/                # React components
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   │
│   ├── features/              # Feature-specific components
│   │   ├── meta/
│   │   │   ├── MetaDashboard.tsx
│   │   │   ├── MetaChart.tsx
│   │   │   └── FormatSelector.tsx
│   │   ├── decks/
│   │   │   ├── DeckList.tsx
│   │   │   ├── DeckCard.tsx
│   │   │   ├── DeckViewer.tsx
│   │   │   └── DeckFilters.tsx
│   │   ├── cards/
│   │   │   ├── CardSearch.tsx
│   │   │   ├── CardGrid.tsx
│   │   │   └── CardDetail.tsx
│   │   └── heroes/
│   │       ├── HeroStats.tsx
│   │       └── HeroComparison.tsx
│   │
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   │
│   └── shared/                # Shared components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── Pagination.tsx
│       └── SearchBar.tsx
│
├── lib/                       # Utility functions
│   ├── api/                   # API client
│   │   ├── client.ts
│   │   ├── meta.ts
│   │   ├── decks.ts
│   │   └── cards.ts
│   ├── utils/                 # Helper functions
│   │   ├── format.ts
│   │   ├── date.ts
│   │   └── validation.ts
│   └── hooks/                 # Custom React hooks
│       ├── useDebounce.ts
│       ├── useMediaQuery.ts
│       └── useLocalStorage.ts
│
├── public/                    # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/                    # Additional styles
│   └── themes/
│       ├── light.css
│       └── dark.css
│
├── types/                     # TypeScript types
│   ├── api.ts
│   ├── deck.ts
│   ├── card.ts
│   └── meta.ts
│
├── config/                    # Configuration files
│   └── site.ts
│
├── .env.local.example         # Example environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, yarn, or pnpm

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

### Development Server

```bash
npm run dev
```

This starts the development server with:
- Hot Module Replacement (HMR)
- Fast Refresh for instant updates
- TypeScript error checking
- Turbopack for faster builds (Next.js 15)

### Code Quality

**Linting**:
```bash
npm run lint
```

**Type Checking**:
```bash
npx tsc --noEmit
```

**Format Code**:
```bash
npm run format
```

### Adding New Components

#### shadcn/ui Components

Add pre-built accessible components:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add select
```

#### Custom Components

Create in `components/features/`:

```tsx
// components/features/decks/DeckCard.tsx
import { Card } from "@/components/ui/card"

interface DeckCardProps {
  deck: Deck
  onClick?: () => void
}

export function DeckCard({ deck, onClick }: DeckCardProps) {
  return (
    <Card onClick={onClick}>
      {/* Component content */}
    </Card>
  )
}
```

## Pages Overview

### Home Page (`/`)
- Overview of the platform
- Latest meta snapshot
- Featured decklists
- Quick navigation

### Meta Dashboard (`/meta`)
- Format selector
- Meta percentage charts
- Hero popularity graphs
- Trend analysis
- Filterable by date range

### Deck Browser (`/decks`)
- List of tournament decklists
- Filters: format, hero, date, event
- Search by deck name or pilot
- Pagination
- Individual deck pages at `/decks/[id]`

### Card Database (`/cards`)
- Searchable card list
- Filters: element, type, rarity, cost
- Card grid view
- Card detail pages at `/cards/[id]`

### Hero Statistics (`/heroes`)
- Hero performance metrics
- Win rates by format
- Matchup tables
- Usage trends

### About Page (`/about`)
- Platform information
- Data sources
- Contact information

## Component Structure

### UI Components (shadcn/ui)

Located in `components/ui/`:
- Pre-built accessible components
- Customizable with Tailwind CSS
- Based on Radix UI primitives

Example usage:

```tsx
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  )
}
```

### Feature Components

Located in `components/features/`:
- Domain-specific logic
- Composable and reusable
- Connect to API and state

### Layout Components

Located in `components/layout/`:
- Header, Footer, Sidebar
- Navigation menus
- Page layouts

## Styling

### Tailwind CSS

The project uses Tailwind CSS 4 for styling:

```tsx
<div className="flex items-center justify-between p-4 bg-card rounded-lg">
  <h2 className="text-2xl font-bold">Title</h2>
  <Button variant="outline" size="sm">Action</Button>
</div>
```

### CSS Variables

Theme colors defined in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Dark Mode

Automatic dark mode with system preference:

```tsx
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </Button>
  )
}
```

## State Management

### React Server Components

Most pages use Server Components for data fetching:

```tsx
// app/(pages)/meta/page.tsx
async function MetaPage() {
  const metaData = await fetchMetaData()

  return <MetaDashboard data={metaData} />
}
```

### Client Components

Interactive components use Client Components:

```tsx
"use client"

import { useState } from "react"

export function DeckFilters() {
  const [filters, setFilters] = useState({})
  // ...
}
```

### Custom Hooks

Located in `lib/hooks/`:

```tsx
import { useDebounce } from "@/lib/hooks/useDebounce"

const [search, setSearch] = useState("")
const debouncedSearch = useDebounce(search, 300)
```

## API Integration

### API Client

Located in `lib/api/client.ts`:

```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiClient<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}
```

### API Functions

Located in `lib/api/`:

```tsx
// lib/api/meta.ts
export async function fetchMetaData(format: string) {
  return apiClient<MetaResponse>(`/api/meta/format/${format}`)
}

// lib/api/decks.ts
export async function fetchDecklists(filters: DeckFilters) {
  const params = new URLSearchParams(filters)
  return apiClient<DecklistResponse>(`/api/decklists?${params}`)
}
```

### Server-Side Data Fetching

```tsx
// app/(pages)/decks/page.tsx
export default async function DecksPage() {
  const decks = await fetchDecklists({ format: "Constructed" })

  return <DeckList decks={decks} />
}
```

### Client-Side Data Fetching

```tsx
"use client"

import { useEffect, useState } from "react"

export function DeckSearch() {
  const [results, setResults] = useState([])

  useEffect(() => {
    fetchDecklists(filters).then(setResults)
  }, [filters])

  return <SearchResults results={results} />
}
```

## Building for Production

### Build

```bash
npm run build
```

This creates an optimized production build with:
- Minified JavaScript and CSS
- Optimized images
- Server-side rendering
- Static page generation where possible

### Analyze Bundle

```bash
npm run build
# Bundle analyzer runs automatically
```

### Test Production Build Locally

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Connect Repository**:
   - Push code to GitHub
   - Import project in Vercel dashboard
   - Vercel auto-detects Next.js

2. **Configure Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/prod/api
   ```

3. **Deploy**:
   ```bash
   # Via CLI
   vercel --prod

   # Or commit to main branch for auto-deployment
   git push origin main
   ```

### Deploy to Vercel via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Alternative: Deploy to AWS (Amplify/S3+CloudFront)

See [DEPLOYMENT.md](../DEPLOYMENT.md) for AWS deployment instructions.

## Environment Variables

Create `.env.local`:

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Optional
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# For development only
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### Environment-Specific Variables

- `.env.local` - Local development (gitignored)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env` - Default values

## Performance Optimization

### Image Optimization

Use Next.js Image component:

```tsx
import Image from "next/image"

<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={400}
  height={300}
  priority // For above-the-fold images
/>
```

### Code Splitting

Automatic with Next.js App Router:

```tsx
// Dynamic import for heavy components
import dynamic from "next/dynamic"

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <LoadingSkeleton />,
  ssr: false // Disable SSR for this component
})
```

### Caching

Configure in `next.config.ts`:

```ts
export default {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "s-maxage=60, stale-while-revalidate" }
        ]
      }
    ]
  }
}
```

### Fonts

Optimized font loading:

```tsx
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
npm run test
```

Example test:

```tsx
import { render, screen } from "@testing-library/react"
import { DeckCard } from "@/components/features/decks/DeckCard"

describe("DeckCard", () => {
  it("renders deck name", () => {
    const deck = { name: "Test Deck", hero: "Lorraine" }
    render(<DeckCard deck={deck} />)
    expect(screen.getByText("Test Deck")).toBeInTheDocument()
  })
})
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Example test:

```ts
import { test, expect } from "@playwright/test"

test("should display meta dashboard", async ({ page }) => {
  await page.goto("/meta")
  await expect(page.getByRole("heading", { name: "Meta Dashboard" })).toBeVisible()
})
```

## Troubleshooting

### Common Issues

**"Cannot find module" errors**:
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
```

**API calls failing**:
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is running
- Check browser console for CORS errors

**Build fails**:
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

**Slow development server**:
- Reduce number of open browser tabs
- Disable unnecessary browser extensions
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run dev`

**Dark mode not working**:
- Ensure `ThemeProvider` is wrapping app
- Check `next-themes` configuration
- Clear browser cache

### Debug Mode

Enable verbose logging:

```bash
DEBUG=* npm run dev
```

### Performance Profiling

Use React DevTools Profiler:
1. Install React DevTools browser extension
2. Open DevTools > Profiler
3. Record interaction
4. Analyze component render times

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)

## Support

For frontend-specific issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Test API endpoints directly
4. Open an issue with reproduction steps

---

**Questions?** See the main [README.md](../README.md) or open an issue.
