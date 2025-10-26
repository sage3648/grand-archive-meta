'use client';

import { useEffect, useState } from 'react';
import { ChampionGrid } from '@/components/champions/ChampionGrid';
import { FilterBar } from '@/components/shared/FilterBar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMetaBreakdown } from '@/lib/api';
import { MetaBreakdown, Format, TimeRange, Element } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ChampionsPage() {
  const [champions, setChampions] = useState<MetaBreakdown[]>([]);
  const [format, setFormat] = useState<Format>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [elementFilter, setElementFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChampions() {
      setLoading(true);
      setError(null);
      try {
        const filters = {
          format: format !== 'all' ? format : undefined,
          startDate: getStartDate(timeRange),
          element: elementFilter !== 'all' ? elementFilter : undefined,
        };

        const data = await getMetaBreakdown(filters);
        setChampions(data);
      } catch (err) {
        setError('Failed to load champions. Please try again later.');
        console.error('Champions error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChampions();
  }, [format, timeRange, elementFilter]);

  function getStartDate(range: TimeRange): string | undefined {
    if (range === 'all') return undefined;
    const days = parseInt(range);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  const elements: string[] = ['all', 'fire', 'water', 'wind', 'earth', 'lightning', 'darkness', 'light', 'arcane', 'norm'];

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
        <h1 className="text-4xl font-bold tracking-tight">Champions</h1>
        <p className="text-muted-foreground">
          Explore champion statistics and performance data
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <FilterBar
          format={format}
          timeRange={timeRange}
          onFormatChange={setFormat}
          onTimeRangeChange={setTimeRange}
        />

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Element:</label>
          <Select value={elementFilter} onValueChange={setElementFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All elements" />
            </SelectTrigger>
            <SelectContent>
              {elements.map((element) => (
                <SelectItem key={element} value={element}>
                  {element.charAt(0).toUpperCase() + element.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {champions.length} champion{champions.length !== 1 ? 's' : ''}
      </div>

      <ChampionGrid champions={champions} />
    </div>
  );
}
