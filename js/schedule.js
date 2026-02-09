const Schedule = {
    init() {
        this.currentDate = new Date();
        this.bindEvents();
        this.renderDailyView();

        // Initial date display
        this.updateDateDisplay();
    },

    bindEvents() {
        const form = document.getElementById('session-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSession();
        });

        // Date navigation
        document.getElementById('prev-day').addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() - 1);
            this.updateDateDisplay();
            this.renderDailyView();
        });

        document.getElementById('next-day').addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() + 1);
            this.updateDateDisplay();
            this.renderDailyView();
        });
    },

    getAll() {
        return Storage.get(Storage.keys.SCHEDULE);
    },

    getSessionsForDate(dateStr) {
        return this.getAll().filter(s => s.date === dateStr);
    },

    updateDateDisplay() {
        const display = document.getElementById('schedule-date-display');
        const options = { weekday: 'short', month: 'short', day: 'numeric' };

        const today = new Date();
        if (this.currentDate.toDateString() === today.toDateString()) {
            display.textContent = 'Today';
        } else {
            display.textContent = this.currentDate.toLocaleDateString('en-US', options);
        }
    },

    formatDate(date) {
        // YYYY-MM-DD for consistency
        return date.toISOString().split('T')[0];
    },

    checkConflict(newSession) {
        const sessions = this.getSessionsForDate(newSession.date);

        // Convert times to comparable values (minutes from midnight)
        const getMinutes = (timeStr) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };

        const newStart = getMinutes(newSession.startTime);
        const newEnd = getMinutes(newSession.endTime);

        if (newStart >= newEnd) return "End time must be after start time.";

        for (const session of sessions) {
            const existStart = getMinutes(session.startTime);
            const existEnd = getMinutes(session.endTime);

            // Overlap logic: (StartA < EndB) and (EndA > StartB)
            if (newStart < existEnd && newEnd > existStart) {
                return "Time conflict with an existing session!";
            }
        }
        return null; // No conflict
    },

    addSession() {
        const subjectId = document.getElementById('sess-subject').value;
        const dateInput = document.getElementById('sess-date').value; // YYYY-MM-DD
        const startInput = document.getElementById('sess-start').value; // HH:MM
        const endInput = document.getElementById('sess-end').value;   // HH:MM

        if (!subjectId) {
            alert('Please select a subject');
            return;
        }

        const newSession = {
            id: Date.now().toString(),
            subjectId,
            date: dateInput,
            startTime: startInput,
            endTime: endInput
        };

        const error = this.checkConflict(newSession);
        if (error) {
            alert(error);
            return;
        }

        Storage.add(Storage.keys.SCHEDULE, newSession);

        document.getElementById('session-form').reset();
        document.getElementById('session-modal').classList.add('hidden');
        document.getElementById('modal-overlay').classList.add('hidden');

        // If added session is on currently viewed date, refresh
        if (dateInput === this.formatDate(this.currentDate)) {
            this.renderDailyView();
        }

        // Update analytics if enabled
        if (typeof Analytics !== 'undefined') Analytics.render();
    },

    deleteSession(id) {
        if (confirm('Delete this study session?')) {
            Storage.delete(Storage.keys.SCHEDULE, 'id', id);
            this.renderDailyView();
            // Update analytics
            if (typeof Analytics !== 'undefined') Analytics.render();
        }
    },

    renderDailyView() {
        const container = document.getElementById('daily-schedule');
        const dateStr = this.formatDate(this.currentDate);
        const sessions = this.getSessionsForDate(dateStr);
        const subjects = Storage.get(Storage.keys.SUBJECTS);

        container.innerHTML = '';
        container.style.position = 'relative';
        container.style.height = '600px'; // Fixed height for timeline
        container.style.borderLeft = '2px solid var(--border-color)';
        container.style.marginTop = '1rem';
        container.style.background = 'repeating-linear-gradient(to bottom, transparent 0, transparent 49px, var(--border-color) 50px)';
        container.style.backgroundSize = '100% 50px'; // Each line = 1 hour visual guide (approx)

        if (sessions.length === 0) {
            container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No sessions for this day.</div>`;
            return;
        }

        // Sort by start time
        sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));

        sessions.forEach(session => {
            const subject = subjects.find(s => s.id === session.subjectId);
            const color = subject ? subject.color : '#ccc';
            const subName = subject ? subject.name : 'Unknown Subject';

            // Calculate position
            const [startH, startM] = session.startTime.split(':').map(Number);
            const [endH, endM] = session.endTime.split(':').map(Number);

            // Map 06:00 to 24:00 (18 hours) to height
            // Let's simplified: Map absolute time 00:00 - 24:00 to 0-100%
            const dayMinutes = 24 * 60;
            const startMinutes = startH * 60 + startM;
            const durationMinutes = (endH * 60 + endM) - startMinutes;

            const topPercent = (startMinutes / dayMinutes) * 100;
            const heightPercent = (durationMinutes / dayMinutes) * 100;

            const el = document.createElement('div');
            el.className = 'session-block';
            el.style.position = 'absolute';
            el.style.top = `${topPercent}%`;
            el.style.height = `${heightPercent}%`;
            el.style.left = '10px';
            el.style.right = '10px';
            el.style.backgroundColor = `${color}30`; // transparent version
            el.style.borderLeft = `4px solid ${color}`;
            el.style.padding = '4px 8px';
            el.style.fontSize = '0.85rem';
            el.style.borderRadius = '4px';
            el.style.overflow = 'hidden';
            el.style.cursor = 'pointer';

            el.innerHTML = `
                <strong>${session.startTime} - ${session.endTime}</strong><br>
                ${subName}
            `;

            el.addEventListener('click', () => this.deleteSession(session.id));

            container.appendChild(el);
        });
    },

    // Used by Dashboard
    renderTodayPreview(containerId) {
        const container = document.getElementById(containerId);
        const todayStr = this.formatDate(new Date());
        let sessions = this.getSessionsForDate(todayStr);
        const subjects = Storage.get(Storage.keys.SUBJECTS);

        container.innerHTML = '';

        if (sessions.length === 0) {
            container.innerHTML = '<div class="empty-state" style="color: var(--text-secondary); padding: 1rem; text-align: center;">No sessions today. Great time to relax or get ahead!</div>';
            return;
        }

        sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Show max 3
        sessions = sessions.slice(0, 3);

        sessions.forEach(session => {
            const subject = subjects.find(s => s.id === session.subjectId);
            const color = subject ? subject.color : '#ccc';

            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '1rem';
            div.style.marginBottom = '0.75rem';
            div.style.padding = '0.5rem';
            div.style.backgroundColor = 'var(--bg-color)';
            div.style.borderRadius = 'var(--radius-sm)';

            div.innerHTML = `
                <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color};"></div>
                <div style="flex: 1; font-weight: 500;">${subject ? subject.name : 'Unknown'}</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">${session.startTime} - ${session.endTime}</div>
            `;
            container.appendChild(div);
        });
    }
};
