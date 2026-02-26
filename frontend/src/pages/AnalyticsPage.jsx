import { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Loader2, CheckCircle2, AlertCircle, Clock, Star, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const PRIORITY_COLORS = {
  low: '#34D399',
  medium: '#FBBF24',
  high: '#FB7185',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-2 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} className="text-white font-semibold" style={{ color: p.color }}>
            {p.value} tasks
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 text-accent animate-spin" />
    </div>
  );

  const priorityData = Object.entries(data.byPriority).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    value: v,
    fill: PRIORITY_COLORS[k]
  }));

  const statusData = [
    { name: 'Todo', value: data.todo, fill: '#6B7280' },
    { name: 'In Progress', value: data.inprogress, fill: '#60A5FA' },
    { name: 'Completed', value: data.completed, fill: '#34D399' },
  ];

  const stats = [
    { label: 'Total Tasks', value: data.total, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Completed', value: data.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Overdue', value: data.overdue, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Important', value: data.importantCount, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Your productivity at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`card p-5 animate-slide-up`} style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="font-display text-3xl font-bold text-white">{s.value}</div>
            <div className="text-white/40 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Completion Rate */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Completion Rate</h2>
          <span className="font-display text-2xl font-bold text-gradient">{data.completionRate}%</span>
        </div>
        <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-1000"
            style={{ width: `${data.completionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-2">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Tasks by Priority - Bar chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-6">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} barSize={40}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Status - Pie chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-6">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  background: '#18181F',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: s.fill }} />
                <span className="text-xs text-white/40">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent completions */}
      {data.recentCompleted?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-6">Completions (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.recentCompleted.map(r => ({ date: r._id, count: r.count }))} barSize={24}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#7C6FFF" fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
