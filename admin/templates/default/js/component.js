var CMS = {};
CMS.component = {
    componentsData: {},
    current: {},

    register: function(data){
        this.componentsData[data.name] = data;
    },

    load: function(name, section, action, url_params){
        var self = this;

        function loadComponent(name){
            var d = $.Deferred();
            if(self.current.name === name){
                d.resolve();
            }else{
                self.current.name = name;
                self.componentUrl = SITE.MAIN_URL+'admin/index.php?com='+name;
                $.getJSON(SITE.MAIN_URL+'admin/index.php?com=_system_&section=helpers&action=get_component_data&component='+name)
                    .done(function(data){
                        //загружаем css и выполняем скрипты компонента
                        if(!$('style.com-'+name).length && data[2]){
                            $('<style class="com-'+name+'" type="text/css">'+data[2]+'</style>').appendTo('head');
                        }
                        if(data[1]){
                            $.globalEval(data[1]);
                        }
                        if(!self.componentsData[name]){
                            d.reject();
                            return;
                        }
                        console.info('Загружаем компонент "'+name+'"');
                        var $content_outer = $('.system-content-outer').empty();
                        //вставляем заголовок компонента
                        if(data[3]){
                            $content_outer.append('<div class="component-info">Компонент: <span class="title">'+data[3]+'</span> ('+name+')</div>');
                        }
                        //создаем меню компонента (в виде вкладок)
                        var menu_data = [];
                        $.each(self.componentsData[name].sections, function(i, section){
                            menu_data.push({
                                title: section.title,
                                name: section.name,
                                href: '#!component/'+name+'/'+section.name
                            });
                        });
                        self.tabsMenu = $content_outer.tabsMenu(menu_data);
                        d.resolve();
                    });
            }
            return d.promise();
        }

        function loadSection(section_name){
            if(!section_name){
                section_name = self.componentsData[self.current.name].sections[0].name;
            }
            if(self.current.section === section_name) return;
            self.sectionUrl = self.componentUrl+'&section='+section_name;
            self.current.section = section_name;
            self.tabsMenu.setActiveItem(section_name);
            self.tabsMenu.tabsBody.empty();
            self.contentBlock = $('<div class="system-content com_'+self.current.name+'-'+section_name+'" />').prependTo(self.tabsMenu.tabsBody);
            $.each(self.componentsData[self.current.name].sections, function(i, sec){
                if(sec.name === self.current.section) self.comSection = sec;
            });
            console.info('Загружаем section "'+section_name+'"');
        }


        function loadAction(action_name){
            var com_action;
            if(!action_name){
                if(self.comSection.actions.show){
                    action_name = 'show';
                }else if(self.comSection.actions.edit){
                    action_name = 'edit';
                }else{
                    action_name = 'new';
                }
            }
            console.info('Загружаем action "'+action_name+'"');
            com_action = self.comSection.actions[action_name];

            var buttons = [],
                $obj_body = $('<div style="clear: both;"/>'),
                $buttons_block = $('<div />'),
                params = com_action.params,
                obj;

            self.contentBlock
                .empty()
                .append('<div class="system-title">' + com_action.title + '</div>')
                .append($buttons_block)
                .append($obj_body);


            switch(action_name){
                case 'show':
                    params.mainUrl = self.sectionUrl;
                    if(self.comSection.actions.edit){
                        params.editElements = {
                            url: '#!component/'+self.current.name+'/'+self.current.section+'/edit'
                        };
                    }
                    obj = $obj_body[com_action.type](params);
                    if(self.comSection.actions.new){
                        buttons.push({
                            type: 'new',
                            href: '#!component/'+self.current.name+'/'+self.current.section+'/new'
                        });
                    }
                    if(self.comSection.actions.delete){
                        buttons.push({
                            type: 'remove',
                            onclick: function(){ self.removeElements(obj.getMarkedElements()).done(function(){obj.refresh()}) }
                        });
                    }
                    break;
                case 'new':
                case 'edit':
                    if(self.comSection.actions.show){
                        buttons.push({
                            type: 'back',
                            href: '#!component/'+self.current.name+'/'+self.current.section
                        });
                    }
                    buttons.push({
                        type: 'apply',
                        onclick: function(){
                            self.saveForm($obj_body)
                                .done(function(id){
                                    if((action_name === 'new') && id){
                                        location.hash = '#!component/'+self.current.name+'/'+self.current.section+'/edit?id='+id;
                                    }
                                })
                        }
                    });
                    if(self.comSection.actions.show){
                        buttons.push({
                            type: 'save',
                            onclick: function(){ self.saveForm($obj_body).done(function(){location.hash='#!component/'+self.current.name+'/'+self.current.section}) }
                        });
                    }

                    if(action_name === 'new'){
                        obj = $obj_body[com_action.type](params);
                        init_editor();
                    }else{
                        if(!params) params = self.comSection.actions.new.params;
                        var fields_names = [],
                            default_values = {};
                        $.each(params.fieldsets, function(i, fieldset){
                            $.each(fieldset.fields, function(i, field){
                                fields_names.push(field.name);
                            });
                        });
                        //запрашиваем данные с сервера
                        $.getJSON(self.sectionUrl+'&action=get&fields='+fields_names.join(','), {filter: JSON.stringify({id: url_params.id})})
                            .done(function(data){
                                $.each(data[0], function(i, el){
                                    default_values[fields_names[i]] = el;
                                });
                                params = $.extend({defaultValues:default_values}, params);
                                obj = $obj_body[com_action.type](params);
                                $obj_body.find('form').attr('data-id', url_params.id);
                                init_editor();
                            });
                    }

                    break;
            }

            $buttons_block.controlButtons({buttons: buttons});
        }


        loadComponent(name)
            .done(function(){
                loadSection(section);
                loadAction(action);
            });


    },

    removeElements: function(arr_id){
        var d = $.Deferred(),
            self = this;
        if(!arr_id.length){
            $('<span>Выберете элементы для удаления!</span>').popup({title: 'Не выбраны элементы', buttons: {'Ok':'close'}});
            d.reject();
        }else{
            var confirm = (self.comSection.actions.delete.confirm || 'Вы действительно хотите удалить выбранные элементы? ('+arr_id.length+' шт.)');
            $('<span>'+confirm+'</span>').popup({
                title: 'Подтвердите удаление',
                buttons: {
                    'Ок': function(){
                        var delete_func = self.comSection.actions.delete.deleteFunc;
                        //проверяем, задана ли пользовательская функция удаления
                        (delete_func? delete_func.call(self, arr_id): self.standardFns.remove(arr_id))
                            .done(function(){
                                d.resolve();
                            });
                        this.close();
                    },
                    'Отмена': 'close'
                }
            });
        }
        return d.promise();
    },

    saveForm: function($form){
        var d = $.Deferred(),
            self = this,
            form = $form.find('form'),
            element_id = form.attr('data-id'),
            type = (element_id? 'edit': 'new'),
            form_data = {},
            errors = false,
            element_name = '';
        if(!form.length){
            d.reject();
            return d.promise();
        }
        //собираем значения полей со всех fieldset-ов формы
        form.find('fieldset').each(function(){
            var $fs = $(this),
                fs_name = $fs.attr('data-name'),
                fs_data = $fs.serializeForm();
            if(!fs_data){
                errors = true;
                return false;
            }
            if(fs_name){
                form_data[fs_name] = fs_data;
            }else{
                $.extend(form_data, fs_data);
            }
        });
        if(!errors){
            console.log(form_data, element_id);
            var save_func = self.comSection.actions[type].deleteFunc;
            //если задана пользовательская функция сохранения - вызываем ее, иначе вызываем стандартную функцию сохранения
            (save_func? save_func.call(self, form_data, element_id, form): self.standardFns.save(form_data, element_id))
                .done(function(id){
                    $.notice({
                        text: (self.comSection.actions[type].onsuccess || 'Сохранено'),
                        type: 'success'
                    });
                    d.resolve(id);
                });
        }else{
            d.reject();
        }
        return d.promise();
    },

    standardFns: {
        remove: function(arr_id){
            return $.post(CMS.component.sectionUrl+'&action=delete', {id_list:JSON.stringify(arr_id)})
                .done(function(){
                    $.notice({
                        text: (CMS.component.comSection.actions.delete.onsuccess || 'Удалено'),
                        type: 'success'
                    });
                });
        },
        save: function(data, id){
            var d = $.Deferred(),
                action = (id? 'update': 'add'),
                request_param = {data: JSON.stringify(data)};
            if(id) request_param.id = id;
            $.post(CMS.component.sectionUrl+'&action='+action, request_param)
                .done(function(id){
                    d.resolve(id);
                });
            return d.promise();
        }
    }
};
