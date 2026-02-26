import { format, isPast, isToday } from 'date-fns';
import { Star, Edit2, Trash2, Calendar, Tag, GripVertical } from 'lucide-react';
import clsx from 'clsx';

const priorityConfig = {
  low: { label: 'Low', className: 'priority-low', dot: 'bg-emerald-400' },
  medium: { label: 'Medium', className: 'priority-medium', dot: 'bg-amber-400' },
  high: { label: 'High', className: 'priority-high', dot: 'bg-rose-400' },
};

export default function TaskCard({ task, onEdit, onDelete, onToggleImportant, dragHandleProps }) {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = task.dueDate && task.status !== 'completed' && isPast(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <div className={clsx(
      'card card-hover p-4 group cursor-default animate-scale-in',
      task.isImportant && 'border-accent/20'
    )}>
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        {dragHandleProps && (
          <div {...dragHandleProps} className="mt-0.5 text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing flex-shrink-0">
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={clsx(
              'font-medium text-sm leading-snug',
              task.status === 'completed' ? 'text-white/40 line-through' : 'text-white'
            )}>
              {task.title}
            </h3>
            <button
              onClick={() => onToggleImportant(task._id)}
              className={clsx(
                'flex-shrink-0 transition-all duration-200 p-0.5 rounded',
                task.isImportant
                  ? 'text-amber-400'
                  : 'text-white/20 hover:text-amber-400 opacity-0 group-hover:opacity-100'
              )}
            >
              <Star className="w-3.5 h-3.5" fill={task.isImportant ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-white/40 text-xs mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-1.5 mt-3">
            <span className={clsx('badge', priority.className)}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', priority.dot)} />
              {priority.label}
            </span>

            {task.dueDate && (
              <span className={clsx(
                'badge flex items-center gap-1',
                isOverdue ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
                isDueToday ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                'bg-surface-4 text-white/40 border border-white/10'
              )}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dueDate), 'MMM d')}
                {isOverdue && ' ⚠'}
              </span>
            )}

            {task.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="badge bg-accent/10 text-accent-light border border-accent/20">
                #{tag}
              </span>
            ))}
            {task.tags?.length > 2 && (
              <span className="text-xs text-white/30">+{task.tags.length - 2}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <span className="text-xs text-white/20">
              {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-surface-4 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
