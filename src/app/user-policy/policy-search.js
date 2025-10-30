$(document).ready(function() {
  // Task 1: Real-time Search and Live Filter
  // Task 2: Autocomplete Search Suggestions  
  // Task 3: Search Highlighting

  // Store all policy sections for search
  const policyData = [];
  
  // Extract policy data from sections
  $('.policy-content h3').each(function() {
    const $section = $(this);
    const heading = $section.text().trim();
    const $paragraphs = $section.nextUntil('h3', 'p');
    const content = $paragraphs.text().trim();
    
    policyData.push({
      heading: heading,
      content: content,
      element: $section,
      paragraphs: $paragraphs
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
    $('.policy-content h3, .policy-content p, .date-info, .disclaimer').each(function() {
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
    $('.policy-content h3, .policy-content p, .date-info p, .disclaimer p').each(function() {
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

  // Task 2: Build autocomplete suggestions from policy data
  function buildAutocompleteSuggestions(searchTerm) {
    const suggestions = [];
    const searchLower = searchTerm.toLowerCase();
    
    // Add section headings that match
    policyData.forEach(function(section) {
      if (section.heading.toLowerCase().includes(searchLower)) {
        suggestions.push(section.heading);
      }
    });
    
    // Add important keywords
    const keywords = [
      'educational', 'gambling', 'platform', 'access', 'policy',
      'data', 'privacy', 'age', 'restrictions', 'technical',
      'feedback', 'intellectual', 'property', 'disclaimer',
      'university', 'modifications', 'support', 'contact'
    ];
    
    keywords.forEach(function(keyword) {
      if (keyword.toLowerCase().includes(searchLower) && !suggestions.includes(keyword)) {
        suggestions.push(keyword);
      }
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
          $('#policySearch').val(suggestion);
          $autocompleteList.hide();
          performSearch(suggestion);
        });
      $autocompleteList.append($item);
    });
    
    $autocompleteList.show();
  }

  // Task 1: Filter policy sections based on search
  function performSearch(searchTerm) {
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Remove previous highlights
    removeHighlights();
    
    if (searchLower === '') {
      // Show all sections if search is empty
      $('.policy-content h3, .policy-content p').show().removeClass('search-match');
      $('.date-info, .disclaimer').show();
      updateSearchInfo(0, ''); // Hide search info
      return;
    }
    
    // Task 3: Apply highlights to matching text
    applyHighlights(searchTerm);
    
    // Task 1: Filter sections
    let matchCount = 0;
    policyData.forEach(function(section) {
      const headingMatch = section.heading.toLowerCase().includes(searchLower);
      const contentMatch = section.content.toLowerCase().includes(searchLower);
      
      if (headingMatch || contentMatch) {
        section.element.show().addClass('search-match');
        section.paragraphs.show().addClass('search-match');
        matchCount++;
      } else {
        section.element.hide().removeClass('search-match');
        section.paragraphs.hide().removeClass('search-match');
      }
    });
    
    // Handle date-info and disclaimer sections
    const dateInfoText = $('.date-info').text().toLowerCase();
    if (dateInfoText.includes(searchLower)) {
      $('.date-info').show().addClass('search-match');
      matchCount++;
    } else {
      $('.date-info').hide();
    }
    
    const disclaimerText = $('.disclaimer').text().toLowerCase();
    if (disclaimerText.includes(searchLower)) {
      $('.disclaimer').show().addClass('search-match');
      matchCount++;
    } else {
      $('.disclaimer').hide();
    }
    
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
      $infoText.text(`Found ${count} section${count !== 1 ? 's' : ''} matching "${term}"`).show();
    } else {
      $infoText.hide();
    }
  }

  // Task 1: Real-time search on keyup
  $('#policySearch').on('keyup', function() {
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
});

