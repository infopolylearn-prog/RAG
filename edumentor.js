/* EduMentor AI Android Mobile Simulator - Kwekwe Poly Controller Logic */
class EduMentorSimulator {
    constructor() {
        this.currentTheme = 'dark';
        this.currentPersona = 'Student'; // Student, Lecturer, Admin
        this.currentUser = {
            name: 'Demo Student',
            username: 'student@kwekwe.ac.zw',
            studentNo: 'KP-2026-993F',
            role: 'Student'
        };
        this.currentActiveTab = 'dashboard';
        this.streakCount = 0;
        this.isPoweredOn = true;
        this.notificationsOpen = false;
        this.apiBaseUrl = 'https://edumentor-backend-fbe9.onrender.com';
        this.authToken = localStorage.getItem('edumentor-auth-token') || '';
        this.authUser = null;

        // Mock Web Audio API Synth Context
        this.audioCtx = null;

        this.courses = [];
        this.courseModules = [];
        this.courseTitle = 'Admin-managed course';
        this.courseDescription = 'Lessons and study resources published by the admin.';

        this.videoTutorials = [];
        this.documentsRegistry = [];
        this.studyHubItems = [];
        this.revisionItems = [];

        this.notifications = [];
        this.chatQueries = [];
        this.bookmarks = [];
        this.downloads = [];
        this.plannerTasks = [];

        this.users = [
            { name: 'Joshua Webs Administrator', username: 'joshwebsinfo@gmail.com', role: 'Admin', studentNo: 'N/A' },
            { name: 'Prof. Alistair Chen', username: 'chen@kwekwe.ac.zw', role: 'Lecturer', studentNo: 'N/A' },
            { name: 'Demo Student', username: 'student@kwekwe.ac.zw', role: 'Student', studentNo: 'KP-2026-993F' }
        ];

        this.departments = [];
        this.adminActiveSubTab = 'users';
        this.loadStoredState();
    }

    loadStoredState() {
        try {
            const raw = localStorage.getItem('edumentor-admin-state');
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (Array.isArray(saved.courses)) this.courses = saved.courses;
            if (Array.isArray(saved.courseModules)) this.courseModules = saved.courseModules;
            if (saved.courseTitle) this.courseTitle = saved.courseTitle;
            if (saved.courseDescription) this.courseDescription = saved.courseDescription;
            if (Array.isArray(saved.videoTutorials)) this.videoTutorials = saved.videoTutorials;
            if (Array.isArray(saved.documentsRegistry)) this.documentsRegistry = saved.documentsRegistry;
            if (Array.isArray(saved.studyHubItems)) this.studyHubItems = saved.studyHubItems;
            if (Array.isArray(saved.revisionItems)) this.revisionItems = saved.revisionItems;
            if (Array.isArray(saved.notifications)) this.notifications = saved.notifications;
            if (Array.isArray(saved.chatQueries)) this.chatQueries = saved.chatQueries;
            if (Array.isArray(saved.bookmarks)) this.bookmarks = saved.bookmarks;
            if (Array.isArray(saved.downloads)) this.downloads = saved.downloads;
            if (Array.isArray(saved.plannerTasks)) this.plannerTasks = saved.plannerTasks;
            if (Array.isArray(saved.users)) this.users = saved.users;
            if (Array.isArray(saved.departments)) this.departments = saved.departments;
        } catch (err) {
            console.warn('Unable to restore saved EduMentor state', err);
        }
    }

    persistState() {
        try {
            const state = {
                courses: this.courses,
                courseModules: this.courseModules,
                courseTitle: this.courseTitle,
                courseDescription: this.courseDescription,
                videoTutorials: this.videoTutorials,
                documentsRegistry: this.documentsRegistry,
                studyHubItems: this.studyHubItems,
                revisionItems: this.revisionItems,
                notifications: this.notifications,
                chatQueries: this.chatQueries,
                bookmarks: this.bookmarks,
                downloads: this.downloads,
                plannerTasks: this.plannerTasks,
                users: this.users,
                departments: this.departments
            };
            localStorage.setItem('edumentor-admin-state', JSON.stringify(state));
        } catch (err) {
            console.warn('Unable to save EduMentor state', err);
        }
    }

