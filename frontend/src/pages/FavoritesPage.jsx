import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';

export default function FavoritesPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', { params: { important: 'true', limit: 100 } });
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleToggleImportant = async (id) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/important`);
      if (!data.isImportant) {
        setTasks(prev => prev.filter(t => t._id !== id));
        toast.success('Removed from favorites');
      }
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleUpdate = async (data) => {
    try {
      const { data: updated } = await api.put(`/tasks/${editingTask._id}`, data);
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
      toast.success('Task updated!');
    } catch (err) {
      toast.error('Failed to update task');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Favorites</h1>
            <p className="text-white/40 text-sm mt-0.5">{tasks.length} important tasks</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Star className="w-12 h-12 text-white/10 mb-4" />
          <h3 className="text-white/40 font-medium">No favorite tasks yet</h3>
          <p className="text-white/20 text-sm mt-1">Star tasks on the board to mark them as important</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {tasks.map((task, i) => (
            <div key={task._id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <TaskCard
                task={task}
                onEdit={(t) => setEditingTask(t)}
                onDelete={handleDelete}
                onToggleImportant={handleToggleImportant}
              />
            </div>
          ))}
        </div>
      )}

      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
