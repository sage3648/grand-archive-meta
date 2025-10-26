'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Decklist } from '@/types';
import { formatDate, formatPlacement, getElementColor } from '@/lib/utils';
import { Trophy, User, Calendar } from 'lucide-react';

interface DecklistCardProps {
  decklist: Decklist;
}

export function DecklistCard({ decklist }: DecklistCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {decklist.placement <= 3 && (
                <Trophy
                  className={`h-5 w-5 ${
                    decklist.placement === 1
                      ? 'text-yellow-500'
                      : decklist.placement === 2
                      ? 'text-gray-400'
                      : 'text-amber-600'
                  }`}
                />
              )}
              <Link
                href={`/champions/${decklist.championSlug}`}
                className="hover:underline"
              >
                {decklist.championName}
              </Link>
            </CardTitle>
          </div>
          <Badge className="ml-2">{formatPlacement(decklist.placement)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{decklist.playerName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <Link href={`/events/${decklist.eventId}`} className="hover:underline">
            {decklist.eventName}
          </Link>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(decklist.eventDate)}
        </div>
        <div className="flex gap-2 pt-2">
          <Badge variant="secondary">{decklist.format}</Badge>
          <Badge variant="outline">
            {decklist.mainDeck.length} cards
          </Badge>
        </div>
        <Link
          href={`/decklists/${decklist.id}`}
          className="block w-full mt-3 text-center text-sm text-primary hover:underline"
        >
          View Decklist
        </Link>
      </CardContent>
    </Card>
  );
}
