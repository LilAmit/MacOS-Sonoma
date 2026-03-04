const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
// nodemailer removed — using Resend API over HTTPS instead (Render blocks SMTP)

const JWT_SECRET = process.env.JWT_SECRET || 'macos-sonoma-secret-key-2024';
const PORT = process.env.PORT || 3001;
const DB_DIR = path.join(__dirname, 'db');

// ─── Email (Resend API — works on Render, no SMTP ports needed) ───────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const sendEmail = async (to, subject, text) => {
    if (!RESEND_API_KEY) return false; // not configured, skip
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + RESEND_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'macOS Sonoma <onboarding@resend.dev>',
            to,
            subject,
            text,
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        console.error('[email] Resend failed:', err);
        throw new Error('Failed to send email: ' + err);
    }
    console.log(`[email] Sent "${subject}" to ${to}`);
    return true;
};

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateTag = () => {
    const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let t = '';
    for (let i = 0; i < 5; i++) t += c[Math.floor(Math.random() * 36)];
    return t;
};

const makeUniqueTag = () => {
    const used = new Set(readTable('users').map(u => u.friend_tag).filter(Boolean));
    let tag;
    do { tag = generateTag(); } while (used.has(tag));
    return tag;
};

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

const safeUser = (u) => {
    if (!u) return null;
    const { password_hash, ...safe } = u;
    return safe;
};

