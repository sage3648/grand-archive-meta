import {
  Champion,
  ChampionStats,
  Event,
  Decklist,
  MetaBreakdown,
  ElementBreakdown,
  CardPerformance,
  MetaFilters,
  DecklistFilters,
  CardFilters,
  ApiResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Champions API
export async function getChampions(): Promise<Champion[]> {
  return fetchApi<Champion[]>('/champions');
}

export async function getChampion(slug: string): Promise<Champion> {
  return fetchApi<Champion>(`/champions/${slug}`);
}

export async function getChampionStats(
  slug: string,
  filters?: MetaFilters
): Promise<ChampionStats> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi<ChampionStats>(`/champions/${slug}/stats${queryString}`);
}

// Events API
export async function getEvents(filters?: {
  format?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<Event[]> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi<Event[]>(`/events${queryString}`);
}

export async function getEvent(id: string): Promise<Event> {
  return fetchApi<Event>(`/events/${id}`);
}

// Decklists API
export async function getDecklists(filters?: DecklistFilters): Promise<Decklist[]> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi<Decklist[]>(`/decklists${queryString}`);
}

export async function getDecklist(id: string): Promise<Decklist> {
  return fetchApi<Decklist>(`/decklists/${id}`);
}

export async function getChampionDecklists(
  slug: string,
  filters?: DecklistFilters
): Promise<Decklist[]> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi<Decklist[]>(`/champions/${slug}/decklists${queryString}`);
}

// Meta Analysis API
export async function getMetaBreakdown(filters?: MetaFilters): Promise<MetaBreakdown[]> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi<MetaBreakdown[]>(`/meta/breakdown${queryString}`);
}

export async function getElementBreakdown(filters?: MetaFilters): Promise<ElementBreakdown[]> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi<ElementBreakdown[]>(`/meta/elements${queryString}`);
}

export async function getMetaTrends(filters?: MetaFilters): Promise<{
  dates: string[];
  champions: Array<{
    championSlug: string;
    championName: string;
    data: number[];
  }>;
}> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi(`/meta/trends${queryString}`);
}

// Card Performance API
export async function getCardPerformance(filters?: CardFilters): Promise<CardPerformance[]> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi<CardPerformance[]>(`/cards/performance${queryString}`);
}

export async function getTopCards(filters?: CardFilters & { limit?: number }): Promise<CardPerformance[]> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi<CardPerformance[]>(`/cards/top${queryString}`);
}

// Matchup Data API (if available)
export async function getMatchups(
  championSlug: string,
  filters?: MetaFilters
): Promise<Array<{
  opponentSlug: string;
  opponentName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
}>> {
  const queryString = filters ? buildQueryString(filters) : '';
  return fetchApi(`/champions/${championSlug}/matchups${queryString}`);
}

// Search API
export async function searchCards(query: string): Promise<Array<{
  cardId: string;
  name: string;
  element?: string;
  cardType?: string;
  imageUrl?: string;
}>> {
  return fetchApi(`/cards/search?q=${encodeURIComponent(query)}`);
}
