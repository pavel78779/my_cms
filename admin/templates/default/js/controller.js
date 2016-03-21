$(document).ready(function(){
    $(window).on('hashchange', function(){
        //если хэша нет - загружаем домашнюю страницу админки
        if(!location.hash || (location.hash === '#')){
            CMS.component.current.name = null;
            //загружаем домашнюю страниуцу админки
            var $home_page = $('<div class="system-home-page" />')
                .appendTo( $('.system-content-outer').empty() );

            $.getJSON('index.php?com=_system_&section=helpers&action=get_data_for_main_page')
                .done(function(data){
                    console.log(data);
                    var titles = ['Система', 'Компоненты', 'Модули'];
                    data.unshift([['Настройки', 'config']]);
                    $.each(data, function(i, el){
                        var $section_body = $('<div class="body">');
                        $('<div class="section" />')
                            .append('<div class="title">'+titles[i]+'</div>')
                            .append($section_body)
                            .appendTo($home_page);
                        el.forEach(function(el){
                            var href, icon;
                            if(i === 2){
                                href = '#!component/modules_manager/modules/edit?id='+el[1];
                                icon = 'templates/default/images/module_icon.png';
                            }else{
                                if(i === 0){
                                    icon = 'templates/default/images/system_config.png';
                                }else{
                                    icon = 'templates/default/images/component_icon.png';
                                }
                                href = '#!component/'+el[1];
                            }
                            var $a = $('<a href="'+href+'" class="item">'+el[0]+'</a>')
                                .css({
                                    backgroundImage: 'url('+icon+')'
                                });
                            $section_body.append($a);
                        });
                    });
                });
            return;
        }

        if(location.hash.slice(1, 2) != '!') return;
        var hash = location.hash.slice(2);
        var parts = hash.split('?'),
            params = {},
            segments = parts[0].split('/');
        //если есть параметры
        if(parts[1]){
            params = {};
            parts[1].split('&').forEach(function(el){
                if(el){
                    params[el.split('=')[0]] = el.split('=')[1]||null;
                }
            });
        }

        switch (segments[0]){
            case 'component':
                CMS.component.load(segments[1], segments[2], segments[3], params);
                break;
        }

    }).triggerHandler('hashchange');
});
