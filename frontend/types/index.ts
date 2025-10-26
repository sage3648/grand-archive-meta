// Champion Types
export interface Champion {
  slug: string;
  name: string;
  element: string;
  className: string;
  imageUrl?: string;
  cardId?: string;
}

export interface ChampionStats extends Champion {
  playRate: number;
  winRate: number;
  totalGames: number;
  wins: number;
  losses: number;
  avgPlacement: number;
  top8Count: number;
  top4Count: number;
  winCount: number;
}

// Event Types
export interface Event {
  id: string;
  name: string;
  date: string;
  format: string;
  playerCount: number;
  organizer?: string;
  location?: string;
  tournamentType?: string;
}

// Decklist Types
export interface DeckCard {
  cardId: string;
  name: string;
  quantity: number;
  cardType?: string;
  element?: string;
}

export interface Decklist {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  playerName: string;
  placement: number;
  championSlug: string;
  championName: string;
  format: string;
  mainDeck: DeckCard[];
  sideboard?: DeckCard[];
  materialDeck?: DeckCard[];
}

// Meta Analysis Types
export interface MetaBreakdown {
  slug: string;
  name: string;
  element: string;
  className: string;
  playRate: number;
  winRate: number;
  totalGames: number;
  wins: number;
  losses: number;
  avgPlacement: number;
  top8Count: number;
  top4Count: number;
  winCount: number;
  imageUrl?: string;
  cardId?: string;
}

export interface ElementBreakdown {
  element: string;
  playRate: number;
  winRate: number;
  totalGames: number;
  championCount: number;
}

// Card Performance Types
export interface CardPerformance {
  cardId: string;
  cardName: string;
  element?: string;
  cardType?: string;
  timesPlayed: number;
  avgCopies: number;
  winRate: number;
  inclusionRate: number;
  topDeckCount: number;
}

// Filter Types
export interface MetaFilters {
  format?: string;
  startDate?: string;
  endDate?: string;
  minGames?: number;
  element?: string;
  tournamentType?: string;
}

export interface DecklistFilters {
  format?: string;
  championSlug?: string;
  startDate?: string;
  endDate?: string;
  eventId?: string;
  minPlacement?: number;
  maxPlacement?: number;
  playerName?: string;
}

export interface CardFilters {
  format?: string;
  championSlug?: string;
  cardType?: string;
  element?: string;
  minInclusion?: number;
  startDate?: string;
  endDate?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

// Time Range Type
export type TimeRange = '7' | '30' | '90' | 'all';

// Format Type
export type Format = 'standard' | 'limited' | 'all';

// Element Type
export type Element = 'fire' | 'water' | 'wind' | 'earth' | 'lightning' | 'darkness' | 'light' | 'arcane' | 'norm';

// Tournament Type
export type TournamentType = 'premiere' | 'regional' | 'local' | 'online';
