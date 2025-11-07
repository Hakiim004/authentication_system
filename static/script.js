// =======================================
// script.js - version finale
// =======================================

// Fonction pour basculer l'affichage du mot de passe
function togglePassword(input) {
  const icon = input.parentNode.querySelector('.toggle-password i');

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

// Attache les événements aux boutons toggle-password
document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.toggle-password');

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling; // suppose que le bouton est juste après l'input
      togglePassword(input);
    });
  });
});
