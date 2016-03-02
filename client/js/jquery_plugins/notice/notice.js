(function($){
    $.notice = function(params){
        params = $.extend({
            type: 'success',
            text: ''
        }, params);

        //удаляем все уведомления кроме текущего
        $('.plugin-notice').not($notice).remove();

        var $notice = $('<div class="plugin-notice" />')
            .addClass(params.type)
            .html(params.text)
            .on('click', function(){
                $(this).remove();
            })
            .prependTo('body');
        $notice.css({
                bottom: '-'+$notice.height()+'px'
            })
            .animate({opacity: 1, bottom: 25}, 200);
        setTimeout(function(){
            $notice.animate({opacity: 0}, 3000, null, function(){
                $notice.remove();
            });
        }, 2000);
        return $notice;
    }
})(jQuery);
