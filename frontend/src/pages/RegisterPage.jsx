import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, ArrowRight, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminSecret: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    return score;
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.adminSecret);
      toast.success('Account created! Welcome aboard');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-glow-sm">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl text-white">TaskFlow</span>
        </div>

        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-white">Create account</h2>
          <p className="text-white/40 mt-2">Start managing your tasks smarter today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Full name</label>
            <input
              type="text"
              className="input"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-12"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength ? strengthColors[strength] : 'bg-surface-4'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-white/30">{strengthLabels[strength]}</span>
              </div>
            )}
          </div>

          {/* Admin Secret Field */}
          <div className="pt-2">
            <div className="border-t border-white/5 pt-4">
              <label className="block text-sm font-medium text-white/60 mb-1">
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  Admin Secret
                  <span className="text-white/25 font-normal text-xs">(optional)</span>
                </span>
              </label>
              <p className="text-xs text-white/25 mb-2">Enter the admin secret key to register as an admin. Leave blank for a regular account.</p>
              <div className="relative">
                <input
                  type={showAdminSecret ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Admin secret key..."
                  value={form.adminSecret}
                  onChange={e => setForm({ ...form, adminSecret: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminSecret(!showAdminSecret)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showAdminSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-light transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
