// Pagina de gestionare prieteni
// Utilizatorul poate trimite cereri de prietenie, accepta/refuza cereri primite si vedea lista de prieteni

import { useState, useEffect } from 'react';
import axios from 'axios';

function Friends() {
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [friendEmail, setFriendEmail] = useState('');
  const [preference, setPreference] = useState('');
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchFriendships();
  }, []);

  // Ia toate prieteniile (acceptate, pending trimise, pending primite)
  const fetchFriendships = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/friends', {
        withCredentials: true
      });
      setFriendships(res.data.friendships);
      setLoading(false);
    } catch (err) {
      setError('Nu s-au putut incarca prietenii');
      setLoading(false);
    }
  };

  // Trimite cerere de prietenie
  const handleAddFriend = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!friendEmail) {
      setAddError('Email-ul este obligatoriu');
      return;
    }

    try {
      const requestData = {
        friendEmail: friendEmail
      };

      if (preference) {
        requestData.preference = preference;
      }

      console.log('Sending request:', requestData);

      await axios.post('http://localhost:3000/api/friends', requestData, {
        withCredentials: true
      });

      alert('Cerere de prietenie trimisa cu succes!');
      setFriendEmail('');
      setPreference('');
      fetchFriendships();
    } catch (err) {
      console.error('Error response:', err.response?.data);
      console.error('Full error:', err);
      if (err.response && err.response.data) {
        setAddError(err.response.data.message || err.response.data.error || 'Eroare la trimiterea cererii');
      } else {
        setAddError('Eroare la trimiterea cererii');
      }
    }
  };

  // Accepta cerere de prietenie primita
  const handleAccept = async (friendshipId, friendName) => {
    const confirm = window.confirm(`Accepti cererea de prietenie de la ${friendName}?`);
    if (!confirm) return;

    try {
      await axios.patch(`http://localhost:3000/api/friends/${friendshipId}/accept`, {}, {
        withCredentials: true
      });
      alert('Cerere acceptata!');
      fetchFriendships();
    } catch (err) {
      alert('Eroare la acceptarea cererii');
    }
  };

  // Refuza cerere de prietenie primita
  const handleReject = async (friendshipId, friendName) => {
    const confirm = window.confirm(`Refuzi cererea de prietenie de la ${friendName}?`);
    if (!confirm) return;

    try {
      await axios.patch(`http://localhost:3000/api/friends/${friendshipId}/reject`, {}, {
        withCredentials: true
      });
      alert('Cerere refuzata!');
      fetchFriendships();
    } catch (err) {
      alert('Eroare la refuzarea cererii');
    }
  };

  const acceptedFriends = friendships.filter(f => f.status === 'ACCEPTED');
  const pendingReceived = friendships.filter(f => f.status === 'PENDING' && f.type === 'received');
  const pendingSent = friendships.filter(f => f.status === 'PENDING' && f.type === 'sent');

  if (loading) {
    return <div style={{ padding: '20px' }}>Se incarca...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Prieteni</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Formular adaugare prieten */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>Adauga Prieten</h2>
        <form onSubmit={handleAddFriend}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <input
                type="email"
                placeholder="Email-ul prietenului"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <select
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="">Fara preferinta (optional)</option>
                <option value="OMNIVOR">Omnivor</option>
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="CARNIVOR">Carnivor</option>
                <option value="VEGAN">Vegan</option>
                <option value="RAW_VEGAN">Raw Vegan</option>
                <option value="ALTCEVA">Altceva</option>
              </select>
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Trimite Cerere
            </button>
          </div>
          {addError && <p style={{ color: 'red', margin: '0' }}>{addError}</p>}
        </form>
      </div>

      {/* Cereri primite */}
      {pendingReceived.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Cereri Primite ({pendingReceived.length})</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingReceived.map((friendship) => (
              <div
                key={friendship.id}
                style={{
                  padding: '15px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '8px',
                  border: '1px solid #ffc107'
                }}
              >
                <h3>{friendship.friend.name}</h3>
                <p><strong>Email:</strong> {friendship.friend.email}</p>
                {friendship.preference && (
                  <p><strong>Preferinta:</strong> {friendship.preference}</p>
                )}
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleAccept(friendship.id, friendship.friend.name)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Accepta
                  </button>
                  <button
                    onClick={() => handleReject(friendship.id, friendship.friend.name)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Refuza
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cereri trimise */}
      {pendingSent.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Cereri Trimise ({pendingSent.length})</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingSent.map((friendship) => (
              <div
                key={friendship.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                <h3>{friendship.friend.name}</h3>
                <p><strong>Email:</strong> {friendship.friend.email}</p>
                <p style={{ color: '#666' }}>In asteptare...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista prieteni acceptati */}
      <div>
        <h2>Prietenii Mei ({acceptedFriends.length})</h2>
        {acceptedFriends.length === 0 ? (
          <p>Nu ai prieteni inca. Adauga primul prieten!</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {acceptedFriends.map((friendship) => (
              <div
                key={friendship.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                <h3>{friendship.friend.name}</h3>
                <p><strong>Email:</strong> {friendship.friend.email}</p>
                {friendship.preference && (
                  <p><strong>Preferinta alimentara:</strong> {friendship.preference}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
