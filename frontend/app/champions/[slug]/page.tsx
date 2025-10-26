import { Metadata } from 'next';
import { getChampion, getChampionStats, getChampionDecklists } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DecklistCard } from '@/components/decklists/DecklistCard';
import { formatPercentage, getElementColor, getWinRateColor, getTierFromWinRate } from '@/lib/utils';
import { TrendingUp, Trophy, Target } from 'lucide-react';

interface ChampionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ChampionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const champion = await getChampion(slug);
    return {
      title: `${champion.name} - Champion Stats | Grand Archive Meta`,
      description: `Detailed statistics, decklists, and meta performance for ${champion.name}`,
    };
  } catch {
    return {
      title: 'Champion Not Found | Grand Archive Meta',
    };
  }
}

export default async function ChampionDetailPage({ params }: ChampionDetailPageProps) {
  const { slug } = await params;

  try {
    const [champion, stats, decklists] = await Promise.all([
      getChampion(slug),
      getChampionStats(slug),
      getChampionDecklists(slug, { minPlacement: 1, maxPlacement: 16 }),
    ]);

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{champion.name}</h1>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className={getElementColor(champion.element)}>
                {champion.element}
              </Badge>
              <Badge variant="outline">{champion.className}</Badge>
              <Badge>Tier {getTierFromWinRate(stats.winRate)}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Play Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(stats.playRate)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalGames} total games
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getWinRateColor(stats.winRate)}`}>
                {formatPercentage(stats.winRate)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.wins}W - {stats.losses}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Tournament Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.top8Count} top 8 finishes
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>Detailed tournament statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">1st Place</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.winCount}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Top 4</div>
                <div className="text-2xl font-bold text-gray-600">{stats.top4Count}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Top 8</div>
                <div className="text-2xl font-bold text-amber-600">{stats.top8Count}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Placement</div>
                <div className="text-2xl font-bold">{stats.avgPlacement.toFixed(1)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="decklists" className="w-full">
          <TabsList>
            <TabsTrigger value="decklists">Recent Decklists</TabsTrigger>
            <TabsTrigger value="matchups">Matchups</TabsTrigger>
          </TabsList>
          <TabsContent value="decklists" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decklists.slice(0, 12).map((decklist) => (
                <DecklistCard key={decklist.id} decklist={decklist} />
              ))}
            </div>
            {decklists.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    No recent decklists available
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="matchups">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Matchup data coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Champion not found or failed to load data
          </div>
        </CardContent>
      </Card>
    );
  }
}
