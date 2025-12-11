# Task Planner App

A modern, browser-based task management application built with Vue 3 and SQLite (sql.js). All data is stored locally in your browser using IndexedDB for persistence.

## 🚀 Features

- ✅ **CRUD Operations** - Create, read, update, and delete tasks
- 💾 **Persistent Storage** - Auto-save to IndexedDB after every operation
- 📊 **SQLite Database** - Full SQL database running in the browser via WebAssembly
- 🔄 **Smart Filtering** - View all, active, or completed tasks
- 🔀 **Sortable Columns** - Click any column header to sort (ID, Title, Created, Completed)
- 📅 **Automatic Timestamps** - Tasks automatically record creation and completion dates
- 📤 **CSV Export/Import** - Export tasks to CSV for backup or editing in Excel/Sheets
- 🎨 **Toast Notifications** - Non-intrusive success/error messages
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Zero Backend** - Runs entirely in the browser, no server required

## 🛠️ Technologies

- **Vue 3** (Options API)
- **sql.js 1.10.3** (SQLite compiled to WebAssembly)
- **IndexedDB** (Browser persistence)
- **Tailwind CSS** (Styling)
- **Vanilla JavaScript** (No build step required)

## 📦 Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)

That's it! No npm install, no build process needed.

## 🎯 Usage

### Adding Tasks
1. Enter a task title in the input field (max 200 characters)
2. Click "Add Task" or press Enter
3. Task is automatically saved with a creation timestamp

### Managing Tasks
- **Mark as Done**: Click the checkbox to toggle completion status
- **Delete**: Click the "Delete" button (with confirmation)
- **Filter**: Use "All", "Active", or "Completed" buttons
- **Sort**: Click any column header (ID, Title, Created, Completed) to sort

### Exporting/Importing
- **Export CSV**: Creates a downloadable CSV file with all tasks
- **Import CSV**: Upload a CSV file to add tasks (supports Excel-edited files)
- **Clear All**: Remove all tasks (with confirmation)

## 📁 Project Structure

```
local sql/
├── index.html                      # Main HTML file
├── main.js                         # Vue app initialization
├── style.css                       # Custom styles
├── components/
│   ├── header/
│   │   └── NavComponent.js         # Navigation bar
│   ├── footer/
│   │   └── FooterComponent.js      # Footer
│   └── sections/
│       └── SectionComponent.js     # Main task manager component
├── layouts/
│   └── MainLayoutComponent.js      # Page layout
└── services/
    └── SqlService.js               # SQLite database service
```

## 🗄️ Database Schema

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER DEFAULT 0,
  date_start TEXT,  -- ISO timestamp when task was created
  date_end TEXT     -- ISO timestamp when task was completed
)
```

## 🔧 Configuration

All database operations are handled by `SqlService.js`. Key features:

- **Auto-migration**: Automatically updates old databases to add new columns
- **Error handling**: QuotaExceededError detection for storage limits
- **Memory management**: Properly closes database connections on unmount

## 🌐 Browser Compatibility

- ✅ Chrome 57+
- ✅ Firefox 52+
- ✅ Safari 11+
- ✅ Edge 79+

Requires support for:
- WebAssembly
- IndexedDB
- ES6 JavaScript
- Vue 3

## 📝 CSV Format

Exported CSV files have the following structure:

```csv
ID,Title,Done,Created,Completed
1,"Buy groceries",0,2025-12-11T10:30:00.000Z,
2,"Finish report",1,2025-12-11T09:00:00.000Z,2025-12-11T11:15:00.000Z
```

## 🔒 Privacy & Security

- **100% Local**: All data stays in your browser
- **No Tracking**: No analytics or external requests (except CDN for sql.js)
- **No Account**: No sign-up, login, or personal information required
- **Portable**: Export your data anytime as CSV

## 🐛 Known Limitations

- Storage limited by browser's IndexedDB quota (~50MB-100MB typical)
- CSV import doesn't check for duplicate IDs
- Single-user only (no collaboration features)

## 🤝 Contributing

This is a standalone project. Feel free to fork and modify for your needs.

## 📄 License

Free to use for personal and commercial projects.

## 🙏 Credits

- Built with [sql.js](https://github.com/sql-js/sql.js) by sql.js team
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Vue 3](https://vuejs.org/)

---

**Made with ❤️ for local-first software**
