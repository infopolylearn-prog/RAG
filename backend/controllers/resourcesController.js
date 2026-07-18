const { uploadFileToSupabase, deleteFileFromSupabase } = require('../services/storageService');
const { supabase } = require('../config/supabase');
const { createResource, getResources, getResourceById, deleteResource: deleteLocalResource } = require('../services/resourceStore');

async function uploadResource(req, res, next) {
    try {
        const { title, subject, course, file_url } = req.body;
        const metadata = {
            title: title || (req.file && req.file.originalname) || 'Study resource',
            subject: subject || 'General IT',
            course: course || 'Information Technology',
            file_url: file_url || ''
        };

        if (!req.file && !metadata.file_url) {
            return res.status(400).json({ error: 'Please provide a file or a resource URL.' });
        }

        if (req.file && process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
            const uploadResult = await uploadFileToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
            metadata.file_url = uploadResult.publicUrl;
        }

        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder') && metadata.file_url) {
            const { data, error } = await supabase
                .from('study_materials')
                .insert({
                    title: metadata.title,
                    subject: metadata.subject,
                    course: metadata.course,
                    file_url: metadata.file_url
                })
                .select();

            if (error) throw error;

            return res.status(201).json({
                message: 'Resource uploaded successfully',
                resource: data[0]
            });
        }

        const resource = createResource(metadata);
        res.status(201).json({
            message: 'Resource uploaded successfully',
            resource
        });
    } catch (err) {
        next(err);
    }
}

async function listResources(req, res, next) {
    try {
        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
            const { data, error } = await supabase
                .from('study_materials')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) {
                return res.json(data || []);
            }
        }

        res.json(getResources());
    } catch (err) {
        res.json(getResources());
    }
}

async function getResource(req, res, next) {
    try {
        const { id } = req.params;

        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
            const { data, error } = await supabase
                .from('study_materials')
                .select('*')
                .eq('id', id)
                .single();

            if (!error && data) {
                return res.json(data);
            }
        }

        const resource = getResourceById(id);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.json(resource);
    } catch (err) {
        next(err);
    }
}

async function downloadResource(req, res, next) {
    try {
        const { id } = req.params;

        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
            const { data, error } = await supabase
                .from('study_materials')
                .select('file_url')
                .eq('id', id)
                .single();

            if (!error && data?.file_url) {
                return res.redirect(data.file_url);
            }
        }

        const resource = getResourceById(id);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.redirect(resource.file_url);
    } catch (err) {
        next(err);
    }
}

async function deleteResource(req, res, next) {
    try {
        const { id } = req.params;
        let deleted = false;

        if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
            const { error } = await supabase
                .from('study_materials')
                .delete()
                .eq('id', id);

            if (error) throw error;
            deleted = true;
        }

        if (!deleted) {
            deleteLocalResource(id);
        }

        res.json({ message: 'Resource deleted successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    uploadResource,
    listResources,
    getResource,
    downloadResource,
    deleteResource
};
