const SectionComponent = {
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      
      <!-- Toast Notifications -->
      <div class="fixed top-4 right-4 z-50 space-y-2">
        <div v-for="toast in activeToasts" :key="toast.id"
          :class="[
            'min-w-[300px] p-4 rounded-lg shadow-lg transform transition-all duration-300',
            'flex items-start gap-3',
            toast.type === 'success' ? 'bg-green-500 text-white' : '',
            toast.type === 'error' ? 'bg-red-500 text-white' : '',
            toast.type === 'info' ? 'bg-blue-500 text-white' : '',
            toast.type === 'warning' ? 'bg-yellow-500 text-white' : ''
          ]">
          <div class="flex-1">
            <p class="font-medium">{{ toast.message }}</p>
          </div>
          <button @click="removeToast(toast.id)" class="text-white hover:text-gray-200 font-bold">
            ×
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="!isDbReady" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p class="text-gray-600">{{ status }}</p>
        </div>
      </div>

      <template v-else>
      <!-- Add Task Form -->
      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Add New Task</h3>
        <form @submit.prevent="addTask" class="flex gap-3 flex-wrap items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Task Title
              <span class="text-gray-500 text-xs ml-2">({{ newTaskTitle.length }}/200)</span>
            </label>
            <input 
              v-model="newTaskTitle"
              type="text" 
              placeholder="Enter task title..."
              maxlength="200"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <button 
            type="submit"
            :disabled="!isDbReady || !newTaskTitle.trim()"
            class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
            Add Task
          </button>
        </form>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mb-6 flex-wrap items-center">
        <div class="flex gap-2">
          <button 
            @click="setFilter('all')"
            :class="filter === 'all' ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'"
            class="px-4 py-2 text-white rounded transition">
            All ({{ allCount }})
          </button>
          <button 
            @click="setFilter('active')"
            :class="filter === 'active' ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'"
            class="px-4 py-2 text-white rounded transition">
            Active ({{ activeCount }})
          </button>
          <button 
            @click="setFilter('completed')"
            :class="filter === 'completed' ? 'bg-purple-600' : 'bg-purple-500 hover:bg-purple-600'"
            class="px-4 py-2 text-white rounded transition">
            Completed ({{ completedCount }})
          </button>
        </div>
        
        <!-- Export/Import -->
        <div class="flex gap-2">
          <button 
            @click="exportToCSV"
            :disabled="!isDbReady"
            class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
            Export CSV
          </button>
          <label class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 cursor-pointer transition">
            Import CSV
            <input 
              type="file" 
              @change="importFromCSV" 
              accept=".csv"
              class="hidden">
          </label>
        </div>
        
        <button 
          @click="clearAll"
          :disabled="!isDbReady"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
          Clear All Tasks
        </button>
      </div>

      <!-- Tasks Table -->
      <div v-if="filteredTasks.length > 0" class="mt-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">
          {{ filterLabel }} ({{ filteredTasks.length }} records)
        </h3>
        <div class="overflow-x-auto shadow-md rounded-lg">
          <table class="w-full bg-white">
            <thead class="bg-gray-800 text-white">
              <tr>
                <th 
                  @click="sortByColumn('id')"
                  class="px-6 py-3 text-left cursor-pointer hover:bg-gray-700 transition">
                  <div class="flex items-center gap-2">
                    ID
                    <span v-if="sortBy === 'id-asc'" class="text-xs">▲</span>
                    <span v-else-if="sortBy === 'id-desc'" class="text-xs">▼</span>
                    <span v-else class="text-xs text-gray-500">⇅</span>
                  </div>
                </th>
                <th 
                  @click="sortByColumn('title')"
                  class="px-6 py-3 text-left cursor-pointer hover:bg-gray-700 transition">
                  <div class="flex items-center gap-2">
                    Title
                    <span v-if="sortBy === 'title-asc'" class="text-xs">▲</span>
                    <span v-else-if="sortBy === 'title-desc'" class="text-xs">▼</span>
                    <span v-else class="text-xs text-gray-500">⇅</span>
                  </div>
                </th>
                <th 
                  @click="sortByColumn('date_start')"
                  class="px-6 py-3 text-left cursor-pointer hover:bg-gray-700 transition">
                  <div class="flex items-center gap-2">
                    Created
                    <span v-if="sortBy === 'date_start-asc'" class="text-xs">▲</span>
                    <span v-else-if="sortBy === 'date_start-desc'" class="text-xs">▼</span>
                    <span v-else class="text-xs text-gray-500">⇅</span>
                  </div>
                </th>
                <th 
                  @click="sortByColumn('date_end')"
                  class="px-6 py-3 text-left cursor-pointer hover:bg-gray-700 transition">
                  <div class="flex items-center gap-2">
                    Completed
                    <span v-if="sortBy === 'date_end-asc'" class="text-xs">▲</span>
                    <span v-else-if="sortBy === 'date_end-desc'" class="text-xs">▼</span>
                    <span v-else class="text-xs text-gray-500">⇅</span>
                  </div>
                </th>
                <th class="px-6 py-3 text-center">Done</th>
                <th class="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in filteredTasks" :key="task.id" class="border-b hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-medium text-blue-600">{{ task.id }}</td>
                <td class="px-6 py-4">{{ task.title }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(task.date_start) }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(task.date_end) }}</td>
                <td class="px-6 py-4 text-center">
                  <input 
                    type="checkbox"
                    :checked="task.done"
                    @change="toggleTask(task.id, task.done)"
                    class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer">
                </td>
                <td class="px-6 py-4">
                  <button 
                    @click="deleteTask(task.id)"
                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="isDbReady && tasks.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-lg mb-4">No tasks yet</p>
        <p class="text-sm">Add a new task to get started</p>
      </div>
      
      <!-- Empty Filter State -->
      <div v-else-if="isDbReady && tasks.length > 0 && filteredTasks.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-lg mb-4">No {{ filter }} tasks</p>
        <p class="text-sm">Try a different filter</p>
      </div>
      </template>
    </div>
  `,

  data() {
    return {
      tasks: [],
      filter: "all",
      sortBy: "id-desc",
      status: "",
      newTaskTitle: "",
      isDbReady: false,
      toasts: [],
      toastIdCounter: 0,
    };
  },

  computed: {
    filteredTasks() {
      let filtered = [];
      if (this.filter === "active") {
        filtered = this.tasks.filter((task) => !task.done);
      } else if (this.filter === "completed") {
        filtered = this.tasks.filter((task) => task.done);
      } else {
        filtered = [...this.tasks];
      }

      // Sortowanie
      const [field, order] = this.sortBy.split("-");
      return filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        // Obsługa null/undefined - zawsze na końcu
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        if (field === "title") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (order === "asc") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    },

    allCount() {
      return this.tasks.length;
    },

    activeCount() {
      return this.tasks.filter((task) => !task.done).length;
    },

    completedCount() {
      return this.tasks.filter((task) => task.done).length;
    },

    filterLabel() {
      if (this.filter === "active") return "Active Tasks";
      if (this.filter === "completed") return "Completed Tasks";
      return "All Tasks";
    },

    activeToasts() {
      return this.toasts;
    },
  },

  async mounted() {
    await this.initDb();
  },

  beforeUnmount() {
    // Cleanup: zamknij połączenie z bazą
    if (SqlService.db) {
      SqlService.db.close();
      SqlService.db = null;
    }
  },

  methods: {
    showToast(message, type = 'info', duration = 3000) {
      const id = ++this.toastIdCounter;
      this.toasts.push({ id, message, type });
      
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    },

    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },

    async initDb() {
      this.status = "Initializing database...";

      try {
        // Najpierw spróbuj wczytać z IndexedDB
        const loadResult = await SqlService.loadFromIndexedDB();

        if (loadResult.success) {
          this.showToast('Database loaded successfully', 'success');
          this.isDbReady = true;
          this.refreshTasks();
        } else {
          // Jeśli brak zapisanej bazy, stwórz nową
          const result = await SqlService.initDatabase();
          this.isDbReady = result.success;

          if (result.success) {
            this.showToast('Database initialized', 'success');
            this.refreshTasks();
          } else {
            this.showToast(result.message, 'error');
          }
        }
      } catch (error) {
        this.showToast(`Initialization error: ${error.message}`, 'error', 5000);
        this.isDbReady = false;
        console.error("Database initialization failed:", error);
      }
    },

    refreshTasks() {
      const result = SqlService.getAllTasks();
      this.tasks = result.data;
    },

    async addTask() {
      if (!this.newTaskTitle.trim()) return;

      const now = new Date().toISOString();
      const result = SqlService.addTask(this.newTaskTitle, false, now, null);

      if (result.success) {
        this.showToast('Task added successfully', 'success');
        this.newTaskTitle = "";
        this.refreshTasks();
        await SqlService.persist();
      } else {
        this.showToast(result.message, 'error');
      }
    },

    async toggleTask(id, currentDone) {
      const result = SqlService.updateTask(id, !currentDone);

      if (result.success) {
        const status = !currentDone ? 'completed' : 'reactivated';
        this.showToast(`Task ${status}`, 'success', 2000);
        this.refreshTasks();
        await SqlService.persist();
      } else {
        this.showToast(result.message, 'error');
      }
    },

    async deleteTask(id) {
      if (!confirm("Are you sure you want to delete this task?")) return;

      const result = SqlService.deleteTask(id);

      if (result.success) {
        this.showToast('Task deleted', 'success', 2000);
        this.refreshTasks();
        await SqlService.persist();
      } else {
        this.showToast(result.message, 'error');
      }
    },

    async clearAll() {
      if (!confirm("Are you sure you want to delete ALL tasks?")) return;

      const result = SqlService.clearAll();

      if (result.success) {
        this.showToast('All tasks cleared', 'success');
        this.tasks = [];
        await SqlService.persist();
      } else {
        this.showToast(result.message, 'error');
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleString("pl-PL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    setFilter(filterType) {
      this.filter = filterType;
    },

    sortByColumn(column) {
      const currentSort = this.sortBy.split("-");
      const currentColumn = currentSort[0];
      const currentOrder = currentSort[1];

      // Jeśli kliknięto tę samą kolumnę, zmień kierunek
      if (currentColumn === column) {
        this.sortBy = `${column}-${currentOrder === "asc" ? "desc" : "asc"}`;
      } else {
        // Nowa kolumna - domyślnie desc (najnowsze/największe na górze)
        this.sortBy = `${column}-desc`;
      }
    },

    exportToCSV() {
      try {
        // Nagłówki CSV
        const headers = ['ID', 'Title', 'Done', 'Created', 'Completed'];
        
        // Konwersja tasków na wiersze CSV
        const rows = this.tasks.map(task => {
          // Escape cudzysłowów w tytule
          const escapedTitle = task.title.replace(/"/g, '""');
          return [
            task.id,
            `"${escapedTitle}"`,
            task.done ? '1' : '0',
            task.date_start || '',
            task.date_end || ''
          ].join(',');
        });
        
        // Złożenie CSV
        const csvContent = [
          headers.join(','),
          ...rows
        ].join('\n');
        
        // Pobieranie pliku
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showToast(`Exported ${this.tasks.length} tasks to CSV`, 'success');
      } catch (error) {
        this.showToast(`Export error: ${error.message}`, 'error');
        console.error('Export error:', error);
      }
    },

    async importFromCSV(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const csvText = e.target.result;
            const lines = csvText.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
              this.showToast('CSV file is empty or invalid', 'error');
              return;
            }
            
            // Pomiń nagłówek (pierwsza linia)
            const dataLines = lines.slice(1);
            let imported = 0;
            let errors = 0;
            
            for (const line of dataLines) {
              try {
                // Parsowanie CSV z obsługą cudzysłowów
                const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
                const values = line.split(regex).map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                
                if (values.length >= 3) {
                  const title = values[1];
                  const done = values[2] === '1';
                  const dateStart = values[3] || new Date().toISOString();
                  const dateEnd = values[4] || null;
                  
                  if (title) {
                    const result = SqlService.addTask(title, done, dateStart, dateEnd);
                    if (result.success) {
                      imported++;
                    } else {
                      errors++;
                    }
                  }
                }
              } catch (lineError) {
                errors++;
                console.error('Error parsing line:', line, lineError);
              }
            }
            
            if (imported > 0) {
              this.showToast(`Imported ${imported} tasks${errors > 0 ? `, ${errors} errors` : ''}`, errors > 0 ? 'warning' : 'success');
            } else {
              this.showToast('No tasks imported', 'error');
            }
            this.refreshTasks();
            await SqlService.persist();
            
          } catch (error) {
            this.showToast(`Import error: ${error.message}`, 'error');
            console.error('Import error:', error);
          }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
      } catch (error) {
        this.showToast(`Import error: ${error.message}`, 'error');
        console.error('Import error:', error);
      }
    },
  },
};
