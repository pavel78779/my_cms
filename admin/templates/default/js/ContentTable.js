function ContentTable(params){
    var self = this;
    var d = $.Deferred();

	var default_params = {
        mainUrl: null,
		columns: [],
		change_ordering: {
			group_by: null,
			disabled: false
		},
		mark_checkboxes: {
			disabled: false
		},
		edit_elements: {
			url: null
		}
	};
	params = $.extend(true, {}, default_params, params);

	//генерируем заголовок таблицы
	this.header = [];
	toArr(params.columns.column).forEach(function(el){
		self.header.push({name: el.name, title: el.title, className: el.type});
	});

	//генерируем массив имен столбцов
    this.column_names = [];
	this.header.forEach(function(el){
		self.column_names.push(el.name);
    });

	//сразу создаем объект Table с пустым содержимым, чтобы у нас уже была JQuery-таблица
	this.table = new Table([], [[]]);
	this.$table = self.table.getResult().addClass('system-content-table');

    //
	//обрабатываем замены данных в стролбцах (атрибут replaced)
	toArr(params.columns.column).forEach(function(column){
		if(column.replaced){
			//если перечисление задано url-ом
			if(column.replaced.slice(0,4) == 'url:'){
				self.$table.on('table_load', function(e, $table){
                    $.getJSON(SITE.MAIN_URL+column.replaced.slice(4))
                        .done(function(data){
                            $table.find('tbody td[data-name="'+column.name+'"]').text(function(i, value){
                                var text = '';
                                data.forEach(function(el){
                                    if(el[0] === value) text = el[1];

                                });
                                return text;
                            });
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
				self.$table.on('table_load', function(e, $table){
                    $table.find('tbody td[data-name="'+column.name+'"]').html(function(i, html){
                        return obj[$.trim(html)];
                    });
                });
			}
			//если перечисление задано функцией
			else{
				self.$table.on('table_load', function(e, $table){
					//собираем старые значения столбца
					var old_values = [];
					$table.find('tbody td[data-name="'+column.name+'"]').each(function(){
						old_values.push($(this).html());
					});
					//вызываем пользовательскую функцию
					eval(column.replaced+'.call(self, old_values)')
						.done(function(result){
							$table.find('tbody td[data-name="'+column.name+'"]').html(function(i, html){
								return result[html];
							});
						});
				});
			}
		}
	});


    //различные преобразования таблицы
    this.$table.on('table_load', function(e, $table){

        // --- добавляем столбец с чекбоксами ---
        var checkboxes = $('<td data-name="mark" class="mark"><input type="checkbox" /></td>').prependTo( $table.find('tr') );
        if(params.mark_checkboxes.disabled){
            checkboxes.find('input[type="checkbox"]').prop('disabled', true);
        }else{
            $table.find('tr.header .mark input[type=checkbox]').attr('data-tooltip', 'Отметить все');
        }

        // --- добавляем колонку для изменения порядка ---
        if(!params.change_ordering.disabled){
            $table.find('tr').prepend('<td data-name="order" class="order"><div class="system-move-lines" /></td>');
            $table.find('tr.header div.system-move-lines')
                .attr('data-tooltip', 'Порядок')
                .removeClass('system-move-lines')
                .addClass('system-move-lines-header');
        }

        // --- обрабатываем дату ---
        $table.find('tr:not(.header) td.date').each(function(i, el){
            $(el).text($(el).text().split('-').reverse().join('.'));
        });

        // --- обрабатываем группировку, прописываем строкам ID и порядок ---
        $table.find('tr:not(.header)').each(function(i, el){
            el = $(el);
            if(params.change_ordering.group_by && el.children('[data-name='+params.change_ordering.group_by+']').length){
                el.attr('data-group', el.children('[data-name='+params.change_ordering.group_by+']').text());
            }
            el.attr({
                'data-id': el.children('[data-name=id]').text(),
                'data-ordering': $.trim(el.find('td.ordering').text())
            });
        });

        if(params.change_ordering.group_by){
            var uniq_group = [];
            $table.find('tbody td[data-name='+params.change_ordering.group_by+']').each(function(){
                if(uniq_group.indexOf($(this).text()) === -1){
                    uniq_group.push($(this).text());
                }
            });
            var $tbody = $table.find('tbody').detach();
            uniq_group.forEach(function(el){
                $('<tbody></tbody>').append($tbody.find('tr[data-group='+el+']')).appendTo($table);
            });
        }

        // --- делаем названия ссылками ---
        if(params.edit_elements.url){
            $table.find('tbody td.name').each(function(){
                $(this).wrapInner('<a href="'+params.edit_elements.url+'?id='+$(this).parent('tr').attr('data-id')+'"></a>');
            });
        }

        // --- обрабатываем поля типа switch ---
        $table.find('tr:not(.header) td.switch').each(function(i, el){
            el = $(el);
            el.html('<div data-value="'+el.text()+'" class="system-switch-value"></div>');
        });

        // --- удаляем колонку с порядком ---
        $table.find('td.ordering').remove();
    });




	// НАЗНАЧАЕМ ОБРАБОТЧИКИ СОБЫТИЙ
	//на чекбокс "Отметить все"
	if(!params.mark_checkboxes.disabled){
		this.$table.on('click', 'tr.header td.mark input[type=checkbox]', function(){
            self.$table.find('td.mark input[type=checkbox]')
                .prop('checked', $(this).prop('checked')? true: false);
		});
	}

    //на переключатели значений switch
    this.$table.on('mousedown', '.system-switch-value', function(e){
        e.preventDefault();
        var el = $(this),
            value = el.attr('data-value'),
            new_value = (value==='0')? '1': '0';
        if(el.hasClass('loading')) return;
        el.addClass('loading');
        var data = {};
        data[el.parent('td').attr('data-name')] = new_value;
        //делаем запрос
        $.post(params.mainUrl+'&action=update', {
            id: el.parents('tr').attr('data-id'),
            data: JSON.stringify(data)
        })
            .done(function(){
                el.removeClass('loading').attr('data-value', new_value);
                Notice.showSuccess(new_value==='0'? 'Выключено': 'Включено');
            });
    });


    //изменение порядка (перемещение строк)
    if(!params.change_ordering.disabled){
        self.$table.on('table_load', function(e, $table){
            $table.children('tbody').sortable({
                containment: 'parent',
                tolerance: 'pointer',
                handle: '.system-move-lines',
                opacity: 0.85,
                cursor: 'move',
                helper: function(e, ui){
                    ui.children().each(function() {
                        $(this).width($(this).width()+1);
                    });
                    return ui;
                },
				start: function(e, ui){
                    ui.item.css('backgroundColor', '#B0FFB0');
				},
                stop: function(e, ui){
                    ui.item.css('backgroundColor', '');
                },
                update: function(e, ui){
                    $.post(params.mainUrl+'&action=change_ordering',{
                        id: ui.item.attr('data-id'),
                        new_order: ui.item.parent().children().index(ui.item)+1
                    })
                        .done(function(d){
                            self.refresh();
                            Notice.showSuccess('Порядок изменен');
                        });
                }
            });
        });
    }


	this.getResult = function(){
		return this.$table;
	};

	//метод возвращает массив id отмеченных элементов
	this.getMarkedElements = function(){
		var result = [];
		self.$table.find('tr:not(.header) td.mark input[type=checkbox]:checked').each(function(i, el){
			result.push($(el).parents('tr').attr('data-id'));
		});
		return result;
	};

    //метод обновляет таблицу
    this.refresh = function(){
        return $.getJSON(params.mainUrl+'&action=get&fields='+self.column_names.join(','))
            		.done(function(data){
                		self.table.refresh(self.header, data);
            		});
    };

	//запускаем создание таблицы
    self.refresh().done(function(){ d.resolve() });

	$.extend(this, d.promise());
}