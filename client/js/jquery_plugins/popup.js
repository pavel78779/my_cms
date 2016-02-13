$.fn.popup = function(options){
    options = $.extend({
        title: '&nbsp;',
        buttons: {},
        closable: true,
        showHeader: true
    }, options);

    var $popup = $('<div class="system-popup-window"/>');

    var methods = {
        close: function(){
            $popup.remove();
            $('.system-page-overlay').remove();
        },
        center: function(){
            $popup.css({
                top: window.innerHeight/2 - $popup.outerHeight()/2,
                left: window.innerWidth/2 - $popup.outerWidth()/2
            });
        }
    };

    //генерируем кнопки
    var $buttons = $('<div class="buttons" />');
    $.each(options.buttons, function(key, value){
        if(value === 'close') value = function(){methods.close()};
        $('<button class="button"/>').html(key).on('click', function(){
            value.call(methods);
        }).appendTo($buttons);
    });

    //создаем окно и вставляем его на страницу
    if(options.showHeader){
        $popup.append('<div class="title">' + options.title + '</div>');
    }
    $popup
        .append($('<div class="content" />').append(this))
        .append($buttons)
        .prependTo('body');

    if(options.closable){
        $popup.prepend($('<div class="window-close" title="Закрыть">x</div>')
            .on('click', function(){
                methods.close();
            })
            .on('mousedown selectstart', false)
        );
    }

    //центрируем окно
    methods.center();

    //вставляем перекрывающий слой
    if(!$('.system-page-overlay').length) $('body').prepend('<div class="system-page-overlay" />');

    //вешаем обработчики для перемещения окна
    $popup.children('div.title').on('mousedown', function(e){
        e.preventDefault();
        var deltaY = e.clientY - $popup.offset().top,
            deltaX = e.clientX - $popup.offset().left,
            popup_height = $popup.outerHeight(),
            popup_width = $popup.outerWidth();
        $(document).on('mousemove.plugin_popup', function(e){
            if(e.clientY <= deltaY){
                $popup.css('top', 0);
            }else if(e.clientY-deltaY+popup_height >= window.innerHeight){
                $popup.css('top', window.innerHeight-popup_height);
            }else{
                $popup.css('top', e.clientY - deltaY);
            }

            if(e.clientX <= deltaX){
                $popup.css('left', 0);
            }else if(e.clientX-deltaX+popup_width >= window.innerWidth){
                $popup.css('left', window.innerWidth-popup_width);
            }else{
                $popup.css('left', e.clientX - deltaX);
            }
        })
            .on('mouseup.plugin_popup', function(){
                $(document).off('.plugin_popup');
            });
    });

    return methods;
};