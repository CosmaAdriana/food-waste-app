// Pagina cu produse disponibile de la prieteni
// Aici utilizatorul poate vedea ce produse au marcat prietenii ca disponibile
// si poate revendica (claim) produsele care il interseaza

import { useState, useEffect } from 'react';
import axios from 'axios';

function Available() {
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchAvailableProducts();
    fetchCategories();
  }, []);

  // Functie care ia produsele disponibile de la prieteni din API
  const fetchAvailableProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/foods/available', {
        withCredentials: true
      });
      setProducts(res.data.products);
      setLoading(false);
    } catch (err) {
      setError('Nu s-au putut incarca produsele disponibile');
      setLoading(false);
    }
  };

  // Functie care ia categoriile din API
  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Nu s-au putut incarca categoriile', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };

  // Functie care trimite cerere de revendicare pentru un produs
  const handleClaimProduct = async (productId, productName, ownerName) => {
    const confirmClaim = window.confirm(`Vrei sa revendici "${productName}" de la ${ownerName}?`);
    if (!confirmClaim) return;

    try {
      await axios.post(`http://localhost:3000/api/foods/${productId}/claim`, {}, {
        withCredentials: true
      });

      alert(`Cerere trimisa cu succes pentru "${productName}"!`);

      // Reincarca lista de produse
      fetchAvailableProducts();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Eroare la trimiterea cererii');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    if (filterCategory && product.categoryId !== parseInt(filterCategory)) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <div style={{ padding: '20px' }}>Se incarca...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Produse Disponibile</h1>
      <p>Produse marcate ca disponibile de catre prietenii tai</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {products.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Filtrare</h3>
          <div>
            <label htmlFor="filterCategory" style={{ marginRight: '10px' }}>Categorie:</label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: '8px', borderRadius: '5px' }}
            >
              <option value="">Toate categoriile</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <p>Nu exista produse disponibile momentan. Prietenii tai nu au marcat niciun produs ca disponibil.</p>
      ) : filteredProducts.length === 0 ? (
        <p>Nu exista produse care sa corespunda filtrelor selectate.</p>
      ) : (
        <div>
          <p>Afisez {filteredProducts.length} din {products.length} produse</p>

          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                <h3>{product.name}</h3>

                <p>
                  <strong>Proprietar:</strong> {product.owner.name} ({product.owner.email})
                </p>

                <p>
                  <strong>Categorie:</strong>{' '}
                  {product.category ? product.category.name : 'Fara categorie'}
                </p>

                <p>
                  <strong>Expira pe:</strong> {formatDate(product.expiresOn)}
                </p>

                {product.notes && (
                  <p><strong>Note:</strong> {product.notes}</p>
                )}

                <div style={{ marginTop: '15px' }}>
                  {product.requests && product.requests.length > 0 && product.requests[0].status === 'PENDING' ? (
                    // User-ul a revendicat deja - cerere în așteptare
                    <p style={{
                      padding: '10px',
                      backgroundColor: '#fff3cd',
                      color: '#856404',
                      borderRadius: '5px',
                      border: '1px solid #ffc107'
                    }}>
                      ⏳ Cerere trimisă - în așteptarea aprobării
                    </p>
                  ) : (
                    // User-ul nu a revendicat încă - arată butonul
                    <button
                      onClick={() => handleClaimProduct(product.id, product.name, product.owner.name)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Revendica Produs
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Available;
