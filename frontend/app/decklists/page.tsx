'use client';

import { useEffect, useState } from 'react';
import { DecklistBrowser } from '@/components/decklists/DecklistBrowser';
import { FilterBar } from '@/components/shared/FilterBar';
import { getDecklists, getChampions } from '@/lib/api';
import { Decklist, Champion, Format, TimeRange } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DecklistsPage() {
  const [decklists, setDecklists] = useState<Decklist[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
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

        const [decklistsResponse, championsResponse] = await Promise.all([
          getDecklists(filters),
          getChampions(),
        ]);

        setDecklists(decklistsResponse);
        setChampions(championsResponse);
      } catch (err) {
        setError('Failed to load decklists. Please try again later.');
        console.error('Decklists error:', err);
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
        <h1 className="text-4xl font-bold tracking-tight">Decklists</h1>
        <p className="text-muted-foreground">
          Browse tournament-winning decklists from competitive events
        </p>
      </div>

      <FilterBar
        format={format}
        timeRange={timeRange}
        onFormatChange={setFormat}
        onTimeRangeChange={setTimeRange}
      />

      <DecklistBrowser decklists={decklists} champions={champions} />
    </div>
  );
}