const db = {
    // ── Users ──────────────────────────────────────────────────────────────────
    getUsers: () => readTable('users'),
    getUser: (id) => readTable('users').find(u => u.id === id),
    getUserByEmail: (email) => readTable('users').find(u => u.email === email?.toLowerCase()),
    getUserByUsername: (username) => readTable('users').find(u => u.username === username),
    createUser: (data) => {
        const users = readTable('users');
        const colors = ['#007AFF','#FF3B30','#34C759','#FF9500','#AF52DE','#FF2D55','#5AC8FA'];
        const user = {
            id: nextId(users),
            created_at: Date.now(),
            avatar_color: colors[Math.floor(Math.random() * colors.length)],
            avatar_base64: null,
            email_verified: false,
            ...data,
        };
        writeTable('users', [...users, user]);
        return user;
    },
    updateUser: (id, data) => {
        const users = readTable('users');
        const idx = users.findIndex(u => u.id === id);
        if (idx === -1) return null;
        users[idx] = { ...users[idx], ...data };
        writeTable('users', users);
        return users[idx];
    },

    // ── Verification codes ─────────────────────────────────────────────────────
    saveVerificationCode: (email, code, type, extras = {}) => {
        const codes = readTable('verification_codes').filter(c => !(c.email === email && c.type === type));
        const entry = {
            id: nextId(readTable('verification_codes')),
            email, code, type,
            expires_at: Date.now() + 10 * 60 * 1000,
            created_at: Date.now(),
            ...extras,
        };
        writeTable('verification_codes', [...codes, entry]);
        return entry;
    },
    getVerificationCode: (email, code, type) => {
        return readTable('verification_codes').find(
            c => c.email === email && c.code === code && c.type === type && c.expires_at > Date.now()
        );
    },
    deleteVerificationCode: (email, type) => {
        writeTable('verification_codes', readTable('verification_codes').filter(c => !(c.email === email && c.type === type)));
    },

    // ── Notes ──────────────────────────────────────────────────────────────────
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

    // ── Files ──────────────────────────────────────────────────────────────────
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

    // ── Messages (DMs) ─────────────────────────────────────────────────────────
    getMessages: (toUserId, fromUserId) => {
        const msgs = readTable('messages');
        const users = readTable('users');
        const enrich = (m) => {
            const u = users.find(u => u.id === m.from_user_id) || {};
            return { ...m, display_name: u.display_name, avatar_color: u.avatar_color, avatar_base64: u.avatar_base64 };
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
        const msg = {
            id: nextId(messages),
            created_at: Date.now(),
            content_type: 'text',
            file_name: null,
            file_mime: null,
            reactions: {},
            read_by: [],
            ...data,
        };
        writeTable('messages', [...messages, msg]);
        return msg;
    },
    updateMessageReaction: (id, emoji, userId) => {
        const messages = readTable('messages');
        const idx = messages.findIndex(m => m.id === id);
        if (idx === -1) return null;
        const reactions = messages[idx].reactions || {};
        const existing = reactions[emoji] || [];
        if (existing.includes(userId)) {
            reactions[emoji] = existing.filter(id => id !== userId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
            reactions[emoji] = [...existing, userId];
        }
        messages[idx] = { ...messages[idx], reactions };
        writeTable('messages', messages);
        return messages[idx];
    },
    markMessageRead: (id, userId) => {
        const messages = readTable('messages');
        const idx = messages.findIndex(m => m.id === id);
        if (idx === -1) return null;
        const read_by = messages[idx].read_by || [];
        if (!read_by.includes(userId)) {
            messages[idx] = { ...messages[idx], read_by: [...read_by, userId] };
            writeTable('messages', messages);
        }
        return messages[idx];
    },

    // ── Friends ────────────────────────────────────────────────────────────────
    getFriends: (userId) => {
        const pairs = readTable('friends').filter(f => f.user_id_a === userId || f.user_id_b === userId);
        const users = readTable('users');
        return pairs.map(f => {
            const friendId = f.user_id_a === userId ? f.user_id_b : f.user_id_a;
            return safeUser(users.find(u => u.id === friendId));
        }).filter(Boolean);
    },
    areFriends: (a, b) => {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        return !!readTable('friends').find(f => f.user_id_a === lo && f.user_id_b === hi);
    },
    addFriend: (a, b) => {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        const friends = readTable('friends');
        if (friends.find(f => f.user_id_a === lo && f.user_id_b === hi)) return;
        writeTable('friends', [...friends, { id: nextId(friends), user_id_a: lo, user_id_b: hi, created_at: Date.now() }]);
    },
    removeFriend: (a, b) => {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        writeTable('friends', readTable('friends').filter(f => !(f.user_id_a === lo && f.user_id_b === hi)));
    },
    getFriendRequests: (userId) => {
        const requests = readTable('friend_requests').filter(r => r.to_user_id === userId && r.status === 'pending');
        const users = readTable('users');
        return requests.map(r => ({
            ...r,
            from_user: safeUser(users.find(u => u.id === r.from_user_id)),
        }));
    },
    createFriendRequest: (fromId, toId) => {
        const requests = readTable('friend_requests');
        const existing = requests.find(r => r.from_user_id === fromId && r.to_user_id === toId && r.status === 'pending');
        if (existing) return existing;
        const req = { id: nextId(requests), from_user_id: fromId, to_user_id: toId, status: 'pending', created_at: Date.now() };
        writeTable('friend_requests', [...requests, req]);
        return req;
    },
    updateFriendRequest: (id, status) => {
        const requests = readTable('friend_requests');
        const idx = requests.findIndex(r => r.id === id);
        if (idx === -1) return null;
        requests[idx] = { ...requests[idx], status };
        writeTable('friend_requests', requests);
        return requests[idx];
    },
    getFriendRequest: (id) => readTable('friend_requests').find(r => r.id === id),

    // ── Groups ─────────────────────────────────────────────────────────────────
    getUserGroups: (userId) => {
        const memberRows = readTable('group_members').filter(m => m.user_id === userId);
        const groups = readTable('groups');
        return memberRows.map(m => groups.find(g => g.id === m.group_id)).filter(Boolean);
    },
    getGroupMembers: (groupId) => {
        const memberRows = readTable('group_members').filter(m => m.group_id === groupId);
        const users = readTable('users');
        return memberRows.map(m => safeUser(users.find(u => u.id === m.user_id))).filter(Boolean);
    },
    isGroupMember: (groupId, userId) => !!readTable('group_members').find(m => m.group_id === groupId && m.user_id === userId),
    createGroup: (data) => {
        const groups = readTable('groups');
        const group = { id: nextId(groups), created_at: Date.now(), avatar_base64: null, ...data };
        writeTable('groups', [...groups, group]);
        return group;
    },
    addGroupMember: (groupId, userId) => {
        const members = readTable('group_members');
        if (members.find(m => m.group_id === groupId && m.user_id === userId)) return;
        writeTable('group_members', [...members, { id: nextId(members), group_id: groupId, user_id: userId, joined_at: Date.now() }]);
    },
    removeGroupMember: (groupId, userId) => {
        writeTable('group_members', readTable('group_members').filter(m => !(m.group_id === groupId && m.user_id === userId)));
    },
    getGroupMessages: (groupId) => {
        const msgs = readTable('group_messages').filter(m => m.group_id === groupId).slice(-100);
        const users = readTable('users');
        return msgs.map(m => {
            const u = users.find(u => u.id === m.from_user_id) || {};
            return { ...m, display_name: u.display_name, avatar_color: u.avatar_color, avatar_base64: u.avatar_base64 };
        });
    },
    createGroupMessage: (data) => {
        const messages = readTable('group_messages');
        const msg = {
            id: nextId(messages),
            created_at: Date.now(),
            content_type: 'text',
            file_name: null,
            file_mime: null,
            reactions: {},
            ...data,
        };
        writeTable('group_messages', [...messages, msg]);
        return msg;
    },
    updateGroupMessageReaction: (id, emoji, userId) => {
        const messages = readTable('group_messages');
        const idx = messages.findIndex(m => m.id === id);
        if (idx === -1) return null;
        const reactions = messages[idx].reactions || {};
        const existing = reactions[emoji] || [];
        if (existing.includes(userId)) {
            reactions[emoji] = existing.filter(id => id !== userId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
            reactions[emoji] = [...existing, userId];
        }
        messages[idx] = { ...messages[idx], reactions };
        writeTable('group_messages', messages);
        return messages[idx];
    },
};

// ─── Migration: add missing fields to existing users ──────────────────────────
const migrateUsers = () => {
    const users = readTable('users');
    let changed = false;
    users.forEach(u => {
        if (!u.friend_tag) { u.friend_tag = makeUniqueTag(); changed = true; }
        if (!u.email && u.username) { u.email = u.username + '@legacy.local'; changed = true; }
        if (u.avatar_base64 === undefined) { u.avatar_base64 = null; changed = true; }
        if (u.email_verified === undefined) { u.email_verified = true; changed = true; }
    });
    if (changed) { writeTable('users', users); console.log('[db] User migration applied'); }
};

// ─── Express ──────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.static(__dirname));

// ─── Auth middleware ──────────────────────────────────────────────────────────
const auth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try { req.user = jwt.verify(token, JWT_SECRET); next(); }
    catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};

const issueToken = (user) => jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

// ─── Auth: Registration (2-step email verification) ───────────────────────────
app.post('/api/auth/send-register-code', async (req, res) => {
    const { email, password, display_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (db.getUserByEmail(email.toLowerCase())) return res.status(400).json({ error: 'Email already registered' });

    const code = generateCode();
    const hash = bcrypt.hashSync(password, 10);
    db.saveVerificationCode(email.toLowerCase(), code, 'register', {
        pending_password_hash: hash,
        pending_display_name: display_name || email.split('@')[0],
    });
    try {
        const sent = await sendEmail(email, 'Your macOS Sonoma verification code', `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`);
        if (sent === false) {
            // Email not configured — return code directly for local dev
            return res.json({ success: true, dev_code: code, message: 'Email not configured. Use this code: ' + code });
        }
    } catch (e) {
        return res.status(500).json({ error: 'Could not send email. Check server email configuration. ' + e.message });
    }
    res.json({ success: true, message: 'Verification code sent to ' + email });
});

app.post('/api/auth/verify-register', (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
    const entry = db.getVerificationCode(email.toLowerCase(), code, 'register');
    if (!entry) return res.status(400).json({ error: 'Invalid or expired verification code' });

    const user = db.createUser({
        email: email.toLowerCase(),
        password_hash: entry.pending_password_hash,
        display_name: entry.pending_display_name,
        friend_tag: makeUniqueTag(),
        email_verified: true,
    });
    db.deleteVerificationCode(email.toLowerCase(), 'register');

    const token = issueToken(user);
    res.json({ token, user: safeUser(user) });
});

// ─── Auth: Login (email-based) ────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = db.getUserByEmail(email.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password_hash))
        return res.status(401).json({ error: 'Invalid email or password' });
    const token = issueToken(user);
    res.json({ token, user: safeUser(user) });
});

// ─── Auth: Forgot password ────────────────────────────────────────────────────
app.post('/api/auth/send-reset-code', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = db.getUserByEmail(email.toLowerCase());
    // Always respond success to avoid email enumeration
    if (user) {
        const code = generateCode();
        db.saveVerificationCode(email.toLowerCase(), code, 'reset_password');
        try { await sendEmail(email, 'Reset your macOS Sonoma password', `Your password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`); }
        catch (e) { console.error('[reset] email failed:', e.message); }
    }
    res.json({ success: true, message: 'If that email is registered, a reset code has been sent.' });
});

