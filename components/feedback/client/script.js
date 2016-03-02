$(document).on('ready ajax_load', function(){
	var $form = $('form.com_feedback');
    if($form.length){
        function refresh_captcha(){
            var $img = $form.find('table.captcha img');
            if($img.length) $img.attr('src', $img.attr('src').split('?')[0]+'?'+Math.random());
            $form.find('input[name=_captcha_]').val('');
        }

        $form.find('table.captcha a').on('click', refresh_captcha);

        $form.on('submit', function(e){
            e.preventDefault();
            var data = $(this).serializeForm();
            if(data){
                data._ajax_mode_ = true;
                $form.css('opacity', 0.5).find('input[type="submit"]').val('Отправка...').prop('disabled', true);
                $.post($form.attr('action'), data)
                    .always(function(){
                        var xhr = (typeof arguments[0] == 'object')? arguments[0]: arguments[2],
                            status = arguments[1];
                        $('.system-notice').remove();
                        $('[data-include="content"].content').prepend('<div class="system-notice '+status+'">'+xhr.responseText+'</div>');
                        window.scrollTo(0, 0);
                        refresh_captcha();
                        if(status == 'success') $form[0].reset();
                        $form.css('opacity', '').find('input[type="submit"]').val('Отправить').prop('disabled', false);
                    });
            }
        });
    }
});