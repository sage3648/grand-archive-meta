'use client';

import { useEffect, useState } from 'react';
import { MetaBreakdown } from '@/components/dashboard/MetaBreakdown';
import { ChampionPopularity } from '@/components/dashboard/ChampionPopularity';
import { RecentDecklists } from '@/components/dashboard/RecentDecklists';
import { FilterBar } from '@/components/shared/FilterBar';
import { getMetaBreakdown, getDecklists } from '@/lib/api';
import { MetaBreakdown as MetaBreakdownType, Decklist, Format, TimeRange } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [metaData, setMetaData] = useState<MetaBreakdownType[]>([]);
  const [decklists, setDecklists] = useState<Decklist[]>([]);
  const [format, setFormat] = useState<Format>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const filters = {
          format: format !== 'all' ? format : undefined,
          startDate: getStartDate(timeRange),
        };

        const [metaResponse, decklistsResponse] = await Promise.all([
          getMetaBreakdown(filters),
          getDecklists({ ...filters, minPlacement: 1, maxPlacement: 8 }),
        ]);

        setMetaData(metaResponse);
        setDecklists(decklistsResponse.slice(0, 10));
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [format, timeRange]);

  function getStartDate(range: TimeRange): string | undefined {
    if (range === 'all') return undefined;
    const days = parseInt(range);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the current Grand Archive competitive meta
        </p>
      </div>

      <FilterBar
        format={format}
        timeRange={timeRange}
        onFormatChange={setFormat}
        onTimeRangeChange={setTimeRange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetaBreakdown data={metaData} />
        <RecentDecklists decklists={decklists} />
      </div>

      <ChampionPopularity data={metaData} />
    </div>
  );
}
