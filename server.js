const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'macos-sonoma-secret-key-2024';
const PORT = process.env.PORT || 3001;
const DB_DIR = path.join(__dirname, 'db');

// ─── JSON File Database ───────────────────────────────────────────────────────
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

const dbFile = (name) => path.join(DB_DIR, name + '.json');

const readTable = (name) => {
    try { return JSON.parse(fs.readFileSync(dbFile(name), 'utf8')); } catch { return []; }
};

const writeTable = (name, data) => {
    fs.writeFileSync(dbFile(name), JSON.stringify(data, null, 2));
};

const nextId = (rows) => rows.length === 0 ? 1 : Math.max(...rows.map(r => r.id)) + 1;

const db = {
    // Users
    getUsers: () => readTable('users'),
    getUser: (id) => readTable('users').find(u => u.id === id),
    getUserByUsername: (username) => readTable('users').find(u => u.username === username),
    createUser: (data) => {
        const users = readTable('users');
        const user = { id: nextId(users), created_at: Date.now(), avatar_color: '#007AFF', ...data };
        writeTable('users', [...users, user]);
        return user;
    },

    // Notes
    getNotes: (userId) => readTable('notes').filter(n => n.user_id === userId)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated_at - a.updated_at),
    createNote: (data) => {
        const notes = readTable('notes');
        const note = { id: nextId(notes), created_at: Date.now(), updated_at: Date.now(), pinned: false, folder: 'All iCloud', body: '', ...data };
        writeTable('notes', [...notes, note]);
        return note;
    },
    updateNote: (id, userId, data) => {
        const notes = readTable('notes');
        const idx = notes.findIndex(n => n.id === id && n.user_id === userId);
        if (idx === -1) return null;
        notes[idx] = { ...notes[idx], ...data, updated_at: Date.now() };
        writeTable('notes', notes);
        return notes[idx];
    },
    deleteNote: (id, userId) => {
        const notes = readTable('notes');
        writeTable('notes', notes.filter(n => !(n.id === id && n.user_id === userId)));
    },

    // Files
    getFiles: (userId) => readTable('files').filter(f => f.user_id === userId),
    upsertFile: (userId, filePath, name, data) => {
        const files = readTable('files');
        const idx = files.findIndex(f => f.user_id === userId && f.path === filePath && f.name === name);
        if (idx >= 0) {
            files[idx] = { ...files[idx], ...data, updated_at: Date.now() };
            writeTable('files', files);
            return files[idx];
        }
        const file = { id: nextId(files), user_id: userId, path: filePath, name, created_at: Date.now(), updated_at: Date.now(), type: 'file', content: '', icon: '📄', size: '0 KB', ...data };
        writeTable('files', [...files, file]);
        return file;
    },
    deleteFile: (userId, filePath, name) => {
        writeTable('files', readTable('files').filter(f => !(f.user_id === userId && f.path === filePath && f.name === name)));
    },

    // Messages
    getMessages: (toUserId, fromUserId) => {
        const msgs = readTable('messages');
        const users = readTable('users');
        const enrich = (m) => {
            const u = users.find(u => u.id === m.from_user_id) || {};
            return { ...m, username: u.username, display_name: u.display_name, avatar_color: u.avatar_color };
        };
        if (toUserId && fromUserId) {
            return msgs.filter(m =>
                (m.from_user_id === fromUserId && m.to_user_id === toUserId) ||
                (m.from_user_id === toUserId && m.to_user_id === fromUserId)
            ).slice(-100).map(enrich);
        }
        return msgs.filter(m => !m.to_user_id).slice(-100).map(enrich);
    },
    createMessage: (data) => {
        const messages = readTable('messages');
        const msg = { id: nextId(messages), created_at: Date.now(), ...data };
        writeTable('messages', [...messages, msg]);
        return msg;
    },
};

// ─── Express ──────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ─── Auth middleware ──────────────────────────────────────────────────────────
const auth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try { req.user = jwt.verify(token, JWT_SECRET); next(); }
    catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};

// ─── Auth routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
    const { username, password, display_name } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (db.getUserByUsername(username.toLowerCase())) return res.status(400).json({ error: 'Username already taken' });

    const colors = ['#007AFF','#FF3B30','#34C759','#FF9500','#AF52DE','#FF2D55','#5AC8FA'];
    const hash = bcrypt.hashSync(password, 10);
    const user = db.createUser({
        username: username.toLowerCase(),
        display_name: display_name || username,
        password_hash: hash,
        avatar_color: colors[Math.floor(Math.random() * colors.length)],
    });
    const { password_hash, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: safeUser });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.getUserByUsername(username?.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password_hash))
        return res.status(401).json({ error: 'Invalid username or password' });
    const { password_hash, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: safeUser });
});

app.get('/api/auth/me', auth, (req, res) => {
    const user = db.getUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
});

