// jQuery Copy to Clipboard functionality
$(document).ready(function() {
  // Update user name from cookies if available
  if (typeof BalanceManager !== 'undefined') {
    const userName = BalanceManager.getUserName() || 'Guest User';
    $('#userName').text(userName);
  }

  $('#copyBtn').on('click', function() {
    const userName = $('#userName').text();
    const $btn = $(this);
    const $icon = $('#copyIcon');
    const $text = $('#copyText');
    const $tooltip = $('#copyTooltip');
    
    // Create a temporary input to copy text
    const $temp = $('<input>');
    $('body').append($temp);
    $temp.val(userName).select();
    document.execCommand('copy');
    $temp.remove();
    
    // Change button appearance
    $btn.addClass('copied');
    $icon.text('✓');
    $text.text('Copied!');
    
    // Show tooltip
    $tooltip.addClass('show');
    
    // Trigger copy event (as per hint)
    $btn.trigger('copy');
    
    // Reset after 2 seconds
    setTimeout(function() {
      $btn.removeClass('copied');
      $icon.text('📋');
      $text.text('Copy');
      $tooltip.removeClass('show');
    }, 2000);
  });
  
  // Optional: Listen to copy event
  $('#copyBtn').on('copy', function() {
    console.log('Copy event triggered!');
  });
});

