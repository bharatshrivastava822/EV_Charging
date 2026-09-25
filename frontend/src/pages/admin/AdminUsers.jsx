import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { LoadingState, EmptyState } from '../../components/UI';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    adminService.getAllUsers()
      .then(setUsers)
      .catch(() => addToast('Failed to load users.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: '0 0 0.15rem' }}>User Management</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>{users.length} registered users</p>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', padding: '0.75rem 1rem' }}>
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input type="text" className="form-control" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone" style={{ paddingLeft: '2rem' }} />
        </div>
      </div>

      {loading ? <LoadingState /> : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <EmptyState title="No users found" message="No users match your search." />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.role === 'ADMIN' ? 'var(--accent)' : 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>{u.email}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{u.phone || '—'}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-available'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{u.bookingCount ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--muted)' }}>
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
}
