//плагин создает вкладки
(function($){
    $.fn.tabsMenu = function(tabs){
        var $tabs = $('<div class="plugin-tabs-menu" />').appendTo(this);
        var tabs_body = $('<div class="tabs-body" />').prependTo($tabs);
        $('<div class="clr" />').prependTo($tabs);
        var tabs_header = $('<div class="tabs-header" />').prependTo($tabs);

        tabs.forEach(function(tab){
            tabs_header.append('<a href="'+tab.href+'" class="'+tab.name+'">'+tab.title+'</a>');
        });
        return tabs_body;
    };
})(jQuery);