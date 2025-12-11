// SQLite Service - zarządzanie bazą danych
const SqlService = {
  db: null,
  DB_NAME: "sqljs-database",
  STORE_NAME: "database",

  // Inicjalizacja bazy danych
  async initDatabase() {
    try {
      const SQL = await initSqlJs({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`,
      });

      this.db = new SQL.Database();

      // Utworzenie tabeli tasks z nowymi kolumnami
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          done INTEGER DEFAULT 0,
          date_start TEXT,
          date_end TEXT
        )
      `);

      // Sprawdź czy kolumny istnieją i dodaj je jeśli nie
      try {
        this.db.exec("SELECT date_start FROM tasks LIMIT 1");
      } catch (e) {
        // Kolumna nie istnieje - dodaj ją
        this.db.run("ALTER TABLE tasks ADD COLUMN date_start TEXT");
        this.db.run("ALTER TABLE tasks ADD COLUMN date_end TEXT");
        console.log("Added date columns to existing table");
      }

      console.log("SQLite database initialized");
      return { success: true, message: "Database initialized successfully!" };
    } catch (error) {
      console.error("Database initialization error:", error);
      return { success: false, message: `Error: ${error.message}` };
    }
  },

  // Pobranie wszystkich zadań
  getAllTasks() {
    if (!this.db) {
      return { success: false, message: "Database not initialized!", data: [] };
    }

    try {
      const result = this.db.exec("SELECT * FROM tasks");

      if (result.length > 0) {
        const values = result[0].values;
        const tasks = values.map((row) => ({
          id: row[0],
          title: row[1],
          done: row[2],
          date_start: row[3],
          date_end: row[4],
        }));

        return {
          success: true,
          message: `Found ${tasks.length} tasks`,
          data: tasks,
        };
      } else {
        return { success: true, message: "No tasks found", data: [] };
      }
    } catch (error) {
      console.error("Query error:", error);
      return {
        success: false,
        message: `Query error: ${error.message}`,
        data: [],
      };
    }
  },

  // Dodanie zadania
  addTask(title, done = false, dateStart = null, dateEnd = null) {
    if (!this.db) {
      return { success: false, message: "Database not initialized!" };
    }

    try {
      const stmt = this.db.prepare(
        "INSERT INTO tasks (title, done, date_start, date_end) VALUES (?, ?, ?, ?)"
      );
      stmt.run([title.trim(), done ? 1 : 0, dateStart, dateEnd]);
      stmt.free();

      return { success: true, message: `Task "${title}" added successfully!` };
    } catch (error) {
      console.error("Add task error:", error);
      return { success: false, message: `Add error: ${error.message}` };
    }
  },

  // Aktualizacja zadania
  updateTask(id, done, dateEnd = null) {
    if (!this.db) {
      return { success: false, message: "Database not initialized!" };
    }

    try {
      // Jeśli zadanie jest oznaczane jako done, ustaw date_end
      if (done && !dateEnd) {
        dateEnd = new Date().toISOString();
      }
      // Jeśli zadanie jest odznaczane (undone), wyczyść date_end
      if (!done) {
        dateEnd = null;
      }

      this.db.run("UPDATE tasks SET done = ?, date_end = ? WHERE id = ?", [
        done ? 1 : 0,
        dateEnd,
        id,
      ]);
      return { success: true, message: `Task #${id} updated!` };
    } catch (error) {
      console.error("Update task error:", error);
      return { success: false, message: `Update error: ${error.message}` };
    }
  },

  // Usunięcie zadania
  deleteTask(id) {
    if (!this.db) {
      return { success: false, message: "Database not initialized!" };
    }

    try {
      this.db.run("DELETE FROM tasks WHERE id = ?", [id]);
      return { success: true, message: `Task #${id} deleted!` };
    } catch (error) {
      console.error("Delete task error:", error);
      return { success: false, message: `Delete error: ${error.message}` };
    }
  },

  // Wyczyszczenie bazy
  clearAll() {
    if (!this.db) {
      return { success: false, message: "Database not initialized!" };
    }

    try {
      this.db.run("DELETE FROM tasks");
      return { success: true, message: "All tasks cleared!" };
    } catch (error) {
      console.error("Clear error:", error);
      return { success: false, message: `Clear error: ${error.message}` };
    }
  },

  // Zapis do IndexedDB
  async persist() {
    if (!this.db) {
      return { success: false, message: "Database not initialized!" };
    }

    return new Promise((resolve) => {
      try {
        const data = this.db.export();
        const request = indexedDB.open(this.DB_NAME, 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME);
          }
        };

        request.onsuccess = (event) => {
          const idb = event.target.result;
          const transaction = idb.transaction([this.STORE_NAME], "readwrite");
          const store = transaction.objectStore(this.STORE_NAME);

          const putRequest = store.put(data, "database");

          putRequest.onerror = () => {
            idb.close();
            if (putRequest.error.name === "QuotaExceededError") {
              resolve({
                success: false,
                message:
                  "Storage quota exceeded! Please export and clear old data.",
              });
            } else {
              resolve({
                success: false,
                message: `Persist error: ${putRequest.error}`,
              });
            }
          };

          transaction.oncomplete = () => {
            console.log("Database saved to IndexedDB");
            idb.close();
            resolve({
              success: true,
              message: "Database persisted to IndexedDB successfully!",
            });
          };

          transaction.onerror = () => {
            idb.close();
            resolve({
              success: false,
              message: `Persist error: ${transaction.error}`,
            });
          };
        };

        request.onerror = () => {
          resolve({
            success: false,
            message: `IndexedDB error: ${request.error}`,
          });
        };
      } catch (error) {
        console.error("Persist error:", error);
        resolve({ success: false, message: `Persist error: ${error.message}` });
      }
    });
  },

  // Wczytanie z IndexedDB
  async loadFromIndexedDB() {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(this.DB_NAME, 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME);
          }
        };

        request.onsuccess = async (event) => {
          const idb = event.target.result;
          const transaction = idb.transaction([this.STORE_NAME], "readonly");
          const store = transaction.objectStore(this.STORE_NAME);
          const getRequest = store.get("database");

          getRequest.onsuccess = async () => {
            const data = getRequest.result;

            if (data) {
              const SQL = await initSqlJs({
                locateFile: (file) =>
                  `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`,
              });

              if (this.db) {
                this.db.close();
              }

              this.db = new SQL.Database(data);

              // Sprawdź czy kolumny istnieją i dodaj je jeśli nie (migracja)
              try {
                this.db.exec("SELECT date_start FROM tasks LIMIT 1");
              } catch (e) {
                // Kolumna nie istnieje - dodaj ją
                this.db.run("ALTER TABLE tasks ADD COLUMN date_start TEXT");
                this.db.run("ALTER TABLE tasks ADD COLUMN date_end TEXT");
                console.log("Migrated old database - added date columns");
              }

              console.log("Database loaded from IndexedDB");
              idb.close();
              resolve({
                success: true,
                message: "Database loaded from IndexedDB successfully!",
              });
            } else {
              idb.close();
              resolve({
                success: false,
                message: "No saved database found in IndexedDB",
              });
            }
          };

          getRequest.onerror = () => {
            idb.close();
            resolve({
              success: false,
              message: `Load error: ${getRequest.error}`,
            });
          };
        };

        request.onerror = () => {
          resolve({
            success: false,
            message: `IndexedDB error: ${request.error}`,
          });
        };
      } catch (error) {
        console.error("Load error:", error);
        resolve({ success: false, message: `Load error: ${error.message}` });
      }
    });
  },
};
