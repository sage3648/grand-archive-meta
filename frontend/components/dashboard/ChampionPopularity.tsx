'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetaBreakdown } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChampionPopularityProps {
  data: MetaBreakdown[];
}

export function ChampionPopularity({ data }: ChampionPopularityProps) {
  const chartData = data
    .sort((a, b) => b.playRate - a.playRate)
    .slice(0, 10)
    .map(item => ({
      name: item.name,
      playRate: (item.playRate * 100).toFixed(1),
      winRate: (item.winRate * 100).toFixed(1),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Champion Popularity & Performance</CardTitle>
        <CardDescription>Top 10 champions by play rate with win rates</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="playRate" fill="#3b82f6" name="Play Rate %" />
            <Bar dataKey="winRate" fill="#10b981" name="Win Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
