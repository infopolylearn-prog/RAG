const { supabase } = require('../config/supabase');
const { getProfile: getLocalProfile, upsertProfile } = require('../services/localUserStore');

async function getProfile(req, res, next) {
    try {
        const userId = req.user ? req.user.id : null;

        let data = getLocalProfile(userId);

        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder') && userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
            try {
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (!error && profileData) {
                    data = profileData;
                }
            } catch (supabaseErr) {
                console.warn('⚠️ Supabase profile lookup failed, using local fallback:', supabaseErr.message);
            }
        }

        if (!data) {
            return res.status(404).json({ error: 'Profile not found for this authenticated user.' });
        }

        res.json(data);
    } catch (err) {
        next(err);
    }
}

async function updateProfile(req, res, next) {
    try {
        const userId = req.user ? req.user.id : null;
        const { full_name, course, year_of_study } = req.body;

        let data = upsertProfile(userId, { full_name, course, year_of_study });

        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder') && userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
            try {
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .upsert({
                        user_id: userId,
                        full_name,
                        course,
                        year_of_study
                    })
                    .select()
                    .single();

                if (!error && profileData) {
                    data = profileData;
                }
            } catch (supabaseErr) {
                console.warn('⚠️ Supabase profile update failed, using local fallback:', supabaseErr.message);
            }
        }

        res.json({ message: 'Profile updated successfully', profile: data });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getProfile,
    updateProfile
};
