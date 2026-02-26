import { useState, useEffect } from 'react';
import { Users, ListTodo, Trash2, Shield, Search, Loader2, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../utils/api';
import clsx from 'clsx';

const TABS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'tasks', label: 'All Tasks', icon: ListTodo },
];

export default function AdminPage() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetch = tab === 'users'
      ? api.get('/admin/users', { params: { page, limit: 15, search } })
      : api.get('/admin/tasks', { params: { page, limit: 15, search } });

    fetch.then(({ data }) => {
      if (tab === 'users') setUsers(data.users);
      else setTasks(data.tasks);
      setTotalPages(data.totalPages);
    }).catch(() => toast.error('Failed to fetch data')).finally(() => setLoading(false));
  }, [tab, page, search]);

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/admin/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: data.role } : u));
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const priorityColors = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high' };

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent/15 border border-accent/20 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage users and content</p>
        </div>
      </div>

      {/* System stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Total Tasks', value: stats.totalTasks },
            { label: 'Completed', value: stats.completedTasks },
            { label: 'Admins', value: stats.adminCount },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <div className="text-2xl font-display font-bold text-white">{s.value}</div>
              <div className="text-white/40 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setPage(1); setSearch(''); }}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t.id
                ? 'bg-accent/15 text-accent border border-accent/20'
                : 'text-white/40 hover:text-white hover:bg-surface-3'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          className="input pl-10"
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Content */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : tab === 'users' ? (
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                {['Name', 'Email', 'Role', 'Tasks', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-surface-3/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
                        {user.name[0].toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-sm">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={clsx('badge', user.role === 'admin' ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-surface-4 text-white/40 border border-white/10')}>
                      {user.role === 'admin' && <Crown className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-sm font-mono">{user.taskCount}</td>
                  <td className="px-5 py-4 text-white/40 text-sm">{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-5 py-4">
                    <select
                      className="bg-surface-3 border border-white/8 text-white/60 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent/60"
                      value={user.role}
                      onChange={e => handleRoleChange(user._id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                {['Title', 'User', 'Priority', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tasks.map(task => (
                <tr key={task._id} className="hover:bg-surface-3/50 transition-colors">
                  <td className="px-5 py-4 text-white text-sm max-w-48 truncate">{task.title}</td>
                  <td className="px-5 py-4 text-white/40 text-sm">{task.user?.name || 'N/A'}</td>
                  <td className="px-5 py-4">
                    <span className={clsx('badge', priorityColors[task.priority])}>{task.priority}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={clsx('badge',
                      task.status === 'completed' ? 'status-completed' :
                      task.status === 'inprogress' ? 'status-inprogress' : 'status-todo'
                    )}>{task.status}</span>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-sm">{format(new Date(task.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-2 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-white/40">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
