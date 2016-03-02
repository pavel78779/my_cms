(function($){
    $.fn.menu = function(params){
        params = $.extend({
            items: []
        }, params);

        var $menu = $('<div class="plugin-menu" />').appendTo(this);

        $.each(params.items, function(i, item){
            var $a = $('<a />')
                .html(item.text)
                .attr('href', item.href? item.href: 'javascript:void(0)');
            if(item.onclick){
                $a.on('click', item.onclick);
            }
            var $item = $('<div class="item" />').append($a);
            if(item.subitems){
                $item.addClass('subitems');
                var $submenu = $('<div class="submenu" />').appendTo($item);
                $.each(item.subitems, function(i, item){
                    if(item === 'separator'){
                        $submenu.append('<div class="separator"></div>');
                    }else{
                        var $a = $('<a />')
                            .html(item.text)
                            .attr('href', item.href? item.href: 'javascript:void(0)')
                            .appendTo($submenu);
                        if(item.onclick){
                            $a.on('click', item.onclick);
                        }
                    }
                });
            }
            $item.appendTo($menu);
        });
        $menu.append('<div class="clr" />');

        $menu.on('click', '.item.subitems', function(){
            var $item = $(this).addClass('active'),
                $submenu = $item.children('.submenu');
            $submenu.css({display: 'block'});

            $(document).on('mousedown.plugin_menu', function(e){
                $(document).off('mousedown.plugin_menu');
                if((e.target.tagName.toLowerCase() === 'a') && $.contains($submenu[0], e.target)){
                    $(document).on('mouseup.plugin_menu', function(){
                        $(document).off('mouseup.plugin_menu');
                        setTimeout(function(){
                            $item.removeClass('active');
                            $submenu.css('display', 'none');
                        }, 0);
                    });
                }else{
                    $item.removeClass('active');
                    $submenu.css('display', 'none');
                }
            });
        });
    };
})(jQuery);
