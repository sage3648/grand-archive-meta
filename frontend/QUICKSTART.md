# Quick Start Guide

Get the Grand Archive Meta frontend up and running in minutes.

## Prerequisites

- Node.js 18+ installed
- Backend API running (or API endpoint configured)

## Installation

1. **Navigate to the frontend directory**:

```bash
cd frontend
```

2. **Install dependencies**:

```bash
npm install
```

3. **Configure environment**:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Run the development server**:

```bash
npm run dev
```

5. **Open your browser**:

Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Overview

The application consists of five main pages:

1. **Dashboard** (`/`) - Meta overview and recent results
2. **Champions** (`/champions`) - Champion statistics and rankings
3. **Decklists** (`/decklists`) - Tournament decklist browser
4. **Meta Analysis** (`/meta`) - Detailed meta breakdown and tier lists
5. **Card Performance** (`/cards`) - Card usage and performance stats

## Key Features

- Real-time meta analysis with filtering
- Champion performance tracking
- Tournament decklist browsing
- Card usage statistics
- Responsive design for all devices
- Dark mode support (via theme customization)

## Development Tips

### Adding shadcn/ui Components

The project uses shadcn/ui for components. To add more:

```bash
npx shadcn@latest add [component-name]
```

### Project Structure

```
app/              # Next.js pages (App Router)
components/       # React components
  ├── ui/         # shadcn/ui components
  ├── dashboard/  # Dashboard components
  ├── champions/  # Champion components
  ├── decklists/  # Decklist components
  └── shared/     # Shared components
lib/              # Utilities and API client
types/            # TypeScript types
```

### API Integration

All API calls are in `lib/api.ts`. Example:

```typescript
import { getChampions, getMetaBreakdown } from '@/lib/api';

// In your component
const champions = await getChampions();
const meta = await getMetaBreakdown({ format: 'standard' });
```

## Building for Production

```bash
npm run build
npm start
```

The build will be optimized for production with:
- Minified JavaScript
- Optimized images
- Server-side rendering
- Static generation where possible

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
# Upload .next/, public/, package.json to your server
npm start
```

## Troubleshooting

**API calls failing?**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running
- Check browser console for errors

**Dependencies not installing?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Build errors?**
- Run `npm run lint` to check for issues
- Check TypeScript errors with `npx tsc --noEmit`

## Next Steps

1. Customize the theme in `app/globals.css`
2. Add your own components in `components/`
3. Extend the API client in `lib/api.ts`
4. Add more pages as needed

## Support

For issues or questions, please refer to the main [README.md](./README.md) or check the backend API documentation.
