# Étape 1 : Utiliser l'image officielle de Node.js (version LTS recommandée)
FROM node:18

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier uniquement les fichiers de dépendances
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier le reste des fichiers de l'application
COPY . .

# Étape 6 : Exposer le port sur lequel l'application écoute
EXPOSE 3000

# Étape 7 : Lancer l'application
CMD ["npm", "start"]
