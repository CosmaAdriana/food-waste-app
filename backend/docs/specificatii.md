# Specificatii detaliate – Backend

# Scop

Componenta de backend vizeaza crearea unui API REST care faciliteaza gestionarea alimentelor adaugate de utilizatori, monitorizarea datei de expirare si distribuirea produselor disponibile cu alti membri ai comunitatii si prieteni.

Aplicatia va permite interactiunea intre utilizatori prin solicitarea alimentelor si vizualizarea articolelor disponibile de la ceilalti.

# Functionalitati principale

Administrarea produselor alimentare: adaugare, modificare, eliminare si editare.

Detectarea produselor care sunt aproape de data limita.

Marcarea articolelor ca fiind disponibile pentru alti utilizatori.

Elaborarea unei liste de prieteni si stabilirea preferintelor (ex: vegetarian, carnivor etc.).

Solicitarea produselor accesibile din lista altor utilizatori.

# Model de date
Baza de date contine urmatoarele tabele esentiale:

users – detalii referitoare la utilizatori (nume, email, parola, data inscrierii)

categories – categoriile unde sunt clasificate alimentele (ex: produse lactate, legume, fructe)

products – catalogul produselor alimentare introduse de utilizatori, incluzand informatii despre cantitate, termenul de valabilitate si stocul disponibil

requests – solicitarile de revendicare pentru bunurile prezentate de alti utilizatori

friends – lista de prieteni si preferintele culinare legate de fiecare