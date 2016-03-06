(function($){
    $.fn.form = function(params){
        params = $.extend({
            fieldsets: [],
            defaultValues: {}
        }, params);

        var $form = $('<form class="plugin-form" onsubmit="return false" />').appendTo(this);

        $.each(params.fieldsets, function(i, fieldset){
            var $fs = $('<fieldset />').appendTo($form);
            if(fieldset.title){
                $fs.append('<legend>'+fieldset.title+'</legend>');
            }else{
                $fs.addClass('unnamed');
            }
            if(fieldset.name){
                $fs.attr('data-name', fieldset.name);
            }
            if(fieldset.fields.length > 0){
                var $table = $('<table />').appendTo($fs);
                $.each(fieldset.fields, function(i, field){
                    field = $.extend({}, field);
                    var $tr = $('<tr />').appendTo($table),
                        $td1 = $('<td />').appendTo($tr);
                    if(field.name in params.defaultValues){
                        field.default = params.defaultValues[field.name];
                    }
                    if(field.type === 'editor'){
                        $td1.attr('colspan', '2').append($.formElements.editor(field, $form));
                    }else{
                        $td1.addClass('title').html(field.title);
                        if(field.tooltip){
                            $td1.attr('data-tooltip', field.tooltip);
                        }
                        if(field.required){
                            $td1.append('<sup class="required">*</sup>');
                        }
                        $('<td />').append($.formElements[field.type](field, $form)).appendTo($tr);
                    }
                });
            }else{
                $fs.append('<span>Нет параметров</span>');
            }
        });
    };
})(jQuery);
