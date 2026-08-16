import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('operator');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ name, email, password, role });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card glass" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p className="subtitle">Join the plant floor system</p>
        {error && <div className="error-msg">{error}</div>}

        <label>Role</label>
        <div className="role-toggle">
          <button type="button" className={role === 'admin' ? 'role-btn active' : 'role-btn'} onClick={() => setRole('admin')}>Admin</button>
          <button type="button" className={role === 'supervisor' ? 'role-btn active' : 'role-btn'} onClick={() => setRole('supervisor')}>Supervisor</button>
          <button type="button" className={role === 'operator' ? 'role-btn active' : 'role-btn'} onClick={() => setRole('operator')}>Operator</button>
        </div>

        <label>Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />

        <button type="submit" disabled={busy}>{busy ? 'Creating...' : 'Register'}</button>
        <p className="switch-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
