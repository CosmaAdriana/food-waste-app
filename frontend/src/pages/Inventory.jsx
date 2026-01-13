import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../config.js';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterCategory, setFilterCategory] = useState('');
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    expiresOn: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ url: '', text: '' });

  // State pentru marcare disponibil cu grupuri
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [productToMark, setProductToMark] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [availabilityMode, setAvailabilityMode] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchGroups();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/foods`, {
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
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Nu s-au putut încărca categoriile', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/groups`, {
        withCredentials: true
      });
      setGroups(res.data.groups);
    } catch (err) {
      console.error('Nu s-au putut încărca grupurile', err);
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

    // Validare: data nu poate fi in trecut
    const selectedDate = new Date(formData.expiresOn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setFormError('Data de expirare nu poate fi în trecut');
      return;
    }

    try {
      if (editingProduct) {
        // Editare 
        await axios.put(`${API_URL}/api/foods/${editingProduct.id}`, {
          name: formData.name,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          expiresOn: formData.expiresOn,
          notes: formData.notes || null
        }, {
          withCredentials: true
        });
      } else {
        // Creare 
        await axios.post(`${API_URL}/api/foods`, {
          name: formData.name,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          expiresOn: formData.expiresOn,
          notes: formData.notes || null
        }, {
          withCredentials: true
        });
      }

      setFormData({ name: '', categoryId: '', expiresOn: '', notes: '' });
      setEditingProduct(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setFormError(editingProduct ? 'Eroare la editarea produsului' : 'Eroare la adăugarea produsului');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', categoryId: '', expiresOn: '', notes: '' });
    setFormError('');
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    // Converteste data in format yyyy-MM-dd pentru input type="date"
    const dateStr = product.expiresOn.split('T')[0];

    setFormData({
      name: product.name,
      categoryId: product.categoryId || '',
      expiresOn: dateStr,
      notes: product.notes || ''
    });
    setEditingProduct(product);
    setShowForm(true);
    setFormError('');

    // Scroll la formular dupa ce se deschide
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (productId, productName) => {
    const confirmDelete = window.confirm(`Ești sigur că vrei să ștergi "${productName}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/foods/${productId}`, {
        withCredentials: true
      });
      fetchProducts();
    } catch (err) {
      alert('Eroare la ștergerea produsului');
    }
  };

  const handleToggleAvailability = async (product) => {
    if (product.isAvailable) {
      // Marcheaza ca indisponibil
      const confirmMark = window.confirm(`Marchezi "${product.name}" ca indisponibil?`);
      if (!confirmMark) return;

      try {
        await axios.put(`${API_URL}/api/foods/${product.id}`, {
          isAvailable: false,
          groupIds: []
        }, {
          withCredentials: true
        });
        fetchProducts();
      } catch (err) {
        alert('Eroare la modificarea statusului produsului');
      }
    } else {
      // Marchează ca disponibil - deschide modal pentru selecție grupuri
      setProductToMark(product);
      setSelectedGroups([]);
      setAvailabilityMode('all');
      setShowAvailabilityModal(true);
    }
  };

  const confirmMarkAvailable = async () => {
    if (!productToMark) return;

    try {
      const requestData = {
        isAvailable: true
      };

      if (availabilityMode === 'groups' && selectedGroups.length > 0) {
        requestData.groupIds = selectedGroups;
      } else {
        requestData.groupIds = [];
      }

      await axios.put(`${API_URL}/api/foods/${productToMark.id}`, requestData, {
        withCredentials: true
      });

      alert(`"${productToMark.name}" marcat ca disponibil!`);
      setShowAvailabilityModal(false);
      setProductToMark(null);
      setSelectedGroups([]);
      fetchProducts();
    } catch (err) {
      alert('Eroare la marcarea produsului ca disponibil');
    }
  };

  const toggleGroupSelection = (groupId) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleShare = async (productId, productName) => {
    try {
      // Apeleaza endpoint-ul pentru a obține link-ul de share
      const res = await axios.get(`${API_URL}/api/foods/${productId}/share-link`, {
        withCredentials: true
      });

      const { shareUrl, text } = res.data;


      if (navigator.share) {
        try {
          await navigator.share({
            title: productName,
            text: text,
            url: shareUrl
          });
          return;
        } catch (err) {
          // Utilizatorul a anulat share-ul sau a apărut o eroare
          if (err.name !== 'AbortError') {
            console.error('Eroare la share:', err);
          }
        }
      }

      
      setShareData({ url: shareUrl, text: text });
      setShowShareModal(true);
    } catch (err) {
      alert('Eroare la generarea link-ului de partajare');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareData.url)
      .then(() => {
        alert('Link copiat în clipboard!');
        setShowShareModal(false);
      })
      .catch(() => {
        alert('Eroare la copierea link-ului');
      });
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
    if (filterCategory && product.categoryId !== parseInt(filterCategory)) {
      return false;
    }
    if (showExpiringSoon && !isExpiringSoon(product.expiresOn)) {
      return false;
    }

    return true;
  });

  if (loading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div>
      <h1>Inventarul Meu</h1>

      {error && <p className="text-danger">{error}</p>}

      {/* Buton Add Product */}
      <button
        onClick={() => {
          if (showForm) {
            handleCancel();
          } else {
            setEditingProduct(null);
            setFormData({ name: '', categoryId: '', expiresOn: '', notes: '' });
            setShowForm(true);
          }
        }}
        className="mb-lg"
        style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
      >
        {showForm ? 'Anulează' : 'Adaugă Produs'}
      </button>

      {/* Filtre */}
      {products.length > 0 && (
        <div className="card mb-lg" style={{ backgroundColor: '#f8f9fa' }}>
          <h3>Filtrare</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label htmlFor="filterCategory" style={{ marginRight: '10px' }}>Categorie:</label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
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

      {/* Formular Add/Edit Product */}
      {showForm && (
        <div ref={formRef} className="card mb-lg">
          <h3>{editingProduct ? 'Editează Produs' : 'Adaugă Produs Nou'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-md">
              <label htmlFor="name">Nume produs *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Lapte"
              />
            </div>

            <div className="mb-md">
              <label htmlFor="categoryId">Categorie</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
              >
                <option value="">Selectează categoria (opțional)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-md">
              <label htmlFor="expiresOn">Data expirării *</label>
              <input
                type="date"
                id="expiresOn"
                name="expiresOn"
                value={formData.expiresOn}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-md">
              <label htmlFor="notes">Note (opțional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ex: Jumătate din cutie"
                rows="3"
              />
            </div>

            {formError && <p className="text-danger mb-md">{formError}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
              >
                Salvează
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{ backgroundColor: '#ccc', color: '#333' }}
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

          <div className="grid mt-lg">
            {filteredProducts.map((product) => {
              const expiringSoon = isExpiringSoon(product.expiresOn);
              return (
                <div
                  key={product.id}
                  className="card"
                  style={{
                    backgroundColor: expiringSoon ? '#fff3cd' : undefined,
                    border: expiringSoon ? '2px solid #ff9800' : undefined
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

                {product.isAvailable && product.groups && product.groups.length > 0 && (
                  <p>
                    <strong>Vizibil pentru grupuri:</strong>{' '}
                    {product.groups.map(pg => pg.group.name).join(', ')}
                  </p>
                )}
                {product.isAvailable && (!product.groups || product.groups.length === 0) && (
                  <p style={{ color: '#28a745', fontWeight: 'bold' }}>
                    Vizibil pentru toți prietenii
                  </p>
                )}

                {/* Butoane de acțiuni */}
                <div className="mt-md" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    style={{
                      backgroundColor: product.isAvailable ? '#ffc107' : '#28a745',
                      color: 'white'
                    }}
                  >
                    {product.isAvailable ? 'Marchează ca Indisponibil' : 'Marchează ca Disponibil'}
                  </button>
                  {product.isAvailable && (
                    <button
                      onClick={() => handleShare(product.id, product.name)}
                      style={{
                        backgroundColor: '#17a2b8',
                        color: 'white'
                      }}
                    >
                      Share
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(product)}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white'
                    }}
                  >
                    Editează
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    style={{
                      backgroundColor: 'var(--danger-color)',
                      color: 'white'
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

      {/* Modal Share */}
      {showShareModal && (
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
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '90%',
              padding: '30px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Distribuie produsul</h3>
            <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              {shareData.text}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#1877f2',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}
              >
                Share pe Facebook
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#25d366',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}
              >
                Share pe WhatsApp
              </a>

              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Copiază Link
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pentru selecție grupuri */}
      {showAvailabilityModal && (
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
          onClick={() => setShowAvailabilityModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '600px',
              width: '90%',
              padding: '30px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Marchează "{productToMark?.name}" ca disponibil</h3>
            <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              Selectează vizibilitatea produsului:
            </p>

            {/* Radio buttons pentru mod disponibilitate */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="availabilityMode"
                  value="all"
                  checked={availabilityMode === 'all'}
                  onChange={(e) => setAvailabilityMode(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontWeight: availabilityMode === 'all' ? 'bold' : 'normal' }}>
                  Toți prietenii
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="availabilityMode"
                  value="groups"
                  checked={availabilityMode === 'groups'}
                  onChange={(e) => setAvailabilityMode(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontWeight: availabilityMode === 'groups' ? 'bold' : 'normal' }}>
                  Doar anumite grupuri
                </span>
              </label>
            </div>

            {/* Lista de grupuri (când e selectat "groups") */}
            {availabilityMode === 'groups' && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                {groups.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    Nu ai niciun grup creat. Creează grupuri în secțiunea Prieteni.
                  </p>
                ) : (
                  <>
                    <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Selectează grupurile:</p>
                    {groups.map(group => (
                      <label
                        key={group.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => toggleGroupSelection(group.id)}
                          style={{ marginRight: '10px' }}
                        />
                        <span>
                          {group.name} ({group._count?.members || 0} {group._count?.members === 1 ? 'membru' : 'membri'})
                        </span>
                      </label>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Butoane acțiuni */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Anulează
              </button>
              <button
                onClick={confirmMarkAvailable}
                disabled={availabilityMode === 'groups' && selectedGroups.length === 0}
                style={{
                  backgroundColor: availabilityMode === 'groups' && selectedGroups.length === 0 ? '#ccc' : '#28a745',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: availabilityMode === 'groups' && selectedGroups.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Confirmă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
