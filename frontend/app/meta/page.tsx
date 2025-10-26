'use client';

import { useEffect, useState } from 'react';
import { FilterBar } from '@/components/shared/FilterBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getMetaBreakdown, getElementBreakdown } from '@/lib/api';
import { MetaBreakdown, ElementBreakdown, Format, TimeRange } from '@/types';
import {
  formatPercentage,
  getElementColor,
  getWinRateColor,
  getTierFromWinRate,
} from '@/lib/utils';
import { Loader2, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';

export default function MetaPage() {
  const [metaData, setMetaData] = useState<MetaBreakdown[]>([]);
  const [elementData, setElementData] = useState<ElementBreakdown[]>([]);
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

        const [metaResponse, elementsResponse] = await Promise.all([
          getMetaBreakdown(filters),
          getElementBreakdown(filters),
        ]);

        setMetaData(metaResponse);
        setElementData(elementsResponse);
      } catch (err) {
        setError('Failed to load meta analysis. Please try again later.');
        console.error('Meta error:', err);
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
        <h1 className="text-4xl font-bold tracking-tight">Meta Analysis</h1>
        <p className="text-muted-foreground">
          Comprehensive competitive meta breakdown and tier rankings
        </p>
      </div>

      <FilterBar
        format={format}
        timeRange={timeRange}
        onFormatChange={setFormat}
        onTimeRangeChange={setTimeRange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Champion Performance</CardTitle>
            <CardDescription>Ranked by win rate with play rate context</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Champion</TableHead>
                  <TableHead>Element</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Play Rate</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">Games</TableHead>
                  <TableHead className="text-right">Wins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metaData
                  .sort((a, b) => b.winRate - a.winRate)
                  .map((champion, index) => (
                    <TableRow key={champion.slug}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Link
                          href={`/champions/${champion.slug}`}
                          className="hover:underline font-medium"
                        >
                          {champion.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getElementColor(champion.element)}>
                          {champion.element}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{getTierFromWinRate(champion.winRate)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(champion.playRate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={getWinRateColor(champion.winRate)}>
                          {formatPercentage(champion.winRate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{champion.totalGames}</TableCell>
                      <TableCell className="text-right">{champion.wins}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {metaData.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No meta data available for the selected filters
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Element Breakdown
              </CardTitle>
              <CardDescription>Meta distribution by element</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {elementData
                  .sort((a, b) => b.playRate - a.playRate)
                  .map((element) => (
                    <div key={element.element} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getElementColor(element.element)}>
                          {element.element}
                        </Badge>
                        <span className="font-medium">{formatPercentage(element.playRate)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {element.championCount} champion{element.championCount !== 1 ? 's' : ''} •{' '}
                        <span className={getWinRateColor(element.winRate)}>
                          {formatPercentage(element.winRate)} WR
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tier Rankings
              </CardTitle>
              <CardDescription>Champion tier distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['S', 'A', 'B', 'C', 'D'].map((tier) => {
                  const count = metaData.filter(
                    (c) => getTierFromWinRate(c.winRate) === tier
                  ).length;
                  return (
                    <div key={tier} className="flex items-center justify-between">
                      <Badge>{tier} Tier</Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} champion{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
