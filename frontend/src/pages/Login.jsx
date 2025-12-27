import { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrorMessage('Email-ul este obligatoriu');
      return;
    }
    if (!emailRegex.test(email)) {
      setErrorMessage('Email invalid');
      return;
    }

    if (!password) {
      setErrorMessage('Parola este obligatorie');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Parola trebuie să aibă minim 6 caractere');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      }, {
        withCredentials: true
      });

      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/inventory';
    } catch (error) {
      const message = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Login failed';
      setErrorMessage(message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
      <h1>Food Waste App</h1>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {errorMessage && <p style={{ color: 'var(--danger-color)', marginBottom: '15px' }}>{errorMessage}</p>}

        <button type="submit" style={{ width: '100%', backgroundColor: 'var(--primary-color)', color: 'white' }}>
          Login
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Nu ai cont? <a href="/register">Înregistrează-te</a>
      </p>
    </div>
  );
}

export default Login;
