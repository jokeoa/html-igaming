$(document).ready(function() {
  const api = window.htmlCasinoUser || null;
  const $userName = $('#userName');
  const $balanceValue = $('#profileBalanceValue');
  const $nicknameInput = $('#profileNicknameInput');
  const $topUpInput = $('#profileTopUpAmount');
  const $avatar = $('.profile-avatar');
  const defaultTopUpValue = $topUpInput.length ? $topUpInput.val() : '';

  function renderUser(snapshot) {
    if (!snapshot) return;

    if ($userName.length) {
      $userName.text(snapshot.nickname);
    }

    if ($avatar.length) {
      const initial = snapshot.nickname ? snapshot.nickname.charAt(0).toUpperCase() : '👤';
      $avatar.text(initial || '👤');
    }

    if ($balanceValue.length) {
      $balanceValue.text(snapshot.balance);
    }

    if ($nicknameInput.length && !$nicknameInput.is(':focus')) {
      $nicknameInput.val(snapshot.nickname);
    }
  }

  function ensureUserSnapshot() {
    if (!api || typeof api.getUserSnapshot !== 'function') return null;
    return api.getUserSnapshot();
  }

  const initialSnapshot = ensureUserSnapshot();
  if (initialSnapshot) {
    renderUser(initialSnapshot);
  }

  if (api && typeof api.onChange === 'function') {
    api.onChange(renderUser);
  }

  // Copy to clipboard
  $('#copyBtn').on('click', function() {
    const nickname = $userName.text();
    const $btn = $(this);
    const $icon = $('#copyIcon');
    const $text = $('#copyText');
    const $tooltip = $('#copyTooltip');

    const $temp = $('<input>');
    $('body').append($temp);
    $temp.val(nickname).select();
    document.execCommand('copy');
    $temp.remove();

    $btn.addClass('copied');
    $icon.text('✓');
    $text.text('Copied!');
    $tooltip.addClass('show');

    $btn.trigger('copy');

    setTimeout(function() {
      $btn.removeClass('copied');
      $icon.text('📋');
      $text.text('Copy');
      $tooltip.removeClass('show');
    }, 2000);
  });

  $('#copyBtn').on('copy', function() {
    console.log('Copy event triggered!');
  });

  $('#profileNicknameForm').on('submit', function(event) {
    event.preventDefault();
    if (!api || typeof api.setNickname !== 'function') return;

    const nickname = ($nicknameInput.val() || '').trim();
    const result = api.setNickname(nickname, { silent: true });

    if (!result || !result.success) {
      $nicknameInput.addClass('is-invalid');
      return;
    }

    $nicknameInput.removeClass('is-invalid');
    renderUser(ensureUserSnapshot());
    if (typeof showToastMessage === 'function') {
      showToastMessage('Profile updated', `Welcome back, ${nickname}!`);
    }
  });

  $nicknameInput.on('input', function() {
    $nicknameInput.removeClass('is-invalid');
  });

  $('#profileTopUpForm').on('submit', function(event) {
    event.preventDefault();
    if (!api || typeof api.addTokens !== 'function') return;

    const amount = Math.floor(Number($topUpInput.val()));
    if (!Number.isFinite(amount) || amount <= 0) {
      $topUpInput.addClass('is-invalid');
      return;
    }

    const result = api.addTokens(amount, { silent: true });
    if (!result || !result.success) {
      $topUpInput.addClass('is-invalid');
      return;
    }

    $topUpInput.removeClass('is-invalid');
    if (typeof showToastMessage === 'function') {
      showToastMessage('Tokens added', `+${amount} tokens added to your balance.`);
    }
    renderUser(ensureUserSnapshot());
    if (defaultTopUpValue !== undefined) {
      $topUpInput.val(defaultTopUpValue);
    }
  });

  $topUpInput.on('input', function() {
    $topUpInput.removeClass('is-invalid');
  });
});