from flask import Flask, flash, request, jsonify, render_template, url_for, redirect, session
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# Charger les variables du fichier .env
load_dotenv()

app = Flask(__name__, static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

db = SQLAlchemy(app)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), default=False)

with app.app_context():
    db.create_all()
    
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Vérifier si l'utilisateur existe déjà
        if User.query.filter_by(email=email).first():
            return "Cet email est déjà utilisé !"
        
        # Stocker le mot de passe tel quel
        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('success'))
    
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
     if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username, password=password).first()

        if user:
            session['user_id'] = user.id
            flash('Connexion réussie !', 'success')
            return redirect(url_for('success'))
        else:
            flash("Nom d'utilisateur ou mot de passe incorrect !", 'danger')
            return redirect(url_for('login'))
     return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.clear()
    flash('Déconnexion réussie !', 'success')
    return redirect(url_for('login'))
@app.route('/success')
def success():
    return "Inscription réussie !"

if __name__ == '__main__':
    app.run(debug=True)
