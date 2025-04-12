import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const root = ReactDOM.createRoot(document.getElementById("appu"));

function TodoApp() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("todo-ultimate");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [theme, setTheme] = useState("light");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    localStorage.setItem("todo-ultimate", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Task manipulation functions
  const addOrUpdate = () => {
    if (input.trim() === "") return;
    if (editId !== null) {
      setTasks(tasks.map((item) =>
        item.id === editId ? { ...item, name: input, dueDate } : item
      ));
      setEditId(null);
    } else {
      setTasks([...tasks, { 
        id: Date.now(), 
        name: input, 
        completed: false, 
        dueDate 
      }]);
    }
    setInput("");
    setDueDate("");
  };

  const deleteTask = (id) => setTasks(tasks.filter((item) => item.id !== id));
  
  const editTask = (id) => {
    const selected = tasks.find((item) => item.id === id);
    setInput(selected.name);
    setDueDate(selected.dueDate || "");
    setEditId(id);
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const markAllDone = () => {
    setTasks(tasks.map(item => ({ ...item, completed: true })));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(item => !item.completed));
  };

  // Filtered tasks calculation
  const filteredTasks = tasks
    .filter((item) => {
      if (filter === "active") return !item.completed;
      if (filter === "completed") return item.completed;
      return true;
    })
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  // Statistics for chart
  const taskStats = [
    { name: 'Active', count: tasks.filter(t => !t.completed).length },
    { name: 'Completed', count: tasks.filter(t => t.completed).length },
    { name: 'Total', count: tasks.length }
  ];

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">🌟 Ultimate To-Do</h1>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} 
                className="theme-btn">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      <div className="search-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search tasks..."
          className="search-input"
        />
      </div>

      <div className="task-creator">
        <div className="input-group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add your task..."
            className="task-input"
          />
          <input
            type="date"
            className="date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button onClick={addOrUpdate} className="primary-btn">
          {editId !== null ? "🔄 Update" : "➕ Add Task"}
        </button>
      </div>

      <div className="controls">
        <div className="filters">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="bulk-actions">
          <button onClick={markAllDone} className="secondary-btn">
            ✅ Mark All Done
          </button>
          <button onClick={clearCompleted} className="secondary-btn">
            🧹 Clear Completed
          </button>
        </div>
      </div>

      <ul className="task-list">
        {filteredTasks.length === 0 && (
          <div className="empty-state">🎉 No tasks found! Add a new task above.</div>
        )}
        {filteredTasks.map((item) => (
          <TaskItem
            key={item.id}
            item={item}
            toggleComplete={toggleComplete}
            editTask={editTask}
            deleteTask={deleteTask}
          />
        ))}
      </ul>

      <div className="analytics">
        <h3 className="chart-title">📊 Task Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={taskStats}>
            <XAxis dataKey="name" stroke="var(--text-primary)" />
            <YAxis allowDecimals={false} stroke="var(--text-secondary)" />
            <Tooltip
              contentStyle={{
                background: 'var(--background)',
                border: '1px solid var(--accent)',
                borderRadius: '8px'
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--accent)"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        :root {
          --background: #ffffff;
          --text-primary: #1a1a1a;
          --text-secondary: #666;
          --accent: #6366f1;
          --border: #e5e7eb;
          --card-bg: #f8fafc;
        }

        .dark {
          --background: #0f172a;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --accent: #818cf8;
          --border: #1e293b;
          --card-bg: #1e293b;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          transition: background-color 0.2s, color 0.2s;
        }

        body {
          font-family: 'Inter', sans-serif;
          background-color: var(--background);
          color: var(--text-primary);
          min-height: 100vh;
          padding: 2rem;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .title {
          font-size: 2.5rem;
          background: linear-gradient(45deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .theme-btn {
          background: var(--card-bg);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .search-bar {
          margin-bottom: 1.5rem;
        }

        .search-input {
          width: 100%;
          padding: 0.8rem;
          border: 2px solid var(--border);
          border-radius: 8px;
          background: var(--card-bg);
          color: var(--text-primary);
        }

        .task-creator {
          background: var(--card-bg);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .input-group {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .task-input, .date-input {
          padding: 0.8rem;
          border: 2px solid var(--border);
          border-radius: 8px;
          background: var(--background);
          color: var(--text-primary);
        }

        .primary-btn {
          width: 100%;
          padding: 0.8rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .controls {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .filters {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 2px solid var(--border);
          border-radius: 8px;
          background: var(--card-bg);
          color: var(--text-primary);
          cursor: pointer;
        }

        .filter-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .bulk-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .secondary-btn {
          padding: 0.5rem 1rem;
          border: 2px solid var(--border);
          border-radius: 8px;
          background: var(--card-bg);
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 500;
        }

        .task-list {
          list-style: none;
          display: grid;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
          background: var(--card-bg);
          border-radius: 8px;
        }

        .analytics {
          background: var(--card-bg);
          padding: 1.5rem;
          border-radius: 12px;
        }

        .chart-title {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        @media (max-width: 640px) {
          body {
            padding: 1rem;
          }

          .title {
            font-size: 2rem;
          }

          .input-group {
            grid-template-columns: 1fr;
          }

          .bulk-actions {
            grid-template-columns: 1fr;
          }

          .controls {
            grid-template-columns: 1fr;
          }

          .filters {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

function TaskItem({ item, toggleComplete, editTask, deleteTask }) {
  return (
    <li className="task-item">
      <div className="task-content" onClick={() => toggleComplete(item.id)}>
        <span className={`task-status ${item.completed ? 'completed' : ''}`}>
          {item.completed ? '✅' : '⭕'}
        </span>
        <div className="task-body">
          <span className={`task-name ${item.completed ? 'completed' : ''}`}>
            {item.name}
          </span>
          {item.dueDate && (
            <span className="task-due">
              📅 {new Date(item.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button onClick={() => editTask(item.id)} className="icon-btn">
          ✏️
        </button>
        <button onClick={() => deleteTask(item.id)} className="icon-btn">
          🗑️
        </button>
      </div>
    </li>
  );
}

root.render(<TodoApp />);