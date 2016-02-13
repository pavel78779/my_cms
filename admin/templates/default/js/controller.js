/**
 * Created by pavel on 16.07.2015.
 */
$(window).ready(function(){
    $(window).on('hashchange', function(){
        //если хэша нет - загружаем домашнюю страницу админки
        if(!location.hash || (location.hash === '#')){
            component.currentComponent = null;
            //загружаем домашнюю страниуцу админки
            var $home_page = $('<div class="system-home-page" />').appendTo( $('.system-content-outer').html('') );

            function load_section(data){
                var $section_body = $('<div class="body">');
                $('<div class="section" />')
                    .append('<div class="title">'+data[0]+'</div>')
                    .append($section_body)
                    .appendTo($home_page);
                data[1].forEach(function(el){
                    var $a = $('<a href="'+el[0]+'" class="item">'+el[1]+'</a>');
                    if(el[2]){
                        $a.css({
                            backgroundImage: 'url('+el[2]+')'
                        });
                    }
                    $section_body.append($a);
                });
            }

            load_section(['Система', [['#!component/config', 'Настройки', 'templates/default/images/system_config.png']]]);

            //загружаем компоненты
            $.getJSON(SITE.MAIN_URL+'admin/index.php?com=extensions_manager&section=extensions&action=get&fields=name,title', {filter: JSON.stringify({type:'component'})})
                .done(function(data){
                    data.forEach(function(el){
                        el[0] = '#!component/'+el[0];
                        el[2] = 'templates/default/images/component_icon.png';
                    });
                    load_section(['Компоненты', data]);

                    //загружаем модули
                    $.getJSON(SITE.MAIN_URL+'admin/index.php?com=modules_manager&section=modules&action=get&fields=id,name')
                        .done(function(data){
                            data.forEach(function(el){
                                el[0] = '#!component/modules_manager/modules/edit?id='+el[0];
                                el[2] = 'templates/default/images/module_icon.png';
                            });
                            load_section(['Модули', data]);
                        });
                });
            return;
        }

        if(location.hash.slice(1, 2) != '!') return;
        var hash = location.hash.slice(2);
        var parts = hash.split('?'),
            params = null,
            segments = [];
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
                function load_page(){
                    //загружаем раздел компонента
                    var section_name = segments[2] || component.sections[0].name;
                    component.loadSection(section_name);
                    component.sections.forEach(function(sec){
                        if(sec.name == section_name){
                            component.loadAction(segments[3] || sec.actions[0], params);
                        }
                    });
                }
                //если компонент изменился
                if(segments[1] != component.currentComponent){
                    component.loadComponent(segments[1])
                        .done(load_page);
                }else{
                    load_page();
                }
        }

    }).triggerHandler('hashchange');
});
