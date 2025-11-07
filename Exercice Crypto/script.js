// Form switching functionality
function switchForm(formType) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  if (formType === 'signup') {
    loginForm.classList.remove('active');
    setTimeout(() => {
      signupForm.classList.add('active');
    }, 250);
  } else {
    signupForm.classList.remove('active');
    setTimeout(() => {
      loginForm.classList.add('active');
    }, 250);
  }
}

// Password visibility toggle
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentNode.querySelector('.toggle-password i');
  
  if (input.type === 'password') {
    input.type = 'text';
    button.classList.remove('fa-eye');
    button.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    button.classList.remove('fa-eye-slash');
    button.classList.add('fa-eye');
  }
}

// Password strength checker
function checkPasswordStrength(password) {
  let strength = 0;
  const checks = [
    /.{8,}/, // At least 8 characters
    /[a-z]/, // Lowercase letter
    /[A-Z]/, // Uppercase letter
    /[0-9]/, // Number
    /[^A-Za-z0-9]/ // Special character
  ];
  
  checks.forEach(check => {
    if (check.test(password)) strength++;
  });
  
  return strength;
}

// Update password strength indicator
function updatePasswordStrength(password) {
  const strength = checkPasswordStrength(password);
  const strengthFill = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');
  
  const strengthPercentage = (strength / 5) * 100;
  strengthFill.style.width = strengthPercentage + '%';
  
  const strengthLabels = [
    'Très faible',
    'Faible',
    'Moyen',
    'Fort',
    'Très fort'
  ];
  
  if (password.length === 0) {
    strengthText.textContent = 'Force du mot de passe';
    strengthFill.style.width = '0%';
  } else {
    strengthText.textContent = strengthLabels[Math.min(strength - 1, 4)] || 'Très faible';
  }
}

// Form animations and interactions
document.addEventListener('DOMContentLoaded', function() {
  // Add input focus animations
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentNode.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentNode.classList.remove('focused');
      }
    });
  });
  
  // Password strength checker for signup
  const signupPassword = document.getElementById('signupPassword');
  if (signupPassword) {
    signupPassword.addEventListener('input', function() {
      updatePasswordStrength(this.value);
    });
  }
  
  // Form submission handlers
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleLogin(this);
  });
  
  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleSignup(this);
  });
});

// Login handler
function handleLogin(form) {
  const submitBtn = form.querySelector('.submit-btn');
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Add loading state
  submitBtn.classList.add('loading');
  
  // Simulate API call
  setTimeout(() => {
    submitBtn.classList.remove('loading');
    
    // Here you would typically make an API call
    console.log('Login attempt:', { email, password });
    
    // Show success message (you can customize this)
    showMessage('Connexion réussie !', 'success');
  }, 2000);
}

// Signup handler
function handleSignup(form) {
  const submitBtn = form.querySelector('.submit-btn');
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const acceptTerms = document.getElementById('acceptTerms').checked;
  
  if (!acceptTerms) {
    showMessage('Veuillez accepter les conditions d\'utilisation', 'error');
    return;
  }
  
  // Add loading state
  submitBtn.classList.add('loading');
  
  // Simulate API call
  setTimeout(() => {
    submitBtn.classList.remove('loading');
    
    // Here you would typically make an API call
    console.log('Signup attempt:', { name, email, password });
    
    // Show success message and switch to login
    showMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
    setTimeout(() => {
      switchForm('login');
    }, 1500);
  }, 2000);
}

// Message display function
function showMessage(message, type) {
  // Remove existing messages
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  messageEl.textContent = message;
  
  // Add styles
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;
  
  if (type === 'success') {
    messageEl.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
  } else {
    messageEl.style.background = 'linear-gradient(135deg, #f56565, #e53e3e)';
  }
  
  // Add animation keyframes if not already added
  if (!document.querySelector('#messageAnimations')) {
    const style = document.createElement('style');
    style.id = 'messageAnimations';
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100px);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(messageEl);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 300);
  }, 4000);
}

// Add smooth scrolling and enhanced interactions
document.addEventListener('DOMContentLoaded', function() {
  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('.submit-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Add ripple animation if not already added
  if (!document.querySelector('#rippleAnimation')) {
    const style = document.createElement('style');
    style.id = 'rippleAnimation';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
});

// Fonction pour basculer entre les formulaires
function switchForm(form) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (form === 'signup') {
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
  } else {
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
  }
}

// Fonction pour afficher / masquer le mot de passe
function togglePassword(id) {
  const input = document.getElementById(id);
  const icon = input.nextElementSibling.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Animation de force du mot de passe (optionnelle)
const passwordInput = document.getElementById('signupPassword');
const strengthFill = document.querySelector('.strength-fill');
const strengthText = document.querySelector('.strength-text');

if (passwordInput) {
  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    let strength = 0;

    if (val.length >= 6) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    const percent = (strength / 4) * 100;
    strengthFill.style.width = percent + '%';

    if (strength <= 1) {
      strengthFill.style.background = '#e74c3c';
      strengthText.textContent = 'Faible';
    } else if (strength === 2) {
      strengthFill.style.background = '#f1c40f';
      strengthText.textContent = 'Moyenne';
    } else if (strength >= 3) {
      strengthFill.style.background = '#2ecc71';
      strengthText.textContent = 'Forte';
    }
  });
}

