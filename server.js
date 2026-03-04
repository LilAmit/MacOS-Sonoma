const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'macos-sonoma-secret-key-2024';
const PORT = process.env.PORT || 3001;

// ─── Database ────────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'macos.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#007AFF',
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'file',
    content TEXT DEFAULT '',
    icon TEXT DEFAULT '📄',
    size TEXT DEFAULT '0 KB',
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    UNIQUE(user_id, path, name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled',
    body TEXT DEFAULT '',
    folder TEXT DEFAULT 'All iCloud',
    pinned INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER,
    content TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// ─── Express ─────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ─── Auth middleware ──────────────────────────────────────────────────────────
const auth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// ─── Auth routes ─────────────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
    const { username, password, display_name } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const colors = ['#007AFF','#FF3B30','#34C759','#FF9500','#AF52DE','#FF2D55','#5AC8FA','#FFCC00'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const hash = bcrypt.hashSync(password, 10);

    try {
        const result = db.prepare(
            'INSERT INTO users (username, display_name, password_hash, avatar_color) VALUES (?, ?, ?, ?)'
        ).run(username.toLowerCase(), display_name || username, hash, color);

        const user = db.prepare('SELECT id, username, display_name, avatar_color, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user });
    } catch (e) {
        if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'Username already taken' });
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username?.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
});

