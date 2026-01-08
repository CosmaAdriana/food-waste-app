import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config.js';

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
      const res = await axios.post(`${API_URL}/api/auth/login`, {
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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <div className="card">
        <h1 className="text-center">Food Waste App</h1>
        <h2 className="text-center mb-lg">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-md">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-md">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && <p className="text-danger mb-md">{errorMessage}</p>}

          <button type="submit" style={{ width: '100%' }}>
            Login
          </button>
        </form>

        <p className="mt-lg text-center">
          Nu ai cont? <a href="/register">Înregistrează-te</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
