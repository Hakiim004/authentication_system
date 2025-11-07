# authentication_system
Project for the 5th semester at ISTAPEM in the Cryptography course: we will build authentication and authorization from scratch.
Authors:OUEDRAOGO Wend Nonga Abdoul Hakiim , Belem Claver , Yaya Karama , ATCHIOGBE ulrich
Date: June 2024
Technologies used: Python, Flask, SQLite, HTML, CSS, JavaScript
Description: This project implements a secure authentication system with user registration, login, password hashing, session management, and account lockout features.
Features:
- User Registration with input validation
- Secure Password Hashing using bcrypt
- User Login with session management
- Account Lockout after multiple failed login attempts
- Responsive UI with HTML, CSS, and JavaScript

## Setup Instructions
1. Clone the repository: `git clone <repository_url>`
2. Navigate to the project directory: `cd authentication_system`
3. Create a virtual environment: `python -m venv venv`
4. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`
5. Install the required packages: `pip install -r requirements.txt`
6. Set up the database: `flask db init`, `flask db migrate`, `flask db upgrade`
7. Run the application: `flask run`
8. Open your web browser and navigate to `http://localhost:5000`
## Usage
- Register a new user account.
- Log in with the registered account.
- Test the account lockout feature by entering incorrect passwords multiple times.
- Log out and log back in to verify session management.
## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.
## License
This project is licensed under the MIT License. See the LICENSE file for details.

