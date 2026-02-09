const Subjects = {
    init() {
        this.renderList();
        this.bindEvents();
    },

    bindEvents() {
        const form = document.getElementById('subject-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSubject();
        });
    },

    getAll() {
        return Storage.get(Storage.keys.SUBJECTS);
    },

    getCount() {
        return this.getAll().length;
    },

    addSubject() {
        const nameInput = document.getElementById('sub-name');
        const colorInput = document.getElementById('sub-color');

        const name = nameInput.value.trim();
        const color = colorInput.value;

        if (!name) return;

        const newSubject = {
            id: Date.now().toString(),
            name,
            color
        };

        Storage.add(Storage.keys.SUBJECTS, newSubject);

        nameInput.value = '';
        colorInput.value = '#4CAF50'; // Reset to default green

        // Close modal
        document.getElementById('subject-modal').classList.add('hidden');
        document.getElementById('modal-overlay').classList.add('hidden');

        this.renderList();
        this.updateDependentSelects();

        // Refresh Dashboard if active
        if (document.getElementById('dashboard').classList.contains('active-section')) {
            document.getElementById('stat-subjects').querySelector('.stat-value').textContent = this.getCount();
        }
    },

    deleteSubject(id) {
        if (confirm('Delete this subject? Associated tasks and sessions will NOT be deleted but will lose their subject link.')) {
            Storage.delete(Storage.keys.SUBJECTS, 'id', id);
            this.renderList();
            this.updateDependentSelects();

            // Stats update
            if (document.getElementById('dashboard').classList.contains('active-section')) {
                document.getElementById('stat-subjects').querySelector('.stat-value').textContent = this.getCount();
            }
        }
    },

    renderList() {
        const listContainer = document.getElementById('subjects-list');
        const subjects = this.getAll();
        listContainer.innerHTML = '';

        if (subjects.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No subjects added yet.</p>';
            return;
        }

        subjects.forEach(sub => {
            const card = document.createElement('div');
            card.className = 'dashboard-card'; // Reuse generic card style
            card.style.borderLeft = `5px solid ${sub.color}`;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">${sub.name}</h3>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" data-id="${sub.id}">Delete</button>
                </div>
            `;

            card.querySelector('button').addEventListener('click', (e) => {
                this.deleteSubject(e.target.dataset.id);
            });

            listContainer.appendChild(card);
        });
    },

    populateSelect(selectId) {
        const select = document.getElementById(selectId);
        const subjects = this.getAll();
        select.innerHTML = '<option value="">Select Subject</option>';

        subjects.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.name;
            select.appendChild(option);
        });
    },

    updateDependentSelects() {
        // If modals are open or will be opened, we need updated lists
        /* 
           This is called after add/delete. 
           In a real app with reactive state, this effectively happens automatically.
           Here we just ensure next time the modal opens, it calls populateSelect
           OR we could update live if open.
           The app.js logic calls populateSelect ON CLICK so it's always fresh.
           So strictly, this might not be needed unless a select is currently visible.
        */
    },

    getInitials(name) {
        return name.substring(0, 2).toUpperCase();
    }
};
