document.addEventListener('DOMContentLoaded', () => {
    // --- Initialization ---
    Storage.init();
    Subjects.init();
    Tasks.init();
    Schedule.init();
    Exams.init();
    Analytics.init();

    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.main-nav li');
    const sections = document.querySelectorAll('section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');

            const targetId = item.getAttribute('data-section');

            // Hide all sections
            sections.forEach(sec => {
                sec.classList.remove('active-section');
                sec.classList.add('hidden-section');
            });

            // Show target section
            const targetSection = document.getElementById(targetId);
            targetSection.classList.remove('hidden-section');
            targetSection.classList.add('active-section');

            // Refresh data for the section if needed
            if (targetId === 'dashboard') updateDashboard();
            if (targetId === 'exams') renderExams();
            if (targetId === 'analytics') Analytics.render();
        });
    });

    // --- Modal Logic ---
    const modalOverlay = document.getElementById('modal-overlay');
    const closeButtons = document.querySelectorAll('.close-modal');

    function openModal(modalId) {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        document.getElementById(modalId).classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
    }

    function closeModal() {
        modalOverlay.classList.add('hidden');
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }

    closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Button Listeners for Modals
    document.getElementById('add-subject-btn').addEventListener('click', () => openModal('subject-modal'));
    document.getElementById('add-task-btn').addEventListener('click', () => {
        Subjects.populateSelect('task-subject');
        openModal('task-modal');
    });
    document.getElementById('add-session-btn').addEventListener('click', () => {
        Subjects.populateSelect('sess-subject');
        openModal('session-modal');
    });

    const openExamModal = () => {
        Subjects.populateSelect('exam-subject');
        openModal('exam-modal');
    };
    document.getElementById('add-exam-btn').addEventListener('click', openExamModal);

    // --- Global Theme Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Dashboard Update Logic ---
    function updateDashboard() {
        // Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);

        // Stats
        document.getElementById('stat-subjects').querySelector('.stat-value').textContent = Subjects.getCount();
        document.getElementById('stat-pending').querySelector('.stat-value').textContent = Tasks.getPendingCount();
        document.getElementById('stat-exams').querySelector('.stat-value').textContent = Exams.getUpcomingCount();

        // Today's schedule preview (Mock for now, will implement properly)
        if (typeof Schedule !== 'undefined') Schedule.renderTodayPreview('dashboard-schedule-list');
    }

    // Initial Dashboard Load
    updateDashboard();

    // --- Data Management (Settings) ---
    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
            Storage.clearAll();
            location.reload();
        }
    });

    // Example of using window.print() for PDF export logic
    // We create a new window, write HTML content to it, and call print()
    document.getElementById('export-data-btn').addEventListener('click', () => {
        const subjects = Storage.get(Storage.keys.SUBJECTS);
        const tasks = Storage.get(Storage.keys.TASKS);
        const schedule = Storage.get(Storage.keys.SCHEDULE);

        const printWindow = window.open('', '_blank');

        let content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Smart Study Planner Export</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                    h1 { text-align: center; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
                    h2 { color: #2c3e50; margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .status-complete { color: green; font-weight: bold; }
                    .status-pending { color: orange; font-weight: bold; }
                    .tag { padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: white; }
                    .footer { margin-top: 40px; text-align: center; font-size: 0.8rem; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
                </style>
            </head>
            <body>
                <h1>Smart Study Planner Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>

                <h2>📚 Subjects</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Color</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjects.length ? subjects.map(s => `
                            <tr>
                                <td>${s.name}</td>
                                <td><span class="tag" style="background-color: ${s.color};">${s.color}</span></td>
                            </tr>
                        `).join('') : '<tr><td colspan="2">No subjects found.</td></tr>'}
                    </tbody>
                </table>

                <h2>✅ Tasks</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Subject</th>
                            <th>Due Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasks.length ? tasks.map(t => {
            const sub = subjects.find(s => s.id === t.subjectId);
            const subName = sub ? sub.name : 'Unknown';
            const subColor = sub ? sub.color : '#ccc';
            return `
                                <tr>
                                    <td>${t.title}</td>
                                    <td><span class="tag" style="background-color: ${subColor};">${subName}</span></td>
                                    <td>${new Date(t.dueDate).toLocaleString()}</td>
                                    <td class="${t.completed ? 'status-complete' : 'status-pending'}">${t.completed ? 'Completed' : 'Pending'}</td>
                                </tr>
                            `;
        }).join('') : '<tr><td colspan="4">No tasks found.</td></tr>'}
                    </tbody>
                </table>

                <h2>📅 Schedule Sessions</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Subject</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schedule.length ? schedule.map(s => {
            const sub = subjects.find(sub => sub.id === s.subjectId);
            const subName = sub ? sub.name : 'Unknown';
            const subColor = sub ? sub.color : '#ccc';
            return `
                                <tr>
                                    <td>${s.date}</td>
                                    <td>${s.startTime} - ${s.endTime}</td>
                                    <td><span class="tag" style="background-color: ${subColor};">${subName}</span></td>
                                </tr>
                            `;
        }).join('') : '<tr><td colspan="3">No sessions scheduled.</td></tr>'}
                    </tbody>
                </table>

                <div class="footer">
                    Smart Study Planner &bull; Organize. Plan. Succeed.
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();

        // Wait for styles to load (small delay)
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    });

    // --- Exams Logic ---
    document.getElementById('exam-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('exam-title').value;
        const subjectId = document.getElementById('exam-subject').value;
        const date = document.getElementById('exam-date').value;
        const topics = document.getElementById('exam-topics').value;

        Exams.add({
            title,
            subjectId,
            date,
            topics
        });

        closeModal();
        e.target.reset();

        // Refresh views
        updateDashboard();
        if (document.getElementById('exams').classList.contains('active-section')) {
            renderExams();
        }
    });

    function renderExams() {
        const list = document.getElementById('exams-list');
        const exams = Exams.getSortedExams();
        const subjects = Subjects.getAll();

        if (exams.length === 0) {
            list.innerHTML = '<p class="empty-state">No exams scheduled. Time to relax! 😎</p>';
            return;
        }

        list.innerHTML = exams.map(exam => {
            const subject = subjects.find(s => s.id === exam.subjectId);
            const color = subject ? subject.color : '#ccc';
            const subjectName = subject ? subject.name : 'Unknown Subject';
            const dateObj = new Date(exam.date);

            // Use a tinted background like schedule items
            const bgTint = color + '20'; // 20 hex = ~12% opacity, 30 hex = ~19%

            return `
                <div class="card" style="background-color: ${bgTint}; border-left: 5px solid ${color}; padding: 1.5rem; border-radius: 10px; box-shadow: 2px 2px 0 rgba(0,0,0,0.1); margin-bottom: 1rem; position: relative; border: 1px solid var(--border-color); border-left-width: 5px;">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px dashed ${color};">
                        <span class="badge" style="background-color: ${color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold;">${subjectName}</span>
                        <span class="date" style="font-size: 0.9em; font-family: 'Patrick Hand', cursive;">${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 style="margin: 0 0 10px 0; font-family: 'Permanent Marker', cursive; color: var(--text-primary);">${exam.title}</h3>
                    <p style="white-space: pre-wrap; margin-bottom: 15px; font-size: 0.95em; color: var(--text-primary); font-family: 'Patrick Hand', cursive;">${exam.topics || 'No topics specified.'}</p>
                    <div style="text-align: right;">
                        <button class="btn-sm btn-danger" onclick="deleteExam('${exam.id}')" style="padding: 4px 10px; border-radius: 5px; border: 1px solid var(--border-color); cursor: pointer; background-color: #ff7675; color: white; font-family: 'Patrick Hand', cursive;">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Expose delete function globally so onclick works
    window.deleteExam = (id) => {
        if (confirm('Delete this exam?')) {
            Exams.delete(id);
            renderExams();
            updateDashboard();
        }
    };
});
