import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = join(__dirname, 'data.json');
const MATCHES_FILE = join(__dirname, 'matches.json');

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

function ensureDataFile() {
  if (!existsSync(DATA_FILE)) {
    const initialData = {
      players: [],
      teams: []
    };
    writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readCoreData() {
  ensureDataFile();
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

  // migrate old matches from data.json into matches.json to keep files separate
  if (Array.isArray(data.matches) && data.matches.length) {
    writeMatches(data.matches);
    delete data.matches;
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }

  return {
    players: data.players || [],
    teams: data.teams || []
  };
}

function writeCoreData(partial) {
  ensureDataFile();
  const existing = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  const updated = {
    players: partial.players ?? existing.players ?? [],
    teams: partial.teams ?? existing.teams ?? []
  };
  writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
}

function readMatches() {
  if (!existsSync(MATCHES_FILE)) {
    writeMatches([]);
  }
  return JSON.parse(readFileSync(MATCHES_FILE, 'utf8'));
}

function writeMatches(matches) {
  writeFileSync(MATCHES_FILE, JSON.stringify(matches, null, 2));
}

app.get('/api/players', (req, res) => {
  const data = readCoreData();
  res.json(data.players || []);
});

app.post('/api/players', (req, res) => {
  const data = readCoreData();
  const newPlayer = {
    id: Date.now().toString(),
    name: req.body.name,
    team_id: req.body.team_id,
    created_at: new Date().toISOString()
  };
  data.players.push(newPlayer);
  writeCoreData(data);
  res.json(newPlayer);
});

app.put('/api/players/:id', (req, res) => {
  const data = readCoreData();
  const idx = data.players.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Player not found' });

  const existing = data.players[idx];
  const updated = {
    ...existing,
    name: req.body.name ?? existing.name,
    team_id: req.body.team_id ?? existing.team_id,
    updated_at: new Date().toISOString()
  };
  data.players[idx] = updated;
  writeCoreData(data);
  res.json(updated);
});

app.delete('/api/players/:id', (req, res) => {
  const data = readCoreData();
  const playerId = req.params.id;
  const before = data.players.length;
  data.players = data.players.filter(p => p.id !== playerId);
  if (data.players.length === before) {
    return res.status(404).json({ error: 'Player not found' });
  }
  writeCoreData(data);

  // Remove matches involving this player from matches file
  const matches = readMatches().filter(
    m => m.player1_id !== playerId && m.player2_id !== playerId
  );
  writeMatches(matches);

  res.json({ success: true });
});

app.get('/api/teams', (req, res) => {
  const data = readCoreData();
  res.json(data.teams || []);
});

app.post('/api/teams', (req, res) => {
  const data = readCoreData();
  const newTeam = {
    id: Date.now().toString(),
    name: req.body.name,
    created_at: new Date().toISOString()
  };
  data.teams.push(newTeam);
  writeCoreData(data);
  res.json(newTeam);
});

app.put('/api/teams/:id', (req, res) => {
  const data = readCoreData();
  const idx = data.teams.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Team not found' });
  const existing = data.teams[idx];
  const updated = {
    ...existing,
    name: req.body.name ?? existing.name,
    updated_at: new Date().toISOString()
  };
  data.teams[idx] = updated;
  writeCoreData(data);
  res.json(updated);
});

app.delete('/api/teams/:id', (req, res) => {
  const data = readCoreData();
  const teamId = req.params.id;
  const before = data.teams.length;
  data.teams = data.teams.filter(t => t.id !== teamId);
  if (data.teams.length === before) {
    return res.status(404).json({ error: 'Team not found' });
  }
  // Clear team assignment for players on this team
  data.players = data.players.map(p =>
    p.team_id === teamId ? { ...p, team_id: null } : p
  );
  writeCoreData(data);
  res.json({ success: true });
});

app.get('/api/matches', (req, res) => {
  const matches = readMatches();
  res.json(matches);
});

app.post('/api/matches', (req, res) => {
  const matches = readMatches();
  const newMatch = {
    id: Date.now().toString(),
    player1_id: req.body.player1_id,
    player2_id: req.body.player2_id,
    player1_score: req.body.player1_score,
    player2_score: req.body.player2_score,
    match_date: req.body.match_date || new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  matches.push(newMatch);
  writeMatches(matches);
  res.json(newMatch);
});

app.put('/api/matches/:id', (req, res) => {
  const matches = readMatches();
  const matchIndex = matches.findIndex(m => m.id === req.params.id);

  if (matchIndex === -1) {
    return res.status(404).json({ error: 'Match not found' });
  }

  const existing = matches[matchIndex];
  const updatedMatch = {
    ...existing,
    player1_id: req.body.player1_id ?? existing.player1_id,
    player2_id: req.body.player2_id ?? existing.player2_id,
    player1_score: req.body.player1_score ?? existing.player1_score,
    player2_score: req.body.player2_score ?? existing.player2_score,
    match_date: req.body.match_date ?? existing.match_date,
    updated_at: new Date().toISOString()
  };

  matches[matchIndex] = updatedMatch;
  writeMatches(matches);
  res.json(updatedMatch);
});

app.post('/api/reset', (req, res) => {
  writeMatches([]);
  res.json({ success: true });
});

app.get('/api/standings', (req, res) => {
  const data = readCoreData();
  const matches = readMatches();
  const standings = {};

  data.players.forEach(player => {
    standings[player.id] = {
      player_id: player.id,
      player_name: player.name,
      team_id: player.team_id,
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0
    };
  });

  matches.forEach(match => {
    const p1 = standings[match.player1_id];
    const p2 = standings[match.player2_id];

    if (p1 && p2) {
      p1.matches_played++;
      p2.matches_played++;
      p1.goals_for += match.player1_score;
      p1.goals_against += match.player2_score;
      p2.goals_for += match.player2_score;
      p2.goals_against += match.player1_score;

      if (match.player1_score > match.player2_score) {
        p1.wins++;
        p1.points += 3;
        p2.losses++;
      } else if (match.player2_score > match.player1_score) {
        p2.wins++;
        p2.points += 3;
        p1.losses++;
      } else {
        p1.draws++;
        p2.draws++;
        p1.points += 1;
        p2.points += 1;
      }

      p1.goal_difference = p1.goals_for - p1.goals_against;
      p2.goal_difference = p2.goals_for - p2.goals_against;
    }
  });

  const standingsArray = Object.values(standings)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });

  res.json(standingsArray);
});

// Fallback to SPA entrypoint for any non-API route
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
