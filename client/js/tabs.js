//плагин создает вкладки
(function($){
    jQuery.fn.singleTabs = function(tabs){
        var tabs_div = $('<div class="system-tabs" />').appendTo(this);
        var tabs_body = $('<div class="tabs-body" />').prependTo(tabs_div);
        $('<div class="clr" />').prependTo(tabs_div);
        var tabs_header = $('<div class="tabs-header" />').prependTo(tabs_div);

        tabs.forEach(function(tab){
            tabs_header.append('<a href="'+tab.href+'" class="'+tab.name+'">'+tab.title+'</a>');
        });
        return tabs_div;
    };
})(jQuery);