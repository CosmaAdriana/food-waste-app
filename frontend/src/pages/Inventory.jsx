import { useState, useEffect } from 'react';
import axios from 'axios';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterCategory, setFilterCategory] = useState('');
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    expiresOn: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/foods', {
        withCredentials: true
      });
      setProducts(res.data.products);
      setLoading(false);
    } catch (err) {
      setError('Nu s-au putut încărca produsele');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Nu s-au putut încărca categoriile', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validare simpla
    if (!formData.name) {
      setFormError('Numele este obligatoriu');
      return;
    }
    if (!formData.expiresOn) {
      setFormError('Data de expirare este obligatorie');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/foods', {
        name: formData.name,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        expiresOn: formData.expiresOn,
        notes: formData.notes || null
      }, {
        withCredentials: true
      });

      // Reset formular si inchide
      setFormData({ name: '', categoryId: '', expiresOn: '', notes: '' });
      setShowForm(false);

      // Reincarca produsele
      fetchProducts();
    } catch (err) {
      setFormError('Eroare la adăugarea produsului');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', categoryId: '', expiresOn: '', notes: '' });
    setFormError('');
    setShowForm(false);
  };

  const handleDelete = async (productId, productName) => {
    const confirmDelete = window.confirm(`Ești sigur că vrei să ștergi "${productName}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/api/foods/${productId}`, {
        withCredentials: true
      });
      // Reincarca produsele
      fetchProducts();
    } catch (err) {
      alert('Eroare la ștergerea produsului');
    }
  };

  const handleToggleAvailability = async (productId, productName, currentStatus) => {
    const newStatus = !currentStatus;
    const message = newStatus
      ? `Marchezi "${productName}" ca disponibil pentru prieteni?`
      : `Marchezi "${productName}" ca indisponibil?`;

    const confirmMark = window.confirm(message);
    if (!confirmMark) return;

    try {
      await axios.put(`http://localhost:3000/api/foods/${productId}`, {
        isAvailable: newStatus
      }, {
        withCredentials: true
      });
      // Reincarca produsele
      fetchProducts();
    } catch (err) {
      alert('Eroare la modificarea statusului produsului');
    }
  };

  // Verifica daca produsul expira in 3 zile
  const isExpiringSoon = (expiresOn) => {
    const now = new Date();
    const expirationDate = new Date(expiresOn);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    return expirationDate >= now && expirationDate <= threeDaysFromNow;
  };

  // Filtreaza produsele
  const filteredProducts = products.filter(product => {
    // Filtrare dupa categorie
    if (filterCategory && product.categoryId !== parseInt(filterCategory)) {
      return false;
    }

    // Filtrare dupa expirare
    if (showExpiringSoon && !isExpiringSoon(product.expiresOn)) {
      return false;
    }

    return true;
  });

  if (loading) {
    return <div style={{ padding: '20px' }}>Se încarcă...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Inventarul Meu</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Buton Add Product */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '10px 20px',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {showForm ? 'Anulează' : 'Adaugă Produs'}
      </button>

      {/* Filtre */}
      {products.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Filtrare</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
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
            <div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showExpiringSoon}
                  onChange={(e) => setShowExpiringSoon(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Doar produse care expiră în 3 zile
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Formular Add Product */}
      {showForm && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '8px',
            border: '1px solid #ddd',
            marginBottom: '20px'
          }}
        >
          <h3>Adaugă Produs Nou</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="name">Nume produs *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Lapte"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="categoryId">Categorie</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">Selectează categoria (opțional)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="expiresOn">Data expirării *</label>
              <input
                type="date"
                id="expiresOn"
                name="expiresOn"
                value={formData.expiresOn}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="notes">Note (opțional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ex: Jumătate din cutie"
                rows="3"
                style={{ width: '100%' }}
              />
            </div>

            {formError && <p style={{ color: 'red' }}>{formError}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Salvează
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Anulează
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de produse */}
      {products.length === 0 ? (
        <p>Nu ai produse încă. Adaugă primul produs!</p>
      ) : filteredProducts.length === 0 ? (
        <p>Nu există produse care să corespundă filtrelor selectate.</p>
      ) : (
        <div>
          <p>Afișez {filteredProducts.length} din {products.length} produse</p>

          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {filteredProducts.map((product) => {
              const expiringSoon = isExpiringSoon(product.expiresOn);
              return (
                <div
                  key={product.id}
                  style={{
                    padding: '15px',
                    backgroundColor: expiringSoon ? '#fff3cd' : 'var(--card-bg)',
                    borderRadius: '8px',
                    border: expiringSoon ? '2px solid #ff9800' : '1px solid #ddd'
                  }}
                >
                <h3>
                  {product.name}
                  {expiringSoon && (
                    <span style={{ marginLeft: '10px', fontSize: '14px', color: '#ff6b00', fontWeight: 'bold' }}>
                      Expiră curând!
                    </span>
                  )}
                </h3>

                <p>
                  <strong>Categorie:</strong>{' '}
                  {product.category ? product.category.name : 'Fără categorie'}
                </p>

                <p>
                  <strong>Expiră pe:</strong> {formatDate(product.expiresOn)}
                </p>

                {product.notes && (
                  <p><strong>Note:</strong> {product.notes}</p>
                )}

                <p>
                  <strong>Status:</strong>{' '}
                  {product.isAvailable ? 'Disponibil' : 'Indisponibil'}
                </p>

                {/* Butoane de acțiuni */}
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleToggleAvailability(product.id, product.name, product.isAvailable)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: product.isAvailable ? '#ffc107' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    {product.isAvailable ? 'Marchează ca Indisponibil' : 'Marchează ca Disponibil'}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Șterge
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
