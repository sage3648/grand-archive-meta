'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Decklist } from '@/types';
import { formatDate, formatPlacement, getElementColor } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface RecentDecklistsProps {
  decklists: Decklist[];
}

export function RecentDecklists({ decklists }: RecentDecklistsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tournament Results</CardTitle>
        <CardDescription>Latest top-performing decklists</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {decklists.map((decklist) => (
            <div
              key={decklist.id}
              className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {decklist.placement <= 3 && (
                    <Trophy
                      className={`h-4 w-4 ${
                        decklist.placement === 1
                          ? 'text-yellow-500'
                          : decklist.placement === 2
                          ? 'text-gray-400'
                          : 'text-amber-600'
                      }`}
                    />
                  )}
                  <Link
                    href={`/decklists/${decklist.id}`}
                    className="font-medium hover:underline"
                  >
                    {decklist.championName}
                  </Link>
                  <Badge variant="outline" className={getElementColor('norm')}>
                    {formatPlacement(decklist.placement)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{decklist.playerName}</span>
                  <span>•</span>
                  <Link
                    href={`/events/${decklist.eventId}`}
                    className="hover:underline"
                  >
                    {decklist.eventName}
                  </Link>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(decklist.eventDate)}
                </div>
              </div>
              <Badge variant="secondary">{decklist.format}</Badge>
            </div>
          ))}
          {decklists.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No recent decklists available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
