import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Search, Filter, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import clsx from 'clsx';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'text-white/60', accent: 'bg-white/10' },
  { id: 'inprogress', label: 'In Progress', color: 'text-blue-400', accent: 'bg-blue-500/10' },
  { id: 'completed', label: 'Completed', color: 'text-emerald-400', accent: 'bg-emerald-500/10' },
];

const LIMIT = 10;

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ priority: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...(search && { search }), ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const getColumnTasks = (colId) => tasks.filter(t => t.status === colId);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));

    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
      toast.success('Task moved');
    } catch {
      toast.error('Failed to update task');
      fetchTasks();
    }
  };

  const handleCreate = async (data) => {
    try {
      const { data: newTask } = await api.post('/tasks', data);
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const handleUpdate = async (data) => {
    try {
      const { data: updated } = await api.put(`/tasks/${editingTask._id}`, data);
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
      toast.success('Task updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
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

  const handleToggleImportant = async (id) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/important`);
      setTasks(prev => prev.map(t => t._id === id ? data : t));
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ priority: '', status: '' });
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const hasFilters = search || filters.priority || filters.status;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Task Board</h1>
            <p className="text-white/40 text-sm mt-1">{total} tasks total</p>
          </div>
          <button
            onClick={() => { setEditingTask(null); setDefaultStatus('todo'); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              className="input pl-10 pr-4"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx('btn-secondary', showFilters && 'border-accent/40 text-accent')}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-accent ml-1" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-rose-400 hover:text-rose-300">
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="flex gap-4 mt-4 animate-fade-in">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Priority</label>
              <select
                className="input text-sm py-2"
                value={filters.priority}
                onChange={e => { setFilters({ ...filters, priority: e.target.value }); setPage(1); }}
              >
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Status</label>
              <select
                className="input text-sm py-2"
                value={filters.status}
                onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              >
                <option value="">All statuses</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-6 h-full">
              {COLUMNS.map(col => {
                const colTasks = getColumnTasks(col.id);
                return (
                  <div key={col.id} className="flex flex-col">
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h2 className={clsx('font-semibold text-sm', col.color)}>{col.label}</h2>
                        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-mono', col.accent, col.color)}>
                          {colTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => { setEditingTask(null); setDefaultStatus(col.id); setShowModal(true); }}
                        className="text-white/20 hover:text-white/60 transition-colors p-1 rounded-lg hover:bg-surface-3"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={clsx(
                            'flex-1 rounded-2xl p-3 min-h-32 transition-all duration-200 space-y-3',
                            snapshot.isDraggingOver
                              ? 'bg-accent/5 border-2 border-dashed border-accent/30'
                              : 'bg-surface-1/50 border-2 border-transparent'
                          )}
                        >
                          {colTasks.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={clsx(snapshot.isDragging && 'opacity-80 rotate-1 scale-105')}
                                >
                                  <TaskCard
                                    task={task}
                                    dragHandleProps={provided.dragHandleProps}
                                    onEdit={(t) => { setEditingTask(t); setShowModal(true); }}
                                    onDelete={handleDelete}
                                    onToggleImportant={handleToggleImportant}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {colTasks.length === 0 && !snapshot.isDraggingOver && (
                            <div className="text-center py-8 text-white/20 text-sm">
                              No tasks here
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4 border-t border-white/5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-white/40">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          defaultStatus={defaultStatus}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSubmit={editingTask ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
