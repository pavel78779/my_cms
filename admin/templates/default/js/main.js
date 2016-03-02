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
});