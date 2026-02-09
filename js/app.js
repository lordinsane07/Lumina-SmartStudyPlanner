document.addEventListener('DOMContentLoaded', () => {
    // --- Initialization ---
    Storage.init();
    Subjects.init();
    Tasks.init();
    Schedule.init();
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
});
