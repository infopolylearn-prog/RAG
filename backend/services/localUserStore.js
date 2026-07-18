const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const storageFile = path.join(__dirname, '..', 'data', 'local-users.json');
const usersByEmail = new Map();
const profilesByUserId = new Map();

const seedUsers = [
    {
        email: 'verifyuser@example.com',
        password: 'StrongPass123!',
        full_name: 'Verify User',
        role: 'Student',
        studentNo: 'KP-VERIFY-001'
    },
    {
        email: 'persist@example.com',
        password: 'Pass123!',
        full_name: 'Persist User',
        role: 'Student',
        studentNo: 'KP-PERSIST-001'
    }
];

function ensureStorageFile() {
    const dir = path.dirname(storageFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(storageFile)) {
        fs.writeFileSync(storageFile, JSON.stringify({ users: [], profiles: [] }, null, 2));
    }
}

function loadState() {
    ensureStorageFile();
    try {
        const raw = fs.readFileSync(storageFile, 'utf8');
        const parsed = JSON.parse(raw);
        const users = parsed.users || [];
        const profiles = parsed.profiles || [];
        users.forEach(user => usersByEmail.set(normalizeEmail(user.email), user));
        profiles.forEach(profile => profilesByUserId.set(profile.user_id, profile));
    } catch (err) {
        console.warn('⚠️ Failed to load local auth store from disk:', err.message);
    }

    seedUsers.forEach(user => {
        const normalizedEmail = normalizeEmail(user.email);
        if (!usersByEmail.has(normalizedEmail)) {
            saveUser(user);
        }
    });
}

function saveState() {
    ensureStorageFile();
    const users = Array.from(usersByEmail.values());
    const profiles = Array.from(profilesByUserId.values());
    fs.writeFileSync(storageFile, JSON.stringify({ users, profiles }, null, 2));
}

loadState();

function normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
}

function createUserId(email) {
    return `local-${crypto.createHash('sha256').update(email).digest('hex').slice(0, 12)}`;
}

function saveUser({ email, password, full_name, role, studentNo }) {
    const normalizedEmail = normalizeEmail(email);
    const userId = createUserId(normalizedEmail);
    const record = {
        id: userId,
        email: normalizedEmail,
        password,
        full_name: full_name || normalizedEmail.split('@')[0],
        role: role || 'Student',
        studentNo: studentNo || 'KP-LOCAL-001'
    };

    usersByEmail.set(normalizedEmail, record);
    const profile = {
        user_id: userId,
        full_name: record.full_name,
        email: normalizedEmail,
        course: 'Information Technology',
        year_of_study: '2026',
        role: record.role,
        student_no: record.studentNo
    };
    profilesByUserId.set(userId, profile);
    saveState();

    return record;
}

function verifyCredentials(email, password) {
    const normalizedEmail = normalizeEmail(email);
    const user = usersByEmail.get(normalizedEmail);
    if (!user) return null;
    if (password === undefined || password === null || password === '') return null;
    if (user.password !== password) return null;
    return user;
}

function getProfile(userId) {
    return profilesByUserId.get(userId) || null;
}

function upsertProfile(userId, profile) {
    const existing = profilesByUserId.get(userId) || {};
    const merged = {
        ...existing,
        user_id: userId,
        ...profile,
        email: profile.email || existing.email || ''
    };
    profilesByUserId.set(userId, merged);
    saveState();
    return merged;
}

module.exports = {
    saveUser,
    verifyCredentials,
    getProfile,
    upsertProfile
};