app.post('/api/auth/verify-reset', (req, res) => {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) return res.status(400).json({ error: 'Email, code, and new password required' });
    if (new_password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const entry = db.getVerificationCode(email.toLowerCase(), code, 'reset_password');
    if (!entry) return res.status(400).json({ error: 'Invalid or expired reset code' });
    const user = db.getUserByEmail(email.toLowerCase());
    if (!user) return res.status(400).json({ error: 'User not found' });
    db.updateUser(user.id, { password_hash: bcrypt.hashSync(new_password, 10) });
    db.deleteVerificationCode(email.toLowerCase(), 'reset_password');
    res.json({ success: true });
});

// ─── Auth: Me ─────────────────────────────────────────────────────────────────
app.get('/api/auth/me', auth, (req, res) => {
    const user = db.getUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(safeUser(user));
});

// ─── Auth: Update profile ─────────────────────────────────────────────────────
app.put('/api/auth/profile', auth, (req, res) => {
    const { display_name, avatar_base64 } = req.body;
    const updates = {};
    if (display_name !== undefined) updates.display_name = display_name.trim() || undefined;
    if (avatar_base64 !== undefined) {
        if (avatar_base64 && avatar_base64.length > 7_000_000) return res.status(400).json({ error: 'Image too large. Max 5MB.' });
        updates.avatar_base64 = avatar_base64;
    }
    const user = db.updateUser(req.user.id, updates);
    res.json(safeUser(user));
});

