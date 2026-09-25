import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, ArrowRight, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Full name is required (min 2 characters)';
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please provide a valid email address';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Valid phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/[\s-+]/g, ''))) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!form.password || form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
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
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password
      });

      addToast('Account created successfully. Please sign in.', 'success');
      navigate('/login', {
        state: { message: 'Account created successfully. You can now sign in with your credentials.' }
      });
    } catch (err) {
      const msg = err.message || err.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(errs => ({ ...errs, [field]: undefined }));
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '82vh', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '8px', background: 'var(--primary)', color: 'var(--primary-contrast)' }}>
              <Zap size={22} fill="currentColor" />
            </span>
            Charger<span style={{ color: 'var(--primary)' }}>Go</span>
          </Link>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.35rem', color: '#FFFFFF' }}>Create Driver Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>

        {/* Card Container */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
          
          {errors.general && (
            <div role="alert" style={{ background: 'var(--danger-light)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--danger)' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Vikramaditya Singh"
                  autoComplete="name"
                />
                <User size={16} color="var(--muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="name@domain.com"
                  autoComplete="email"
                />
                <Mail size={16} color="var(--muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Mobile Number *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="phone"
                  type="tel"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="9876543210"
                  autoComplete="tel"
                />
                <Phone size={16} color="var(--muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirm-password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1.25rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : <>Complete Registration <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
