# Instrucțiuni de Instalare și Rulare - Food Waste App Backend


##  Cerințe Preliminare

Înainte de a rula aplicația, asigurați-vă că aveți instalate următoarele:

- **Node.js**  
- **PostgreSQL** 

---

## Instalare

### 1. Clonați repository-ul 

```bash
git clone https://github.com/CosmaAdriana/food-waste-app.git
```

### 2. Instalați dependențele

```bash
npm install
```

---

## Configurare Bază de Date

### 1. Creați baza de date PostgreSQL

Deschideți terminalul PostgreSQL (psql) sau folosiți pgAdmin și executați:

```sql
CREATE DATABASE appdb;
```

### 2. Configurați variabilele de mediu

Verificați fișierul `.env` din folderul `backend`. Acesta ar trebui să conțină:

```env
DATABASE_URL="postgresql://postgres:secretmare@localhost:5432/appdb?schema=public"
```

**Important**: Modificați `DATABASE_URL` cu credențialele PostgreSQL de pe mașina dvs:
- `postgres` - username-ul PostgreSQL
- `secretmare` - parola PostgreSQL
- `appdb` - numele bazei de date

### 3. Rulați migrările Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

Acestea vor:
- Genera Prisma Client
- Crea tabelele necesare în baza de date (Users, Products, Friendships, Requests, Categories)

---

## Rulare Aplicație

### Mod Development (cu auto-reload)

```bash
npm run dev
```

### Mod Production

```bash
npm start
```

Serverul va rula pe **http://localhost:3000**

Veți vedea în consolă:
```
Server is running on http://localhost:3000
Environment: development
```

---

## Testare API

**Testarea se face în Postman sau un client similar.**

**Important**: Pentru cereri autentificate, asigurați-vă că aveți activat **Send cookies automatically** în Postman sau salvați cookie-ul de sesiune după login.

### 1. Verificare Server

**GET** `http://localhost:3000/api/health`

### 2. Înregistrare utilizator

**POST** `http://localhost:3000/api/auth/register`

Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

### 3. Autentificare

**POST** `http://localhost:3000/api/auth/login`

Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 4. Obținere profil utilizator

**GET** `http://localhost:3000/api/users/me`

### 5. Creare aliment

**POST** `http://localhost:3000/api/foods`

Body (JSON):
```json
{
  "name": "Pizza",
  "expiresOn": "2024-12-30",
  "notes": "Half pizza left"
}
```

### 6. Listare alimente proprii

**GET** `http://localhost:3000/api/foods`

### 7. Marcare aliment ca disponibil

**PATCH** `http://localhost:3000/api/foods/1/mark-available`

### 8. Alimente care expiră în 3 zile

**GET** `http://localhost:3000/api/foods/expiring`

### 9. Adăugare prieten

**POST** `http://localhost:3000/api/friends`

Body (JSON):
```json
{
  "friendId": 2
}
```

### 10. Claim produs de la prieten

**POST** `http://localhost:3000/api/foods/1/claim`

### 11. Generare link de partajare

**GET** `http://localhost:3000/api/foods/1/share-link`

### 12. Vizualizare aliment partajat (PUBLIC - fără autentificare)

**GET** `http://localhost:3000/share/food/1`

---

## Funcționalități Implementate

Proiectul implementează toate task-urile 1-13 din specificație:

### Autentificare 
- `POST /api/auth/register` - Înregistrare utilizator nou
- `POST /api/auth/login` - Autentificare cu sesiuni
- `POST /api/auth/logout` - Deconectare
- `GET /api/users/me` - Profil utilizator autentificat

### Gestionare Alimente 
- `POST /api/foods` - Creare aliment
- `GET /api/foods` - Listare alimente proprii
- `PUT /api/foods/:id` - Actualizare aliment
- `DELETE /api/foods/:id` - Ștergere aliment
- `PATCH /api/foods/:id/mark-available` - Marcare ca disponibil
- `GET /api/foods/expiring` - Alimente care expiră în 3 zile

### Prieteni 
- `POST /api/friends` - Adăugare prieten (cerere de prietenie)
- `GET /api/friends` - Listare prieteni
- `DELETE /api/friends/:id` - Ștergere prieten
- `GET /api/friends/:friendId/foods` - Alimente disponibile ale unui prieten

### Claim Produse 
- `POST /api/foods/:id/claim` - Claim produs de la prieten
- `GET /api/foods/my-claims` - Produsele la care ai făcut claim
- `GET /api/foods/:id/requests` - Cererile pentru un aliment
- `PATCH /api/requests/:id/approve` - Aprobare cerere
- `PATCH /api/requests/:id/reject` - Respingere cerere

### Social Share
- `GET /api/foods/:id/share-link` - Generare link de partajare
- `GET /share/food/:id` - pentru vizualizare aliment partajat

---


## Schema Bazei de Date

### Tabele principale:

1. **User** - Utilizatori ai aplicației
   - id, name, email, password, createdAt

2. **Product** - Produse alimentare
   - id, name, categoryId, expiresOn, isAvailable, notes, ownerId

3. **Category** - Categorii de produse
   - id, name

4. **Friendship** - Relații de prietenie
   - id, userId, friendId, preference, status

5. **Request** - Cereri de claim pentru produse
   - id, productId, claimerId, status, createdAt

6. **session** - Sesiuni utilizatori (auto-generat de express-session)

---


