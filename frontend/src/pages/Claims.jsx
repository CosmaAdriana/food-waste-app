// Pagina cu cereri de produse
// Utilizatorul poate vedea cererile trimise (My Claims) si cererile primite (Received Requests)
// Poate aproba/respinge cererile primite pentru produsele lui

import { useState, useEffect } from 'react';
import axios from 'axios';

function Claims() {
  const [myClaims, setMyClaims] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMyClaims();
    fetchReceivedRequests();
  }, []);

  const fetchMyClaims = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/foods/my-claims', {
        withCredentials: true
      });
      setMyClaims(res.data.claims || []);
      setLoading(false);
    } catch (err) {
      setError('Nu s-au putut încărca cererile trimise');
      setLoading(false);
    }
  };

  const fetchReceivedRequests = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/requests/received', {
        withCredentials: true
      });
      setReceivedRequests(res.data.requests || []);
    } catch (err) {
      console.error('Nu s-au putut încărca cererile primite', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#ffc107'; 
      case 'APPROVED':
        return '#28a745'; 
      case 'REJECTED':
        return '#dc3545';
      default:
        return '#6c757d'; 
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'În așteptare';
      case 'APPROVED':
        return 'Aprobat';
      case 'REJECTED':
        return 'Respins';
      default:
        return status;
    }
  };

  const handleApprove = async (requestId, productName, claimerName) => {
    const confirmApprove = window.confirm(
      `Ești sigur că vrei să aprobi cererea lui ${claimerName} pentru "${productName}"?`
    );
    if (!confirmApprove) return;

    try {
      await axios.patch(
        `http://localhost:3000/api/requests/${requestId}/approve`,
        {},
        { withCredentials: true }
      );

      setSuccessMessage(`Cererea pentru "${productName}" a fost aprobată!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reincarca cererile
      fetchReceivedRequests();
    } catch (err) {
      alert('Eroare la aprobarea cererii: ' + (err.response?.data?.message || 'Eroare necunoscută'));
    }
  };

  const handleReject = async (requestId, productName, claimerName) => {
    const confirmReject = window.confirm(
      `Ești sigur că vrei să respingi cererea lui ${claimerName} pentru "${productName}"?`
    );
    if (!confirmReject) return;

    try {
      await axios.patch(
        `http://localhost:3000/api/requests/${requestId}/reject`,
        {},
        { withCredentials: true }
      );

      setSuccessMessage(`Cererea pentru "${productName}" a fost respinsă!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reincarca cererile
      fetchReceivedRequests();
    } catch (err) {
      alert('Eroare la respingerea cererii: ' + (err.response?.data?.message || 'Eroare necunoscută'));
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Se încarcă...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cereri de Produse</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          {successMessage}
        </div>
      )}

      {/* Sectiunea "My Claims" - Cererile pe care le-am trimis */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Cererile Mele</h2>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Produse pe care le-ai solicitat de la prieteni
        </p>

        {myClaims.length === 0 ? (
          <p>Nu ai trimis nicio cerere încă.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {myClaims.map((claim) => (
              <div
                key={claim.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                <h3>{claim.product.name}</h3>

                <p>
                  <strong>Proprietar:</strong> {claim.product.owner.name}
                </p>

                <p>
                  <strong>Categorie:</strong>{' '}
                  {claim.product.category ? claim.product.category.name : 'Fără categorie'}
                </p>

                <p>
                  <strong>Data cererii:</strong> {formatDate(claim.createdAt)}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    color: getStatusColor(claim.status),
                    fontWeight: 'bold'
                  }}>
                    {getStatusText(claim.status)}
                  </span>
                </p>

                {claim.product.notes && (
                  <p><strong>Note:</strong> {claim.product.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sectiunea "Received Requests" - Cererile primite pentru produsele mele */}
      <div>
        <h2>Cereri Primite</h2>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Cereri de la prieteni pentru produsele tale
        </p>

        {receivedRequests.length === 0 ? (
          <p>Nu ai cereri primite încă.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {receivedRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                <h3>{request.product.name}</h3>

                <p>
                  <strong>Solicitant:</strong> {request.claimer.name} ({request.claimer.email})
                </p>

                <p>
                  <strong>Categorie:</strong>{' '}
                  {request.product.category ? request.product.category.name : 'Fără categorie'}
                </p>

                <p>
                  <strong>Data cererii:</strong> {formatDate(request.createdAt)}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    color: getStatusColor(request.status),
                    fontWeight: 'bold'
                  }}>
                    {getStatusText(request.status)}
                  </span>
                </p>

                {request.product.notes && (
                  <p><strong>Note:</strong> {request.product.notes}</p>
                )}

                {/* Butoane de actiuni doar dacă statusul e PENDING */}
                {request.status === 'PENDING' && (
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApprove(request.id, request.product.name, request.claimer.name)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Aprobă
                    </button>
                    <button
                      onClick={() => handleReject(request.id, request.product.name, request.claimer.name)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Respinge
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Claims;
