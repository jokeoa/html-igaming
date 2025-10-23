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

// Time-based greeting toast
function showGreetingToast() {
  const hour = new Date().getHours();
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');

  let greeting, message;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning!';
    message = 'Start your day with some exciting casino games!';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon!';
    message = 'Perfect time to try your luck at our casino!';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening!';
    message = 'Evening is the best time to play and win!';
  } else {
    greeting = 'Good Night!';
    message = 'Late night gaming sessions are the most thrilling!';
  }

  toastTitle.textContent = greeting;
  toastMessage.textContent = message;

  const toastElement = document.getElementById('greetingToast');
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 5000
  });
  toast.show();
}

// Show toast when page loads
window.addEventListener('load', function() {
  setTimeout(showGreetingToast, 1000);
});
