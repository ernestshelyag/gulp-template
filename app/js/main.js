console.log("test");

$('.tabs__nav-link').on('click', function(e) {
    e.preventDefault();

    var idToggle = $(this).attr('data-toggle');

    $('.tabs__nav-link').removeClass('tabs__nav-link_active');
    $(this).addClass('tabs__nav-link_active');

    $('.tabs__box').removeClass('tabs__box_active');
    $('.tabs__box[data-id="' + idToggle + '"]').addClass('tabs__box_active');
});