// TASK 3: POPUP FUNCTIONALITY
function openPopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function closePopupOnOutside(event) {
  if (event.target.id === 'popupOverlay') {
    closePopup();
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('popup-name').value;
  const email = document.getElementById('popup-email').value;
  const message = document.getElementById('popup-message').value;
  
  alert(`Thank you for subscribing, ${name}!\nWe'll send updates to ${email}`);
  
  // Reset form
  event.target.reset();
  closePopup();
}

// Close popup with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closePopup();
  }
});