// ─── Users ────────────────────────────────────────────────────────────────────
app.get('/api/users', auth, (req, res) => {
    const users = db.getUsers()
        .filter(u => u.id !== req.user.id)
        .map(({ password_hash, ...u }) => u);
    res.json(users);
});

// ─── Notes ────────────────────────────────────────────────────────────────────
app.get('/api/notes', auth, (req, res) => res.json(db.getNotes(req.user.id)));

app.post('/api/notes', auth, (req, res) => {
    const { title, body, folder, pinned } = req.body;
    res.json(db.createNote({ user_id: req.user.id, title: title || 'Untitled', body: body || '', folder: folder || 'All iCloud', pinned: !!pinned }));
});

app.put('/api/notes/:id', auth, (req, res) => {
    const note = db.updateNote(parseInt(req.params.id), req.user.id, req.body);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
});

app.delete('/api/notes/:id', auth, (req, res) => {
    db.deleteNote(parseInt(req.params.id), req.user.id);
    res.json({ success: true });
});

// ─── Files ────────────────────────────────────────────────────────────────────
app.get('/api/files', auth, (req, res) => res.json(db.getFiles(req.user.id)));

app.post('/api/files', auth, (req, res) => {
    const { path: filePath, name, type, content, icon, size } = req.body;
    if (!filePath || !name) return res.status(400).json({ error: 'path and name required' });
    res.json(db.upsertFile(req.user.id, filePath, name, { type, content, icon, size }));
});

app.delete('/api/files', auth, (req, res) => {
    db.deleteFile(req.user.id, req.body.path, req.body.name);
    res.json({ success: true });
});

// ─── Weather proxy (wttr.in — no API key needed) ──────────────────────────────
app.get('/api/weather', async (req, res) => {
    try {
        const city = req.query.city || '';
        const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
            headers: { 'User-Agent': 'MacOS-Sonoma-Web/1.0' }
        });
        if (!r.ok) throw new Error('wttr error');
        const data = await r.json();
        const cur = data.current_condition[0];
        const area = data.nearest_area[0];
        const today = data.weather[0];
        res.json({
            city: area.areaName[0].value + ', ' + area.country[0].value,
            temp_f: parseInt(cur.temp_F), temp_c: parseInt(cur.temp_C),
            condition: cur.weatherDesc[0].value,
            humidity: parseInt(cur.humidity),
            feels_like_f: parseInt(cur.FeelsLikeF),
            wind_mph: parseInt(cur.windspeedMiles),
            high_f: parseInt(today.maxtempF), low_f: parseInt(today.mintempF),
            high_c: parseInt(today.maxtempC), low_c: parseInt(today.mintempC),
            weather_code: parseInt(cur.weatherCode),
        });
    } catch { res.status(500).json({ error: 'Weather data unavailable' }); }
});

// ─── Messages ─────────────────────────────────────────────────────────────────
app.get('/api/messages', auth, (req, res) => {
    const withId = req.query.with ? parseInt(req.query.with) : null;
    res.json(db.getMessages(withId, withId ? req.user.id : null));
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/ping', (_, res) => res.json({ ok: true, version: '1.0.0' }));

// ─── WebSocket ────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });
const clients = new Map();

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    let userId = null;
    try { userId = jwt.verify(token, JWT_SECRET).id; }
    catch { ws.close(1008, 'Invalid token'); return; }

    clients.set(userId, ws);
    ws.send(JSON.stringify({ type: 'online_users', userIds: [...clients.keys()] }));
    broadcast({ type: 'user_online', userId }, userId);

    ws.on('message', (raw) => {
        try {
            const msg = JSON.parse(raw);
            if (msg.type === 'message') {
                const saved = db.createMessage({ from_user_id: userId, to_user_id: msg.to_user_id || null, content: msg.content });
                const user = db.getUser(userId);
                const payload = {
                    type: 'message', ...saved,
                    username: user.username, display_name: user.display_name, avatar_color: user.avatar_color,
                };
                if (msg.to_user_id) {
                    if (clients.has(msg.to_user_id)) clients.get(msg.to_user_id).send(JSON.stringify(payload));
                    ws.send(JSON.stringify(payload));
                } else {
                    broadcast(payload, null);
                }
            }
        } catch {}
    });

    ws.on('close', () => {
        clients.delete(userId);
        broadcast({ type: 'user_offline', userId }, userId);
    });
});

function broadcast(data, excludeId) {
    const msg = JSON.stringify(data);
    clients.forEach((ws, id) => { if (id !== excludeId && ws.readyState === 1) ws.send(msg); });
}

server.listen(PORT, () => {
    console.log(`\n🖥️  macOS Sonoma backend running at http://localhost:${PORT}`);
    console.log(`📡  WebSocket ready at ws://localhost:${PORT}`);
    console.log(`💾  Database stored in: ${DB_DIR}\n`);
});
