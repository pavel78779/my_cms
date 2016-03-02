(function($){
    $.fn.controlButtons = function(params){
        params = $.extend({
            buttons: []
        }, params);

        var buttons_text = {
            save: 'Сохранить',
            new: 'Создать',
            back: 'Назад',
            remove: 'Удалить',
            apply: 'Применить'

        };
        var $buttons = $('<div class="plugin-control_buttons" />').appendTo(this);

        $.each(params.buttons, function(i, button){
            var $button = $('<a class="button" />').appendTo($buttons);
            $button
                .addClass(button.type)
                .html(button.text? button.text: buttons_text[button.type])
                .attr('href', (button.href? button.href: 'javascript:void(0)'));
            if(button.onclick){
                $button.on('click', button.onclick);
            }
        });
    };
})(jQuery);