    getApiUrl(path) {
        return `${this.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    }

    getAuthHeaders(includeJson = true) {
        const headers = {};
        if (this.authToken) {
            headers.Authorization = `Bearer ${this.authToken}`;
        }
        if (includeJson) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    async init() {
        this.setupClock();
        await this.fetchVideoTutorials();
        await this.fetchPlannerTasks();
        if (this.authToken) {
            try {
                const res = await fetch(this.getApiUrl('/api/auth/me'), { headers: this.getAuthHeaders(false) });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.user) {
                        this.authUser = data.user;
                        this.currentUser = {
                            name: data.user.full_name || data.user.email || 'User',
                            username: data.user.email || '',
                            studentNo: data.user.studentNo || 'KP-2026-993F',
                            role: data.user.role || 'Student'
                        };
                        this.currentPersona = this.currentUser.role;
                    }
                }
            } catch (err) {
                console.warn('Unable to restore saved auth session', err);
            }
        }
        this.renderAllViews();
        this.setupChatAutoResize();
        this.playHapticSound(600, 0.08); // Initial startup beep
        setTimeout(() => {
            const splash = document.getElementById('screen-splash');
            const onboard = document.getElementById('screen-onboarding');
            if (splash && onboard) {
                splash.classList.remove('active');
                onboard.classList.add('active');
            }
        }, 1500);
    }

    async fetchVideoTutorials() {
        try {
            const res = await fetch(this.getApiUrl('/api/video_tutorials'));
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    this.videoTutorials = data;
                }
            }
        } catch (err) {
            console.error('Error fetching tutorials from live backend:', err);
        }
    }

    async fetchPlannerTasks() {
        try {
            const res = await fetch(this.getApiUrl('/api/planner_tasks'));
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    this.plannerTasks = data.map(item => ({
                        id: item.id,
                        text: item.task_text,
                        priority: item.priority || 'medium',
                        completed: item.completed == 1 || item.completed === true
                    }));
                }
            }
        } catch (err) {
            console.error('Error fetching planner tasks from live backend:', err);
        }
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const clockEl = document.getElementById('phone-clock');
            if (clockEl) clockEl.innerText = timeStr;
        };
        updateClock();
        setInterval(updateClock, 30000);
    }

    // Audio Haptic generator using Web Audio API
    playHapticSound(freq = 440, duration = 0.1, type = 'sine') {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
            
            gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            // Audio context not allowed or blocked
        }
    }

    playHapticSuccess() {
        this.playHapticSound(520, 0.08);
        setTimeout(() => this.playHapticSound(650, 0.08), 80);
    }

    playHapticNotification() {
        this.playHapticSound(440, 0.05);
        setTimeout(() => this.playHapticSound(554, 0.05), 60);
        setTimeout(() => this.playHapticSound(659, 0.1), 120);
    }

    showToast(message) {
        const toast = document.getElementById('toast-alert');
        const text = document.getElementById('toast-message-text');
        if (toast && text) {
            text.innerText = message;
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }

    escapeHtml(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Theme Switcher Controller
    toggleSimulatorTheme() {
        const body = document.body;
        this.playHapticSound(800, 0.05);
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            this.currentTheme = 'light';
            this.showToast('Theme switched to Light mode');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            this.currentTheme = 'dark';
            this.showToast('Theme switched to Dark mode');
        }
    }

    resetSimulator() {
        this.playHapticSound(300, 0.2, 'sawtooth');
        this.showToast('Resetting simulator...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    // Tab view switcher
    switchTab(tabId) {
        if (this.currentActiveTab === tabId) return;
        this.playHapticSound(480, 0.03);
        this.currentActiveTab = tabId;

        // Hide notification overlay if switching tabs
        const notifPane = document.getElementById('notif-pane');
        if (notifPane) {
            notifPane.classList.add('hidden');
            this.notificationsOpen = false;
        }

        const screens = document.querySelectorAll('.tab-view');
        screens.forEach(s => s.classList.remove('active'));

        const activeView = document.getElementById(`view-${tabId}`);
        if (activeView) activeView.classList.add('active');

        const tabBtns = document.querySelectorAll('.nav-tab');
        tabBtns.forEach(btn => btn.classList.remove('active'));

        const activeTabBtn = document.getElementById(`tab-${tabId}`);
        if (activeTabBtn) activeTabBtn.classList.add('active');

        // Scroll to bottom of chat if switching to AI Tutor tab
        if (tabId === 'chat') {
            const box = document.getElementById('chat-messages-box');
            if (box) {
                setTimeout(() => box.scrollTop = box.scrollHeight, 100);
            }
        }
    }

    // Persona controller
    switchPersona(persona) {
        this.playHapticSuccess();
        this.currentPersona = persona;

        document.querySelectorAll('.btn-persona').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`btn-persona-${persona.toLowerCase()}`);
        if (activeBtn) activeBtn.classList.add('active');

        // Set user simulation defaults based on persona
        if (persona === 'Student') {
            this.currentUser = {
                name: 'Demo Student',
                username: 'student@kwekwe.ac.zw',
                studentNo: 'KP-2026-993F',
                role: 'Student'
            };
        } else if (persona === 'Lecturer') {
            this.currentUser = {
                name: 'Prof. Alistair Chen',
                username: 'chen@kwekwe.ac.zw',
                studentNo: 'N/A',
                role: 'Lecturer'
            };
        } else {
            this.currentUser = {
                name: 'Joshua Webs Administrator',
                username: 'joshwebsinfo@gmail.com',
                studentNo: 'N/A',
                role: 'Admin'
            };
        }

        this.showToast(`Swapped to simulated ${persona} workflow`);
        this.renderAllViews();
        this.switchTab(persona === 'Admin' ? 'admin' : 'dashboard');
    }

    // Auth screen controller
    switchAuthForm(formId) {
        this.playHapticSound(500, 0.05);
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${formId}-form`).classList.add('active');
    }

    bypassOnboarding() {
        this.playHapticSuccess();
        document.getElementById('screen-onboarding').classList.remove('active');
        document.getElementById('screen-auth').classList.add('active');
    }

    nextOnboardingSlide() {
        const slides = document.querySelectorAll('.onboard-slide');
        const dots = document.querySelectorAll('.carousel-dot');
        let activeIdx = 0;

        slides.forEach((slide, idx) => {
            if (slide.classList.contains('active')) activeIdx = idx;
        });

        const nextIdx = (activeIdx + 1) % slides.length;
        this.playHapticSound(550, 0.05);

        if (activeIdx === slides.length - 1) {
            this.bypassOnboarding();
            return;
        }

        slides[activeIdx].classList.remove('active');
        dots[activeIdx].classList.remove('active');

        slides[nextIdx].classList.add('active');
        dots[nextIdx].classList.add('active');
    }

    async handleLogin(event) {
        event.preventDefault();
        const userVal = document.getElementById('login-username').value.trim();
        const passVal = document.getElementById('login-password').value;

        const normalizedEmail = userVal.toLowerCase();
        const candidateEmails = [normalizedEmail];
        if (normalizedEmail === 'joshwebsinfo@gmail.com' || normalizedEmail === 'joshua@gmail.com') {
            candidateEmails.push('joshua@gmail.com');
            candidateEmails.push('joshwebsinfo@gmail.com');
        }

        this.playHapticSound(500, 0.04);
        try {
            let lastError = null;
            for (const email of [...new Set(candidateEmails)]) {
                const res = await fetch(this.getApiUrl('/api/auth/login'), {
                    method: 'POST',
                    headers: this.getAuthHeaders(true),
                    body: JSON.stringify({ email, password: passVal })
                });
                const data = await res.json().catch(() => ({}));

                if (res.ok && data?.token && data?.user) {
                    this.authToken = data.token;
                    this.authUser = data.user;
                    localStorage.setItem('edumentor-auth-token', data.token);
                    localStorage.setItem('edumentor-auth-user', JSON.stringify(data.user));

                    this.currentUser = {
                        name: data.user.full_name || data.user.email || userVal,
                        username: data.user.email || userVal,
                        studentNo: data.user.studentNo || 'KP-2026-993F',
                        role: data.user.role || 'Student'
                    };
                    this.currentPersona = this.currentUser.role;
                    this.playHapticSuccess();
                    this.showToast(this.currentUser.role === 'Admin' ? 'Admin access granted' : `Logged in as ${this.currentUser.role}`);

                    document.getElementById('screen-auth').classList.remove('active');
                    document.getElementById('screen-shell').classList.add('active');
                    this.renderAllViews();
                    this.switchTab(this.currentUser.role === 'Admin' ? 'admin' : 'dashboard');
                    return;
                }

                lastError = new Error(data?.message || 'Authentication failed');
            }

            throw lastError || new Error('Authentication failed');
        } catch (err) {
            this.playHapticSound(280, 0.08, 'sawtooth');
            this.showToast(err.message || 'Unable to reach the live backend');
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const nameVal = document.getElementById('register-name').value.trim();
        const emailVal = document.getElementById('register-email').value.trim();
        const studentNoVal = document.getElementById('register-student-no').value.trim();
        const passVal = document.getElementById('register-password').value;

        this.playHapticSound(500, 0.04);
        try {
            const res = await fetch(this.getApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: this.getAuthHeaders(true),
                body: JSON.stringify({ email: emailVal, password: passVal, full_name: nameVal, role: 'Student', studentNo: studentNoVal })
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.token || !data?.user) {
                throw new Error(data?.message || 'Registration failed');
            }

            this.authToken = data.token;
            this.authUser = data.user;
            localStorage.setItem('edumentor-auth-token', data.token);
            localStorage.setItem('edumentor-auth-user', JSON.stringify(data.user));

            this.currentUser = {
                name: data.user.full_name || nameVal,
                username: data.user.email || emailVal,
                studentNo: data.user.studentNo || studentNoVal,
                role: data.user.role || 'Student'
            };
            this.currentPersona = 'Student';
            this.playHapticSuccess();
            this.showToast(`Account ${studentNoVal} created successfully!`);

            document.getElementById('screen-auth').classList.remove('active');
            document.getElementById('screen-shell').classList.add('active');
            this.renderAllViews();
            this.switchTab('dashboard');
        } catch (err) {
            this.playHapticSound(280, 0.08, 'sawtooth');
            this.showToast(err.message || 'Unable to register through the live backend');
        }
    }

    handleForgot(event) {
        event.preventDefault();
        this.playHapticSuccess();
        this.showToast('Reset email sent to your academic inbox!');
        this.switchAuthForm('login');
    }

    logout() {
        this.playHapticSound(350, 0.1);
        this.showToast('Logged out successfully');
        document.getElementById('screen-shell').classList.remove('active');
        document.getElementById('screen-auth').classList.add('active');
        this.switchAuthForm('login');
    }

    // Dynamic Course modules management
    adminAddCourse(event) {
        event.preventDefault();
        const titleInput = document.getElementById('admin-add-course-title');
        const descriptionInput = document.getElementById('admin-add-course-description');

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (title) {
            this.courses.unshift({
                id: Date.now(),
                title,
                description: description || 'Admin-managed course published to all users.',
                modules: []
            });

            titleInput.value = '';
            descriptionInput.value = '';

            this.playHapticSuccess();
            this.persistState();
            this.renderAllViews();
            this.showToast(`Course ${title} published to everyone.`);
            this.addNotification(`📚 New course published: ${title}`);
        }
    }

    adminAddModule(event) {
        event.preventDefault();
        const titleInput = document.getElementById('admin-add-module-title');
        const topicInput = document.getElementById('admin-add-module-topic');

        const title = titleInput.value.trim();
        const topic = topicInput.value.trim();

        if (title && topic) {
            if (this.courses.length === 0) {
                this.courses.unshift({
                    id: Date.now(),
                    title: this.courseTitle,
                    description: this.courseDescription,
                    modules: []
                });
            }

            const targetCourse = this.courses[0];
            targetCourse.modules.push({
                title: title,
                topics: [topic]
            });
            this.courseModules = targetCourse.modules;

            titleInput.value = '';
            topicInput.value = '';

            this.playHapticSuccess();
            this.persistState();
            this.showToast('New module added and synchronized across the platform.');
            this.addNotification(`📚 New module added: ${title}`);
            this.renderAllViews();
        }
    }

    adminAddResource(event) {
        event.preventDefault();
        const titleInput = document.getElementById('admin-add-resource-title');
        const typeInput = document.getElementById('admin-add-resource-type');
        const contentInput = document.getElementById('admin-add-resource-content');
        const linkInput = document.getElementById('admin-add-resource-link');

        const title = titleInput.value.trim();
        const type = typeInput.value.trim();
        const content = contentInput.value.trim();
        const link = linkInput.value.trim();

        if (title && content) {
            this.documentsRegistry.unshift({
                id: Date.now(),
                title,
                type: type || 'notes',
                content,
                released: true,
                animClass: '',
                link: link || ''
            });

            titleInput.value = '';
            typeInput.value = 'notes';
            contentInput.value = '';
            linkInput.value = '';

            this.playHapticSuccess();
            this.persistState();
            this.renderAllViews();
            this.showToast(`Resource ${title} released to everyone.`);
            this.addNotification(`📄 New resource published: ${title}`);
        }
    }

    adminAddStudyHubItem(event) {
        event.preventDefault();
        const titleInput = document.getElementById('admin-add-study-title');
        const summaryInput = document.getElementById('admin-add-study-summary');

        const title = titleInput.value.trim();
        const summary = summaryInput.value.trim();

        if (title && summary) {
            this.studyHubItems.unshift({ id: Date.now(), title, summary });
            titleInput.value = '';
            summaryInput.value = '';
            this.playHapticSuccess();
            this.persistState();
            this.renderAllViews();
            this.showToast('Study hub item published.');
        }
    }

    adminAddRevisionItem(event) {
        event.preventDefault();
        const promptInput = document.getElementById('admin-add-revision-prompt');
        const answerInput = document.getElementById('admin-add-revision-answer');

        const prompt = promptInput.value.trim();
        const answer = answerInput.value.trim();

        if (prompt && answer) {
            this.revisionItems.unshift({ id: Date.now(), prompt, answer });
            promptInput.value = '';
            answerInput.value = '';
            this.playHapticSuccess();
            this.persistState();
            this.renderAllViews();
            this.showToast('Revision challenge published.');
        }
    }

    // Resources Release Controller (Fade)
    releaseResource(docId) {
        const doc = this.documentsRegistry.find(d => d.id === docId);
        if (doc) {
            doc.released = true;
            doc.animClass = 'fade-in-view'; // triggers the fade release CSS transition
            this.playHapticSuccess();
            this.showToast(`Released document: ${doc.title}`);
            this.addNotification(`📄 Academic notes released: ${doc.title}`);
            this.renderAllViews();
        }
    }

    // Toggle Notifications Pane
    toggleNotifications() {
        const pane = document.getElementById('notif-pane');
        this.playHapticSound(500, 0.05);
        if (pane) {
            if (this.notificationsOpen) {
                pane.classList.add('hidden');
                this.notificationsOpen = false;
            } else {
                pane.classList.remove('hidden');
                this.notificationsOpen = true;
                this.renderNotificationsList();
            }
        }
    }

    addNotification(text) {
        this.notifications.unshift({
            id: Date.now(),
            text: text,
            read: false
        });
        this.playHapticNotification();
        this.renderNotificationsList();
    }

    clearNotifications() {
        this.notifications = [];
        this.playHapticSound(300, 0.05);
        this.renderNotificationsList();
        this.showToast('All notifications cleared');
    }

    renderNotificationsList() {
        const list = document.getElementById('notif-list');
        const badge = document.getElementById('notif-badge');
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        if (badge) {
            if (unreadCount > 0) {
                badge.innerText = unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        if (list) {
            list.innerHTML = '';
            if (this.notifications.length === 0) {
                list.innerHTML = '<div class="empty-notifications">No new notifications</div>';
                return;
            }

            this.notifications.forEach(n => {
                const item = document.createElement('div');
                item.className = `notif-pane-item ${n.read ? 'read' : ''}`;
                item.innerHTML = `
                    <p class="notif-text">${n.text}</p>
                    <span class="notif-time">Just Now</span>
                `;
                item.onclick = () => {
                    n.read = true;
                    this.renderNotificationsList();
                };
                list.appendChild(item);
            });
        }
    }

    // Task Planner checklists
    async addTask(event) {
        event.preventDefault();
        const textInput = document.getElementById('new-task-text');
        const prioInput = document.getElementById('new-task-priority');

        const text = textInput.value.trim();
        const priority = prioInput.value;

        if (text) {
            const newTaskObj = {
                user_id: this.currentUser.username,
                task_text: text,
                priority: priority,
                completed: 0
            };

            this.plannerTasks.push({
                id: Date.now(),
                text: text,
                priority: priority,
                completed: false
            });

            this.playHapticSuccess();
            this.renderPlanner();
            this.showToast('Task added to your checklist');
            textInput.value = '';

            try {
                await fetch(this.getApiUrl('/api/planner_tasks'), {
                    method: 'POST',
                    headers: this.getAuthHeaders(true),
                    body: JSON.stringify(newTaskObj)
                });
            } catch (err) {
                console.error('Error saving task to Supabase/PostgreSQL:', err);
            }
        }
    }

    async toggleTask(taskId) {
        const task = this.plannerTasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.playHapticSound(task.completed ? 600 : 400, 0.05);
            this.renderPlanner();

            try {
                await fetch(this.getApiUrl(`/api/planner_tasks/${taskId}`), {
                    method: 'PUT',
                    headers: this.getAuthHeaders(true),
                    body: JSON.stringify({ completed: task.completed ? 1 : 0 })
                });
            } catch (err) {
                // Ignore fallback failures
            }
        }
    }

    async clearCompletedTasks() {
        const completedTasks = this.plannerTasks.filter(t => t.completed);
        this.plannerTasks = this.plannerTasks.filter(t => !t.completed);
        this.playHapticSound(300, 0.05);
        this.renderPlanner();
        this.showToast('Cleared completed items');

        for (const t of completedTasks) {
            try {
                await fetch(this.getApiUrl(`/api/planner_tasks/${t.id}`), { method: 'DELETE', headers: this.getAuthHeaders(true) });
            } catch (e) {
                // Ignore fallback failures
            }
        }
    }

    // Dynamic rendering functions
    renderAllViews() {
        this.renderDashboard();
        this.renderChatMessages();
        this.renderCourses();
        this.renderResources();
        this.renderPlanner();
        this.renderProfile();
        this.renderAdminSubTab();
        this.renderNotificationsList();
    }

    renderDashboard() {
        const focusEl = document.getElementById('study-focus-score');
        const focusBadge = document.getElementById('focus-badge');
        const publishedContentCount = this.videoTutorials.length + this.studyHubItems.length + this.revisionItems.length;
        if (focusEl) {
            const completed = this.plannerTasks.filter(task => task.completed).length;
            const total = this.plannerTasks.length;
            focusEl.innerText = total > 0 ? `${completed}/${total}` : `${publishedContentCount} live`;
        }
        if (focusBadge) {
            focusBadge.innerText = publishedContentCount > 0 ? 'Live content' : 'Awaiting admin';
        }

        const queriesEl = document.getElementById('dash-queries-count');
        if (queriesEl) queriesEl.innerText = `${this.chatQueries.length} Queries`;

        const coursesEl = document.getElementById('dash-courses-count');
        if (coursesEl) {
            const totalCourses = this.courses.length || (this.courseModules.length > 0 ? 1 : 0);
            coursesEl.innerText = `${totalCourses} ${totalCourses === 1 ? 'Course' : 'Courses'}`;
        }

        const feedContainer = document.getElementById('dashboard-tutorials-list');
        if (feedContainer) {
            feedContainer.innerHTML = '';
            if (this.videoTutorials.length === 0) {
                feedContainer.innerHTML = '<div class="empty-state-card"><strong>No tutorials published yet.</strong><p>Admin content appears here after it is shared with everyone.</p></div>';
            } else {
                this.videoTutorials.forEach(t => {
                    const card = document.createElement('div');
                    card.className = 'tutorial-card';
                    card.innerHTML = `
                        <div class="tutorial-icon">▶</div>
                        <div class="tutorial-details">
                            <div class="tutorial-module">${t.module_name || 'Admin published lesson'}</div>
                            <div class="tutorial-title">${t.title}</div>
                            <div class="tutorial-topic">Topic: ${t.topic_name || 'Shared by admin'}</div>
                        </div>
                        <a href="${t.video_url}" target="_blank" onclick="edumentor.playHapticSuccess();" class="tutorial-link">Watch</a>
                    `;
                    feedContainer.appendChild(card);
                });
            }
        }

        const topicsGrid = document.getElementById('dashboard-topics-grid');
        if (topicsGrid) {
            topicsGrid.innerHTML = '';
            const allTopics = this.courses.flatMap(course => (course.modules || []).flatMap(module => module.topics || []));
            if (allTopics.length === 0) {
                topicsGrid.innerHTML = '<div class="empty-topic-chip">Admin can publish topics for all learners.</div>';
            } else {
                allTopics.slice(0, 4).forEach(topic => {
                    const chip = document.createElement('button');
                    chip.className = 'topic-chip';
                    chip.innerText = topic;
                    chip.onclick = () => this.prefillAndGoToChat(`Help me understand ${topic} in detail.`);
                    topicsGrid.appendChild(chip);
                });
            }
        }
    }

    renderChatMessages() {
        const box = document.getElementById('chat-messages-box');
        if (box && box.children.length === 0) {
            const studyHubHtml = this.studyHubItems.length > 0
                ? `<div class="study-hub-list">${this.studyHubItems.slice(0, 3).map(item => `<div class="study-hub-item"><strong>${item.title}</strong><span>${item.summary}</span></div>`).join('')}</div>`
                : '<div class="empty-study-state">Admin can publish study hub cards here for everyone.</div>';

            const revisionHtml = this.revisionItems.length > 0
                ? `<div class="revision-list">${this.revisionItems.slice(0, 2).map(item => `<div class="revision-card"><strong>${item.prompt}</strong><p>${item.answer}</p></div>`).join('')}</div>`
                : '<div class="empty-study-state">Revision prompts will appear after the admin publishes them.</div>';

            box.innerHTML = `
                <div class="chat-welcome-state">
                    <span class="welcome-robot">🤖</span>
                    <h3>Admin-ready study companion</h3>
                    <p>Ask for a recap, a concept breakdown, or use the admin-published study materials below.</p>
                    <div class="prompt-suggestions">
                        <button class="prompt-suggest-btn" onclick="edumentor.prefillChatInput('Explain database normalization.')">💡 Explain database normalization</button>
                        <button class="prompt-suggest-btn" onclick="edumentor.prefillChatInput('What is the difference between TCP and UDP?')">💡 Difference between TCP & UDP</button>
                    </div>
                    <div class="study-panel-card">
                        <h4>Study Hub</h4>
                        ${studyHubHtml}
                    </div>
                    <div class="study-panel-card">
                        <h4>Revision</h4>
                        ${revisionHtml}
                    </div>
                </div>
            `;
        }
    }

    renderCourses() {
        const box = document.getElementById('courses-accordion-list');
        if (!box) return;
        box.innerHTML = '';

        if (this.courses.length === 0) {
            box.innerHTML = '<div class="empty-state-card"><strong>No courses published yet.</strong><p>Use the admin panel to publish courses, modules, and lessons for everyone.</p></div>';
            return;
        }

        this.courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-node open';

            const modules = Array.isArray(course.modules) ? course.modules : [];
            let modulesHtml = '';
            if (modules.length === 0) {
                modulesHtml = '<div class="empty-module-card">No modules published yet for this course.</div>';
            } else {
                modules.forEach(mod => {
                    let topicsHtml = '';
                    (mod.topics || []).forEach(topic => {
                        topicsHtml += `
                            <div class="topic-item-row" onclick="edumentor.askAITutorAbout('${topic}')">
                                <span><span class="topic-bullet">▪</span> ${topic}</span>
                                <button class="btn-ask-topic">Ask Mentor AI</button>
                            </div>
                        `;
                    });

                    modulesHtml += `
                        <div class="module-node">
                            <div class="module-title">${mod.title}</div>
                            <div class="topics-list">
                                ${topicsHtml}
                            </div>
                        </div>
                    `;
                });
            }

            card.innerHTML = `
                <div class="course-node-header" onclick="this.closest('.course-node').classList.toggle('open')">
                    <div class="course-node-title-box">
                        <div class="course-node-title">${course.title}</div>
                        <div class="course-node-meta">${course.description || 'Admin published course'} • ${modules.length} Modules</div>
                    </div>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="course-node-body">
                    ${modulesHtml}
                </div>
            `;
            box.appendChild(card);
        });

        const syncCount = document.getElementById('sync-modules-count');
        if (syncCount) syncCount.innerText = this.courses.reduce((sum, course) => sum + (course.modules || []).length, 0);
    }

    renderResources() {
        const grid = document.getElementById('resources-grid-list');
        const statsCount = document.getElementById('kb-docs-count');
        const telemetryList = document.getElementById('telemetry-source-list');

        if (!grid) return;
        grid.innerHTML = '';
        if (telemetryList) telemetryList.innerHTML = '';

        let releasedCount = 0;

        this.documentsRegistry.forEach(doc => {
            if (telemetryList) {
                const badgeClass = doc.released ? 'badge-success' : 'badge-danger';
                const badgeText = doc.released ? 'Released' : 'Locked';
                const item = document.createElement('div');
                item.className = 'kb-source-item';
                item.innerHTML = `
                    <span>📄 ${doc.title}</span>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                `;
                telemetryList.appendChild(item);
            }

            if (doc.released) {
                releasedCount++;
                const isBookmarked = this.bookmarks.includes(doc.id);
                const isDownloaded = this.downloads.includes(doc.id);

                const card = document.createElement('div');
                card.className = `resource-card ${doc.animClass}`;
                card.innerHTML = `
                    <div class="resource-icon-box">
                        <span class="res-icon">📄</span>
                    </div>
                    <div class="resource-info">
                        <div class="resource-title">${doc.title}</div>
                        <div class="resource-meta">${doc.content.substring(0, 80)}${doc.content.length > 80 ? '…' : ''}</div>
                    </div>
                    <div class="resource-actions">
                        <button class="btn-res-act ${isBookmarked ? 'active' : ''}" onclick="edumentor.toggleBookmark(${doc.id}, this)">
                            ${isBookmarked ? '★' : '☆'}
                        </button>
                        <button class="btn-res-act ${isDownloaded ? 'downloaded' : ''}" onclick="edumentor.toggleDownload(${doc.id}, this)">
                            📥
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            }
        });

        if (statsCount) statsCount.innerText = releasedCount;

        if (releasedCount === 0) {
            grid.innerHTML = `
                <div class="empty-resources-state">
                    <span class="lock-emoji">🔒</span>
                    <h4>Resources will appear here</h4>
                    <p>The administrator can publish notes, slides, and study packs for everyone to access.</p>
                </div>
            `;
        }
    }

    renderPlanner() {
        const container = document.getElementById('task-checklist-box');
        if (!container) return;
        container.innerHTML = '';

        const completed = this.plannerTasks.filter(task => task.completed).length;
        const total = this.plannerTasks.length;
        const progress = total > 0 ? completed / total : 0;

        const summary = document.createElement('div');
        summary.className = 'planner-summary';
        summary.innerHTML = `
            <div class="planner-summary-copy">
                <div>
                    <strong>${completed}/${total} goals complete</strong>
                    <span>${total === 0 ? 'Add your next milestone below.' : `${Math.round(progress * 100)}% of your study plan`}</span>
                </div>
                <span class="planner-summary-chip">${total === 0 ? 'Ready' : completed === total ? 'All done' : 'In progress'}</span>
            </div>
            <div class="planner-progress-bar"><div class="planner-progress-fill" style="width: ${Math.round(progress * 100)}%"></div></div>
        `;
        container.appendChild(summary);

        if (this.plannerTasks.length === 0) {
            container.innerHTML += '<div class="empty-checklist">No tasks set yet. Add your next milestone above and it will appear here as a polished checklist card.</div>';
            return;
        }

        this.plannerTasks.forEach(t => {
            const item = document.createElement('div');
            const priorityLabel = t.priority === 'high' ? 'High priority' : t.priority === 'low' ? 'Low priority' : 'Medium priority';
            item.className = `task-item ${t.completed ? 'completed' : ''} prio-${t.priority}`;
            item.innerHTML = `
                <label class="task-check">
                    <input type="checkbox" ${t.completed ? 'checked' : ''} onclick="edumentor.toggleTask(${t.id})">
                    <span class="task-checkmark"></span>
                </label>
                <div class="task-main">
                    <span class="task-text">${this.escapeHtml(t.text)}</span>
                    <span class="task-meta">${this.escapeHtml(priorityLabel)} • ${t.completed ? 'Completed' : 'In progress'}</span>
                </div>
                <div class="task-actions">
                    <span class="prio-tag">${t.priority.toUpperCase()}</span>
                    <button class="btn-delete-task" onclick="edumentor.deleteTask(${t.id})">✕</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    deleteTask(id) {
        this.plannerTasks = this.plannerTasks.filter(t => t.id !== id);
        this.persistState();
        this.playHapticSound(300, 0.05);
        this.renderPlanner();
    }

    renderProfile() {
        const nameEl = document.getElementById('profile-user-name');
        const roleEl = document.getElementById('profile-user-role');
        const noEl = document.getElementById('profile-student-no');
        const consoleLauncher = document.getElementById('profile-admin-console-launcher');
        const roleLabelHeader = document.getElementById('user-role-lbl');

        if (nameEl) nameEl.innerText = this.currentUser.name;
        if (roleEl) roleEl.innerText = `${this.currentUser.role} • Kwekwe Poly`;
        
        if (noEl) {
            if (this.currentUser.role === 'Student') {
                noEl.innerText = `Student No: ${this.currentUser.studentNo}`;
                noEl.style.display = 'block';
            } else {
                noEl.style.display = 'none';
            }
        }

        if (roleLabelHeader) roleLabelHeader.innerText = `${this.currentUser.role} Portal`;

        if (consoleLauncher) {
            if (this.currentUser.role === 'Admin') {
                consoleLauncher.classList.remove('hidden');
            } else {
                consoleLauncher.classList.add('hidden');
            }
        }
    }

    renderAdminSubTab() {
        const uList = document.getElementById('admin-users-list');
        const dList = document.getElementById('admin-depts-list');
        const docsList = document.getElementById('admin-docs-list');
        const modulesList = document.getElementById('admin-modules-list');
        const tutorialsList = document.getElementById('admin-tutorials-list');
        const resourcesList = document.getElementById('admin-resources-list');
        const studyList = document.getElementById('admin-study-list');
        const revisionList = document.getElementById('admin-revision-list');

        if (this.adminActiveSubTab === 'users' && uList) {
            uList.innerHTML = '';
            this.users.forEach((u, idx) => {
                const row = document.createElement('div');
                row.className = 'admin-account-row';
                row.innerHTML = `
                    <div class="account-info">
                        <strong>${u.name}</strong>
                        <span class="account-meta">${u.username} • ID: ${u.studentNo}</span>
                        <span class="account-role-tag role-${u.role.toLowerCase()}">${u.role}</span>
                    </div>
                `;
                uList.appendChild(row);
            });
        }

        if (this.adminActiveSubTab === 'departments' && dList) {
            dList.innerHTML = '';
            this.departments.forEach((d, idx) => {
                const row = document.createElement('div');
                row.className = 'admin-account-row';
                row.innerHTML = `
                    <div class="account-info">
                        <strong>${d.name}</strong>
                        <span class="account-meta">Head: ${d.head}</span>
                    </div>
                    <button class="btn-admin-act" onclick="edumentor.deleteDept(${idx})" style="color:var(--danger); border-color:rgba(239,68,68,0.2);">Remove</button>
                `;
                dList.appendChild(row);
            });
        }

        if (this.adminActiveSubTab === 'documents' && docsList) {
            docsList.innerHTML = '';
            if (this.courses.length === 0) {
                docsList.innerHTML = '<div class="empty-state-card"><strong>No published course content.</strong><p>Create courses and modules in the forms above.</p></div>';
            } else {
                this.courses.forEach(course => {
                    const row = document.createElement('div');
                    row.className = 'admin-account-row';
                    row.innerHTML = `
                        <div class="account-info">
                            <strong>📚 ${course.title}</strong>
                            <span class="account-meta">${course.description || 'Admin published course'}</span>
                        </div>
                        <span class="badge badge-success" style="font-size:10px;">${(course.modules || []).length} modules</span>
                    `;
                    docsList.appendChild(row);
                });
            }
        }

        if (modulesList) {
            modulesList.innerHTML = '';
            const mergedModules = this.courses.flatMap(course => (course.modules || []).map(module => ({ ...module, courseTitle: course.title })));
            if (mergedModules.length === 0) {
                modulesList.innerHTML = '<div class="empty-state-card"><strong>No modules yet.</strong><p>Add modules from the form above.</p></div>';
            } else {
                mergedModules.forEach(module => {
                    const row = document.createElement('div');
                    row.className = 'admin-account-row';
                    row.innerHTML = `
                        <div class="account-info">
                            <strong>${module.title}</strong>
                            <span class="account-meta">${module.courseTitle}</span>
                        </div>
                        <span class="badge badge-success" style="font-size:10px;">${(module.topics || []).length} topics</span>
                    `;
                    modulesList.appendChild(row);
                });
            }
        }

        if (tutorialsList) {
            tutorialsList.innerHTML = '';
            if (this.videoTutorials.length === 0) {
                tutorialsList.innerHTML = '<div class="empty-state-card"><strong>No tutorials yet.</strong><p>Publish tutorials to show them on everyone’s dashboard.</p></div>';
            } else {
                this.videoTutorials.forEach(video => {
                    const row = document.createElement('div');
                    row.className = 'admin-account-row';
                    row.innerHTML = `
                        <div class="account-info">
                            <strong>📹 ${video.title}</strong>
                            <span class="account-meta">${video.module_name} • ${video.topic_name}</span>
                        </div>
                        <span class="badge badge-success" style="font-size:10px;">Live</span>
                    `;
                    tutorialsList.appendChild(row);
                });
            }
        }

        if (resourcesList) {
            resourcesList.innerHTML = '';
            if (this.documentsRegistry.length === 0) {
                resourcesList.innerHTML = '<div class="empty-state-card"><strong>No resources yet.</strong><p>Share notes, slides, or links from the panel above.</p></div>';
            } else {
                this.documentsRegistry.forEach(doc => {
                    const row = document.createElement('div');
                    row.className = 'admin-account-row';
                    row.innerHTML = `
                        <div class="account-info">
                            <strong>📄 ${doc.title}</strong>
                            <span class="account-meta">${doc.content.substring(0, 50)}${doc.content.length > 50 ? '…' : ''}</span>
                        </div>
                        <span class="badge badge-success" style="font-size:10px;">${doc.type || 'notes'}</span>
                    `;
                    resourcesList.appendChild(row);
                });
            }
        }

        if (studyList) {
            studyList.innerHTML = '';
            if (this.studyHubItems.length === 0) {
                studyList.innerHTML = '<div class="empty-state-card"><strong>No study hub cards yet.</strong><p>Publish study cards to show them in the assistant view.</p></div>';
            } else {
                this.studyHubItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'admin-account-row';
                    row.innerHTML = `
                        <div class="account-info">
                            <strong>${item.title}</strong>
                            <span class="account-meta">${item.summary}</span>
                        </div>
                        <span class="badge badge-success" style="font-size:10px;">Live</span>
                    `;
                    studyList.appendChild(row);
                });
            }
        }

        if (revisionList) {
            revisionList.innerHTML = '';
            if (this.revisionItems.length === 0) {
                revisionList.innerHTML = '<div class="empty-state-card"><strong>No revision prompts yet.</strong><p>Publish revision challenges for learners to practice.</p></div>';
            } else {
                this.revisionItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'admin-account-row';
                    row.innerHTML = `
                        <div class="account-info">
                            <strong>${item.prompt}</strong>
                            <span class="account-meta">${item.answer}</span>
                        </div>
                        <span class="badge badge-success" style="font-size:10px;">Live</span>
                    `;
                    revisionList.appendChild(row);
                });
            }
        }
    }

    switchAdminSubTab(subTabId) {
        this.playHapticSound(500, 0.03);
        this.adminActiveSubTab = subTabId;

        document.querySelectorAll('.admin-sub-view').forEach(view => view.classList.add('hidden'));
        document.getElementById(`admin-sub-view-${subTabId}`).classList.remove('hidden');

        document.querySelectorAll('#view-admin .resource-tabs .tab-pill').forEach(pill => pill.classList.remove('active'));
        document.getElementById(`btn-admin-tab-${subTabId}`).classList.add('active');

        this.renderAdminSubTab();
    }

    // Document Bookmark and Downloads
    toggleBookmark(docId, btn) {
        this.playHapticSound(600, 0.05);
        if (this.bookmarks.includes(docId)) {
            this.bookmarks = this.bookmarks.filter(id => id !== docId);
            btn.classList.remove('active');
            btn.innerText = '☆';
            this.showToast('Bookmark removed');
        } else {
            this.bookmarks.push(docId);
            btn.classList.add('active');
            btn.innerText = '★';
            this.showToast('Resource bookmarked!');
        }
    }

    toggleDownload(docId, btn) {
        this.playHapticSound(600, 0.05);
        if (this.downloads.includes(docId)) {
            this.downloads = this.downloads.filter(id => id !== docId);
            btn.classList.remove('downloaded');
            this.showToast('Downloaded file cleared');
        } else {
            this.downloads.push(docId);
            btn.classList.add('downloaded');
            this.showToast('Downloaded to offline storage!');
        }
    }

    // Portal routing
    openAdminPanel() {
        this.switchTab('admin');
    }

    closeAdminPanel() {
        this.switchTab('profile');
    }

    // Chat Controller & input resizing
    autoGrowTextarea(element) {
        element.style.height = '32px';
        element.style.height = (element.scrollHeight - 4) + 'px';
    }

    prefillChatInput(val) {
        const textarea = document.getElementById('chat-input-textarea');
        if (textarea) {
            textarea.value = val;
            this.autoGrowTextarea(textarea);
        }
    }

    prefillAndGoToChat(val) {
        this.prefillChatInput(val);
        this.switchTab('chat');
    }

    askAITutorAbout(topic) {
        this.prefillAndGoToChat(`Help me understand ${topic} in detail.`);
    }

    setupChatAutoResize() {
        const textarea = document.getElementById('chat-input-textarea');
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.submitQuery();
                }
            });
        }
    }

    submitQuery() {
        const textarea = document.getElementById('chat-input-textarea');
        if (!textarea) return;

        const val = textarea.value.trim();
        if (!val) return;

        this.playHapticSound(500, 0.05);
        const box = document.getElementById('chat-messages-box');
        if (box) {
            // Remove initial welcome chat state
            const welcome = box.querySelector('.chat-welcome-state');
            if (welcome) welcome.remove();

            const studBubble = document.createElement('div');
            studBubble.className = 'message-bubble student';
            studBubble.innerText = val;
            box.appendChild(studBubble);
            box.scrollTop = box.scrollHeight;
        }

        // Save chat log to Supabase via backend POST
        try {
            fetch(this.getApiUrl('/api/save_chat'), {
                method: 'POST',
                headers: this.getAuthHeaders(true),
                body: JSON.stringify({
                    user_id: this.currentUser.username,
                    question: val,
                    answer: 'Constructed by cascade RAG system',
                    subject: 'Database Systems CS301',
                    model: 'Gemini/Groq Llama Cascade'
                })
            });
        } catch (e) {
            // Silence silent background loggers
        }

        // Reset input fields
        textarea.value = '';
        textarea.style.height = '32px';

        // Trigger step-by-step retrieved contexts and RAG flow logging
        const flowPanel = document.getElementById('rag-flow-panel');
        if (flowPanel) {
            flowPanel.classList.remove('hidden');
            const step1 = document.getElementById('rag-step-search');
            const step2 = document.getElementById('rag-step-retrieved');
            const step3 = document.getElementById('rag-step-llm');

            step1.style.color = '#cbd5e1';
            step2.style.color = 'var(--text-muted)';
            step3.style.color = 'var(--text-muted)';

            setTimeout(() => {
                step1.style.color = 'var(--secondary)';
                step2.style.color = '#cbd5e1';
                this.playHapticSound(500, 0.02);
            }, 800);

            setTimeout(() => {
                step2.style.color = 'var(--secondary)';
                step3.style.color = '#cbd5e1';
                this.playHapticSound(550, 0.02);
            }, 1600);

            setTimeout(() => {
                step2.innerText = "📄 Match found. Sourced from Kwekwe Poly registry...";
                step2.style.color = 'var(--secondary)';
                step3.style.color = '#cbd5e1';
                this.playHapticSound(600, 0.02);
                flowPanel.classList.add('hidden');
                
                // Construct AI Response
                this.generateAiResponse(val);
            }, 2400);
        } else {
            this.generateAiResponse(val);
        }
    }

    generateAiResponse(query) {
        this.playHapticSuccess();
        const box = document.getElementById('chat-messages-box');
        if (!box) return;

        const aiBubble = document.createElement('div');
        aiBubble.className = 'message-bubble ai';

        const q = query.toLowerCase();
        let title = 'Study support';
        let summary = 'Here is a clear breakdown of the topic you asked about.';
        let points = [];
        let quickActions = [];
        let matchedSources = [];

        if (q.includes('normal') || q.includes('database') || q.includes('1nf') || q.includes('3nf')) {
            matchedSources = ['Syllabus_CS301.pdf', 'Lecture_Notes_DB_Normalization.pdf'];
            title = 'Database normalization guide';
            summary = 'A structured recap of the core rules and why they matter in relational design.';
            points = [
                ['1NF', 'Keep each field atomic and remove repeating groups.'],
                ['2NF', 'Eliminate partial dependencies so non-key columns depend on the whole key.'],
                ['3NF', 'Remove transitive dependencies so each fact is stored once in the right place.']
            ];
            quickActions = ['Review the schema example', 'Ask for a 3NF practice quiz'];
        } else if (q.includes('tcp') || q.includes('udp') || q.includes('network')) {
            matchedSources = ['Networking_TCP_vs_UDP.pdf', 'Exam_PastPaper_2024.pdf'];
            title = 'TCP vs UDP breakdown';
            summary = 'A simple comparison of reliability, speed, and the best use cases for each protocol.';
            points = [
                ['TCP', 'Reliable and ordered, ideal for file transfers and web traffic.'],
                ['UDP', 'Low-overhead and fast, ideal for live streams and gaming.'],
                ['Best practice', 'Choose TCP when accuracy matters most and UDP when latency matters more.']
            ];
            quickActions = ['Compare TCP and UDP with examples', 'Turn this into a revision sheet'];
        } else {
            title = 'Course material support';
            summary = 'This topic is not yet covered by the published course content. The admin can add matching resources to improve the answer.';
            points = [
                ['Publish new notes', 'Ask the admin to release syllabus notes or sample questions.'],
                ['Ask for a recap', 'Request a short revision summary until the right material is available.']
            ];
            quickActions = ['Ask for a study checklist', 'Request a revision summary'];
        }

        const adminSupport = [];
        if (this.studyHubItems.length > 0) {
            const item = this.studyHubItems[0];
            adminSupport.push(`<div class="ai-response-support-item"><strong>${this.escapeHtml(item.title)}</strong><span>${this.escapeHtml(item.summary)}</span></div>`);
        }
        if (this.revisionItems.length > 0) {
            const item = this.revisionItems[0];
            adminSupport.push(`<div class="ai-response-support-item"><strong>${this.escapeHtml(item.prompt)}</strong><span>${this.escapeHtml(item.answer)}</span></div>`);
        }

        aiBubble.innerHTML = `
            <div class="ai-message-header">
                <span class="ai-avatar">🤖</span>
                <strong>EduMentor AI</strong>
                <div class="ai-msg-actions">
                    <button class="btn-msg-action" onclick="navigator.clipboard.writeText(this.closest('.message-bubble').querySelector('.message-content').innerText); edumentor.playHapticSuccess(); alert('Answer copied to clipboard!');" title="Copy Reply">📋 Copy</button>
                    <button class="btn-msg-action" onclick="edumentor.saveResponse('${query.replace(/'/g, "\\'")}');" title="Save Reply">⭐ Save</button>
                </div>
            </div>
            <div class="message-content">
                <div class="ai-response-shell">
                    <div class="ai-response-hero">
                        <div class="ai-response-badge">✨ Structured answer</div>
                        <h3>${this.escapeHtml(title)}</h3>
                        <p>${this.escapeHtml(summary)}</p>
                    </div>
                    <div class="ai-response-section">
                        <div class="ai-response-section-title">Key points</div>
                        <ul class="ai-response-list">
                            ${points.map(([label, detail]) => `<li><strong>${this.escapeHtml(label)}:</strong> ${this.escapeHtml(detail)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="ai-response-section">
                        <div class="ai-response-section-title">Suggested next steps</div>
                        <div class="ai-response-actions">
                            ${quickActions.map(action => `<button class="ai-response-action" onclick="edumentor.prefillAndGoToChat('${this.escapeHtml(action).replace(/'/g, "\\'")}')">${this.escapeHtml(action)}</button>`).join('')}
                        </div>
                    </div>
                    ${matchedSources.length > 0 ? `
                        <div class="ai-response-section">
                            <div class="ai-response-section-title">Source materials</div>
                            <div class="ai-response-actions">
                                ${matchedSources.map(source => `<span class="source-tag">📄 ${this.escapeHtml(source)}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${adminSupport.length > 0 ? `
                        <div class="ai-response-section">
                            <div class="ai-response-section-title">Admin published support</div>
                            ${adminSupport.join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        box.appendChild(aiBubble);
        box.scrollTop = box.scrollHeight;
    }

    saveResponse(query) {
        this.playHapticSuccess();
        this.showToast('Response bookmarked under study profile!');
    }

    deleteDept(idx) {
        this.playHapticSound(300, 0.05);
        this.departments.splice(idx, 1);
        this.renderAdminSubTab();
        this.showToast('Department removed');
    }

    adminAddDept(event) {
        event.preventDefault();
        const nameVal = document.getElementById('admin-add-dept-name').value;
        const headVal = document.getElementById('admin-add-dept-head').value;

        this.departments.push({
            id: Date.now(),
            name: nameVal,
            head: headVal
        });

        document.getElementById('admin-add-dept-name').value = '';
        document.getElementById('admin-add-dept-head').value = '';

        this.playHapticSuccess();
        this.persistState();
        this.renderAdminSubTab();
        this.showToast(`Department ${nameVal} added successfully!`);
    }

    adminAddUser(event) {
        event.preventDefault();
        const nameVal = document.getElementById('admin-add-username').value;
        const emailVal = document.getElementById('admin-add-email').value;
        const roleVal = document.getElementById('admin-add-role').value;

        this.users.push({
            name: nameVal,
            username: emailVal,
            role: roleVal,
            studentNo: roleVal === 'Student' ? 'KP-2026-' + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase() : 'N/A'
        });

        document.getElementById('admin-add-username').value = '';
        document.getElementById('admin-add-email').value = '';

        this.playHapticSuccess();
        this.persistState();
        this.renderAdminSubTab();
        this.showToast(`Provisioned account for ${nameVal}`);
    }

    async adminAddVideo(event) {
        event.preventDefault();
        const titleEl = document.getElementById('admin-add-video-title');
        const moduleEl = document.getElementById('admin-add-video-module');
        const topicEl = document.getElementById('admin-add-video-topic');
        const urlEl = document.getElementById('admin-add-video-url');

        const title = titleEl.value.trim();
        const module_name = moduleEl.value.trim();
        const topic_name = topicEl.value.trim();
        const video_url = urlEl.value.trim();

        if (title && module_name && topic_name && video_url) {
            const newVideo = {
                title,
                module_name,
                topic_name,
                video_url
            };

            this.videoTutorials.unshift(newVideo);
            this.playHapticSuccess();
            this.persistState();
            this.showToast(`Published tutorial: ${title}`);
            this.addNotification(`📹 New video tutorial released: "${title}" (${module_name})`);
            
            titleEl.value = '';
            moduleEl.value = '';
            topicEl.value = '';
            urlEl.value = '';

            this.renderAllViews();

            try {
                await fetch(this.getApiUrl('/api/video_tutorials'), {
                    method: 'POST',
                    headers: this.getAuthHeaders(true),
                    body: JSON.stringify(newVideo)
                });
            } catch (err) {
                console.error('Error saving tutorial to Supabase/PostgreSQL:', err);
            }
        }
    }
}

// Global initialization
const edumentor = new EduMentorSimulator();
window.addEventListener('load', () => edumentor.init());
