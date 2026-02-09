# Smart Study Planner

A comprehensive, vanilla JavaScript web application for managing academic life. Built with a focus on clean architecture, responsive design, and local data persistence.
**Featuring a unique "Human-Made" design aesthetic that mimics a physical study journal.**

## Features

-   **Dashboard**: High-level overview of subjects, tasks, and today's schedule.
-   **Subject Management**: Create, edit, and color-code subjects.
-   **Schedule Planner**: Interactive daily timeline with visual conflict detection to prevent overlapping sessions.
-   **Task Manager**: Track assignments and exams with deadlines, priorities, and status filtering. Overdue items are highlighted.
-   **Progress Analytics**: Visual charts showing study time distribution and task completion rates.
-   **Settings**: Dark/Light mode toggle, data export/import for backup, and data reset.
-   **Persistence**: All data is automatically saved to LocalStorage, ensuring it persists across browser sessions.

## Technologies Used

-   **HTML5**: Semantic markup.
-   **CSS3**: Flexbox/Grid layouts, CSS Variables for theming, no frameworks.
-   **JavaScript (ES6+)**: Modular code structure, LocalStorage API, DOM manipulation.

## How to Run

1.  Clone or download this repository.
2.  Open `index.html` in any modern web browser.
3.  No "build" step or server required.

## Application Structure

-   `index.html`: Single Page Application (SPA) entry point.
-   `css/styles.css`: All application styles including dark mode logic.
-   `js/`:
    -   `app.js`: Main controller, routing, and initialization.
    -   `storage.js`: LocalStorage data access layer.
    -   `subjects.js`, `tasks.js`, `schedule.js`: Feature-specific logic.
    -   `analytics.js`: Data visualization logic.

## Usage Guide

1.  **Start by adding Subjects**: Go to the Subjects tab and create your courses with unique colors.
2.  **Plan your Schedule**: Use the Schedule tab to add study sessions. The app will warn you if times overlap.
3.  **Track Tasks**: Add assignments or exams in the Tasks tab.
4.  **Monitor Progress**: Check the Analytics tab to see where you are spending your time.
5.  **Backup**: Use the Settings tab to Export your data to a JSON file for safekeeping.

## Screenshot Placeholders

*(In a real submission, screenshots would be placed here)*

-   *Dashboard View*
-   *Schedule Timeline*
-   *Task Manager*

## Known Limitations

-   Charts are simple CSS-based implementations to strict "no library" constraints.
-   Notifications are visual only (no browser push notifications).

## Future Improvements

-   Drag-and-drop support for rescheduling sessions.
-   Calendar view (Month/Week).
-   Pomodoro timer integration.

---

**Developed for Academic Project Submission**
