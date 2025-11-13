// jQuery Copy to Clipboard and Edit Nickname functionality
$(document).ready(function() {
  // Update user name from localStorage if available
  if (typeof BalanceManager !== 'undefined') {
    const userName = BalanceManager.getUserName() || 'Guest User';
    $('#userName').text(userName);
  }

  // Edit nickname functionality
  let isEditing = false;
  let originalName = '';

  $('#editBtn').on('click', function() {
    const $btn = $(this);
    const $icon = $('#editIcon');
    const $text = $('#editText');
    const $userName = $('#userName');

    if (!isEditing) {
      // Start editing
      isEditing = true;
      originalName = $userName.text();

      // Change button to Save
      $btn.addClass('editing');
      $icon.text('💾');
      $text.text('Save');

      // Replace h1 with input, keeping it in the same container
      const $input = $('<input>', {
        type: 'text',
        class: 'edit-input',
        id: 'userNameInput',
        value: originalName,
        maxlength: 30
      });

      // Replace the h1 with input, maintaining the structure
      $userName.replaceWith($input);
      
      // Focus and select the input
      setTimeout(function() {
        $input.focus();
        $input.select();
      }, 10);

      // Handle Enter key
      $input.on('keypress', function(e) {
        if (e.which === 13) {
          $('#editBtn').click();
        }
      });

      // Handle Escape key
      $input.on('keydown', function(e) {
        if (e.which === 27) {
          // Cancel editing
          isEditing = false;
          const $h1 = $('<h1>', {
            class: 'profile-name',
            id: 'userName',
            text: originalName
          });
          $input.replaceWith($h1);
          $btn.removeClass('editing');
          $icon.text('✏️');
          $text.text('Edit');
        }
      });
    } else {
      // Save changes
      const $input = $('#userNameInput');
      let newName = $input.val().trim();

      // Validation
      if (newName === '') {
        alert('Name cannot be empty!');
        return;
      }

      if (newName.length < 2) {
        alert('Name must be at least 2 characters long!');
        return;
      }

      if (newName.length > 30) {
        newName = newName.substring(0, 30);
      }

      // Save to localStorage
      if (typeof BalanceManager !== 'undefined') {
        BalanceManager.setUserName(newName);
      }

      // Replace input with h1
      const $h1 = $('<h1>', {
        class: 'profile-name',
        id: 'userName',
        text: newName
      });
      $input.replaceWith($h1);

      // Update the reference for copy button
      // The copy button will now use the new h1 element

      // Reset button
      isEditing = false;
      $btn.removeClass('editing');
      $icon.text('✏️');
      $text.text('Edit');

      // Show success message
      const $alert = $('<div class="alert alert-success alert-dismissible fade show" role="alert">' +
        '<strong>Success!</strong> Your nickname has been updated to "' + newName + '".' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
        '</div>');
      $('.profile-header').after($alert);

      // Auto dismiss after 3 seconds
      setTimeout(function() {
        $alert.alert('close');
      }, 3000);
    }
  });

  // Copy to clipboard functionality
  $('#copyBtn').on('click', function() {
    const $btn = $(this);
    const $icon = $('#copyIcon');
    const $text = $('#copyText');
    const $tooltip = $('#copyTooltip');

    // Get user name - check if editing (input) or normal (h1)
    let userName = '';
    const $userNameEl = $('#userName');
    const $userNameInput = $('#userNameInput');
    
    if ($userNameInput.length > 0) {
      // Currently editing, get value from input
      userName = $userNameInput.val().trim();
    } else if ($userNameEl.length > 0) {
      // Normal state, get text from h1
      userName = $userNameEl.text();
    } else {
      // Fallback: get from BalanceManager
      userName = (typeof BalanceManager !== 'undefined' && BalanceManager.getUserName()) || 'Guest User';
    }

    // Use modern Clipboard API if available, fallback to execCommand
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(userName).then(function() {
        // Success
        $btn.addClass('copied');
        $icon.text('✓');
        $text.text('Copied!');
        $tooltip.addClass('show');

        // Reset after 2 seconds
        setTimeout(function() {
          $btn.removeClass('copied');
          $icon.text('📋');
          $text.text('Copy');
          $tooltip.removeClass('show');
        }, 2000);
      }).catch(function(err) {
        console.error('Failed to copy:', err);
        // Fallback to old method
        copyFallback(userName, $btn, $icon, $text, $tooltip);
      });
    } else {
      // Fallback for older browsers
      copyFallback(userName, $btn, $icon, $text, $tooltip);
    }
  });

  // Fallback copy function for older browsers
  function copyFallback(text, $btn, $icon, $text, $tooltip) {
    // Create a temporary input to copy text
    const $temp = $('<input>');
    $('body').append($temp);
    $temp.val(text).select();
    document.execCommand('copy');
    $temp.remove();

    // Change button appearance
    $btn.addClass('copied');
    $icon.text('✓');
    $text.text('Copied!');

    // Show tooltip
    $tooltip.addClass('show');

    // Reset after 2 seconds
    setTimeout(function() {
      $btn.removeClass('copied');
      $icon.text('📋');
      $text.text('Copy');
      $tooltip.removeClass('show');
    }, 2000);
  }

  // Optional: Listen to copy event
  $('#copyBtn').on('copy', function() {
    console.log('Copy event triggered!');
  });
});

