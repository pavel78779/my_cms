//скрипт отвечает за создание всплывающих подсказок у элементов с атрибутом data-tooltip
$(document).ready(function(){
    $('body').on('mouseenter.plugin_tooltip', '*[data-tooltip]', function(e){
        var $this = $(this);
        var $tooltip;
        var tooltip_text = $this.attr('data-tooltip');
        if(tooltip_text === '') return;
        if($('body>div.plugin-tooltip').length){
            $tooltip = $('body>div.plugin-tooltip');
        }else{
            $tooltip = $('<div class="plugin-tooltip" />');
        }
        $tooltip
            .css({
                top: e.pageY+6,
                left: e.pageX+6
            })
            .html(tooltip_text)
            .prependTo('body');
        //обработчик перемещения курсора
        $this.on('mousemove.plugin_tooltip', function(e){
            $tooltip.css({top: e.pageY+6, left: e.pageX+6});
        });
        //обработчик ухода курсора с элемента
        $this.on('mouseleave.plugin_tooltip', function(){
            $tooltip.remove();
            $this.off('mouseleave.plugin_tooltip mousemove.plugin_tooltip');
        });
    });
});