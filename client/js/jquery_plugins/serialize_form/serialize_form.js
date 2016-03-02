(function($){
    jQuery.fn.serializeForm = function(params){
        params = $.extend({
            validate: true
        }, params);
        var data = {}, error = '', $form = this;

        if(window.tinymce){
            $.each(tinymce.editors, function(key, editor){
                editor.save();
            });
        }

        this.find('input:not([type="submit"]),select,textarea').each(function(){
            var val, el = $(this);
            if(el.is('input[type=button]')){
                val = el.attr('data-value');
            }else if(el.is('input[type=radio]')){
                val = $form.find('input[name='+el.attr('name')+']:checked').val();
            }else{
                val = el.val();
            }

            if(el.attr('name') && !el.is('input[type=checkbox]:not(:checked)')){
                data[el.attr('name')] = val;
            }
        });

        if(params.validate){
            this.find('input:not([type="submit"]),select,textarea').each(function(i, el){
                el = $(el);
                //проверяем на обязательность заполнения
                if(el.attr('data-required') && !$.trim(data[el.attr('name')])){
                    error = 'Заполните это поле';
                }
                //проверяем на pattern
                else if(data[el.attr('name')] && el.attr('data-pattern') && !eval(el.attr('data-pattern')).test(data[el.attr('name')])){
                    error = el.attr('data-invalid_description') || 'Неверный формат';
                }

                if(error){
                    el.addClass('invalid')
                        .popover({html: error})
                        .off('focus').on('focus', function(){
                        $(this).removeClass('invalid').popover('remove');
                    });
                    return false;
                }
            });
        }

        return (error? false: data);
    };
})(jQuery);