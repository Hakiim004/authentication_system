FROM python:3.10-slim

# Installer dépendances système
RUN apt-get update && apt-get install -y \
    build-essential libpq-dev gcc \
    && apt-get clean

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exposer le port Flask
EXPOSE 5000

# Commande de démarrage (Gunicorn = production)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
