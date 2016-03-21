var Ajax = {
	historySupported: (window.history && window.history.pushState),

	loadPage: function(url){
		var d = $.Deferred();
		$.getJSON(url, {'_ajax_mode_': '1'})
			.done(function(data){
                var header = data[0],
                    content = data[1],
                    modules = data[2],
                    debug = data[3];
                document.title = header['title'];
                //обновляем модули
                $('[data-include="module"]').each(function(){
                    var $el = $(this);
                    $el.html( modules[$el.attr('data-position')] );
                });
				//обновляем debug
                if(debug){
                    $('[data-include=debug]').html(debug);
                }

                //загружаем CSS
                var css_def = $.map(header.css, function(el){
                    if($('style[data-href="'+el+'"]').length || $('link[rel="stylesheet"][href="'+el+'"]').length) {
                        return null;
                    }else{
                        return $.get(el);
                    }
                });

                $.when.apply(null, css_def)
                    .done(function(){
                        var css_data = (css_def.length===1? [arguments]: arguments);
                        $.each(css_data, function(i, data){
                            $('head').append('<style data-href="'+header.css[i]+'" type="text/css">'+data[0]+'</style>');
                        });

                        //загружаем СКРИПТЫ
                        var js_def = $.map(header.js, function(el){
                            if($('script[data-src="'+el+'"]').length || $('script[src="'+el+'"]').length){
                                return null;
                            }else{
                                return $.get(el, undefined, undefined, 'text');
                            }
                        });

                        $.when.apply(null, js_def)
                            .done(function(){
                                $.each((js_def.length===1?[arguments]:arguments), function(i, data){
                                    $('head').append('<script type="text/javascript" data-src="'+header.js[i]+'">'+data[0]+'</script>');
                                });

                                //обновляем контент
                                $('[data-include="content"]').html(content).css('opacity', '');
                                $(document).trigger('ajax_load');
                                d.resolve();

                            });
                    });
            })
			.fail(function(xhr){
				$('[data-include="content"]').html('<div class="load-page-error">При загрузке страницы произошла ошибка:<br />'+xhr.responseText+'</div>').css('opacity', '');
				d.reject();
			})
            .always(function(){
                window.scrollTo(0, 0);
            });
		return d.promise();
	}
};

if(Ajax.historySupported){
    $(document).ready(function(){
        //ставим обработчики для всех внутренних ссылок, кроме тех которые с классом no_ajax
        $('body').on('click', 'a:not(.no_ajax)', function(event){
            var $a = $(this),
                href = $a.attr('href');
            if($a.attr('target') === '_blank') return;
            if(/^[a-z]+:/i.test(href)) return;
            if(!href || ((href.slice(0,7) === 'http://') && (href.indexOf(SITE.MAIN_URL) !== 0))){
                return;
            }
            $('[data-include="content"]').css('opacity', 0.5);
            Ajax.loadPage(href).always(function(){
                //если url страницы изменился - добавляем страницу в историю
                if(location.href.replace(/^https?:\/\/[a-z\-._]+/i,'') !== href.replace(/^https?:\/\/[a-z\-._]+/i,'')){
                    window.history.pushState(null, document.title, href);
                }
            });
            event.preventDefault();
        });

        //ставим обработчик при переходе по кнопкам браузера Вперед, Назад
        $(window).on('popstate', function(){
            Ajax.loadPage(location.href);
        });

    });
}