app.get('/api/auth/me', auth, (req, res) => {
    const user = db.prepare('SELECT id, username, display_name, avatar_color, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

// ─── Users (for contacts) ─────────────────────────────────────────────────────
app.get('/api/users', auth, (req, res) => {
    const users = db.prepare('SELECT id, username, display_name, avatar_color FROM users WHERE id != ?').all(req.user.id);
    res.json(users);
});

// ─── Files routes ─────────────────────────────────────────────────────────────
app.get('/api/files', auth, (req, res) => {
    const files = db.prepare('SELECT * FROM files WHERE user_id = ?').all(req.user.id);
    res.json(files);
});

app.post('/api/files', auth, (req, res) => {
    const { path: filePath, name, type, content, icon, size } = req.body;
    if (!filePath || !name) return res.status(400).json({ error: 'path and name required' });
    try {
        db.prepare(`
            INSERT INTO files (user_id, path, name, type, content, icon, size)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, path, name) DO UPDATE SET
                content = excluded.content,
                type = excluded.type,
                icon = excluded.icon,
                size = excluded.size,
                updated_at = strftime('%s','now') * 1000
        `).run(req.user.id, filePath, name, type || 'file', content || '', icon || '📄', size || '0 KB');
        const file = db.prepare('SELECT * FROM files WHERE user_id = ? AND path = ? AND name = ?').get(req.user.id, filePath, name);
        res.json(file);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/files', auth, (req, res) => {
    const { path: filePath, name } = req.body;
    db.prepare('DELETE FROM files WHERE user_id = ? AND path = ? AND name = ?').run(req.user.id, filePath, name);
    res.json({ success: true });
});

// ─── Notes routes ─────────────────────────────────────────────────────────────
app.get('/api/notes', auth, (req, res) => {
    const notes = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC').all(req.user.id);
    res.json(notes);
});

app.post('/api/notes', auth, (req, res) => {
    const { title, body, folder, pinned } = req.body;
    const result = db.prepare(
        'INSERT INTO notes (user_id, title, body, folder, pinned) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, title || 'Untitled', body || '', folder || 'All iCloud', pinned ? 1 : 0);
    res.json(db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/notes/:id', auth, (req, res) => {
    const { title, body, folder, pinned } = req.body;
    db.prepare(`
        UPDATE notes SET title = ?, body = ?, folder = ?, pinned = ?,
        updated_at = strftime('%s','now') * 1000
        WHERE id = ? AND user_id = ?
    `).run(title, body, folder || 'All iCloud', pinned ? 1 : 0, req.params.id, req.user.id);
    res.json(db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id));
});

app.delete('/api/notes/:id', auth, (req, res) => {
    db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
});

// ─── Weather proxy (wttr.in, no API key needed) ───────────────────────────────
app.get('/api/weather', async (req, res) => {
    const city = req.query.city || '';
    try {
        const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
            headers: { 'User-Agent': 'MacOS-Sonoma-Web/1.0' }
        });
        if (!r.ok) throw new Error('wttr.in error');
        const data = await r.json();
        const cur = data.current_condition[0];
        const area = data.nearest_area[0];
        const today = data.weather[0];
        res.json({
            city: area.areaName[0].value + ', ' + area.country[0].value,
            temp_f: parseInt(cur.temp_F),
            temp_c: parseInt(cur.temp_C),
            condition: cur.weatherDesc[0].value,
            humidity: parseInt(cur.humidity),
            feels_like_f: parseInt(cur.FeelsLikeF),
            feels_like_c: parseInt(cur.FeelsLikeC),
            wind_mph: parseInt(cur.windspeedMiles),
            high_f: parseInt(today.maxtempF),
            low_f: parseInt(today.mintempF),
            high_c: parseInt(today.maxtempC),
            low_c: parseInt(today.mintempC),
            weather_code: parseInt(cur.weatherCode),
        });
    } catch (e) {
        res.status(500).json({ error: 'Weather data unavailable' });
    }
});

// ─── Messages history ─────────────────────────────────────────────────────────
app.get('/api/messages', auth, (req, res) => {
    const { with: withUserId } = req.query;
    let rows;
    if (withUserId) {
        rows = db.prepare(`
            SELECT m.*, u.username, u.display_name, u.avatar_color
            FROM messages m JOIN users u ON m.from_user_id = u.id
            WHERE (m.from_user_id = ? AND m.to_user_id = ?)
               OR (m.from_user_id = ? AND m.to_user_id = ?)
            ORDER BY m.created_at ASC LIMIT 100
        `).all(req.user.id, withUserId, withUserId, req.user.id);
    } else {
        // Global chat (no to_user_id)
        rows = db.prepare(`
            SELECT m.*, u.username, u.display_name, u.avatar_color
            FROM messages m JOIN users u ON m.from_user_id = u.id
            WHERE m.to_user_id IS NULL
            ORDER BY m.created_at ASC LIMIT 100
        `).all();
    }
    res.json(rows);
});

// ─── WebSocket ────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });
const clients = new Map(); // userId -> ws

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    let userId = null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
    } catch {
        ws.close(1008, 'Invalid token');
        return;
    }

    clients.set(userId, ws);

    // Send online users list to the new client
    const onlineIds = [...clients.keys()];
    ws.send(JSON.stringify({ type: 'online_users', userIds: onlineIds }));

    // Tell others this user came online
    broadcast({ type: 'user_online', userId }, userId);

    ws.on('message', (raw) => {
        try {
            const msg = JSON.parse(raw);

            if (msg.type === 'message') {
                const result = db.prepare(
                    'INSERT INTO messages (from_user_id, to_user_id, content) VALUES (?, ?, ?)'
                ).run(userId, msg.to_user_id || null, msg.content);

                const user = db.prepare('SELECT id, username, display_name, avatar_color FROM users WHERE id = ?').get(userId);
                const saved = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);

                const payload = {
                    type: 'message',
                    ...saved,
                    username: user.username,
                    display_name: user.display_name,
                    avatar_color: user.avatar_color,
                };

                if (msg.to_user_id) {
                    // DM: send to recipient + echo to sender
                    if (clients.has(msg.to_user_id)) {
                        clients.get(msg.to_user_id).send(JSON.stringify(payload));
                    }
                    ws.send(JSON.stringify(payload));
                } else {
                    // Global: broadcast to everyone
                    broadcast(payload, null);
                }
            }
        } catch (e) { /* ignore malformed messages */ }
    });

    ws.on('close', () => {
        clients.delete(userId);
        broadcast({ type: 'user_offline', userId }, userId);
    });
});

function broadcast(data, excludeUserId) {
    const msg = JSON.stringify(data);
    clients.forEach((ws, id) => {
        if (id !== excludeUserId && ws.readyState === 1) {
            ws.send(msg);
        }
    });
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/ping', (_, res) => res.json({ ok: true, version: '1.0.0' }));

server.listen(PORT, () => {
    console.log(`\n🖥️  macOS Sonoma backend running at http://localhost:${PORT}`);
    console.log(`📡  WebSocket ready at ws://localhost:${PORT}`);
    console.log(`📁  Serving static files from: ${__dirname}\n`);
});
