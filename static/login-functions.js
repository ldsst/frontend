function adjust_box() {
    $('.box').each(function() {
      $(this).css({'position' : 'absolute','left' : '50%','top' : '50%','margin-left' : function() {return -$(this).outerWidth()/2},'margin-top' : function() {return -$(this).outerHeight()/2}});
    });
  }