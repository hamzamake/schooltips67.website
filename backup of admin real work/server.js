const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve your HTML, CSS, JS files

// Session configuration
app.use(session({
    secret: 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database file path
const DB_FILE = './users.json';

// Initialize database
async function initDatabase() {
    try {
        await fs.access(DB_FILE);
    } catch {
        // Create default admin user
        const defaultAdmin = {
            users: [
                {
                    id: 1,
                    username: 'admin',
                    password: await bcrypt.hash('admin123', 10),
                    role: 'admin',
                    createdAt: new Date().toISOString()
                }
            ]
        };
        await fs.writeFile(DB_FILE, JSON.stringify(defaultAdmin, null, 2));
    }
}

// Helper functions
async function readUsers() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return { users: [] };
    }
}

async function writeUsers(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    const data = await readUsers();
    const user = data.users.find(u => u.username === username);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    res.json({ 
        success: true, 
        user: { 
            id: user.id, 
            username: user.username, 
            role: user.role 
        } 
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Admin routes
app.get('/api/admin/users', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const data = await readUsers();
    // Return users without passwords for security
    const safeUsers = data.users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt
    }));
    
    res.json(safeUsers);
});

app.post('/api/admin/users', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { username, password, role = 'user' } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    const data = await readUsers();
    
    // Check if username already exists
    if (data.users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }
    
    const newUser = {
        id: Math.max(...data.users.map(u => u.id), 0) + 1,
        username,
        password: await bcrypt.hash(password, 10),
        role,
        createdAt: new Date().toISOString()
    };
    
    data.users.push(newUser);
    await writeUsers(data);
    
    res.json({ 
        success: true, 
        user: { 
            id: newUser.id, 
            username: newUser.username, 
            role: newUser.role 
        } 
    });
});

app.put('/api/admin/users/:id', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const userId = parseInt(req.params.id);
    const { username, password, role } = req.body;
    
    const data = await readUsers();
    const userIndex = data.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user
    if (username) data.users[userIndex].username = username;
    if (password) data.users[userIndex].password = await bcrypt.hash(password, 10);
    if (role) data.users[userIndex].role = role;
    
    await writeUsers(data);
    
    res.json({ 
        success: true, 
        user: { 
            id: data.users[userIndex].id, 
            username: data.users[userIndex].username, 
            role: data.users[userIndex].role 
        } 
    });
});

app.delete('/api/admin/users/:id', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const userId = parseInt(req.params.id);
    const data = await readUsers();
    
    data.users = data.users.filter(u => u.id !== userId);
    await writeUsers(data);
    
    res.json({ success: true });
});

// Check session status
app.get('/api/session', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            authenticated: true, 
            user: { 
                id: req.session.userId, 
                username: req.session.username, 
                role: req.session.role 
            } 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Start server
app.listen(PORT, async () => {
    await initDatabase();
    console.log(`Server running on http://localhost:${PORT}`);
});