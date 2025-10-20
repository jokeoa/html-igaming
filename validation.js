document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.newsletter-section form');

  if (!form) return;

  const nameInput = form.querySelector('input[type="text"]');
  const emailInput = form.querySelector('input[type="email"]');
  const phoneInput = form.querySelector('input[type="tel"]');
  const checkbox = form.querySelector('#personalDataCheckbox');

  function createErrorElement(message) {
    const error = document.createElement('div');
    error.className = 'invalid-feedback d-block';
    error.style.color = '#ff6b6b';
    error.style.fontSize = '14px';
    error.style.marginTop = '5px';
    error.textContent = message;
    return error;
  }

  function removeError(input) {
    const parent = input.closest('.mb-3') || input.closest('.form-check');
    const existingError = parent.querySelector('.invalid-feedback');
    if (existingError) {
      existingError.remove();
    }
    input.classList.remove('is-invalid');
  }

  function showError(input, message) {
    removeError(input);
    input.classList.add('is-invalid');
    const parent = input.closest('.mb-3') || input.closest('.form-check');
    parent.appendChild(createErrorElement(message));
  }

  function validateName(name) {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name can only contain letters and spaces';
    }
    return null;
  }

  function validateEmail(email) {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  function validatePhone(phone) {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number';
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    return null;
  }

  function validateCheckbox(checkbox) {
    if (!checkbox.checked) {
      return 'You must agree to the processing of personal data';
    }
    return null;
  }

  nameInput.addEventListener('blur', function() {
    const error = validateName(this.value);
    if (error) {
      showError(this, error);
    } else {
      removeError(this);
    }
  });

  emailInput.addEventListener('blur', function() {
    const error = validateEmail(this.value);
    if (error) {
      showError(this, error);
    } else {
      removeError(this);
    }
  });

  phoneInput.addEventListener('blur', function() {
    const error = validatePhone(this.value);
    if (error) {
      showError(this, error);
    } else {
      removeError(this);
    }
  });

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    let isValid = true;

    const nameError = validateName(nameInput.value);
    if (nameError) {
      showError(nameInput, nameError);
      isValid = false;
    } else {
      removeError(nameInput);
    }

    const emailError = validateEmail(emailInput.value);
    if (emailError) {
      showError(emailInput, emailError);
      isValid = false;
    } else {
      removeError(emailInput);
    }

    const phoneError = validatePhone(phoneInput.value);
    if (phoneError) {
      showError(phoneInput, phoneError);
      isValid = false;
    } else {
      removeError(phoneInput);
    }

    const checkboxError = validateCheckbox(checkbox);
    if (checkboxError) {
      showError(checkbox, checkboxError);
      isValid = false;
    } else {
      removeError(checkbox);
    }

    if (isValid) {
      alert('Form submitted successfully!');
      form.reset();
    }
  });
});
