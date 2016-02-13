var Ajax = {
	historySupported: (window.history && window.history.pushState),

	loadPage: function(url){
		var d = $.Deferred();
		$.ajax({
			url: url,
            data: {'_ajax_mode_': null},
			dataType: 'json'
		}).done(function(data){
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
                    $.each((css_def.length===1?[arguments]:arguments), function(i, data){
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
				$('[data-include="content"]').html('Ошибка<br />'+xhr.responseText).css('opacity', '');
				d.reject();
			})
            .always(function(){
                window.scrollTo(0, 0);
            });
		return d.promise();
	}
};
$(document).ready(function(){
	//ставим обработчики для всех внутренних ссылок, кроме тех которые с классом no_ajax
	$('body').on('click', 'a:not(.no_ajax)', function(event){
		var $a = $(this), href = $a.attr('href');
		if(!href || ((href.slice(0,7) === 'http://') && (href.indexOf(SITE.MAIN_URL) !== 0))){
			return;
		}
		if(Ajax.historySupported){
			$('[data-include="content"]').css('opacity', 0.5);
			Ajax.loadPage(href).always(function(){
				//если url страницы изменился - добавляем страницу в историю
				if(location.href.replace(/^https?:\/\/[a-z\-._]+/i,'') !== href.replace(/^https?:\/\/[a-z\-._]+/i,'')){
					window.history.pushState(null, document.title, href);
				}
			});
		}else{
			location.hash = '-'+href.replace(/^https?:\/\/[a-z\-._]+/i,'');
		}
		event.preventDefault();
	});
	//назначаем обработчик при переходе по кнопкам браузера Вперед, Назад
	if(Ajax.historySupported){
		$(window).on('popstate', function(e){
			Ajax.loadPage(location.href);
		});
	}else{
		var hash = location.hash;
		setInterval(function(){
			//если хеш изменился
			if(hash !== location.hash){
				$(window).trigger('hash_change');
				hash = location.hash;
			}
		}, 100);
		$(window).on('hash_change', function(){
			if(location.hash.charAt(1) === '-'){
				$('[data-include="content"]').css('opacity', 0.5);
				Ajax.loadPage(location.hash.slice(2));
			}
		}).trigger('hash_change');
	}
});