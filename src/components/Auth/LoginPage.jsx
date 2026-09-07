import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, Eye, EyeOff, AlertCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { signIn } from '../../services/authService';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    if (!configured) {
      setErrorMessage('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
      return;
    }

    setLoading(true);
    try {
      const data = await signIn(email, password);
      if (data?.user && onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = 'Invalid email or password. Please verify your credentials and try again.';
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        msg = 'Your email has not been confirmed yet. Please verify your email in the Supabase Dashboard or click the confirmation link.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0b1120',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.1) 0px, transparent 50%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        padding: '36px 32px',
        position: 'relative'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px -2px rgba(37, 99, 235, 0.4)',
            marginBottom: '16px'
          }}>
            <GraduationCap size={30} strokeWidth={2.4} />
          </div>

          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.025em',
            margin: '0 0 6px 0'
          }}>
            Placement Management Portal
          </h1>

          <div style={{
            display: 'inline-block',
            padding: '3px 10px',
            background: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#93c5fd',
            marginBottom: '8px'
          }}>
            Cybersecurity & IoT Department
          </div>

          <p style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            margin: 0
          }}>
            Authorized Placement Mentor & Coordinator Sign In
          </p>
        </div>

        {/* Configuration Warning Notice if missing env */}
        {!configured && (
          <div style={{
            backgroundColor: 'rgba(217, 119, 6, 0.12)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            color: '#fde68a',
            fontSize: '0.8rem',
            lineHeight: 1.45
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }} />
            <div>
              <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '2px' }}>
                Supabase Credentials Required
              </strong>
              Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> file as documented in <code>SETUP.md</code>.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            color: '#fca5a5',
            fontSize: '0.825rem',
            lineHeight: 1.45
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#e2e8f0',
              marginBottom: '6px'
            }}>
              Mentor Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Mail size={16} />
              </div>
              <input
                type="email"
                className="form-control"
                style={{
                  paddingLeft: '38px',
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#f8fafc'
                }}
                placeholder="mentor@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#e2e8f0',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{
                  paddingLeft: '38px',
                  paddingRight: '38px',
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#f8fafc'
                }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              marginTop: '8px',
              padding: '11px',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#2563eb',
              borderColor: '#2563eb'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Portal</span>
            )}
          </button>
        </form>

        {/* Security / Provisioning Notice */}
        <div style={{
          marginTop: '26px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.5
          }}>
            🔒 <strong>Protected Portal:</strong> Accounts are provisioned exclusively by the Placement Administration via the Supabase Console. Self-registration is disabled.
          </p>
        </div>
      </div>
    </div>
  );
}
