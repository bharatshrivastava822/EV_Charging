import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const registeredMsg = location.state?.message;

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const user = await login({ email: form.email, password: form.password });
      addToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'STATION_OPERATOR') {
        if (user.operatorStatus === 'APPROVED') {
          navigate('/operator', { replace: true });
        } else {
          navigate('/operator/status', { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.message || err.response?.data?.message || 'Invalid email or password.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, pass) => {
    setForm({ email, password: pass });
    setErrors({});
  };

  return (
    <div style={{ display: 'flex', minHeight: '82vh', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '8px', background: 'var(--primary)', color: 'var(--primary-contrast)' }}>
              <Zap size={22} fill="currentColor" />
            </span>
            Charger<span style={{ color: 'var(--primary)' }}>Go</span>
          </Link>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.35rem', color: '#FFFFFF' }}>Sign In to ChargerGo</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            New to ChargerGo? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create Account</Link>
          </p>
        </div>

        {/* Card Container */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
          
          {registeredMsg && (
            <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} /> {registeredMsg}
            </div>
          )}

          {location.search.includes('expired') && (
            <div style={{ background: 'var(--warning-light)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--warning)' }}>
              Your session expired. Please sign in again.
            </div>
          )}

          {errors.general && (
            <div role="alert" style={{ background: 'var(--danger-light)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--danger)' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                  placeholder="driver@example.com"
                />
                <Mail size={16} color="var(--muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', cursor: 'pointer' }} onClick={() => addToast('Use the demo credentials below to sign in.', 'info')}>
                  Forgot Password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
                <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Signing In...' : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Test Credentials Quick Fill */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              One-Click Demo Credentials
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickFill('aryan@example.com', 'User@123')}
                style={{ fontSize: '0.75rem' }}
              >
                Driver (Aryan)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickFill('operator@evcharge.in', 'Operator@123')}
                style={{ fontSize: '0.75rem', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60A5FA' }}
              >
                Operator (Vikram)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickFill('admin@evcharge.in', 'Admin@123')}
                style={{ fontSize: '0.75rem', borderColor: 'var(--primary-border)', color: 'var(--primary)' }}
              >
                Admin (Console)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
