//плагин отображает уведомление рядом с элементом
(function($){
    jQuery.fn.popover = function(params){
        var $this = this,
            actions = {
                remove: function(){
                    if($this.data('plugin_popover')) $this.data('plugin_popover').remove();
                }
            };
        if(typeof params == 'string'){
            if(params in actions) actions[params]();
            return $this;
        }

        params = $.extend({
            html: '!',
            type: 'warning'
        }, params);

        //если popover уже есть у этого элемента - удаляем его
        $this.popover('remove');

        //создаем popover
        var $popover = $('<div class="plugin-popover" />')
            .append('<div class="triangle" />')
            .append('<div class="content">'+params.html+'</div>')
            .addClass(params.type)
            .prependTo($this.offsetParent());
        $popover.css({
                top: $this.position().top - $popover.outerHeight()/2 + $this.outerHeight()/2,
                left: $this.position().left + $this.outerWidth()
            })
            .stop().animate({
                left: '+=13',
                opacity: 1
            }, 100);
        $this.data('plugin_popover', $popover);
        return $this;
    };
})(jQuery);