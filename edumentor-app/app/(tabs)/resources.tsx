import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { Text, TextInput, Card, Button } from 'react-native-paper';
import { getAuthSession } from '../../services/authStorage';
import { apiFetch } from '../../services/api';

export default function ResourcesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadResources();
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
              <Button mode="outlined" style={styles.downloadBtn} labelStyle={{ fontSize: 10, paddingHorizontal: 0 }} onPress={() => handleOpen(item)}>
                Open
              </Button>
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
  }
});
