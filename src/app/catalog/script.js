$(window).on('scroll', function() {
  const scrollTop = $(this).scrollTop();
  const docHeight = $(document).height() - $(window).height();
  const scrollPercent = (scrollTop / docHeight) * 100;
  $('#scroll-progress').css('width', scrollPercent + '%');
});