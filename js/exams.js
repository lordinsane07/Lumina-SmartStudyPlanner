const Exams = {
    init() {
        // Any specific initialization if needed
    },

    getAll() {
        return Storage.get(Storage.keys.EXAMS);
    },

    add(exam) {
        // exam object: { id, subjectId, title, date, type, topics }
        exam.id = Date.now().toString();
        Storage.add(Storage.keys.EXAMS, exam);
        return exam;
    },

    delete(id) {
        Storage.delete(Storage.keys.EXAMS, 'id', id);
    },

    getUpcomingCount() {
        const exams = this.getAll();
        const now = new Date();
        // Count exams in the future
        return exams.filter(e => new Date(e.date) >= now).length;
    },

    // Get exams sorted by date
    getSortedExams() {
        return this.getAll().sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    populateSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '<option value="">Select Type</option>';
        ['Quiz', 'Midterm', 'Final', 'Test', 'Assignment'].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            select.appendChild(option);
        });
    }
};
