//кнопка для выбора страниц, на которых будет отображаться модуль
FormElements.modulesManagerSelectPagesButton = function(params){
	var $button = $('<input type="button" value="Все" data-value="all" />');
	//если задано значение по умолчанию
	if(params.default){
        $button
            .val({
                all: 'Все',
                on: 'Выбранные',
                except: 'Все, кроме выбранных'
            }[params.default])
            .attr('data-value', params.default);
	}


	$button.on('click', function(){
        var $load_popup = $('<span>Загрузка...</span>').popup({showHeader: false});
        //делаем ajax-запрос, чтобы загрузить список пунктов меню
        $.getJSON(SITE.MAIN_URL+'admin/index.php?com=modules_manager&section=modules&action=get_menu')
            .done(function(data){
                $load_popup.close();
                //генерируем содержимое popup-окна
                var $select_type = $('<select />')
                        .append('<option value="all">Все</option>')
                        .append('<option value="on">Выбранные</option>')
                        .append('<option value="except">Все, кроме выбранных</option>')
                        .on('change', function(){
                            $(this).siblings('div.select-pages').css('display', ($(this).val()==='all'? 'none': 'block'));
                        }),
                    $select_menu = $('<select name="menu_items" style="min-height:100px" multiple="multiple" />'),
                    $textarea_urls = $('<textarea style="width:230px; height:90px;" name="urls" />'),
                    $select_pages = $('<div class="select-pages" />')
                        .append($('<div class="col" />').append('<div class="title">Пункты меню</div>').append($select_menu))
                        .append($('<div class="col" />').append('<div class="title">Введите url-ы<div>Каждый с новой строки</div></div>').append($textarea_urls));

                data.forEach(function(menu){
                    var $optgroup = $('<optgroup />').attr('label', menu[0]);
                    menu[1].forEach(function(items){
                        $('<option />').attr('value', items[0]).html(items[1]).appendTo($optgroup);
                    });
                    $select_menu.append($optgroup);
                });

                var $assignment_urls = $button.parents('table').eq(0).find('input[name="assignment_urls"]');

                //высталяем значения по умолчанию
                if($assignment_urls.val()){
                    var urls = [];
                    JSON.parse($assignment_urls.val()).forEach(function(url){
                        if($select_menu.find('option[value="'+url+'"]').length){
                            $select_menu.find('option[value="'+url+'"]').prop('selected', true);
                        }else{
                            urls.push(url);
                        }
                    });
                    $textarea_urls.val(urls.join('\n'));
                }
                $select_type.find('option[value="'+$button.attr('data-value')+'"]').prop('selected', true);

                $('<div class="modules-manager-select-pages-window" />').append($select_type).append($select_pages).popup({
                    title: 'Выберете страницы, на которых будет отображаться модуль',
                    buttons: {
                        'Ok': function(){
                            var urls = [];
                            if($select_menu.val()) urls = urls.concat($select_menu.val());
                            if($textarea_urls.val()) urls = urls.concat($textarea_urls.val().split('\n'));
                            $assignment_urls.val(JSON.stringify(urls));
                            $button
                                .val($select_type.find('option:checked').text())
                                .attr('data-value', $select_type.val());
                            this.close();
                        },
                        'Отмена': 'close'
                    }
                });

                $select_type.trigger('change');
            });
	});
	return FormElements.setAttrs($button, params);
};



//Кнопка для выбора типа модуля
FormElements.modulesManagerSelectModuleTypeButton = function(params){
	var $button = FormElements.button(params);

    $button.on('element_inserted', function(){
        if(params.default){
            $button.parents('form.system-options-form').find('div[data-name="module_params"] fieldset').html('<span>Загрузка...</span>');
            //получаем название модуля
            $.getJSON(SITE.MAIN_URL+'admin/index.php?com=extensions_manager&section=extensions&action=get&fields=title', {filter: JSON.stringify({name:params.default,type:'module'}) })
                .done(function(data){
                    $button.val(data[0][0]);
                    load_module_params(params.default, $button.val());
                });
        }
    });

	//функция загружает параметры модуля
	function load_module_params(module_name, module_title){
		$.get(SITE.MAIN_URL+'admin/index.php?com=modules_manager&section=modules&action=get_module_params&module_name='+module_name)
			.done(function(data){
                var fields = data? $($.parseXML(data)).children().toDATA().params.field: [],
                    form = new ContentForm({
                        fieldset: {title: 'Параметры модуля "'+module_title+'"', field: fields}
                    }),
                    params = $button.parents('table').eq(0).find('input[name="params"]').val();
                if(params){
                    form.setDefaultValues(JSON.parse(params));
                }
                $button.parents('form.system-options-form').children('div[data-name="module_params"]').html('').append( form.getResult().children().children() );
                init_editor();
			});
	}


	$button.on('click', function(){
		var $module_params = $button.parents('form.system-options-form').eq(0).children('div').eq(1);

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
					//загружаем параметры модуля
					load_module_params($button.attr('data-value'), $button.val());
				});
			});
	});

	return $button;
};


//функция сохраняет модуль
function modulesManagerSaveModule(data, id){
	data.main_params.params = JSON.stringify(data.module_params);
	return this.standardFn.save(data.main_params, id);
}



//кнопка для выбора типа пункта меню
FormElements.modulesManagerMenuItemsSelectItemTypeButton = function(params){
	var $button = FormElements.button(params);

    //функция загружает параметры пункта меню
    function load_item_params(item_title, item_type){
        var $form = $button.parents('form').eq(0);
        $form.find('div[data-name="item_params"]').find('fieldset').html('Загрузка...');
        $.getJSON(SITE.MAIN_URL+'admin/index.php?com=modules_manager&section=menu_items&action=get_item_params&item_type='+item_type)
            .done(function(data){
                var default_params = $form.find('fieldset').eq(0).find('input[name="params"]').val(),
                    form = new ContentForm({fieldset:{
                        title: 'Параметры пункта "'+item_title+'"',
                        field: data.field
                    }});
                if(default_params){
                    form.setDefaultValues(JSON.parse(default_params));
                }
                form.getResult().children().children().appendTo($form.children('div[data-name="item_params"]').html(''));
            });
    }

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