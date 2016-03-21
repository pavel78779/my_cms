(function($){
    jQuery.fn.table = function(params){
        params = $.extend({
            mainUrl: null,
            columns: [],
            changeOrdering: {
                groupBy: null,
                disabled: false
            },
            markCheckboxes: {
                disabled: false
            },
            editElements: {
                url: null,
                disabled: false
            }
        }, params);

        var $table = $('<table class="plugin-table" />').appendTo(this),
            $thead = $('<thead />').appendTo($table),
            $tbody = $('<tbody />').appendTo($table);

        var columns_names = [];
        $.each(params.columns, function(i, column){
            columns_names.push(column.name);
        });

        //генерируем заголовок таблицы
        var $tr_header = $('<tr class="header" />').appendTo($thead);
        $tr_header.append('<td data-name="mark" class="mark"><input type="checkbox" data-tooltip="Отметить все" /></td>');
        $.each(params.columns, function(i, el){
            $tr_header.append('<td data-name="'+el.name+'" class="'+(el.type||'')+'">'+el.title+'</td>');
        });


        // --- назначаем обработчики СОБЫТИЙ на таблицу ---
        //на чекбокс "Отметить все"
        if(!params.markCheckboxes.disabled){
            $table.on('click.mark_checkboxes', 'thead td.mark input[type=checkbox]', function(){
                $table.find('tbody td.mark input[type=checkbox]').prop('checked', $(this).prop('checked'));
            });
        }

        //на переключатели значений switch
        $table.on('mousedown.switch', 'div.switch-value', function(e){
            e.preventDefault();
            var $this = $(this),
                value = $this.attr('data-value'),
                new_value = (value==='0')? '1': '0';
            if($this.hasClass('loading')) return;
            $this.addClass('loading');
            var data = {};
            data[$this.parent('td').attr('data-name')] = new_value;
            //делаем запрос
            $.post(params.mainUrl+'&action=update', {
                    id: $this.parents('tr').attr('data-id'),
                    data: JSON.stringify(data)
                })
                .done(function(){
                    $this.removeClass('loading').attr('data-value', new_value);
                    $.notice({text: (new_value==='0'? 'Выключено': 'Включено')});
                });
        });

        //на иконку изменения порядка
        if(!params.changeOrdering.disabled){
            $table.on('mousedown.table_change_ordering', 'div.change-ordering', function(e){
                e.preventDefault();
                var target_tr = $(this).parents('tr'),
                    selector = (params.changeOrdering.groupBy? '[data-group='+target_tr.attr('data-group')+']': ''),
                    siblings_tr = target_tr.siblings(selector),
                    all_siblings = target_tr.parent().children(selector);
                //если это единственный элемент в своей группе
                if(siblings_tr.length === 0) return;

                var dragging_tbody = $('<tbody />').append(target_tr.clone());

                var dragging = $('<table class="plugin-table dragging" />').css({
                    width: $table.width(),
                    top: target_tr.eq(0).offset().top,
                    left: target_tr.eq(0).offset().left
                }).append(dragging_tbody).prependTo('body');

                //делаем ширину столбцов в клоне такой же как в таблице
                dragging.find('td').each(function(i){
                    $(this).width(target_tr.children().eq(i).width());
                });

                target_tr.css('visibility', 'hidden');

                var deltaY = e.pageY - target_tr.offset().top,
                    limit_top = all_siblings.eq(0).offset().top,
                    limit_bottom = all_siblings.eq(-1).offset().top + all_siblings.eq(-1).outerHeight(),
                    dragging_height = dragging.outerHeight(),
                    target_i = all_siblings.index(target_tr),
                    old_position = target_i+1,
                    coords = [];

                //сохраняем координаты строк таблицы (исключая target_tr)
                siblings_tr.each(function(i){
                    var $el = $(this);
                    coords.push([$el.offset().top + $el.outerHeight()/2, $el, i]);
                });

                var top_point = coords[target_i-1]? coords[target_i-1]: null,
                    bottom_point = coords[target_i]? coords[target_i]: null;


                $(document).on('mousemove.table_change_ordering', function(e){
                    var allow_move = true;
                    if(e.pageY-deltaY <= limit_top){
                        dragging.offset({ top: limit_top });
                        allow_move = false;
                    }
                    if(e.pageY-deltaY+dragging_height >= limit_bottom){
                        dragging.offset({ top: limit_bottom-dragging_height });
                        allow_move = false;
                    }
                    if(allow_move){
                        dragging.offset({
                            top: e.pageY - deltaY
                        });
                    }
                    if(top_point && (e.pageY-deltaY+2 < top_point[0])){
                        //перемещаем вверх
                        top_point[1].insertAfter(target_tr);
                        top_point[0] = top_point[1].offset().top + top_point[1].outerHeight()/2;
                        bottom_point = top_point;
                        top_point = (top_point&&coords[top_point[2]-1])? coords[top_point[2]-1]: null;
                    }else if(bottom_point && (e.pageY-deltaY+dragging_height-2 > bottom_point[0])){
                        //перемещаем вниз
                        bottom_point[1].insertBefore(target_tr);
                        bottom_point[0] = bottom_point[1].offset().top + bottom_point[1].outerHeight()/2;
                        top_point = bottom_point;
                        bottom_point = (bottom_point&&coords[bottom_point[2]+1])? coords[bottom_point[2]+1]: null;
                    }

                });


                $(document).on('mouseup.table_change_ordering', function(){
                    $(document).off('.table_change_ordering');
                    dragging.remove();
                    target_tr.css('visibility', 'visible');
                    var new_position = target_tr.parent().children(selector).index(target_tr)+1;
                    if(old_position === new_position) return;
                    $.post(params.mainUrl+'&action=change_ordering',{
                            id: target_tr.attr('data-id'),
                            new_order: new_position
                        })
                        .done(function(){
                            $.notice({text: 'Порядок изменен'});
                        })
                        .always(function(){
                            methods.refresh();
                        });
                });
            });
        }



        var methods = {
            //метод обновляет (генерирует) содержимое таблицы
            refresh: function(){
                $.getJSON(params.mainUrl+'&action=get&fields='+columns_names.join(','))
                    .done(function(data){
                        $tbody.empty();
                        $.each(data, function(i, line){
                            var $tr = $('<tr data-id="'+line[columns_names.indexOf('id')]+'" />').appendTo($tbody);
                            $.each(line, function(i, cell){
                                $tr.append('<td data-name="'+params.columns[i].name+'" class="'+(params.columns[i].type||'')+'">'+(cell||'')+'</td>');
                            });
                        });

                        // --- добавляем столбец с чекбоксами ---
                        var checkboxes = $('<td data-name="mark" class="mark"><input type="checkbox" /></td>').prependTo($table.find('tbody tr'));
                        if(params.markCheckboxes.disabled){
                            checkboxes.find('input[type="checkbox"]').prop('disabled', true);
                        }

                        // --- обрабатываем колонку для изменения порядка ---
                        if(!params.changeOrdering.disabled){
                            $table.find('tbody td[data-name="ordering"]').each(function(){
                                var $el = $(this);
                                $el.parent('tr').attr('data-ordering', $el.text());
                                $el.html('<div class="change-ordering"></div>');
                            });
                            $table.find('thead td[data-name="ordering"]')
                                .attr('data-tooltip', 'Порядок')
                                .html('<div class="change-ordering-header"></div>');
                        }

                        // --- проставляем строкам таблицы атрибут data-group ---
                        if(params.changeOrdering.groupBy){
                            $table.find('tbody tr').each(function(){
                                var $tr = $(this);
                                $tr.attr('data-group', $tr.find('td[data-name='+params.changeOrdering.groupBy+']').text());
                            });
                        }

                        // --- обрабатываем дату ---
                        $table.find('tbody td.date').each(function(){
                            $(this).text($(this).text().split('-').reverse().join('.'));
                        });

                        // --- обрабатываем поля типа switch ---
                        $table.find('tbody td.switch').each(function(){
                            var $el = $(this);
                            $el.html('<div data-value="'+$el.text()+'" class="switch-value"></div>');
                        });

                        // --- делаем названия ссылками ---
                        if(params.editElements.url){
                            $table.find('tbody td.name').each(function(){
                                $(this).wrapInner('<a href="'+params.editElements.url+'?id='+$(this).parent('tr').attr('data-id')+'"></a>');
                            });
                        }

                        // --- обрабатываем замены данных в стролбцах (атрибут replaced) ---
                        $.each(params.columns, function(i, column){
                            if(column.replaced){
                                //если перечисление задано url-ом
                                if(column.replaced.slice(0,4) == 'url:'){
                                    $.getJSON(SITE.MAIN_URL+column.replaced.slice(4))
                                        .done(function(data){
                                            $table.find('tbody td[data-name="'+column.name+'"]').text(function(i, value){
                                                var text = '';
                                                $.each(data, function(i, el){
                                                    if(el[0] === value) text = el[1];

                                                });
                                                return text;
                                            });
                                        });
                                }
                                //если перечисление задано явно
                                else if(column.replaced.indexOf(':') != -1){
                                    //создаем объект типа {имя: 'Значение', ...}
                                    var obj = {};
                                    column.replaced.split(', ').forEach(function(el){
                                        obj[el.split(':')[0]] = el.split(':')[1];
                                    });
                                    $table.find('tbody td[data-name="'+column.name+'"]').html(function(i, html){
                                        return obj[$.trim(html)];
                                    });
                                }
                                //если перечисление задано функцией
                                else{
                                    //собираем старые значения столбца
                                    var old_values = [];
                                    $table.find('tbody td[data-name="'+column.name+'"]').each(function(){
                                        old_values.push($(this).html());
                                    });
                                    //вызываем пользовательскую функцию
                                    eval(column.replaced+'.call(null, old_values)')
                                        .done(function(result){
                                            $table.find('tbody td[data-name="'+column.name+'"]').html(function(i, html){
                                                return result[html];
                                            });
                                        });
                                }
                            }
                        });

                        $table.triggerHandler('table_load', [$table]);
                    });
            },
            //метод возвращает массив id отмеченных элементов
            getMarkedElements: function(){
                var result = [];
                $table.find('tbody td.mark input[type=checkbox]:checked').each(function(){
                    result.push($(this).parents('tr').attr('data-id'));
                });
                return result;
            }
        };

        //создаем таблицу
        methods.refresh();
        return methods;
    };
})(jQuery);