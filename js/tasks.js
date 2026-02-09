const Tasks = {
    init() {
        this.renderList();
        this.bindEvents();

        // Initial filter state
        this.currentFilter = 'all';
    },

    bindEvents() {
        const form = document.getElementById('task-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // UI Toggle
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Logic
                this.currentFilter = e.target.dataset.filter;
                this.renderList();
            });
        });
    },

    getAll() {
        return Storage.get(Storage.keys.TASKS);
    },

    getPendingCount() {
        return this.getAll().filter(t => !t.completed).length;
    },

    addTask() {
        const title = document.getElementById('task-title').value;
        const subjectId = document.getElementById('task-subject').value;
        const due = document.getElementById('task-due').value;
        const priority = document.getElementById('task-priority').value;

        if (!subjectId) {
            alert('Please select a subject');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            title,
            subjectId,
            dueDate: due,
            priority,
            completed: false
        };

        Storage.add(Storage.keys.TASKS, newTask);

        document.getElementById('task-form').reset();
        document.getElementById('task-modal').classList.add('hidden');
        document.getElementById('modal-overlay').classList.add('hidden');

        this.renderList();

        // Refresh dashboard stats if visible
        if (document.getElementById('dashboard').classList.contains('active-section')) {
            document.getElementById('stat-pending').querySelector('.stat-value').textContent = this.getPendingCount();
        }
    },

    toggleComplete(id) {
        const tasks = this.getAll();
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            Storage.update(Storage.keys.TASKS, 'id', task);
            this.renderList();

            // Refresh dashboard
            if (document.getElementById('dashboard').classList.contains('active-section')) {
                document.getElementById('stat-pending').querySelector('.stat-value').textContent = this.getPendingCount();
            }
        }
    },

    deleteTask(id) {
        if (confirm('Delete this task?')) {
            Storage.delete(Storage.keys.TASKS, 'id', id);
            this.renderList();
            // Refresh dashboard
            if (document.getElementById('dashboard').classList.contains('active-section')) {
                document.getElementById('stat-pending').querySelector('.stat-value').textContent = this.getPendingCount();
            }
        }
    },

    isOverdue(dueDate) {
        return new Date(dueDate) < new Date();
    },

    renderList() {
        const listContainer = document.getElementById('tasks-list');
        let tasks = this.getAll();
        const subjects = Storage.get(Storage.keys.SUBJECTS);

        // Sort by Due Date (soonest first)
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // Apply Filter
        if (this.currentFilter === 'pending') {
            tasks = tasks.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            tasks = tasks.filter(t => t.completed);
        } else if (this.currentFilter === 'overdue') {
            tasks = tasks.filter(t => !t.completed && this.isOverdue(t.dueDate));
        }

        listContainer.innerHTML = '';

        if (tasks.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No tasks found.</p>';
            return;
        }

        tasks.forEach(task => {
            const subject = subjects.find(s => s.id === task.subjectId);
            const subjectColor = subject ? subject.color : '#ccc';
            const subjectName = subject ? subject.name : 'Unknown Subject';

            const isOverdue = !task.completed && this.isOverdue(task.dueDate);

            // Format Date
            const dateObj = new Date(task.dueDate);
            const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const item = document.createElement('div');
            item.className = `task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;

            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-check" data-id="${task.id}" style="width: 20px; height: 20px; cursor: pointer;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0; font-size: 1rem;">${task.title}</h4>
                        <div style="display: flex; gap: 0.5rem; align-items: center; font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                            <span style="background-color: ${subjectColor}20; color: ${subjectColor}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${subjectName}</span>
                            <span class="priority-tag priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                            <span>📅 ${dateStr}</span>
                            ${isOverdue ? '<span style="color: var(--danger-color); font-weight: bold;">(Overdue)</span>' : ''}
                        </div>
                    </div>
                </div>
                <button class="btn btn-secondary delete-task-btn" data-id="${task.id}" style="margin-left: 1rem; padding: 0.25rem 0.5rem;">✕</button>
            `;

            // Event Listeners
            item.querySelector('.task-check').addEventListener('change', (e) => this.toggleComplete(e.target.dataset.id));
            item.querySelector('.delete-task-btn').addEventListener('click', (e) => this.deleteTask(e.target.dataset.id));

            listContainer.appendChild(item);
        });
    }
};
