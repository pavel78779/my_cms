var component = {
    //метод загружает компонент, читая файл client.xml
    loadComponent: function(component_name){
        var d = $.Deferred(), self = this;
        self.currentComponent = component_name;
        self.componentUrl = SITE.MAIN_URL+'admin/index.php?com='+component_name;
        //получаем и читаем файл client.xml компонента
        $.getJSON(SITE.MAIN_URL+'admin/index.php?com=_system_&section=helpers&action=get_component_data&component='+component_name)
            .done(function(data){
                self.xml = $($.parseXML(data[0]));
                //загружаем CSS и выполняем СКРИПТЫ компонента
                if(!$('style.com-'+component_name).length && data[2]){
                    $('<style class="com-'+component_name+'" type="text/css">'+data[2]+'</style>').appendTo('head');
                }
                if(data[1]){
                    $.globalEval(data[1]);
                }
                //собираем информацию о разделах компонента
                self.sections = [];
                self.xml.children().children('section').each(function(){
                    var section = $(this),
                        actions = [];
                    section.children().each(function(){
                        actions.push(this.tagName);
                    });
                    self.sections.push({
                        name: section.attr('name'),
                        title: section.attr('title'),
                        href: '#!component/'+component_name+'/'+section.attr('name'),
                        actions: actions
                    });
                });
                //создаем МЕНЮ КОМПОНЕНТА (в виде вкладок)
                self.tabsMenu = $('.system-content-outer').html('').singleTabs(self.sections);
                if(data[3]){
                    self.tabsMenu.prepend('<div class="system-component-info">Компонент: <span class="title">'+data[3]+'</span> ('+component_name+')</div>');
                }
                d.resolve();
            });
        return d.promise();
    },

    //метод отображает раздел компонента
    loadSection: function(section_name){
        var self = this;
        self.tabsMenu.find('.tabs-header').children().removeClass('active').filter('.'+section_name).addClass('active');
        self.contentBlock = $('<div class="system-content com_'+self.currentComponent+'-'+section_name+'" />').prependTo(self.tabsMenu.find('.tabs-body').html(''));
        self.xmlSection = self.xml.children().children('section[name='+section_name+']');
        self.sectionName = self.xmlSection.attr('name');
    },

    //метод отображает действие (action) в разделе
    loadAction: function(action_name, data){
        var self = this;
        var actions = {
            show: function(){self.displayShow()},
            edit: function(){self.displayForm('edit', (data||{}).id||0)},
            'new': function(){self.displayForm('new')}
        };
        actions[action_name]();
    },

    //метод выводит отображение в контент-менеджере (может быть деревом, таблицей, и т.д.)
    displayShow: function(){
        var self = this,
            data = self.xmlSection.children('show').children().toDATA();
        data.mainUrl = self.componentUrl+'&section='+self.sectionName;
        if(self.xmlSection.children('new,edit').length){
            data.edit_elements = {
                url: '#!component/'+self.currentComponent+'/'+self.sectionName+'/edit'
            };
        }
        var show_obj = eval('new '+self.xmlSection.children('show').children()[0].tagName+'(data)');
        var buttons = {
            'new': self.xmlSection.children('new')[0]? '#!component/'+self.currentComponent+'/'+self.sectionName+'/new': null,
            remove: self.xmlSection.children('delete')[0]? function(){ self.removeElements(show_obj.getMarkedElements()).done(function(){show_obj.refresh()}) }: null
        };
        self.displayPage(
            self.xmlSection.children('show').attr('title'),
            new ControlButtons(buttons),
            show_obj.getResult()
        );
    },

    //метод отображает страницу с формой для создания или редактирования элемента
    displayForm: function(type, id){
        var self = this, type_ = type;

        if((type === 'edit') && !self.xmlSection.children('edit').children()[0]){
            type_ = 'new';
        }

        var form_data = self.xmlSection.children(type_).children().toDATA();

        var buttons = {
            back: self.xmlSection.children('show')[0]? '#!component/'+self.currentComponent+'/'+self.sectionName: null,
            apply: type==='new'? function(){self.saveForm(type).done(function(id){self.displayForm('edit', id)})}: function(){self.saveForm(type)},
            save: self.xmlSection.children('show')[0]? function(){ self.saveForm(type).done(function(){location.hash='#!component/'+self.currentComponent+'/'+self.sectionName}) }: null
        };

        //создаем объект формы
        var form_obj = eval('new '+self.xmlSection.children(type_).children()[0].tagName+'(form_data)');

        function display_form($form){
            self.displayPage(
                self.xmlSection.children(type).attr('title'),
                new ControlButtons(buttons),
                $form
            );
            init_editor();
        }

        if(type === 'edit'){
            var field_names = [];

            (self.xmlSection.children('new').children()[0]? self.xmlSection.children('new'): self.xmlSection.children('edit')).children().find('field').each(function(){
                if($(this).attr('name')) field_names.push($(this).attr('name'));
            });

            //заменяем поля
            /*toArr(self.section.edit.maker[constr].fieldset).forEach(function(e_fs){
             toArr(e_fs.field).forEach(function(e_field){
             toArr(form_data.fieldset).forEach(function(fieldset, i){
             toArr(fieldset.field).forEach(function(field, j){
             if(field.name == e_field.name){
             toArr(toArr(form_data.fieldset)[i].field)[j] = e_field;
             }
             });
             });
             });
             });*/

            //запрашиваем данные с сервера
            $.getJSON(self.componentUrl+'&section='+self.sectionName+'&action=get&fields='+field_names.join(',')+'&id='+id)
                .done(function(data){
                    if($.isArray(data[0])) data = data[0];
                    var values = {};
                    field_names.forEach(function(name, i){
                        values[name] = data[i];
                    });
                    form_obj.setDefaultValues(values);
                    display_form(form_obj.getResult().attr('data-id', id));
                });

        }else{
            display_form(form_obj.getResult());
        }
    },

    //метод сохраняет данные из формы
    saveForm: function(type){
        var d = $.Deferred(),
            self = this,
            form = self.contentBlock.find('form.system-options-form'),
            element_id = form.attr('data-id'),
            form_data = {},
            errors = false,
            element_name = '';
        //собираем значения полей со всех fieldset-ов формы
        form.children().each(function(){
            var $fs = $(this), fs_name = $fs.attr('data-name'), fs_data = $fs.serializeObject();
            if(fs_data && ('name' in fs_data)) element_name = fs_data['name'];
            if(!fs_data) errors = true;
            if(fs_name){
                form_data[fs_name] = fs_data;
            }else{
                $.extend(form_data, fs_data);
            }
        });
        if(!errors){
            var save_func = self.xmlSection.children(type).attr('save_func');
            //если задана пользовательская функция сохранения - вызываем ее, иначе вызываем стандартную функцию сохранения
            (save_func? eval(save_func+'.call(self, form_data, element_id, form)'): self.standardFn.save(form_data, element_id))
                .done(function(id){
                    Notice.showSuccess(self.xmlSection.children(type).attr('onsuccess')||'Сохранено', {'%name%':element_name});
                    d.resolve(id);
                });
        }
        return d.promise();
    },

    //метод удаляет элементы
    removeElements: function(arr_id){
        var d = $.Deferred(), self = this;
        function remove(){
            var delete_func = self.xmlSection.children('delete').attr('delete_func');
            //проверяем, задана ли пользовательская функция удаления
            (delete_func? eval(delete_func+'.call(self, arr_id)'): self.standardFn.remove(arr_id))
                .done(function(){
                    d.resolve();
                });
        }
        if(!arr_id.length){
            $('<span>Выберете элементы для удаления!</span>').popup({title: 'Не выбраны элементы', buttons: {'Ok':'close'}});
        }else{
            //если задано потверждение удаления
            if(self.xmlSection.children('delete').attr('confirm')){
                $('<span>'+self.xmlSection.children('delete').attr('confirm')+'</span>').popup({
                    title: 'Подтвердите удаление',
                    buttons: {
                        'Ок': function(){
                            this.close();
                            remove();
                        },
                        'Отмена': 'close'
                    }
                });
            }else{
                remove();
            }
        }
        return d.promise();
    },

    //стандартные функция для удаления, сохранения
    standardFn: {
        remove: function(arr_id){
            return $.post(component.componentUrl+'&section='+component.sectionName+'&action=delete', {id_list:JSON.stringify(arr_id)})
                .done(function(){
                    Notice.showSuccess(component.xmlSection.children('delete').attr('onsuccess') || 'Удалено', {'%count%':arr_id.length});
                });
        },

        save: function(data, id){
            var d = $.Deferred(),
                action = (id? 'update': 'add'),
                request_param = {data: JSON.stringify(data)};
            if(id) request_param.id = id;
            $.post(component.componentUrl+'&section='+component.sectionName+'&action='+action, request_param)
                .done(function(id){
                    d.resolve(id);
                });
            return d.promise();
        }
    },

    //метод отображает произвольную страницу компонента
    displayPage: function(title, buttons, content){
    this.contentBlock
        .empty()
        .append('<div class="system-title">' + title + '</div>')
        .append(buttons)
        .append(content);
    }
};