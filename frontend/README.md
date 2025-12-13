# Frontend – Food Waste App

Aplicație web pentru prevenirea risipei alimentare

## Obiectivul proiectului
Scopul aplicației este de a încuraja utilizatorii să reducă risipa alimentară prin partajarea alimentelor care se apropie de termenul de expirare.
Utilizatorii pot adăuga produsele din frigider, pot primi alerte când acestea expiră și le pot oferi altor persoane interesate.

## Echipa de proiect
- Cosma Adriana – Frontend & Backend Developer
- Pîrnuță Alexandra – Frontend & Backend Developer

## Tehnologii utilizate
- **Frontend**: React + Vite (SPA)
- **Backend**: Node.js, Express
- **ORM**: Prisma
- **Baza de date**: PostgreSQL
- **Mediu de dezvoltare**: Visual Studio Code, GitHub

## Funcționalități planificate
- Înregistrare utilizator nou și autentificare utilizator care are deja cont
- Gestionare produse alimentare: adăugare, vizualizare, editare, ștergere, marcare ca disponibile
- Alerte de expirare: identificare produse care expiră în curând
- Creare grup de prieteni
- Vizualizare alimente disponibile la prieteni
- Revendicare produse oferite
- CRUD complet
- Validare date și gestionare erori

---

## Cum să rulezi aplicația

### 1. Instalează dependențele
```bash
npm install
```

### 2. Pornește aplicația
```bash
npm run dev
```

Aplicația va rula pe **http://localhost:5173**


## Structura proiectului

```
src/
├── components/     # Componente reutilizabile
├── pages/          # Pagini principale
├── context/        # State management (AuthContext)
├── services/       # API calls
├── utils/          # Funcții helper
├── App.jsx         # Routing principal
└── main.jsx        # Entry point
```


## Link-uri utile

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
