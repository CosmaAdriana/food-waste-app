# API Documentation – Food Waste App

## Scop
Acest document descrie structura API-ului REST care va fi utilizat pentru comunicarea dintre frontend si backend.
API-ul permite gestionarea alimentelor, a prietenilor si a revendicarilor, precum si integrarea cu un serviciu extern pentru date suplimentare despre produse.

## Server
- **URL:** http://localhost:3000
- **Environment:** Development
- **Autentificare:** Session-based (express-session cu PostgreSQL store)

---

## 🔐 Autentificare

### POST /api/auth/register
Înregistrează un utilizator nou în sistem.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-11-26T20:26:39.984Z"
  }
}
```

**Errors:**
- `400` - Date lipsă (name, email sau password)
- `409` - Email-ul există deja

---

### POST /api/auth/login
Autentifică un utilizator existent și creează o sesiune.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-11-26T20:26:39.984Z"
  }
}
```

**Headers:**
- `Set-Cookie: connect.sid=...` - Cookie de sesiune (30 zile)

**Errors:**
- `400` - Date lipsă (email sau password)
- `401` - Email sau parolă incorectă

---

### POST /api/auth/logout
Deconectează utilizatorul și distruge sesiunea.

**Request:** Nu necesită body

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

**Errors:**
- `500` - Eroare la distrugerea sesiunii

---

## 📋 Middleware

### requireAuth
Verifică dacă utilizatorul este autentificat prin `req.session.userId`.

**Usage:**
```javascript
import { requireAuth } from './middleware/requireAuth.js';
router.get('/protected-route', requireAuth, controller);
```

**Response (401 Unauthorized) dacă nu este autentificat:**
```json
{
  "error": "Unauthorized",
  "message": "You must be logged in to access this resource"
}
```

---

## 🍎 Alimente (TODO)
- GET /api/food – obține lista alimentelor utilizatorului
- POST /api/food – adaugă un aliment nou
- GET /api/food/:id – detalii despre un aliment
- PATCH /api/food/:id – modifică datele unui aliment
- PATCH /api/food/:id/available – marchează alimentul ca disponibil
- DELETE /api/food/:id – șterge un aliment
- GET /api/alerts/near-expiry – obține produsele aproape de expirare

---

## 👥 Prieteni (TODO)
- GET /api/friends – listează prietenii utilizatorului
- POST /api/friends – adaugă un prieten nou
- PATCH /api/friends/:id – actualizează un prieten
- DELETE /api/friends/:id – șterge un prieten

---

## 🛒 Revendicări (TODO)
- POST /api/claims – creează o revendicare pentru un produs
- GET /api/claims – obține revendicările (trimise sau primite)
- PATCH /api/claims/:id/status – actualizează statusul unei revendicări
- DELETE /api/claims/:id – anulează o revendicare

---

## 📦 Alte endpoint-uri (TODO)
- GET /api/categories – obține lista categoriilor de produse
- GET /api/external/products – caută produse în serviciul extern (OpenFoodFacts)
