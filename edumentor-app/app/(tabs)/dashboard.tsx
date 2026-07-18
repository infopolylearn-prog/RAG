import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, Card, ProgressBar, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getAuthSession } from '../../services/authStorage';
import { apiFetch } from '../../services/api';

interface VideoTutorial {
  id: string | number;
  title: string;
  module_name: string;
  topic_name: string;
  video_url: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [tutorials, setTutorials] = useState<VideoTutorial[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>({
    streakDays: 0,
    activeCoursesCount: 0,
    queriesCount: 0,
    recommendedTopics: [],
    upcomingExam: null
  });
  const [userRole, setUserRole] = useState('Student');

  useEffect(() => {
    fetchDashboard();
    fetchTutorials();
    fetchCourses();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const session = await getAuthSession();
    setUserRole((session?.user?.role || 'Student').toString());
  };

  const fetchDashboard = async () => {
    const session = await getAuthSession();
    if (!session?.token) return;
    try {
      const { response, data } = await apiFetch('/api/dashboard/student', {}, session.token);
      if (response.ok) {
        setDashboardMetrics(data);
      }
    } catch (err) {
      // keep default dashboard metrics
    }
  };

  const fetchCourses = async () => {
    const session = await getAuthSession();
    if (!session?.token) return;
    try {
      const { response, data } = await apiFetch('/api/admin/courses', {}, session.token);
      if (response.ok && Array.isArray(data)) {
        setCourses(data);
      }
    } catch (err) {
      setCourses([]);
    }
  };

  const fetchTutorials = async () => {
    const session = await getAuthSession();
    if (!session?.token) return;

    try {
      const { response, data } = await apiFetch('/api/admin/tutorials', {}, session.token);
      if (response.ok && Array.isArray(data)) {
        setTutorials(data);
        return;
      }
    } catch (err) {
      setTutorials([]);
    }
  };

  const watchVideo = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.container}>
      {/* Premium IT Student Welcome Panel */}
      <View style={styles.itGreeting}>
        <Text style={styles.itGreetTitle}>Welcome back, {userRole}! 👋</Text>
        <Text style={styles.itGreetSub}>Kwekwe Poly Information Technology • Division of CS & IS</Text>
        <View style={styles.focusPill}>
          <Text style={styles.focusPillText}>💻 Focus Area: Database Systems & Software Engineering</Text>
        </View>
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.greet}>EduMentor Hub</Text>
          <Text style={styles.role}>{userRole === 'Lecturer' ? 'Lecturer Workspace' : 'Student Workspace'}</Text>
        </View>
        <View style={styles.streak}>
          <Text style={styles.streakText}>
            🔥 {dashboardMetrics.streakDays > 0 ? `${dashboardMetrics.streakDays} Days` : 'Start your first study streak'}
          </Text>
        </View>
      </View>

      <Card style={[styles.card, styles.hero]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.heroTitle}>Ask your Academic Assistant</Text>
          <Text style={styles.heroDesc}>Gemini-powered syllabus and notes semantic lookup</Text>
          <Button
            mode="contained"
            style={styles.chatBtn}
            onPress={() => router.push('/(tabs)/chat')}
          >
            Launch AI Chat Tutor
          </Button>
        </Card.Content>
      </Card>

      {/* DYNAMIC VIDEO TUTORIALS FEED */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionText}>🎥 Video Tutorials Hub</Text>
        <Text style={styles.adminBadge}>Admin Verified</Text>
      </View>

      {tutorials.length === 0 ? (
        <Card style={[styles.card, styles.emptyStateCard]}>
          <Card.Content>
            <Text style={styles.emptyStateTitle}>No admin tutorials available</Text>
            <Text style={styles.emptyStateText}>The admin can publish course tutorials and video lessons for the study hub.</Text>
          </Card.Content>
        </Card>
      ) : (
        tutorials.map((t) => (
          <Card key={t.id} style={styles.tutorialCard}>
            <Card.Content style={styles.tutorialContent}>
              <View style={styles.playIconContainer}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <View style={styles.tutorialDetails}>
                <Text style={styles.moduleTag}>{t.module_name}</Text>
                <Text style={styles.tutorialTitle}>{t.title}</Text>
                <Text style={styles.topicLabel}>Topic: {t.topic_name}</Text>
              </View>
              <Button
                mode="contained"
                compact
                style={styles.watchBtn}
                labelStyle={styles.watchBtnLabel}
                onPress={() => watchVideo(t.video_url)}
              >
                Watch
              </Button>
            </Card.Content>
          </Card>
        ))
      )}

      <View style={styles.sectionTitle}>
        <Text style={styles.sectionText}>My Active Courses</Text>
      </View>

      {courses.length === 0 ? (
        <Card style={[styles.card, styles.emptyStateCard]}>
          <Card.Content>
            <Text style={styles.emptyStateTitle}>No admin courses published yet</Text>
            <Text style={styles.emptyStateText}>Courses will appear here once the administrator publishes syllabi and modules.</Text>
          </Card.Content>
        </Card>
      ) : (
        courses.map(course => (
          <Card key={course.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.courseCode}>{course.title}</Text>
              <Text style={styles.courseTitle}>{course.description || 'Admin published course details'}</Text>
              <Text style={styles.percent}>{course.modules.length} module(s) published</Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    padding: 16
  },
  itGreeting: {
    marginTop: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10
  },
  itGreetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'System'
  },
  itGreetSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4
  },
  focusPill: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: 'flex-start'
  },
  focusPillText: {
    color: '#c084fc',
    fontSize: 10,
    fontWeight: '700'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14
  },
  greet: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9'
  },
  role: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  streak: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  streakText: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 11
  },
  card: {
    backgroundColor: '#1e293b',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12
  },
  hero: {
    backgroundColor: '#312e81'
  },
  heroTitle: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  heroDesc: {
    color: '#c7d2fe',
    fontSize: 11,
    marginVertical: 10
  },
  chatBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    marginTop: 5
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12
  },
  sectionTitle: {
    marginVertical: 12
  },
  sectionText: {
    color: '#cbd5e1',
    fontWeight: 'bold',
    fontSize: 15
  },
  adminBadge: {
    fontSize: 10,
    color: '#818cf8',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700'
  },
  tutorialCard: {
    backgroundColor: '#111b2e',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8
  },
  tutorialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  playIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playIcon: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold'
  },
  tutorialDetails: {
    flex: 1
  },
  moduleTag: {
    fontSize: 9,
    color: '#818cf8',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  tutorialTitle: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '800',
    marginVertical: 2
  },
  topicLabel: {
    fontSize: 10,
    color: '#94a3b8'
  },
  watchBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 8
  },
  watchBtnLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginHorizontal: 8
  },
  courseCode: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700'
  },
  courseTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginVertical: 4
  },
  progress: {
    height: 6,
    borderRadius: 3,
    marginTop: 8
  },
  percent: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 6
  },
  metricsCard: {
    backgroundColor: '#1e293b',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 14
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10
  },
  metricTile: {
    flex: 1,
    backgroundColor: 'rgba(79, 70, 229, 0.12)',
    borderRadius: 12,
    padding: 12
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 4
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  metricNote: {
    color: '#c7d2fe',
    fontSize: 11,
    marginBottom: 12
  },
  adminPanelBtn: {
    borderColor: '#4f46e5',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4
  },
  emptyStateCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12
  },
  emptyStateTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 12
  }
});
