const API_URL = '/api';

export async function fetchPlayers() {
  const response = await fetch(`${API_URL}/players`);
  if (!response.ok) throw new Error('Failed to fetch players');
  return response.json();
}

export async function createPlayer(name: string, teamId: string) {
  const response = await fetch(`${API_URL}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, team_id: teamId })
  });
  if (!response.ok) throw new Error('Failed to create player');
  return response.json();
}

export async function fetchTeams() {
  const response = await fetch(`${API_URL}/teams`);
  if (!response.ok) throw new Error('Failed to fetch teams');
  return response.json();
}

export async function createTeam(name: string) {
  const response = await fetch(`${API_URL}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!response.ok) throw new Error('Failed to create team');
  return response.json();
}

export async function fetchMatches() {
  const response = await fetch(`${API_URL}/matches`);
  if (!response.ok) throw new Error('Failed to fetch matches');
  return response.json();
}

export async function createMatch(
  player1Id: string,
  player2Id: string,
  player1Score: number,
  player2Score: number,
  matchDate: string
) {
  const response = await fetch(`${API_URL}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      player1_id: player1Id,
      player2_id: player2Id,
      player1_score: player1Score,
      player2_score: player2Score,
      match_date: matchDate
    })
  });
  if (!response.ok) throw new Error('Failed to create match');
  return response.json();
}

export async function updateMatch(
  id: string,
  player1Id: string,
  player2Id: string,
  player1Score: number,
  player2Score: number,
  matchDate: string
) {
  const response = await fetch(`${API_URL}/matches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      player1_id: player1Id,
      player2_id: player2Id,
      player1_score: player1Score,
      player2_score: player2Score,
      match_date: matchDate
    })
  });
  if (!response.ok) throw new Error('Failed to update match');
  return response.json();
}

export async function fetchStandings() {
  const response = await fetch(`${API_URL}/standings`);
  if (!response.ok) throw new Error('Failed to fetch standings');
  return response.json();
}

export async function resetLeague() {
  const response = await fetch(`${API_URL}/reset`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to reset league');
  return response.json();
}
