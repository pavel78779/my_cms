//функция для сохранения модуля
function modulesManagerSaveModule(data, id){
    data.main_params.params = JSON.stringify(data.module_params);
    return this.standardFns.save(data.main_params, id);
}


//кнопка для выбора страниц, на которых будет отображаться модуль
$.formElements.modulesManagerSelectPagesButton = function(params, $form){
    var $button = $.formElements.button(params);
    if(params.default){
        $button.val(JSON.parse(params.default).length + ' стр.');
    }else{
        $button.val('Выбрать');
    }

    $button.on('click', function(){
        var $button = $(this);
        var $load_popup = $('<span>Загрузка...</span>').popup({showHeader: false});
        //делаем ajax-запрос, чтобы загрузить список пунктов меню
        $.getJSON(SITE.MAIN_URL+'admin/index.php?com=modules_manager&section=modules&action=get_menu')
            .done(function(data){
                $load_popup.close();
                //генерируем содержимое popup-окна
                var $select_menu = $('<select name="menu_items" style="min-height:100px" multiple="multiple" />'),
                    $textarea_urls = $('<textarea style="width:230px; height:90px;" name="urls" />'),
                    $select_pages = $('<div class="select-pages" />')
                        .append($('<div class="col" />').append('<div class="title">Пункты меню</div>').append($select_menu))
                        .append($('<div class="col" />').append('<div class="title">Введите url-ы<div>Каждый с новой строки</div></div>').append($textarea_urls));

                data.forEach(function(menu){
                    var $optgroup = $('<optgroup />').attr('label', menu[0]);
                    menu[1].forEach(function(items){
                        $('<option />').attr('value', items[0]).html(items[1]).appendTo($optgroup);
                    });
                    $optgroup.appendTo($select_menu);
                });

                //высталяем значения по умолчанию
                if($button.attr('data-value')){
                    var urls = [];
                    JSON.parse($button.attr('data-value')).forEach(function(url){
                        if($select_menu.find('option[value="'+url+'"]').length){
                            $select_menu.find('option[value="'+url+'"]').prop('selected', true);
                        }else{
                            urls.push(url);
                        }
                    });
                    $textarea_urls.val(urls.join('\n'));
                }

                $('<div class="modules-manager-select-pages-window" />').append($select_pages).popup({
                    title: 'Выберете страницы, на которых будет отображаться модуль',
                    buttons: {
                        'Ok': function(){
                            var urls = [];
                            if($select_menu.val()) urls = urls.concat($select_menu.val());
                            if($textarea_urls.val()) urls = urls.concat($textarea_urls.val().split('\n'));
                            $button
                                .val(urls.length + ' стр.')
                                .attr('data-value', JSON.stringify(urls));
                            this.close();
                        },
                        'Отмена': 'close'
                    }
                });
            });
    });
    return $button
};

//Кнопка для выбора типа модуля
$.formElements.modulesManagerSelectModuleTypeButton = function(params, $form){
    var $button = $.formElements.button(params);

    if(params.default){
        $form.on('form_load', function(){
            $button.val(params.default);
            //получаем название модуля
            $.getJSON(SITE.MAIN_URL+'admin/index.php?com=extensions_manager&section=extensions&action=get&fields=title', {filter: JSON.stringify({name:params.default, type:'module'})})
                .done(function(data){
                    $button.val(data[0][0]);
                    load_module_params(params.default, data[0][0]);
                });
        });
    }

    //функция загружает параметры модуля
    function load_module_params(module_name, module_title){
        $form.find('fieldset[data-name="module_params"]').html('<span>Загрузка...</span>');
        $.getJSON(SITE.MAIN_URL+'admin/index.php?com=modules_manager&section=modules&action=get_module_params&module_name='+module_name)
            .done(function(data){
                data = {
                    fieldsets: [
                        {title: 'Параметры модуля "'+module_title+'"', name: 'module_params', fields: data}
                    ]
                };
                var params = $form.find('fieldset[data-name="main_params"] input[name=params]').val();
                if(params){
                    data.defaultValues = JSON.parse(params);
                }
                var $div = $('<div />');
                $div.form(data);
                $form.find('fieldset[data-name="module_params"]').replaceWith($div.find('fieldset'));
                init_editor();
            });
    }


    $button.on('click', function(){
        //var $module_params = $button.parents('form.system-options-form').eq(0).children('div').eq(1);

        var $popup_content = $('<div class="modules-manager-select-module-type">Загрузка...</div>');
        var $popup = $popup_content.popup({
            title: 'Выберите тип модуля',
            buttons: {
                'Отмена': 'close'
            }
        });

        $.getJSON(SITE.MAIN_URL+'admin/index.php?com=extensions_manager&section=extensions&action=get&fields=name,title,description', {filter: JSON.stringify({type:'module',enabled:'1'})})
            .done(function(data){
                $popup_content.empty();
                data.forEach(function(item){
                    $popup_content.append('<div class="item"><a data-value="'+item[0]+'" class="title">'+item[1]+'</a><div class="description">'+item[2]+'</div></div>');
                });
                $popup.center();
                $popup_content.on('click', 'a[data-value]', function(){
                    $button.val($(this).text()).attr('data-value', $(this).attr('data-value'));
                    $popup.close();
                    load_module_params($button.attr('data-value'), $button.val());
                });
            });
    });

    return $button;
};

