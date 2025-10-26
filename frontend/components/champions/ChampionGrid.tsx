'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetaBreakdown } from '@/types';
import { formatPercentage, getElementColor, getWinRateColor, getTierFromWinRate } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChampionGridProps {
  champions: MetaBreakdown[];
}

export function ChampionGrid({ champions }: ChampionGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {champions.map((champion) => (
        <Link key={champion.slug} href={`/champions/${champion.slug}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{champion.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className={getElementColor(champion.element)}>
                      {champion.element}
                    </Badge>
                    <Badge variant="outline">{champion.className}</Badge>
                  </div>
                </div>
                <Badge className="ml-2">
                  Tier {getTierFromWinRate(champion.winRate)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Play Rate</span>
                <span className="font-semibold">{formatPercentage(champion.playRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <div className="flex items-center gap-1">
                  <span className={`font-semibold ${getWinRateColor(champion.winRate)}`}>
                    {formatPercentage(champion.winRate)}
                  </span>
                  {champion.winRate >= 0.50 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Games</span>
                <span className="font-semibold">{champion.totalGames}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-around text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{champion.winCount}</div>
                    <div className="text-muted-foreground">1st</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-600">{champion.top4Count}</div>
                    <div className="text-muted-foreground">Top 4</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-amber-600">{champion.top8Count}</div>
                    <div className="text-muted-foreground">Top 8</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      {champions.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground py-12">
          No champions found matching the current filters
        </div>
      )}
    </div>
  );
}
