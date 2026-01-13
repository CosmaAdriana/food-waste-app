import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config.js';

function Friends() {
  const [friendships, setFriendships] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [friendEmail, setFriendEmail] = useState('');
  const [addError, setAddError] = useState('');

  // State pentru grupuri
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupError, setGroupError] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState(null);
  const [selectedFriendshipsForGroup, setSelectedFriendshipsForGroup] = useState([]);

  useEffect(() => {
    fetchFriendships();
    fetchGroups();
  }, []);

  const fetchFriendships = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/friends`, {
        withCredentials: true
      });
      setFriendships(res.data.friendships);
      setLoading(false);
    } catch (err) {
      setError('Nu s-au putut incarca prietenii');
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/groups`, {
        withCredentials: true
      });
      setGroups(res.data.groups);
    } catch (err) {
      console.error('Nu s-au putut incarca grupurile', err);
    }
  };

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

      await axios.post(`${API_URL}/api/friends`, requestData, {
        withCredentials: true
      });

      alert('Cerere de prietenie trimisa cu succes!');
      setFriendEmail('');
      fetchFriendships();
    } catch (err) {
      if (err.response && err.response.data) {
        setAddError(err.response.data.message || err.response.data.error || 'Eroare la trimiterea cererii');
      } else {
        setAddError('Eroare la trimiterea cererii');
      }
    }
  };

  // Functii pentru gestionarea grupurilor
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setGroupError('');

    if (!groupName.trim()) {
      setGroupError('Numele grupului este obligatoriu');
      return;
    }

    try {
      if (editingGroup) {
        // Editare grup existent
        await axios.put(`${API_URL}/api/groups/${editingGroup.id}`, {
          name: groupName
        }, {
          withCredentials: true
        });
        alert('Grup actualizat cu succes!');
      } else {
        // Creare grup nou
        await axios.post(`${API_URL}/api/groups`, {
          name: groupName
        }, {
          withCredentials: true
        });
        alert('Grup creat cu succes!');
      }

      setGroupName('');
      setEditingGroup(null);
      setShowGroupForm(false);
      fetchGroups();
    } catch (err) {
      if (err.response && err.response.data) {
        setGroupError(err.response.data.message || 'Eroare la salvarea grupului');
      } else {
        setGroupError('Eroare la salvarea grupului');
      }
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    const confirm = window.confirm(`Ești sigur că vrei să ștergi grupul "${groupName}"?`);
    if (!confirm) return;

    try {
      await axios.delete(`${API_URL}/api/groups/${groupId}`, {
        withCredentials: true
      });
      alert('Grup șters cu succes!');
      fetchGroups();
    } catch (err) {
      alert('Eroare la ștergerea grupului');
    }
  };

  const handleAddMembersToGroup = async () => {
    if (!selectedGroupForMembers) return;
    if (selectedFriendshipsForGroup.length === 0) {
      alert('Selectează cel puțin un prieten');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/groups/${selectedGroupForMembers}/members`, {
        friendshipIds: selectedFriendshipsForGroup
      }, {
        withCredentials: true
      });

      alert('Membri adăugați cu succes!');
      setSelectedGroupForMembers(null);
      setSelectedFriendshipsForGroup([]);
      fetchGroups();
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.message || 'Eroare la adăugarea membrilor');
      } else {
        alert('Eroare la adăugarea membrilor');
      }
    }
  };

  const handleRemoveMemberFromGroup = async (groupId, membershipId, friendName) => {
    const confirm = window.confirm(`Elimini pe ${friendName} din grup?`);
    if (!confirm) return;

    try {
      await axios.delete(`${API_URL}/api/groups/${groupId}/members/${membershipId}`, {
        withCredentials: true
      });
      alert('Membru eliminat din grup!');
      fetchGroups();
    } catch (err) {
      alert('Eroare la eliminarea membrului');
    }
  };

  const toggleFriendshipSelection = (friendshipId) => {
    setSelectedFriendshipsForGroup(prev => {
      if (prev.includes(friendshipId)) {
        return prev.filter(id => id !== friendshipId);
      } else {
        return [...prev, friendshipId];
      }
    });
  };

  const handleAccept = async (friendshipId, friendName) => {
    const confirm = window.confirm(`Accepti cererea de prietenie de la ${friendName}?`);
    if (!confirm) return;

    try {
      await axios.patch(`${API_URL}/api/friends/${friendshipId}/accept`, {}, {
        withCredentials: true
      });
      alert('Cerere acceptata!');
      fetchFriendships();
    } catch (err) {
      alert('Eroare la acceptarea cererii');
    }
  };

  const handleReject = async (friendshipId, friendName) => {
    const confirm = window.confirm(`Refuzi cererea de prietenie de la ${friendName}?`);
    if (!confirm) return;

    try {
      await axios.patch(`${API_URL}/api/friends/${friendshipId}/reject`, {}, {
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
    return <div>Se incarca...</div>;
  }

  return (
    <div>
      <h1>Prieteni & Grupuri</h1>

      {error && <p className="text-danger">{error}</p>}

      {/* Formular adaugare prieten */}
      <div className="card mb-xl" style={{ backgroundColor: '#f8f9fa' }}>
        <h2>Adauga Prieten</h2>
        <form onSubmit={handleAddFriend}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="email"
                placeholder="Email-ul prietenului"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                whiteSpace: 'nowrap'
              }}
            >
              Trimite Cerere
            </button>
          </div>
          {addError && <p className="text-danger" style={{ margin: '0' }}>{addError}</p>}
        </form>
      </div>

      {/* SECTIUNE GRUPURI */}
      <div className="card mb-xl" style={{ backgroundColor: '#e8f5e9' }}>
        <h2>Grupurile Mele ({groups.length})</h2>

        <button
          onClick={() => {
            setShowGroupForm(!showGroupForm);
            setEditingGroup(null);
            setGroupName('');
            setGroupError('');
          }}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            marginBottom: '15px'
          }}
        >
          {showGroupForm ? 'Anulează' : 'Creează Grup Nou'}
        </button>

        {showGroupForm && (
          <form onSubmit={handleCreateGroup} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Numele grupului (ex: Familie, Vegetariani)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--success-color)',
                  color: 'white'
                }}
              >
                {editingGroup ? 'Salvează' : 'Creează'}
              </button>
            </div>
            {groupError && <p className="text-danger" style={{ marginTop: '10px' }}>{groupError}</p>}
          </form>
        )}

        {groups.length === 0 ? (
          <p>Nu ai grupuri create încă. Creează primul grup pentru a organiza prietenii!</p>
        ) : (
          <div className="grid">
            {groups.map(group => (
              <div key={group.id} className="card" style={{ backgroundColor: 'white' }}>
                <h3>{group.name}</h3>
                <p><strong>Membri:</strong> {group._count.members}</p>
                <p><strong>Produse:</strong> {group._count.products}</p>

                {/* Lista membri */}
                {group.members.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Membri:</strong>
                    <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                      {group.members.map(member => {
                        const friendship = member.friendship;
                        const friend = friendship.userId === friendship.friend.id
                          ? friendship.user
                          : friendship.friend;
                        return (
                          <li key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <span>{friend.name}</span>
                            <button
                              onClick={() => handleRemoveMemberFromGroup(group.id, member.id, friend.name)}
                              style={{
                                backgroundColor: 'var(--danger-color)',
                                color: 'white',
                                padding: '2px 8px',
                                fontSize: '12px'
                              }}
                            >
                              Elimină
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="mt-md" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setEditingGroup(group);
                      setGroupName(group.name);
                      setShowGroupForm(true);
                      setGroupError('');
                    }}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white'
                    }}
                  >
                    Redenumește
                  </button>
                  <button
                    onClick={() => setSelectedGroupForMembers(group.id)}
                    style={{
                      backgroundColor: 'var(--success-color)',
                      color: 'white'
                    }}
                  >
                    Adaugă Membri
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                    style={{
                      backgroundColor: 'var(--danger-color)',
                      color: 'white'
                    }}
                  >
                    Șterge Grup
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal pentru adaugare membri în grup */}
        {selectedGroupForMembers && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
            onClick={() => {
              setSelectedGroupForMembers(null);
              setSelectedFriendshipsForGroup([]);
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '30px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Adaugă Membri în Grup</h3>
              <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                Selectează prietenii pe care vrei să îi adaugi în grupul "
                {groups.find(g => g.id === selectedGroupForMembers)?.name}".
              </p>

              {acceptedFriends.length === 0 ? (
                <p>Nu ai prieteni acceptați pentru a adăuga în grup.</p>
              ) : (
                <div>
                  {acceptedFriends.map(friendship => (
                    <label
                      key={friendship.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        backgroundColor: selectedFriendshipsForGroup.includes(friendship.id) ? '#e3f2fd' : 'white'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFriendshipsForGroup.includes(friendship.id)}
                        onChange={() => toggleFriendshipSelection(friendship.id)}
                        style={{ marginRight: '10px' }}
                      />
                      <span>{friendship.friend.name} ({friendship.friend.email})</span>
                    </label>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={handleAddMembersToGroup}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--success-color)',
                    color: 'white'
                  }}
                  disabled={selectedFriendshipsForGroup.length === 0}
                >
                  Adaugă ({selectedFriendshipsForGroup.length})
                </button>
                <button
                  onClick={() => {
                    setSelectedGroupForMembers(null);
                    setSelectedFriendshipsForGroup([]);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#ccc',
                    color: '#333'
                  }}
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cereri primite */}
      {pendingReceived.length > 0 && (
        <div className="mb-xl">
          <h2>Cereri Primite ({pendingReceived.length})</h2>
          <div className="grid">
            {pendingReceived.map((friendship) => (
              <div
                key={friendship.id}
                className="card"
                style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107'
                }}
              >
                <h3>{friendship.friend.name}</h3>
                <p><strong>Email:</strong> {friendship.friend.email}</p>
                <div className="mt-sm" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleAccept(friendship.id, friendship.friend.name)}
                    style={{
                      backgroundColor: 'var(--success-color)',
                      color: 'white'
                    }}
                  >
                    Accepta
                  </button>
                  <button
                    onClick={() => handleReject(friendship.id, friendship.friend.name)}
                    style={{
                      backgroundColor: 'var(--danger-color)',
                      color: 'white'
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
        <div className="mb-xl">
          <h2>Cereri Trimise ({pendingSent.length})</h2>
          <div className="grid">
            {pendingSent.map((friendship) => (
              <div
                key={friendship.id}
                className="card"
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
          <div className="grid">
            {acceptedFriends.map((friendship) => (
              <div
                key={friendship.id}
                className="card"
              >
                <h3>{friendship.friend.name}</h3>
                <p><strong>Email:</strong> {friendship.friend.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
