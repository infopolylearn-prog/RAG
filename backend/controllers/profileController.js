const { supabase } = require('../config/supabase');
const { getProfile: getLocalProfile, upsertProfile } = require('../services/localUserStore');

async function getProfile(req, res, next) {
    try {
        const userId = req.user ? req.user.id : null;
        
        let data = null;

        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            data = profileData;
        } else {
            data = getLocalProfile(userId);
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

        let data;

        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
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

            if (error) throw error;
            data = profileData;
        } else {
            data = upsertProfile(userId, { full_name, course, year_of_study });
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
