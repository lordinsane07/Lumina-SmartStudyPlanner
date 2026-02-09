const Analytics = {
    init() {
        this.render();
    },

    render() {
        // Only render if section is active to save resources, or just always render
        // Simple implementation: always calc stats, render if container exists

        this.renderTimeChart();
        this.renderCompletionChart();
    },

    renderTimeChart() {
        const container = document.getElementById('time-chart');
        if (!container) return;

        const sessions = Storage.get(Storage.keys.SCHEDULE);
        const subjects = Storage.get(Storage.keys.SUBJECTS);

        // Calculate total minutes per subject
        const subjectTimes = {};

        sessions.forEach(session => {
            const [startH, startM] = session.startTime.split(':').map(Number);
            const [endH, endM] = session.endTime.split(':').map(Number);
            const duration = (endH * 60 + endM) - (startH * 60 + startM);

            if (active = subjects.find(s => s.id === session.subjectId)) {
                if (!subjectTimes[active.name]) {
                    subjectTimes[active.name] = { minutes: 0, color: active.color };
                }
                subjectTimes[active.name].minutes += duration;
            }
        });

        // Convert to array and sort
        const data = Object.keys(subjectTimes).map(name => ({
            name,
            minutes: subjectTimes[name].minutes,
            color: subjectTimes[name].color
        })).sort((a, b) => b.minutes - a.minutes);

        if (data.length === 0) {
            container.innerHTML = '<p class="empty-state">No study data available.</p>';
            return;
        }

        const maxMinutes = Math.max(...data.map(d => d.minutes));

        // Render simple bar chart
        let html = '<div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">';
        data.forEach(d => {
            const width = (d.minutes / maxMinutes) * 100;
            const hours = (d.minutes / 60).toFixed(1);

            html += `
                <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.9rem;">
                    <div style="width: 100px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d.name}</div>
                    <div style="flex: 1; background-color: var(--border-color); height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="width: ${width}%; background-color: ${d.color}; height: 100%;"></div>
                    </div>
                    <div style="width: 50px;">${hours}h</div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    renderCompletionChart() {
        const container = document.getElementById('completion-chart');
        if (!container) return;

        const tasks = Storage.get(Storage.keys.TASKS);
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;

        if (total === 0) {
            container.innerHTML = '<p class="empty-state">No tasks created yet.</p>';
            return;
        }

        const percent = Math.round((completed / total) * 100);

        // Simple CSS Conic Gradient Pie Chart
        /*
            background: conic-gradient(
                var(--success-color) 0% 70%, 
                var(--border-color) 70% 100%
            );
        */

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                <div style="
                    width: 150px; 
                    height: 150px; 
                    border-radius: 50%;
                    background: conic-gradient(var(--success-color) 0% ${percent}%, var(--border-color) ${percent}% 100%);
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        width: 120px; 
                        height: 120px; 
                        background-color: var(--surface-color); 
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                    ">
                        <span style="font-size: 2rem; font-weight: bold;">${percent}%</span>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">Completed</span>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; font-size: 0.9rem;">
                    <div><span style="color: var(--border-color);">●</span> Pending: ${pending}</div>
                    <div><span style="color: var(--success-color);">●</span> Done: ${completed}</div>
                </div>
            </div>
        `;
    },

};
