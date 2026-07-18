const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const resourceStore = {
  study_materials: []
};

function getResources() {
  return [...resourceStore.study_materials];
}

function createResource(data) {
  const resource = {
    id: generateId(),
    title: data.title || data.name || 'Study Resource',
    subject: data.subject || 'General IT',
    course: data.course || 'Information Technology',
    file_url: data.file_url || data.download_url || data.url || '',
    createdAt: new Date().toISOString()
  };
  resourceStore.study_materials.unshift(resource);
  return resource;
}

function getResourceById(id) {
  return resourceStore.study_materials.find(item => item.id === id) || null;
}

function deleteResource(id) {
  const index = resourceStore.study_materials.findIndex(item => item.id === id);
  if (index === -1) return false;
  resourceStore.study_materials.splice(index, 1);
  return true;
}

module.exports = {
  getResources,
  createResource,
  getResourceById,
  deleteResource
};
