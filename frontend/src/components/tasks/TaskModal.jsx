import { useState, useEffect } from 'react';
import { X, Tag, Calendar, Loader2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function TaskModal({ task, onClose, onSubmit, defaultStatus = 'todo' }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || defaultStatus,
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    tags: task?.tags?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null,
      };
      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Close on escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="card w-full max-w-lg animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-display font-bold text-lg text-white">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1 rounded-lg hover:bg-surface-4 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Title *</label>
            <input
              type="text"
              className="input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
            <textarea
              className="input resize-none"
              placeholder="Add some details..."
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Priority & Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={clsx(
                      'flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all duration-200 border',
                      form.priority === p ? {
                        low: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
                        medium: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
                        high: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
                      }[p] : 'bg-surface-3 border-white/8 text-white/40 hover:text-white/60'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Due Date</label>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Tags</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                className="input pl-10"
                placeholder="design, frontend, urgent (comma separated)"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? 'Update' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
