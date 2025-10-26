'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DecklistCard } from './DecklistCard';
import { Decklist, Champion } from '@/types';

interface DecklistBrowserProps {
  decklists: Decklist[];
  champions: Champion[];
}

export function DecklistBrowser({ decklists, champions }: DecklistBrowserProps) {
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [championFilter, setChampionFilter] = useState<string>('all');
  const [placementFilter, setPlacementFilter] = useState<string>('all');

  const filteredDecklists = decklists.filter((decklist) => {
    if (formatFilter !== 'all' && decklist.format !== formatFilter) return false;
    if (championFilter !== 'all' && decklist.championSlug !== championFilter) return false;
    if (placementFilter !== 'all') {
      const maxPlacement = parseInt(placementFilter);
      if (decklist.placement > maxPlacement) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Format:</label>
          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="limited">Limited</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
          <label className="text-sm font-medium">Placement:</label>
          <Select value={placementFilter} onValueChange={setPlacementFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All placements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Placements</SelectItem>
              <SelectItem value="1">1st Place Only</SelectItem>
              <SelectItem value="4">Top 4</SelectItem>
              <SelectItem value="8">Top 8</SelectItem>
              <SelectItem value="16">Top 16</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredDecklists.length} of {decklists.length} decklists
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDecklists.map((decklist) => (
          <DecklistCard key={decklist.id} decklist={decklist} />
        ))}
      </div>

      {filteredDecklists.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No decklists found matching the current filters
        </div>
      )}
    </div>
  );
}
