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
import { getCardPerformance, getChampions } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardPerformance, Champion, Format, TimeRange } from '@/types';
import { formatPercentage, getElementColor } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function CardsPage() {
  const [cards, setCards] = useState<CardPerformance[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [format, setFormat] = useState<Format>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [championFilter, setChampionFilter] = useState<string>('all');
  const [cardTypeFilter, setCardTypeFilter] = useState<string>('all');
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
          championSlug: championFilter !== 'all' ? championFilter : undefined,
          cardType: cardTypeFilter !== 'all' ? cardTypeFilter : undefined,
        };

        const [cardsResponse, championsResponse] = await Promise.all([
          getCardPerformance(filters),
          getChampions(),
        ]);

        setCards(cardsResponse);
        setChampions(championsResponse);
      } catch (err) {
        setError('Failed to load card performance data. Please try again later.');
        console.error('Cards error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [format, timeRange, championFilter, cardTypeFilter]);

  function getStartDate(range: TimeRange): string | undefined {
    if (range === 'all') return undefined;
    const days = parseInt(range);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  const cardTypes = ['all', 'Action', 'Attack', 'Item', 'Ally', 'Regalia'];

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
        <h1 className="text-4xl font-bold tracking-tight">Card Performance</h1>
        <p className="text-muted-foreground">
          Analyze card usage and win rates across competitive play
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
          <label className="text-sm font-medium">Champion:</label>
          <Select value={championFilter} onValueChange={setChampionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All champions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Champions</SelectItem>
              {champions.map((champion) => (
                <SelectItem key={champion.slug} value={champion.slug}>
                  {champion.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Card Type:</label>
          <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              {cardTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Cards</CardTitle>
          <CardDescription>
            Cards ranked by inclusion rate and win rate in tournament decks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Element</TableHead>
                <TableHead className="text-right">Inclusion Rate</TableHead>
                <TableHead className="text-right">Avg Copies</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Times Played</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards
                .sort((a, b) => b.inclusionRate - a.inclusionRate)
                .slice(0, 50)
                .map((card) => (
                  <TableRow key={card.cardId}>
                    <TableCell className="font-medium">{card.cardName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{card.cardType || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell>
                      {card.element && (
                        <Badge variant="outline" className={getElementColor(card.element)}>
                          {card.element}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercentage(card.inclusionRate)}
                    </TableCell>
                    <TableCell className="text-right">{card.avgCopies.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {formatPercentage(card.winRate)}
                    </TableCell>
                    <TableCell className="text-right">{card.timesPlayed}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {cards.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No card data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