// ─── Auth: Change email (2-step) ──────────────────────────────────────────────
app.put('/api/auth/change-email', auth, async (req, res) => {
    const { new_email } = req.body;
    if (!new_email) return res.status(400).json({ error: 'New email required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email)) return res.status(400).json({ error: 'Invalid email address' });
    if (db.getUserByEmail(new_email.toLowerCase())) return res.status(400).json({ error: 'Email already in use' });
    const currentUser = db.getUser(req.user.id);
    const code = generateCode();
    db.saveVerificationCode(currentUser.email, code, 'change_email', { new_email: new_email.toLowerCase() });
    try { await sendEmail(new_email, 'Confirm your new email address', `Your email change code is: ${code}\n\nThis code expires in 10 minutes.`); }
    catch (e) { return res.status(500).json({ error: 'Could not send confirmation email: ' + e.message }); }
    res.json({ success: true });
});

app.post('/api/auth/verify-change-email', auth, (req, res) => {
    const { code } = req.body;
    const currentUser = db.getUser(req.user.id);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });
    const entry = db.getVerificationCode(currentUser.email, code, 'change_email');
    if (!entry) return res.status(400).json({ error: 'Invalid or expired code' });
    const updated = db.updateUser(req.user.id, { email: entry.new_email });
    db.deleteVerificationCode(currentUser.email, 'change_email');
    const token = issueToken(updated);
    res.json({ token, user: safeUser(updated) });
});

// ─── Auth: Change password ────────────────────────────────────────────────────
app.put('/api/auth/change-password', auth, (req, res) => {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'Both passwords required' });
    if (new_password.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const user = db.getUser(req.user.id);
    if (!bcrypt.compareSync(current_password, user.password_hash))
        return res.status(401).json({ error: 'Current password is incorrect' });
    db.updateUser(req.user.id, { password_hash: bcrypt.hashSync(new_password, 10) });
    res.json({ success: true });
});

