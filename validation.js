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

// Date-Time


// Date-Time Floating Card (global, inside validation.js)
(function() {
  const TZ = 'Asia/Almaty';
  const DEFAULT_24H = true;

  function qs(id) { return document.getElementById(id); }

  function initDateTimeCard() {
    const elTime = qs('dt-f-time');
    const elDate = qs('dt-f-date');
    const btnToggle = qs('dt-f-toggle');
    const card = qs('dt-floating-card');

    // Если на странице нет HTML-карточки — тихо выходим
    if (!elTime || !elDate || !btnToggle || !card) return;

    // Предпочтение 12/24 в localStorage (общая настройка для всех страниц)
    function getIs24() {
      try {
        const v = localStorage.getItem('dt_is24h');
        return v === null ? DEFAULT_24H : v === 'true';
      } catch (_) { return DEFAULT_24H; }
    }
    function setIs24(v) {
      try { localStorage.setItem('dt_is24h', String(v)); } catch (_) {}
    }

    let is24 = getIs24();

    function fmtTime(date) {
      return new Intl.DateTimeFormat(undefined, {
        timeZone: TZ,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24
      }).format(date);
    }

    function fmtDate(date) {
      return new Intl.DateTimeFormat('ru-RU', {
        timeZone: TZ,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      }).format(date);
    }

    function render() {
      const now = new Date();
      elTime.textContent = fmtTime(now);
      elDate.textContent = fmtDate(now);
      btnToggle.textContent = is24 ? '12/24' : '24/12';
      btnToggle.setAttribute('aria-label', is24 ? 'Переключить на 12-часовой' : 'Переключить на 24-часовой');
    }

    // Ровный тикер по секундам
    let intervalId;
    function startTicker() {
      const delay = 1000 - (Date.now() % 1000);
      setTimeout(() => {
        render();
        intervalId = setInterval(render, 1000);
      }, delay);
    }

    btnToggle.addEventListener('click', () => {
      is24 = !is24;
      setIs24(is24);
      render();
    });

    render();
    startTicker();

    // Очистка
    window.addEventListener('beforeunload', () => {
      if (intervalId) clearInterval(intervalId);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDateTimeCard);
  } else {
    initDateTimeCard();
  }
})();
