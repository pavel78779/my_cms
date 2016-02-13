var com = {},
    CMS = {};
$(document).ready(function(){
	//обработчик на ссылку "Выйти"
	$('.system-user-block .logout').on('click', function(){
		$('body').empty();
		$.get(SITE.MAIN_URL+'admin/index.php?com=users&action=logout')
			.always(function(){
				location.reload();
			});
		return false;
	});

	var $main_menu = $('.system-main-menu');

	//ставим обработчики клика на пункты с выпадающим меню
	$main_menu.on('click', '.item[data-dropdown-menu]', function(){
		var $item = $(this).addClass('active'),
			dropdown_menu = $main_menu.find('.system-dropdown-menu.'+$item.attr('data-dropdown-menu'));
		dropdown_menu
			.css({
				top: $item.outerHeight(),
				left: $item.position().left,
				display: ''
			});
		$(document).on('mousedown.system_dropdown_menu', function(){
			$item.removeClass('active');
			dropdown_menu.css('display', 'none');
			$(document).off('mousedown.system_dropdown_menu');
		});
	});
	$main_menu.find('.system-dropdown-menu')
		.on('mousedown', false)
		.on('click', '.item', function(){
			$(document).trigger('mousedown');
		});

});