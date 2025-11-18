/**
 * API Gateway를 통한 백엔드 API 호출 유틸리티
 */

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY || 'http://localhost:9000';
const SOCCER_API = process.env.NEXT_PUBLIC_SOCCER_API || '/api/soccer';
const USER_API = process.env.NEXT_PUBLIC_USER_API || '/api/user';
const COMMON_API = process.env.NEXT_PUBLIC_COMMON_API || '/api/common';

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Soccer Service API
 */
export const soccerApi = {
  // Get all players
  getPlayers: (name?: string, position?: string) => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (position) params.append('position', position);
    const query = params.toString();
    return apiFetch(`${API_GATEWAY}${SOCCER_API}/players${query ? `?${query}` : ''}`);
  },

  // Get player by ID
  getPlayer: (id: number) =>
    apiFetch(`${API_GATEWAY}${SOCCER_API}/players/${id}`),

  // Create player
  createPlayer: (data: Record<string, unknown>) =>
    apiFetch(`${API_GATEWAY}${SOCCER_API}/players`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update player
  updatePlayer: (id: number, data: Record<string, unknown>) =>
    apiFetch(`${API_GATEWAY}${SOCCER_API}/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete player
  deletePlayer: (id: number) =>
    apiFetch(`${API_GATEWAY}${SOCCER_API}/players/${id}`, {
      method: 'DELETE',
    }),

  // Get all teams
  getTeams: (name?: string, region?: string) => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (region) params.append('region', region);
    const query = params.toString();
    return apiFetch(`${API_GATEWAY}${SOCCER_API}/teams${query ? `?${query}` : ''}`);
  },

  // Get team by ID
  getTeam: (id: number) =>
    apiFetch(`${API_GATEWAY}${SOCCER_API}/teams/${id}`),

  // Get all stadiums
  getStadiums: (name?: string, homeTeamUk?: string) => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (homeTeamUk) params.append('homeTeamUk', homeTeamUk);
    const query = params.toString();
    return apiFetch(`${API_GATEWAY}${SOCCER_API}/stadiums${query ? `?${query}` : ''}`);
  },

  // Get all schedules
  getSchedules: (date?: string, teamUk?: string, gubun?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (teamUk) params.append('teamUk', teamUk);
    if (gubun) params.append('gubun', gubun);
    const query = params.toString();
    return apiFetch(`${API_GATEWAY}${SOCCER_API}/schedules${query ? `?${query}` : ''}`);
  },

  // Get schedule by ID
  getSchedule: (id: number) =>
    apiFetch(`${API_GATEWAY}${SOCCER_API}/schedules/${id}`),
};

/**
 * User Service API
 */
export const userApi = {
  // Get user profile
  getProfile: () =>
    apiFetch(`${API_GATEWAY}${USER_API}/profile`),

  // Update user profile
  updateProfile: (data: Record<string, unknown>) =>
    apiFetch(`${API_GATEWAY}${USER_API}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

/**
 * Common Service API
 */
export const commonApi = {
  // Health check
  healthCheck: () =>
    apiFetch(`${API_GATEWAY}${COMMON_API}/health`),
};

// Named export instead of anonymous default export
const apiClient = {
  soccer: soccerApi,
  user: userApi,
  common: commonApi,
};

export default apiClient;

