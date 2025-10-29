$(document).ready(function(){
  console.log("jQuery is ready!");
  
  // Task 2: Autocomplete Search Suggestions
  const games = ["Blackjack", "Poker", "Roulette"];
  
  $('#game-search').on('input', function() {
    const value = $(this).val().toLowerCase();
    $('#autocomplete-list').empty().hide();
    
    if (!value) return;
    
    const matches = games.filter(game => 
      game.toLowerCase().includes(value)
    );
    
    matches.forEach(game => {
      $('#autocomplete-list').append(
        $('<div></div>')
          .text(game)
          .on('click', function() {
            $('#game-search').val(game);
            $('#autocomplete-list').hide();
          })
      );
    });
    
    if (matches.length > 0) {
      $('#autocomplete-list').show();
    }
  });
  
  // Скрыть при клике вне
  $(document).on('click', function() {
    $('#autocomplete-list').hide();
  });
});