$.formElements = {
    //вспомогательная функция назначает атрибуты
    setAttrs: function(el, params, del_attrs){
        var standard_attrs = ['width', 'height', 'rows', 'class', 'id', 'maxlength', 'multiple', 'name', 'style', 'title', 'disabled', 'readonly', 'onclick', 'onchange', 'min', 'max'];
        var deleted_attrs = ['type', 'default', 'options', 'text', 'radio', 'tooltip', 'optionsFromUrl'];
        $.each(params, function(attr, value){
            //если этот атрибут удалять не надо
            if((!del_attrs || (del_attrs.indexOf(attr) === -1)) && (deleted_attrs.indexOf(attr) === -1)){
                //если это обработчик события
                if((attr.slice(0,2) === 'on') && ($.isFunction(value))){
                    el.on(attr.slice(2), value);
                }else{
                    //если это стандартный атрибут
                    if(standard_attrs.indexOf(attr) !== -1){
                        el.attr(attr, value);
                    }
                    //если не стандартный - делаем data-артибут
                    else{
                        el.attr('data-'+attr, value);
                    }
                }
            }
        });
        return el;
    },

    // ------------ СТАНДАРТНЫЕ ЭЛЕМЕНТЫ ФОРМ -------------------
    text: function(params){
        var $input = $('<input type="text" />');
        if(params.default !== undefined) $input.val(params.default);
        if(params.pattern !== undefined){
            var regexp = eval(params.pattern);
            $input.on('blur', function(){
                    if(!regexp.test(this.value) && (this.value !== '')){
                        $(this)
                            .addClass('invalid')
                            .popover({html: params.invalid_description||'Некорректное значение'});
                    }else{
                        $(this).removeClass('invalid').popover('remove');
                    }
                })
                .on('focus', function(){
                    $(this).removeClass('invalid').popover('remove');
                });
        }
        return this.setAttrs($input , params);
    },

    number: function(params){
        var $input = $('<input type="number" />');
        if(params.default !== undefined) $input.val(params.default);
        return this.setAttrs($input , params);
    },

    hidden: function(params){
        var $hidden = $('<input type="hidden" />');
        if(params.default !== undefined) $hidden.val(params.default);
        return this.setAttrs($hidden , params);
    },


    select: function(params){
        var $select = this.setAttrs($('<select />'), params);
        if(params.options){
            params.options.forEach(function(opt){
                $select.append('<option value="'+opt.value+'">'+opt.title+'</option>');
            });
        }
        //если опции надо загрузить еще и из URL
        if(params.optionsFromUrl){
            $select.prop('disabled', true).prepend('<option value="-" selected="selected">Загрузка...</option>');
            $.getJSON(SITE.MAIN_URL+params.optionsFromUrl)
                .done(function(data){
                    data.forEach(function(el){
                        if(!$.isArray(el)) el = [el, el];
                        $select.append('<option value="'+ el[1] +'">'+ el[0] +'</option>');

                    });
                    $select.prop('disabled', false).find('option').eq(0).remove();
                    if(params.default !== undefined){
                        $select.find('option[value='+params.default+']').attr('selected', 'selected');
                    }
                });
        }
        if(params.default !== undefined){
            $select.find('option[value='+params.default+']').attr('selected', 'selected');
        }
        return $select;
    },


    textarea: function(params){
        var $textarea = $('<textarea />');
        if(params.default !== undefined) $textarea.text(params.default);
        return this.setAttrs($textarea, params);
    },


    button: function(params){
        var $button = $('<input type="button" value="'+ (params.text||'Выбрать') +'" />');
        if(params.default !== undefined) $button.attr('data-value', params.default).val(params.default);
        return this.setAttrs($button , params);
    },


    normalText: function(params){
        return this.setAttrs( $('<span />').html(params.text) , params);
    },


    radiogroup: function(params){
        var $radiogroup = $('<div />');
        var self = this;
        params.radio.forEach(function(el){
            var $radio = self.setAttrs($('<input type="radio" value="'+el.value+'"/>'), params);
            $radiogroup.append( $('<label />').append($radio).append(el.title) );
        });
        if(params.default !== undefined){
            $radiogroup.find('input[type=radio][value='+params.default+']').prop('checked', true);
        }else{
            $radiogroup.find('input[type=radio]').eq(0).prop('checked', true);
        }
        return $radiogroup;
    },


    // ----------- ДОПОЛНИТЕЛЬНЫЙ ЭЛЕМЕНТЫ --------------

    //HTML редактор
    editor: function(params){
        params = $.extend({'class': 'editor'}, params);
        return $('<div class="system-editor" />')
            .append('<div class="title">'+ params.title + (params.required? '<sup class="required">*</sup>': '') + '</div>')
            .append(this.textarea(params));
    },


    //две радиокнопки да/нет
    'switch': function(params){
        params = JSON.parse(JSON.stringify(params));
        params.radio = [
            {title: 'Да', value: 1},
            {title: 'Нет', value: 0}
        ];
        return this.radiogroup(params);
    },


    //select для выбора элемента из иерархии
    hierarchySelect: function(params){
        params = JSON.parse(JSON.stringify(params));
        var self = this;
        var $select = this.setAttrs($('<select disabled="disabled"><option>Загрузка...</option></select>'), params);
        $.getJSON(SITE.MAIN_URL+params.optionsFromUrl)
            .done(function(data){
                $select.prop('disabled', false).empty();
                if(params.options){
                    params.options.forEach(function(opt){
                        $select.append('<option value="'+opt.value+'">'+opt.title+'</option>');
                    });
                }
                var ii = 0;
                function parse_category(el){
                    var str = '';
                    for(var i = 0; i < ii; i++) str += '&ndash;&ndash;&nbsp;|&nbsp;';
                    $select.append('<option data-parent="'+el[2]+'" value="'+el[0]+'">'+ str.slice(0,-7)+el[1] +'</option>');
                    data.forEach(function(el_){
                        if(el_[2] === el[0]){
                            ii++;
                            parse_category(el_);
                            ii--;
                        }
                    });
                }
                data.forEach(function(el){
                    if(el[2] == 0){
                        ii = 0;
                        parse_category(el);
                    }
                });
                if(params.default !== undefined){
                    $select.find('option[value='+params.default+']').attr('selected', 'selected');
                }
                $select.trigger('element_loaded');
            });
        return $select;
    },

    hierarchySelectForParent: function(params, form){
        var $select = this.hierarchySelect(params);
        $select.on('element_loaded', function(){
            //дети или сам элемент не могут быть родителями, поэтому мы их удаляем из select-а
            function del_children(el){
                el.siblings('[data-parent="'+el.attr('value')+'"]').each(function(){
                    del_children($(this));
                });
                el.remove();
            }
            del_children($(this).children('option[value='+form.attr('data-id')+']'));

        });
        return $select;
    }
};