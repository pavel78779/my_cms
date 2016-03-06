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
        var methods = {
            setActiveItem: function(item_name){
                tabs_header.children().removeClass('active').filter('.'+item_name).addClass('active');
            },
            tabsBody: tabs_body
        };
        return methods;
    };
})(jQuery);