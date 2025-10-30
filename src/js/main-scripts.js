// === TASK 5: Animated Number Counter ===
let countersAnimated = false;

function animateCounters() {
  $('.counter').each(function() {
    const $this = $(this);
    const target = parseInt($this.data('target'));
    let count = 0;
    const increment = Math.ceil(target / 50);
    const interval = 30;

    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        $this.text(target + (target === 98 ? '%' : '+'));
        clearInterval(timer);
      } else {
        $this.text(count);
      }
    }, interval);
  });
}

$(window).on('scroll', function() {
  if (countersAnimated) return;

  const $section = $('.stats-section');
  const sectionTop = $section.offset().top;
  const sectionHeight = $section.outerHeight();
  const windowHeight = $(window).height();
  const scroll = $(window).scrollTop();

  if (scroll > sectionTop + sectionHeight - windowHeight - 100) {
    animateCounters();
    countersAnimated = true;
    $(this).off('scroll');
  }
});

$(document).ready(function() {
  if ($('.stats-section').length) {
    const check = () => {
      if (!countersAnimated && $(window).scrollTop() + $(window).height() > $('.stats-section').offset().top) {
        animateCounters();
        countersAnimated = true;
      }
    };
    check();
    $(window).on('scroll', check);
  }
});

// jQuery
$(document).ready(function() {
  console.log("jQuery is ready!");
});


// === TASK 6: Loading Spinner ===
$('#stay-updated-form').on('submit', function(e) {
  e.preventDefault();

  const $btn = $('#stay-updated-btn');
  const original = $btn.html();

  $btn.prop('disabled', true)
      .html('<span class="spinner"></span> Please wait...');

  setTimeout(() => {
    $btn.prop('disabled', false).html(original);
    alert('Subscribed successfully!');
  }, 2000);
});

// === TASK 3: Image Lazy Loading ===
$(document).ready(function() {
  // Function to check if element is in viewport
  function isInViewport($element) {
    const elementTop = $element.offset().top;
    const elementBottom = elementTop + $element.outerHeight();
    const viewportTop = $(window).scrollTop();
    const viewportBottom = viewportTop + $(window).height();

    // Add some buffer (100px) to start loading before image enters viewport
    return elementBottom > viewportTop - 100 && elementTop < viewportBottom + 100;
  }

  // Function to load images
  function loadVisibleImages() {
    $('.lazy-load').each(function() {
      const $img = $(this);

      // Check if image hasn't been loaded yet and is in viewport
      if (!$img.hasClass('loaded') && isInViewport($img)) {
        const dataSrc = $img.attr('data-src');

        if (dataSrc) {
          // Add loading animation
          $img.css({
            'opacity': '0.3',
            'transition': 'opacity 0.5s ease'
          });

          // Create new image to preload
          const tempImg = new Image();
          tempImg.onload = function() {
            // Set the src attribute and mark as loaded
            $img.attr('src', dataSrc);
            $img.addClass('loaded');
            $img.css('opacity', '1');

            console.log('Lazy loaded:', dataSrc);
          };

          tempImg.onerror = function() {
            console.error('Failed to load:', dataSrc);
            // Show placeholder on error
            $img.css({
              'opacity': '1',
              'background': 'rgba(255, 0, 0, 0.1)'
            });
            $img.addClass('loaded');
          };

          tempImg.src = dataSrc;
        }
      }
    });
  }

  // Load images on scroll
  $(window).on('scroll', function() {
    loadVisibleImages();
  });

  // Load images on page load (for images already in viewport)
  loadVisibleImages();

  // Also check on resize
  $(window).on('resize', function() {
    loadVisibleImages();
  });
});