//кнопка для выбора типа пункта меню
$.formElements.modulesManagerMenuItemsSelectItemTypeButton = function(params, $form){
    var $button = $.formElements.button(params);

    if(params.default){
        //загружаем имя компонента и типа пункта меню для вывода их на кнопке
        $.getJSON(SITE.MAIN_URL+'admin/index.php?com=modules_manager&section=menu_items&action=get_com_and_type_title&item_type='+params.default)
            .done(function(data){
                $button
                    .val(data[1])
                    .attr('data-tooltip', data[0]+' -> '+data[1]);
                //загружаем параметры пункта меню
                load_item_params(data[1], params.default);
            });
    }

    //функция загружает параметры пункта меню
    function load_item_params(item_title, item_type){
        $form.find('fieldset[data-name="item_params"]').html('Загрузка...');
        $.getJSON(SITE.MAIN_URL+'admin/index.php?com=modules_manager&section=menu_items&action=get_item_params&item_type='+item_type)
            .done(function(data){
                var default_params = $form.find('fieldset:not([data-name=item_params]) input[name=params]').val();
                data = {
                    fieldsets: [
                        {title: 'Параметры пункта "'+item_title+'"', name: 'item_params', fields: data}
                    ]
                };
                if(default_params){
                    data.defaultValues = JSON.parse(default_params);
                }
                var $div = $('<div />');
                $div.form(data);
                $form.find('fieldset[data-name="item_params"]').replaceWith($div.find('fieldset'));
                init_editor();
            });
    }

    $button.on('click', function(){
        var $popup_content = $('<div class="modules_manager-select_item_type">Загрузка...</div>'),
            $popup = $popup_content.popup({title: 'Выберите тип пункта меню'});
        $.getJSON(SITE.MAIN_URL+'admin/index.php?com=modules_manager&section=menu_items&action=get_items_types')
            .done(function(data){
                $popup_content.html('');
                data.forEach(function(com){
                    var $items_ul = $('<ul />');
                    com[2].forEach(function(item){
                        $('<li />').attr('data-item_type', item[0])
                            .append('<div class="title">'+item[1]+'</div>')
                            .append('<div class="description">'+item[2]+'</div>')
                            .appendTo($items_ul);
                    });
                    $('<div class="com" />').attr('data-com_name', com[0])
                        .append('<div class="title">'+com[1]+'</div>')
                        .append($items_ul)
                        .appendTo($popup_content);
                });
                $popup.center();

                $popup_content.on('click', 'li>div.title', function(){
                    var $el = $(this),
                        item_type = $el.parents('li').attr('data-item_type');
                    $popup.close();
                    $button
                        .val($el.text())
                        .attr('data-tooltip', $el.parents('div.com').children('.title').text() + ' -> ' + $el.text())
                        .attr('data-value', item_type);

                    //загружаем параметры пункта меню
                    load_item_params($el.text(), item_type);
                });
            });
    });
    return $button;
};