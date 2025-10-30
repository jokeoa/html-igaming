$(window).on('scroll', function() {
  const scrollTop = $(this).scrollTop();
  const docHeight = $(document).height() - $(window).height();
  const scrollPercent = (scrollTop / docHeight) * 100;
  $('#scroll-progress').css('width', scrollPercent + '%');
});


// Task 5: Animated Number Counter 
let countersAnimated = false;

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
    
    $(window).off('scroll', arguments.callee);
  }
});
// jQuery
$(document).ready(function() {
  console.log("jQuery is ready!");
});