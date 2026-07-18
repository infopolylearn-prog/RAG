import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { Text, TextInput, Card, Button, IconButton } from 'react-native-paper';
import { getAuthSession } from '../../services/authStorage';
import { apiFetch } from '../../services/api';

export default function ResourcesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadResources();
    loadUserRole();
  }, []);

  const loadResources = async () => {
    const session = await getAuthSession();
    if (!session?.token) return;

    setLoading(true);
    try {
      const { response, data } = await apiFetch('/api/resources', {}, session.token);
      if (response.ok && Array.isArray(data)) {
        setResources(data);
      }
    } catch (err) {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    const session = await getAuthSession();
    setIsAdmin(session?.user?.role === 'Admin');
  };

  const handleAddResource = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      setStatusMessage('Title and link are required to publish a resource.');
      return;
    }

    const session = await getAuthSession();
    if (!session?.token) {
      setStatusMessage('Authentication required to publish resources.');
      return;
    }

    setUploading(true);
    setStatusMessage('');

    try {
      const { response, data } = await apiFetch(
        '/api/resources/upload',
        {
          method: 'POST',
          body: JSON.stringify({
            title: newTitle.trim(),
            subject: newSubject.trim() || 'General IT',
            course: newCourse.trim() || 'Information Technology',
            file_url: newUrl.trim()
          })
        },
        session.token
      );

      if (response.ok) {
        setResources(prev => [data.resource || data, ...prev]);
        setNewTitle('');
        setNewSubject('');
        setNewCourse('');
        setNewUrl('');
        setStatusMessage('Resource added successfully.');
      } else {
        setStatusMessage(data?.error || 'Unable to add resource.');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Unable to reach backend.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    const session = await getAuthSession();
    if (!session?.token) return;

    try {
      const { response } = await apiFetch(`/api/resources/${id}`, { method: 'DELETE' }, session.token);
      if (response.ok) {
        setResources(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      // ignore deletion failures for now
    }
  };

  const handleOpen = async (resource: any) => {
    const session = await getAuthSession();
    if (!session?.token) return;

    const url = resource.file_url || resource.download_url || resource.url;
    if (url) {
      await Linking.openURL(url);
    }
  };

  const filtered = resources.filter(res =>
    (res.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Resources</Text>
        <Text style={styles.subtitle}>Browse syllabi, notes, past papers, and slides</Text>
      </View>

      <TextInput
        placeholder="Search documents..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.search}
        mode="outlined"
        theme={{ colors: { primary: '#4f46e5' }}}
      />

      {isAdmin && (
        <Card style={styles.adminSection}>
          <Card.Content>
            <Text style={styles.sectionHeader}>Admin Resource Publisher</Text>
            <TextInput
              label="Document Title"
              value={newTitle}
              onChangeText={setNewTitle}
              mode="outlined"
              style={styles.adminInput}
              textColor="#fff"
              activeOutlineColor="#4f46e5"
            />
            <TextInput
              label="Subject"
              value={newSubject}
              onChangeText={setNewSubject}
              mode="outlined"
              style={styles.adminInput}
              textColor="#fff"
              activeOutlineColor="#4f46e5"
            />
            <TextInput
              label="Course"
              value={newCourse}
              onChangeText={setNewCourse}
              mode="outlined"
              style={styles.adminInput}
              textColor="#fff"
              activeOutlineColor="#4f46e5"
            />
            <TextInput
              label="Document URL"
              value={newUrl}
              onChangeText={setNewUrl}
              mode="outlined"
              style={styles.adminInput}
              textColor="#fff"
              activeOutlineColor="#4f46e5"
            />
            <Button mode="contained" onPress={handleAddResource} loading={uploading} style={styles.addResourceBtn}>
              Publish Resource
            </Button>
            {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}
          </Card.Content>
        </Card>
      )}

      <View style={styles.list}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator animating color="#4f46e5" />
            <Text style={styles.docMeta}>Loading resources...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <Text style={styles.docMeta}>No resources are available yet.</Text>
        ) : filtered.map((item, idx) => (
          <Card key={item.id || idx} style={styles.card}>
            <Card.Content style={styles.cardRow}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>📄</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.docTitle}>{item.title || 'Study material'}</Text>
                <Text style={styles.docMeta}>{item.subject || 'General'} • {item.course || 'IT'}</Text>
              </View>
              <View style={styles.resourceActions}>
                <Button mode="outlined" style={styles.downloadBtn} labelStyle={{ fontSize: 10, paddingHorizontal: 0 }} onPress={() => handleOpen(item)}>
                  Open
                </Button>
                {isAdmin && (
                  <IconButton
                    icon="trash-can-outline"
                    iconColor="#ef4444"
                    size={18}
                    onPress={() => handleDeleteResource(item.id)}
                    style={styles.deleteIcon}
                  />
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    padding: 16
  },
  header: {
    marginTop: 40,
    marginBottom: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2
  },
  search: {
    backgroundColor: '#1e293b',
    marginBottom: 15
  },
  list: {
    gap: 10
  },
  card: {
    backgroundColor: '#1e293b',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 12
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    fontSize: 18
  },
  info: {
    flex: 1,
    marginLeft: 12
  },
  docTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  docMeta: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  downloadBtn: {
    borderColor: '#4f46e5',
    borderRadius: 8
  },
  adminSection: {
    marginBottom: 20,
    backgroundColor: '#111827',
    borderColor: 'rgba(79, 70, 229, 0.15)',
    borderWidth: 1
  },
  sectionHeader: {
    color: '#ffffff',
    marginBottom: 12,
    fontWeight: '700',
    fontSize: 14
  },
  adminInput: {
    backgroundColor: '#111827',
    marginBottom: 12
  },
  addResourceBtn: {
    marginTop: 8,
    borderRadius: 8
  },
  statusMessage: {
    marginTop: 10,
    color: '#94a3b8',
    fontSize: 12
  },
  resourceActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  deleteIcon: {
    marginLeft: 8,
    backgroundColor: 'transparent'
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12
  }
});
