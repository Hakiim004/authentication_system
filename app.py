from flask import Flask, flash, request, jsonify, render_template, url_for, redirect, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import logging
from logging.handlers import RotatingFileHandler
import re
import pkg_resources

# -------------------- Chargement des variables d'environnement --------------------
load_dotenv()

app = Flask(__name__, static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY') or 'jwt-secret-key'

# -------------------- Configuration Flask-Mail --------------------
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# -------------------- Initialisation des extensions --------------------
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
mail = Mail(app)
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
jwt = JWTManager(app)
limiter = Limiter(get_remote_address, app=app, default_limits=["200 per day", "50 per hour"])

# -------------------- Logger centralisé --------------------
logger = logging.getLogger("app_security_logger")
logger.setLevel(logging.INFO)
handler = RotatingFileHandler("security_logs.log", maxBytes=5*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

def log_critical_action(user_id, action, extra=None):
    logger.info(f"User {user_id} performed {action} | Extra: {extra}")

def detect_suspicious_input(data):
    patterns = [
        r"(<script>)",          # XSS
        r"(union select)",      # SQLi basique
        r"(--|;|\bDROP\b|\bDELETE\b)"  # injections SQL
    ]
    for pattern in patterns:
        if re.search(pattern, data, re.IGNORECASE):
            return True
    return False

def list_dependencies():
    deps = {}
    for dist in pkg_resources.working_set:
        deps[dist.project_name] = dist.version
    logger.info(f"Current dependencies: {deps}")

# -------------------- Modèle User --------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # hashé

with app.app_context():
    db.create_all()
    list_dependencies()  # log des dépendances au démarrage

# -------------------- Gestion des erreurs globales --------------------
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Exception: {str(e)} | Path: {request.path} | Data: {request.get_data()}")
    return jsonify({"msg": "Erreur interne du serveur"}), 500

# -------------------- Routes --------------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        if detect_suspicious_input(username) or detect_suspicious_input(email):
            logger.warning(f"Suspicious input detected on /register | Username: {username} | Email: {email}")
            return jsonify({"msg": "Entrée suspecte détectée"}), 400

        if User.query.filter_by(email=email).first():
            flash("Cet email est déjà utilisé !", "danger")
            return redirect(url_for('register'))

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        log_critical_action(new_user.id, "register")
        flash("Inscription réussie !", "success")
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        if detect_suspicious_input(username):
            logger.warning(f"Suspicious input detected on /login | Username: {username}")
            return jsonify({"msg": "Entrée suspecte détectée"}), 400

        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.id)
            log_critical_action(user.id, "login_success")
            return jsonify({"msg": "Connexion réussie", "access_token": access_token}), 200
        else:
            logger.warning(f"Failed login attempt | Username: {username}")
            return jsonify({"msg": "Nom d'utilisateur ou mot de passe incorrect"}), 401

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.clear()
    flash('Déconnexion réussie !', 'success')
    return redirect(url_for('login'))

@app.route('/success')
@jwt_required()
def success():
    current_user = get_jwt_identity()
    return jsonify({"msg": "Connexion ou inscription réussie ✅", "user_id": current_user})

# -------------------- Récupération et réinitialisation de mot de passe --------------------
@app.route('/retrievePassword', methods=['GET', 'POST'])
@limiter.limit("3 per hour")
def retrieve_password():
    if request.method == 'POST':
        email = request.form['email']

        if detect_suspicious_input(email):
            logger.warning(f"Suspicious input detected on /retrievePassword | Email: {email}")
            return jsonify({"msg": "Entrée suspecte détectée"}), 400

        user = User.query.filter_by(email=email).first()

        if user:
            token = serializer.dumps(email, salt='password-reset-salt')
            reset_url = url_for('reset_password', token=token, _external=True)

            msg = Message('Réinitialisation de mot de passe',
                          sender=app.config['MAIL_USERNAME'],
                          recipients=[email])
            msg.body = f"Bonjour {user.username},\n\nCliquez sur le lien suivant pour réinitialiser votre mot de passe :\n{reset_url}\n\nCe lien expirera dans 1 heure."
            mail.send(msg)
            log_critical_action(user.id, "password_reset_request")
            flash("Un e-mail de réinitialisation a été envoyé.", "info")
            return redirect(url_for('login'))
        else:
            flash("Aucun compte trouvé avec cet e-mail.", "danger")

    return render_template('password_retrieve.html')

@app.route('/resetPassword/<token>', methods=['GET', 'POST'])
def reset_password(token):
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)
    except SignatureExpired:
        flash("Le lien de réinitialisation a expiré.", "danger")
        return redirect(url_for('retrieve_password'))
    except BadTimeSignature:
        flash("Lien invalide.", "danger")
        return redirect(url_for('retrieve_password'))

    user = User.query.filter_by(email=email).first()

    if request.method == 'POST':
        new_password = request.form['password']
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password = hashed_password
        db.session.commit()
        log_critical_action(user.id, "password_reset")
        flash("Mot de passe réinitialisé avec succès !", "success")
        return redirect(url_for('login'))

    return render_template('reset_password.html', email=email)

# -------------------- Lancer l'application --------------------
if __name__ == '__main__':
    app.run(debug=True)
