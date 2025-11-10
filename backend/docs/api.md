# API planificat – Food Waste App

# Scop
Acest document descrie structura API-ului REST care va fi utilizat pentru comunicarea dintre frontend si backend.  
API-ul permite gestionarea alimentelor, a prietenilor si a revendicarilor, precum si integrarea cu un serviciu extern pentru date suplimentare despre produse.

# Structura API – Backend (Node.js)
- POST /api/auth/register – înregistrează un utilizator nou
- POST /api/auth/login – autentificare utilizator
- GET /api/food – obține lista alimentelor utilizatorului
- POST /api/food – adaugă un aliment nou
- GET /api/food/:id – detalii despre un aliment
- PATCH /api/food/:id – modifică datele unui aliment
- PATCH /api/food/:id/available – marchează alimentul ca disponibil
- DELETE /api/food/:id – șterge un aliment
- GET /api/alerts/near-expiry – obține produsele aproape de expirare
- GET /api/friends – listează prietenii utilizatorului
- POST /api/friends – adaugă un prieten nou
- PATCH /api/friends/:id – actualizează un prieten
- DELETE /api/friends/:id – șterge un prieten
- POST /api/claims – creează o revendicare pentru un produs
- GET /api/claims – obține revendicările (trimise sau primite)
- PATCH /api/claims/:id/status – actualizează statusul unei revendicări
- DELETE /api/claims/:id – anulează o revendicare
- GET /api/categories – obține lista categoriilor de produse
- GET /api/external/products – caută produse în serviciul extern (OpenFoodFacts)
