//плагин для отображения всплывающих окон
$.fn.popup = function(options){
    options = $.extend({
        title: '&nbsp;',
        buttons: {},
        closable: true,
        showHeader: true
    }, options);

    var $popup = $('<div class="plugin-popup-window"/>');

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
        $('<button class="button" />').html(key).on('click', function(){
            value.call(methods);
        }).appendTo($buttons);
    });

    if(options.showHeader){
        $popup.append('<div class="title">' + options.title + '</div>');
    }
    //создаем окно и вставляем его на страницу
    $popup
        .append($('<div class="content" />').append(this))
        .append($buttons)
        .prependTo('body');

    if(options.closable){
        $popup.prepend($('<div class="close-icon" title="Закрыть окно">x</div>')
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
        var deltaY = e.pageY - $popup.offset().top,
            deltaX = e.pageX - $popup.offset().left,
            popup_height = $popup.outerHeight(),
            popup_width = $popup.outerWidth();
        $(document).on('mousemove.plugin_popup', function(e){
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop,
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            var pageY = e.pageY - scrollTop,
                pageX = e.pageX - scrollLeft;
                if(pageY <= deltaY){
                    $popup.css('top', 0);
                }else if(pageY-deltaY+popup_height >= window.innerHeight){
                    $popup.css('top', window.innerHeight-popup_height);
                }else{
                    $popup.css('top', pageY - deltaY);
                }

                if(pageX <= deltaX){
                    $popup.css('left', 0);
                }else if(pageX-deltaX+popup_width >= window.innerWidth){
                    $popup.css('left', window.innerWidth-popup_width);
                }else{
                    $popup.css('left', pageX - deltaX);
                }
            })
            .on('mouseup.plugin_popup', function(){
                $(document).off('.plugin_popup');
            });
    });

    return methods;
};