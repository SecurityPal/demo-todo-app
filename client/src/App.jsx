import { useState, useEffect } from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api';
import { Plus, Trash2, Check, Circle, ListTodo, Loader2 } from 'lucide-react';

function App() {
  const [todos, setTodos] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newText.trim()) return;
    try {
      const todo = await createTodo(newText);
      setTodos((prev) => [todo, ...prev]);
      setNewText('');
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggle(todo) {
    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="min-h-screen flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <ListTodo size={28} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Todo App</h1>
          </div>
          <p className="text-gray-500 text-sm">Stay organized, get things done</p>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         placeholder:text-gray-400 text-gray-700"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700
                         transition-colors shadow-sm flex items-center gap-1 font-medium"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors
                ${filter === f
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {f}
              <span className="ml-1.5 text-xs opacity-60">
                {f === 'all' ? todos.length : f === 'active' ? activeCount : completedCount}
              </span>
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <Loader2 size={32} className="animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ListTodo size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {filter === 'all'
                  ? 'No todos yet. Add one above!'
                  : `No ${filter} todos.`}
              </p>
            </div>
          ) : (
            filtered.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center gap-3 p-4 bg-white rounded-xl border
                           shadow-sm hover:shadow-md transition-all
                           ${todo.completed ? 'border-green-100 bg-green-50/30' : 'border-gray-100'}`}
              >
                <button
                  onClick={() => handleToggle(todo)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                             transition-colors
                             ${todo.completed
                               ? 'bg-green-500 border-green-500 text-white'
                               : 'border-gray-300 hover:border-indigo-400'
                             }`}
                >
                  {todo.completed ? <Check size={14} /> : <Circle size={14} className="opacity-0" />}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500
                             hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {todos.length > 0 && (
          <div className="mt-4 text-center text-xs text-gray-400">
            {activeCount} remaining · {completedCount} completed
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
