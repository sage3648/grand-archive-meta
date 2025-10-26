# Frontend Setup Guide

Complete setup instructions for the Grand Archive Meta frontend application.

## Overview

This is a production-ready Next.js 15 frontend built with:
- **Framework**: Next.js 15.2.2 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.7.2
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui (Radix UI)
- **Charts**: Recharts 2.15.4
- **Icons**: Lucide React 0.479.0

## Complete File Structure

```
frontend/
├── app/                                    # Next.js App Router
│   ├── layout.tsx                         # Root layout with header/footer
│   ├── page.tsx                           # Dashboard (home page)
│   ├── globals.css                        # Global styles & CSS variables
│   ├── champions/
│   │   ├── page.tsx                       # Champions list page
│   │   └── [slug]/
│   │       └── page.tsx                   # Champion detail page
│   ├── decklists/
│   │   └── page.tsx                       # Decklists browser page
│   ├── meta/
│   │   └── page.tsx                       # Meta analysis page
│   └── cards/
│       └── page.tsx                       # Card performance page
│
├── components/
│   ├── ui/                                # shadcn/ui base components
│   │   ├── button.tsx                     # Button component
│   │   ├── card.tsx                       # Card component
│   │   ├── badge.tsx                      # Badge component
│   │   ├── select.tsx                     # Select dropdown
│   │   ├── tabs.tsx                       # Tabs component
│   │   └── table.tsx                      # Table component
│   │
│   ├── dashboard/                         # Dashboard components
│   │   ├── MetaBreakdown.tsx             # Pie chart meta breakdown
│   │   ├── ChampionPopularity.tsx        # Bar chart popularity
│   │   └── RecentDecklists.tsx           # Recent results list
│   │
│   ├── champions/
│   │   └── ChampionGrid.tsx              # Champions grid view
│   │
│   ├── decklists/
│   │   ├── DecklistBrowser.tsx           # Decklist browser with filters
│   │   └── DecklistCard.tsx              # Individual decklist card
│   │
│   └── shared/                            # Shared components
│       ├── Header.tsx                     # Site header with navigation
│       ├── Footer.tsx                     # Site footer
│       └── FilterBar.tsx                  # Format & time range filters
│
├── lib/
│   ├── api.ts                             # API client functions
│   └── utils.ts                           # Utility functions
│
├── types/
│   └── index.ts                           # TypeScript type definitions
│
├── package.json                           # Dependencies
├── tsconfig.json                          # TypeScript config
├── tailwind.config.ts                     # Tailwind config
├── next.config.ts                         # Next.js config
├── postcss.config.mjs                     # PostCSS config
├── components.json                        # shadcn/ui config
├── .eslintrc.json                         # ESLint config
├── .gitignore                             # Git ignore rules
├── .env.local.example                     # Environment variable template
├── README.md                              # Main documentation
├── QUICKSTART.md                          # Quick start guide
└── SETUP.md                               # This file
```

## Installation Steps

### 1. Prerequisites

Ensure you have:
- Node.js 18.x or higher
- npm, yarn, or pnpm
- Git (optional)

### 2. Navigate to Directory

```bash
cd /Users/sage/Programming/grand-archive-meta/frontend
```

### 3. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 15.2.2 and React 19
- TypeScript and type definitions
- Tailwind CSS and plugins
- Radix UI components
- Recharts for data visualization
- Lucide React for icons
- Utility libraries (clsx, tailwind-merge, etc.)

### 4. Configure Environment

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your settings:

```env
# Required: Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Required: Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Site name
NEXT_PUBLIC_SITE_NAME=Grand Archive Meta

# Optional: Analytics (if using)
# NEXT_PUBLIC_GA_ID=
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Page Routes

Once running, you can access:

- `/` - Dashboard with meta overview
- `/champions` - Champion statistics and rankings
- `/champions/[slug]` - Individual champion detail pages
- `/decklists` - Tournament decklist browser
- `/meta` - Comprehensive meta analysis
- `/cards` - Card performance statistics

## Component Architecture

### UI Components (shadcn/ui)

Base components in `components/ui/`:
- Built on Radix UI primitives
- Fully accessible (ARIA compliant)
- Customizable with Tailwind CSS
- Type-safe with TypeScript

### Feature Components

Domain-specific components organized by feature:
- **Dashboard**: Meta visualization components
- **Champions**: Champion-related components
- **Decklists**: Decklist browsing and display
- **Shared**: Reusable components across features

### Layout Components

Global layout components:
- **Header**: Navigation and site branding
- **Footer**: Site information and links
- **FilterBar**: Common filtering controls

## API Integration

All API calls are centralized in `lib/api.ts`:

```typescript
// Import API functions
import {
  getChampions,
  getMetaBreakdown,
  getDecklists
} from '@/lib/api';

