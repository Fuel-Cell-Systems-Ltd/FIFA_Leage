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

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

function readData() {
  if (!existsSync(DATA_FILE)) {
    const initialData = {
      players: [],
      matches: [],
      teams: []
    };
    writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/players', (req, res) => {
  const data = readData();
  res.json(data.players);
});

app.post('/api/players', (req, res) => {
  const data = readData();
  const newPlayer = {
    id: Date.now().toString(),
    name: req.body.name,
    team_id: req.body.team_id,
    created_at: new Date().toISOString()
  };
  data.players.push(newPlayer);
  writeData(data);
  res.json(newPlayer);
});

app.get('/api/teams', (req, res) => {
  const data = readData();
  res.json(data.teams);
});

app.post('/api/teams', (req, res) => {
  const data = readData();
  const newTeam = {
    id: Date.now().toString(),
    name: req.body.name,
    created_at: new Date().toISOString()
  };
  data.teams.push(newTeam);
  writeData(data);
  res.json(newTeam);
});

app.get('/api/matches', (req, res) => {
  const data = readData();
  res.json(data.matches);
});

app.post('/api/matches', (req, res) => {
  const data = readData();
  const newMatch = {
    id: Date.now().toString(),
    player1_id: req.body.player1_id,
    player2_id: req.body.player2_id,
    player1_score: req.body.player1_score,
    player2_score: req.body.player2_score,
    match_date: req.body.match_date || new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  data.matches.push(newMatch);
  writeData(data);
  res.json(newMatch);
});

app.put('/api/matches/:id', (req, res) => {
  const data = readData();
  const matchIndex = data.matches.findIndex(m => m.id === req.params.id);

  if (matchIndex === -1) {
    return res.status(404).json({ error: 'Match not found' });
  }

  const existing = data.matches[matchIndex];
  const updatedMatch = {
    ...existing,
    player1_id: req.body.player1_id ?? existing.player1_id,
    player2_id: req.body.player2_id ?? existing.player2_id,
    player1_score: req.body.player1_score ?? existing.player1_score,
    player2_score: req.body.player2_score ?? existing.player2_score,
    match_date: req.body.match_date ?? existing.match_date,
    updated_at: new Date().toISOString()
  };

  data.matches[matchIndex] = updatedMatch;
  writeData(data);
  res.json(updatedMatch);
});

app.post('/api/reset', (req, res) => {
  const data = readData();
  data.matches = [];
  writeData(data);
  res.json({ success: true });
});

app.get('/api/standings', (req, res) => {
  const data = readData();
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

  data.matches.forEach(match => {
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
