import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { operatorService } from '../../services/operatorService';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw,
  LogOut,
  ArrowRight
} from 'lucide-react';

export default function OperatorStatus() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const data = await operatorService.getStatus();
      setStatusData(data);
      if (data.approved) {
        navigate('/operator', { replace: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPending = user?.operatorStatus === 'PENDING' || statusData?.operatorStatus === 'PENDING';
  const isRejected = user?.operatorStatus === 'REJECTED' || statusData?.operatorStatus === 'REJECTED';

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
      <div style={{ maxWidth: '580px', width: '100%' }}>
        
        {/* Status Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.25rem', boxShadow: 'var(--shadow-md)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: isRejected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: isRejected ? 'var(--danger)' : '#FBBF24', marginBottom: '1rem' }}>
              {isRejected ? <AlertCircle size={32} /> : <Clock size={32} />}
            </div>
            
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem' }}>
              {isRejected ? 'Operator Application Declined' : 'Operator Application Under Review'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {statusData?.message || 'Your partner account has been submitted and is queued for verification.'}
            </p>
          </div>

          {/* Account Details Box */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Applicant Name</span>
                <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{user?.name}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Account Role</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Station Operator</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Email Address</span>
                <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{user?.email}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Approval Status</span>
                <span style={{ fontWeight: 700, color: isRejected ? 'var(--danger)' : '#FBBF24' }}>
                  ● {statusData?.operatorStatus || user?.operatorStatus || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Timeline */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Application Progress
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(184, 255, 0, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>Registration Submitted</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Account details received successfully</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isRejected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: isRejected ? 'var(--danger)' : '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>Admin Verification</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {isRejected ? 'Application was not approved by platform administrator' : 'Queued in Administrator Console review list'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', opacity: isRejected ? 0.3 : 0.5 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>Operator Console Activation</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unlock station creation, slot generation, and revenue analytics</div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Demonstration Note */}
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', marginBottom: '1.75rem', fontSize: '0.8125rem', color: '#93C5FD' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#60A5FA' }}>Academic Evaluation Demonstration Note</div>
            To review or approve this operator application for demonstration, sign in with the <strong>Admin account</strong> (<code>admin@evcharge.in</code>) and navigate to <strong>Admin Console → Operator Approvals</strong>.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
            <button
              onClick={checkStatus}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> Check Approval Status
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

