$(document).ready(function() {
  // Task 1: Real-time Search and Live Filter
  // Task 2: Autocomplete Search Suggestions  
  // Task 3: Search Highlighting

  // Store all FAQ questions and answers for search
  const faqData = [];
  
  // Extract FAQ data from accordion items
  $('.accordion-item').each(function() {
    const question = $(this).find('.accordion-button').text().trim();
    const answer = $(this).find('.accordion-body').text().trim();
    faqData.push({
      question: question,
      answer: answer,
      element: $(this)
    });
  });

  // Function to escape regex special characters
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Function to highlight text matches (text nodes only)
  function highlightTextNodes($element, searchTerm) {
    if (!searchTerm) return;
    
    const escapedTerm = escapeRegex(searchTerm);
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    
    $element.contents().each(function() {
      if (this.nodeType === 3) { // Text node
        const text = $(this).text();
        if (regex.test(text)) {
          const highlighted = text.replace(regex, '<span class="highlight">$1</span>');
          $(this).replaceWith(highlighted);
        }
      } else if (this.nodeType === 1 && this.tagName !== 'SPAN') { // Element node (but not our highlight spans)
        highlightTextNodes($(this), searchTerm);
      }
    });
  }

  // Function to remove highlights
  function removeHighlights() {
    $('.accordion-button, .accordion-body').each(function() {
      const $elem = $(this);
      // Store original text if not already stored
      if (!$elem.data('original-html')) {
        $elem.data('original-html', $elem.html());
      }
      // Restore original text
      $elem.html($elem.data('original-html'));
    });
  }

  // Function to apply highlights
  function applyHighlights(searchTerm) {
    $('.accordion-button, .accordion-body').each(function() {
      const $elem = $(this);
      // Store original if not stored
      if (!$elem.data('original-html')) {
        $elem.data('original-html', $elem.html());
      }
      // Restore original first
      $elem.html($elem.data('original-html'));
      // Apply highlights to text nodes only
      highlightTextNodes($elem, searchTerm);
    });
  }

  // Task 2: Build autocomplete suggestions from FAQ data
  function buildAutocompleteSuggestions(searchTerm) {
    const suggestions = [];
    const searchLower = searchTerm.toLowerCase();
    
    faqData.forEach(function(faq) {
      // Check if question matches
      if (faq.question.toLowerCase().includes(searchLower)) {
        suggestions.push(faq.question);
      }
      // Also check key terms in answers
      const words = faq.answer.toLowerCase().split(' ');
      words.forEach(function(word) {
        if (word.length > 4 && word.includes(searchLower) && !suggestions.includes(word)) {
          suggestions.push(word);
        }
      });
    });
    
    // Remove duplicates and limit to 5 suggestions
    return [...new Set(suggestions)].slice(0, 5);
  }

  // Task 2: Display autocomplete dropdown
  function showAutocomplete(suggestions) {
    const $autocompleteList = $('#autocompleteList');
    $autocompleteList.empty();
    
    if (suggestions.length === 0) {
      $autocompleteList.hide();
      return;
    }
    
    suggestions.forEach(function(suggestion) {
      const $item = $('<div>')
        .addClass('autocomplete-item')
        .text(suggestion)
        .on('click', function() {
          $('#faqSearch').val(suggestion);
          $autocompleteList.hide();
          performSearch(suggestion);
        });
      $autocompleteList.append($item);
    });
    
    $autocompleteList.show();
  }

  // Task 1: Filter FAQ items based on search
  function performSearch(searchTerm) {
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Remove previous highlights
    removeHighlights();
    
    if (searchLower === '') {
      // Show all items if search is empty
      $('.accordion-item').show().removeClass('search-match');
      updateSearchInfo(0, ''); // Hide search info
      return;
    }
    
    // Task 3: Apply highlights to matching text
    applyHighlights(searchTerm);
    
    // Task 1: Filter items
    let matchCount = 0;
    faqData.forEach(function(faq) {
      const questionMatch = faq.question.toLowerCase().includes(searchLower);
      const answerMatch = faq.answer.toLowerCase().includes(searchLower);
      
      if (questionMatch || answerMatch) {
        faq.element.show().addClass('search-match');
        matchCount++;
      } else {
        faq.element.hide().removeClass('search-match');
      }
    });
    
    // Update the info text
    updateSearchInfo(matchCount, searchTerm);
  }

  // Update search results info
  function updateSearchInfo(count, term) {
    let $infoText = $('.search-info');
    if ($infoText.length === 0) {
      $infoText = $('<p class="search-info text-center mb-3"></p>');
      $('.policy-subtitle').after($infoText);
    }
    
    if (term) {
      $infoText.text(`Found ${count} result${count !== 1 ? 's' : ''} for "${term}"`).show();
    } else {
      $infoText.hide();
    }
  }

  // Task 1: Real-time search on keyup
  $('#faqSearch').on('keyup', function() {
    const searchTerm = $(this).val();
    
    // Task 2: Show autocomplete suggestions
    if (searchTerm.length >= 2) {
      const suggestions = buildAutocompleteSuggestions(searchTerm);
      showAutocomplete(suggestions);
    } else {
      $('#autocompleteList').hide();
    }
    
    // Task 1 & 3: Perform search and highlight
    performSearch(searchTerm);
  });

  // Hide autocomplete when clicking outside
  $(document).on('click', function(e) {
    if (!$(e.target).closest('.search-container-header').length) {
      $('#autocompleteList').hide();
    }
  });

  // Prevent accordion from closing when clicking on highlighted text
  $('.accordion-item').on('click', '.highlight', function(e) {
    e.stopPropagation();
  });
});

