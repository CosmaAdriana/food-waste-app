import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config.js';

function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [productRequestsCount, setProductRequestsCount] = useState(0);

  useEffect(() => {
    fetchNotificationCounts();
    // Refresh notificari la 30 de secunde
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh notificari când schimbam pagina
  useEffect(() => {
    fetchNotificationCounts();
  }, [location.pathname]);

  const fetchNotificationCounts = async () => {
    try {
      // Cereri de prietenie primite
      const friendsRes = await axios.get(`${API_URL}/api/friends`, {
        withCredentials: true
      });
      const pendingReceived = friendsRes.data.friendships.filter(
        f => f.status === 'PENDING' && f.type === 'received'
      );
      setFriendRequestsCount(pendingReceived.length);

      // Cereri de produse primite
      const requestsRes = await axios.get(`${API_URL}/api/requests/received`, {
        withCredentials: true
      });
      const pendingRequests = requestsRes.data.requests.filter(
        r => r.status === 'PENDING'
      );
      setProductRequestsCount(pendingRequests.length);
    } catch (err) {
      console.error('Eroare la încărcarea notificărilor:', err);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Ești sigur că vrei să te deconectezi?');
    if (!confirmLogout) return;

    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Eroare la logout:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Header with user info and logout */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">Food Waste App</h1>
          <div className="header-user">
            <span>Bună, <strong>{user?.name || 'User'}</strong>!</span>
            <button onClick={handleLogout} className="logout-btn">
              Deconectare
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item">
            <Link
              to="/inventory"
              className={`nav-link ${isActive('/inventory') ? 'active' : ''}`}
            >
              Inventarul Meu
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/available"
              className={`nav-link ${isActive('/available') ? 'active' : ''}`}
            >
              Produse Disponibile
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/friends"
              className={`nav-link ${isActive('/friends') ? 'active' : ''}`}
            >
              Prieteni
              {friendRequestsCount > 0 && (
                <span className="nav-badge">{friendRequestsCount}</span>
              )}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/claims"
              className={`nav-link ${isActive('/claims') ? 'active' : ''}`}
            >
              Cereri
              {productRequestsCount > 0 && (
                <span className="nav-badge">{productRequestsCount}</span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Header;