// ─── Users ────────────────────────────────────────────────────────────────────
app.get('/api/users', auth, (req, res) => {
    const users = db.getUsers().filter(u => u.id !== req.user.id).map(safeUser);
    res.json(users);
});

app.get('/api/users/search', auth, (req, res) => {
    const tag = req.query.tag?.toLowerCase();
    if (!tag) return res.status(400).json({ error: 'Tag required' });
    const user = db.getUsers().find(u => u.friend_tag === tag && u.id !== req.user.id);
    if (!user) return res.status(404).json({ error: 'No user found with that tag' });
    res.json(safeUser(user));
});

// ─── Friends ──────────────────────────────────────────────────────────────────
app.get('/api/friends', auth, (req, res) => {
    res.json(db.getFriends(req.user.id));
});

app.get('/api/friends/requests', auth, (req, res) => {
    res.json(db.getFriendRequests(req.user.id));
});

app.post('/api/friends/request', auth, (req, res) => {
    const { to_user_id } = req.body;
    if (!to_user_id) return res.status(400).json({ error: 'to_user_id required' });
    if (to_user_id === req.user.id) return res.status(400).json({ error: 'Cannot add yourself' });
    const toUser = db.getUser(to_user_id);
    if (!toUser) return res.status(404).json({ error: 'User not found' });
    if (db.areFriends(req.user.id, to_user_id)) return res.status(400).json({ error: 'Already friends' });
    const friendReq = db.createFriendRequest(req.user.id, to_user_id);
    const fromUser = db.getUser(req.user.id);
    // Notify recipient via WebSocket
    if (clients.has(to_user_id)) {
        clients.get(to_user_id).send(JSON.stringify({
            type: 'friend_request',
            request: { ...friendReq, from_user: safeUser(fromUser) },
        }));
    }
    res.json(friendReq);
});

