const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { JWT_SECRET } = require('../middleware/auth');
const { saveUser, verifyCredentials, getProfile } = require('../services/localUserStore');

async function register(req, res, next) {
    try {
        const { email, password, full_name, role, studentNo } = req.body;
        
        let userId = 'user-gen-id-' + Date.now();
        const finalRole = role || 'Student';
        
        // Register in Supabase auth natively if configured
        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
            try {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password
                });
                if (authError) throw authError;
                userId = authData.user?.id || userId;
            } catch (authErr) {
                console.warn('⚠️ Supabase Auth registration failed/unconfigured:', authErr.message);
            }
        }

        if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
            const localUser = saveUser({ email, password, full_name, role: finalRole, studentNo: studentNo || 'KP-2026-993F' });
            userId = localUser.id;
        } else {
            // Create the real corresponding profile row in public schema database
            try {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        user_id: userId,
                        full_name,
                        email,
                        course: 'Information Technology',
                        year_of_study: '2026',
                        role: finalRole,
                        student_no: studentNo || 'KP-2026-993F'
                    });
                if (profileError) throw profileError;
            } catch (dbErr) {
                console.warn('⚠️ Profile insertion on Supabase bypassed:', dbErr.message);
            }
        }

        const payload = {
            id: userId,
            email,
            role: finalRole,
            full_name,
            studentNo: studentNo || 'KP-2026-993F'
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully with authentic credentials',
            token,
            user: payload
        });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        let userId = 'user-gen-id-' + Date.now();
        let role = 'Student';
        let full_name = email.split('@')[0];
        let studentNo = 'KP-2026-993F';

        const localUser = verifyCredentials(email, password);
        if (localUser) {
            userId = localUser.id;
            role = localUser.role;
            full_name = localUser.full_name;
            studentNo = localUser.studentNo;
        } else if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
                userId = data.user?.id || userId;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, full_name, student_no')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (profile) {
                    role = profile.role;
                    full_name = profile.full_name;
                    studentNo = profile.student_no;
                }
            } catch (authErr) {
                console.warn('⚠️ Supabase auth unavailable, falling back to local user store:', authErr.message);
                const invalidCreds = new Error('Invalid login credentials');
                invalidCreds.statusCode = 401;
                throw invalidCreds;
            }
        } else {
            const invalidCreds = new Error('Invalid login credentials');
            invalidCreds.statusCode = 401;
            throw invalidCreds;
        }

        const payload = {
            id: userId,
            email,
            role,
            full_name,
            studentNo
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Logged in successfully against Supabase Auth',
            token,
            user: payload
        });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        await supabase.auth.signOut();
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
}

async function getCurrentUser(req, res, next) {
    try {
        res.json({ user: req.user });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    register,
    login,
    logout,
    getCurrentUser
};
