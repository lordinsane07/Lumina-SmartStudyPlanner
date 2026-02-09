const Storage = {
    keys: {
        SUBJECTS: 'ssp_subjects',
        TASKS: 'ssp_tasks',
        SCHEDULE: 'ssp_schedule',
        THEME: 'theme'
    },

    init() {
        if (!localStorage.getItem(this.keys.SUBJECTS)) {
            localStorage.setItem(this.keys.SUBJECTS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.keys.TASKS)) {
            localStorage.setItem(this.keys.TASKS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.keys.SCHEDULE)) {
            localStorage.setItem(this.keys.SCHEDULE, JSON.stringify([]));
        }
    },

    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    add(key, item) {
        const data = this.get(key);
        data.push(item);
        this.save(key, data);
        return data; // Return updated list
    },

    update(key, idField, updatedItem) {
        let data = this.get(key);
        const index = data.findIndex(item => item[idField] === updatedItem[idField]);
        if (index !== -1) {
            data[index] = updatedItem;
            this.save(key, data);
        }
        return data;
    },

    delete(key, idField, id) {
        let data = this.get(key);
        data = data.filter(item => item[idField] !== id);
        this.save(key, data);
        return data;
    },

    clearAll() {
        localStorage.clear();
    },

    exportData() {
        return {
            subjects: this.get(this.keys.SUBJECTS),
            tasks: this.get(this.keys.TASKS),
            schedule: this.get(this.keys.SCHEDULE),
            theme: localStorage.getItem(this.keys.THEME) || 'light'
        };
    }
};