app.post('/api/friends/accept', auth, (req, res) => {
    const { request_id } = req.body;
    const request = db.getFriendRequest(request_id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.to_user_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already handled' });
    db.updateFriendRequest(request_id, 'accepted');
    db.addFriend(request.from_user_id, request.to_user_id);
    const accepter = db.getUser(req.user.id);
    // Notify sender
    if (clients.has(request.from_user_id)) {
        clients.get(request.from_user_id).send(JSON.stringify({
            type: 'friend_accepted',
            by_user: safeUser(accepter),
            new_friend: safeUser(accepter),
        }));
    }
    res.json({ success: true });
});

app.post('/api/friends/decline', auth, (req, res) => {
    const { request_id } = req.body;
    const request = db.getFriendRequest(request_id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.to_user_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
    db.updateFriendRequest(request_id, 'declined');
    res.json({ success: true });
});

app.delete('/api/friends/:friendId', auth, (req, res) => {
    db.removeFriend(req.user.id, parseInt(req.params.friendId));
    res.json({ success: true });
});

// ─── Groups ───────────────────────────────────────────────────────────────────
app.get('/api/groups', auth, (req, res) => {
    const groups = db.getUserGroups(req.user.id);
    const result = groups.map(g => ({
        ...g,
        members: db.getGroupMembers(g.id),
    }));
    res.json(result);
});

app.post('/api/groups', auth, (req, res) => {
    const { name, member_ids = [], avatar_base64 } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Group name required' });
    const group = db.createGroup({ name: name.trim(), created_by: req.user.id, avatar_base64: avatar_base64 || null });
    // Add creator + all specified members
    db.addGroupMember(group.id, req.user.id);
    member_ids.forEach(uid => { if (uid !== req.user.id) db.addGroupMember(group.id, uid); });
    const members = db.getGroupMembers(group.id);
    const fullGroup = { ...group, members };
    // Notify all members
    members.forEach(m => {
        if (m.id !== req.user.id && clients.has(m.id)) {
            clients.get(m.id).send(JSON.stringify({ type: 'group_added', group: fullGroup }));
        }
    });
    res.json(fullGroup);
});

app.get('/api/groups/:groupId/messages', auth, (req, res) => {
    const groupId = parseInt(req.params.groupId);
    if (!db.isGroupMember(groupId, req.user.id)) return res.status(403).json({ error: 'Not a member' });
    res.json(db.getGroupMessages(groupId));
});

app.post('/api/groups/:groupId/messages', auth, (req, res) => {
    const groupId = parseInt(req.params.groupId);
    if (!db.isGroupMember(groupId, req.user.id)) return res.status(403).json({ error: 'Not a member' });
    const { content, content_type, file_name, file_mime } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const user = db.getUser(req.user.id);
    const msg = db.createGroupMessage({
        group_id: groupId,
        from_user_id: req.user.id,
        content,
        content_type: content_type || 'text',
        file_name: file_name || null,
        file_mime: file_mime || null,
    });
    const enriched = { ...msg, display_name: user.display_name, avatar_color: user.avatar_color, avatar_base64: user.avatar_base64 };
    broadcastToGroup(groupId, { type: 'group_message', ...enriched }, req.user.id);
    res.json(enriched);
});

app.post('/api/groups/:groupId/members', auth, (req, res) => {
    const groupId = parseInt(req.params.groupId);
    if (!db.isGroupMember(groupId, req.user.id)) return res.status(403).json({ error: 'Not a member' });
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    db.addGroupMember(groupId, user_id);
    const groups = db.getUserGroups(req.user.id);
    const group = groups.find(g => g.id === groupId);
    if (group && clients.has(user_id)) {
        clients.get(user_id).send(JSON.stringify({ type: 'group_added', group: { ...group, members: db.getGroupMembers(groupId) } }));
    }
    res.json({ success: true });
});

app.post('/api/groups/:groupId/react', auth, (req, res) => {
    const groupId = parseInt(req.params.groupId);
    if (!db.isGroupMember(groupId, req.user.id)) return res.status(403).json({ error: 'Not a member' });
    const { message_id, emoji } = req.body;
    const msg = db.updateGroupMessageReaction(message_id, emoji, req.user.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    broadcastToGroup(groupId, { type: 'reaction_update', context: 'group', group_id: groupId, message_id, reactions: msg.reactions }, null);
    res.json(msg);
});

// ─── Messages ─────────────────────────────────────────────────────────────────
app.get('/api/messages', auth, (req, res) => {
    const withId = req.query.with ? parseInt(req.query.with) : null;
    res.json(db.getMessages(withId, withId ? req.user.id : null));
});

app.post('/api/messages/:id/react', auth, (req, res) => {
    const { emoji } = req.body;
    const msg = db.updateMessageReaction(parseInt(req.params.id), emoji, req.user.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    // Notify other party
    const otherId = msg.from_user_id === req.user.id ? msg.to_user_id : msg.from_user_id;
    if (otherId && clients.has(otherId)) {
        clients.get(otherId).send(JSON.stringify({ type: 'reaction_update', context: 'dm', message_id: msg.id, reactions: msg.reactions }));
    }
    res.json(msg);
});

app.post('/api/messages/:id/read', auth, (req, res) => {
    const msg = db.markMessageRead(parseInt(req.params.id), req.user.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    // Notify sender
    if (clients.has(msg.from_user_id)) {
        clients.get(msg.from_user_id).send(JSON.stringify({ type: 'read_receipt', message_id: msg.id, reader_id: req.user.id }));
    }
    res.json({ success: true });
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

// ─── Weather ──────────────────────────────────────────────────────────────────
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

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/ping', (_, res) => res.json({ ok: true, version: '2.0.0' }));

// ─── WebSocket ────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });
const clients = new Map(); // userId → WebSocket

function broadcastToGroup(groupId, data, excludeUserId) {
    const members = readTable('group_members').filter(m => m.group_id === groupId);
    const msg = JSON.stringify(data);
    members.forEach(m => {
        if (m.user_id !== excludeUserId && clients.has(m.user_id) && clients.get(m.user_id).readyState === 1) {
            clients.get(m.user_id).send(msg);
        }
    });
}

function broadcast(data, excludeId) {
    const msg = JSON.stringify(data);
    clients.forEach((ws, id) => { if (id !== excludeId && ws.readyState === 1) ws.send(msg); });
}

// Typing debounce timers: Map<`${userId}-${contextKey}`, timeout>
const typingTimers = new Map();

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
                // DM or global
                const saved = db.createMessage({
                    from_user_id: userId,
                    to_user_id: msg.to_user_id || null,
                    content: msg.content,
                    content_type: msg.content_type || 'text',
                    file_name: msg.file_name || null,
                    file_mime: msg.file_mime || null,
                });
                const user = db.getUser(userId);
                const payload = {
                    type: 'message', ...saved,
                    display_name: user.display_name,
                    avatar_color: user.avatar_color,
                    avatar_base64: user.avatar_base64,
                };
                if (msg.to_user_id) {
                    if (clients.has(msg.to_user_id)) clients.get(msg.to_user_id).send(JSON.stringify(payload));
                    ws.send(JSON.stringify(payload));
                } else {
                    broadcast(payload, null);
                }
            }

            if (msg.type === 'group_message') {
                const groupId = msg.group_id;
                if (!db.isGroupMember(groupId, userId)) return;
                const user = db.getUser(userId);
                const saved = db.createGroupMessage({
                    group_id: groupId,
                    from_user_id: userId,
                    content: msg.content,
                    content_type: msg.content_type || 'text',
                    file_name: msg.file_name || null,
                    file_mime: msg.file_mime || null,
                });
                const payload = {
                    type: 'group_message', ...saved,
                    display_name: user.display_name,
                    avatar_color: user.avatar_color,
                    avatar_base64: user.avatar_base64,
                };
                broadcastToGroup(groupId, payload, userId);
                ws.send(JSON.stringify(payload));
            }

            if (msg.type === 'typing') {
                const contextKey = msg.group_id ? `group:${msg.group_id}` : `dm:${msg.to_user_id}`;
                const timerKey = `${userId}-${contextKey}`;
                if (msg.is_typing) {
                    // Clear existing timer
                    if (typingTimers.has(timerKey)) clearTimeout(typingTimers.get(timerKey));
                    const payload = { type: 'typing', from_user_id: userId, group_id: msg.group_id || null, is_typing: true };
                    if (msg.group_id) broadcastToGroup(msg.group_id, payload, userId);
                    else if (msg.to_user_id && clients.has(msg.to_user_id)) clients.get(msg.to_user_id).send(JSON.stringify(payload));
                    // Auto-clear after 4s
                    typingTimers.set(timerKey, setTimeout(() => {
                        const stopPayload = { type: 'typing', from_user_id: userId, group_id: msg.group_id || null, is_typing: false };
                        if (msg.group_id) broadcastToGroup(msg.group_id, stopPayload, userId);
                        else if (msg.to_user_id && clients.has(msg.to_user_id)) clients.get(msg.to_user_id).send(JSON.stringify(stopPayload));
                        typingTimers.delete(timerKey);
                    }, 4000));
                } else {
                    if (typingTimers.has(timerKey)) { clearTimeout(typingTimers.get(timerKey)); typingTimers.delete(timerKey); }
                    const payload = { type: 'typing', from_user_id: userId, group_id: msg.group_id || null, is_typing: false };
                    if (msg.group_id) broadcastToGroup(msg.group_id, payload, userId);
                    else if (msg.to_user_id && clients.has(msg.to_user_id)) clients.get(msg.to_user_id).send(JSON.stringify(payload));
                }
            }

            if (msg.type === 'dm_read') {
                const message = db.markMessageRead(msg.message_id, userId);
                if (message && clients.has(message.from_user_id)) {
                    clients.get(message.from_user_id).send(JSON.stringify({ type: 'read_receipt', message_id: msg.message_id, reader_id: userId }));
                }
            }
        } catch {}
    });

    ws.on('close', () => {
        clients.delete(userId);
        broadcast({ type: 'user_offline', userId }, userId);
    });
});

// ─── Start ────────────────────────────────────────────────────────────────────
migrateUsers();

server.listen(PORT, () => {
    console.log(`\n🖥️  macOS Sonoma backend v2.0 running at http://localhost:${PORT}`);
    console.log(`📡  WebSocket ready at ws://localhost:${PORT}`);
    console.log(`💾  Database stored in: ${DB_DIR}`);
    console.log(`📧  Email: ${RESEND_API_KEY ? 'Resend configured' : 'NOT CONFIGURED (set RESEND_API_KEY env var)'}\n`);
});