// Use in components
const champions = await getChampions();
const meta = await getMetaBreakdown({ format: 'standard' });
const decks = await getDecklists({ championSlug: 'lorraine' });
```

API functions automatically:
- Handle errors gracefully
- Parse JSON responses
- Build query strings from filter objects
- Use configured base URL from environment

## TypeScript Types

All types are defined in `types/index.ts`:

### Core Types
- `Champion`, `ChampionStats`
- `Event`, `Decklist`, `DeckCard`
- `MetaBreakdown`, `ElementBreakdown`
- `CardPerformance`

### Filter Types
- `MetaFilters`
- `DecklistFilters`
- `CardFilters`

### Utility Types
- `Format`: 'standard' | 'limited' | 'all'
- `TimeRange`: '7' | '30' | '90' | 'all'
- `Element`: Element types
- `TournamentType`: Tournament categories

## Styling System

### Tailwind CSS

Custom configuration in `tailwind.config.ts`:
- CSS variable-based theming
- Dark mode support (class-based)
- Custom color palette
- Extended utilities

### CSS Variables

Theme colors defined in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more variables */
}

.dark {
  /* Dark mode overrides */
}
```

### Utility Functions

Helper functions in `lib/utils.ts`:
- `cn()` - Class name merger
- `formatPercentage()` - Format numbers as percentages
- `formatDate()` - Format dates
- `getElementColor()` - Get element-specific colors
- `getWinRateColor()` - Get win rate color coding
- `getTierFromWinRate()` - Calculate tier ranking

## Building for Production

### Build

```bash
npm run build
```

Creates optimized production build:
- Minified JavaScript and CSS
- Optimized images
- Server-side rendered pages
- Static generation where possible

### Test Production Build

```bash
npm run build
npm start
```

### Analyze Bundle (Optional)

Add to `package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Make Changes

- Edit components in `components/`
- Edit pages in `app/`
- Edit styles in `app/globals.css` or with Tailwind classes
- Edit API client in `lib/api.ts`

### 3. Type Checking

```bash
npx tsc --noEmit
```

### 4. Linting

```bash
npm run lint
```

### 5. Test Build

```bash
npm run build
```

## Adding New Features

### Add a New Page

1. Create file in `app/`:

```tsx
// app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page Content</div>
}
```

2. Add navigation link in `components/shared/Header.tsx`

### Add a New Component

1. Create in appropriate directory:

```tsx
// components/features/my-component.tsx
export function MyComponent() {
  return <div>Component</div>
}
```

2. Import and use in pages

### Add shadcn/ui Component

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### Add API Endpoint

Add to `lib/api.ts`:

```typescript
export async function getMyData(filters?: MyFilters): Promise<MyData[]> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi<MyData[]>(`/my-endpoint${queryString}`);
}
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel dashboard
3. Configure environment variables
4. Deploy

### Manual

1. Build: `npm run build`
2. Copy files to server: `.next/`, `public/`, `package.json`
3. Install production dependencies: `npm install --production`
4. Start: `npm start`

## Environment Variables

### Development (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production

Set in deployment platform:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Troubleshooting

### Dependencies Won't Install

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

Check TypeScript:
```bash
npx tsc --noEmit
```

Check linting:
```bash
npm run lint
```

### API Calls Failing

1. Verify `NEXT_PUBLIC_API_URL` is set
2. Check backend is running
3. Check browser console for CORS errors
4. Verify API endpoint URLs in `lib/api.ts`

### Styles Not Loading

1. Check Tailwind config
2. Verify `globals.css` is imported in layout
3. Clear `.next` folder: `rm -rf .next`
4. Restart dev server

### Type Errors

1. Check all imports
2. Verify types in `types/index.ts`
3. Run `npx tsc --noEmit` for details

## Performance Optimization

### Server Components (Default)

Most components are Server Components for better performance:
- Faster initial page load
- Reduced JavaScript bundle
- Better SEO

### Client Components

Use `'use client'` only when needed:
- Interactive components (useState, useEffect)
- Event handlers
- Browser APIs

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
/>
```

### Code Splitting

Automatically handled by Next.js App Router.

For dynamic imports:

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

## Additional Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/docs/primitives)
- [Recharts Documentation](https://recharts.org/en-US)

## Support

For issues:
1. Check browser console
2. Check terminal output
3. Verify environment variables
4. Review API responses
5. Check types and imports

## Summary

You now have a complete, production-ready Next.js 15 frontend with:
- Full TypeScript support
- Responsive design
- Modern UI components
- Chart visualizations
- API integration
- Optimized performance

Start the dev server and begin building!

```bash
npm run dev
```
