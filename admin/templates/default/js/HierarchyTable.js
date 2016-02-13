function HierarchyTable(params){
    var d = $.Deferred();
    var content_table = new ContentTable(params);
    var $table = content_table.getResult();

    $table.on('table_load', function(e, $table){
        //ИЗМЕНЕНИЕ ПОРЯДКА
        if(!(params.change_ordering||{}).disabled){
            $table.children('tbody').sortable('destroy');
            $table.off('.hierarchy_table_change_ordering').on('mousedown.hierarchy_table_change_ordering', 'div.system-move-lines', function(e){
                e.preventDefault();
                var target_tr = $(this).parents('tr');
                //если это единственный элемент у своего родителя
                if(target_tr.siblings('tr[data-parent='+target_tr.attr('data-parent')+']').length === 0) return;

                function find_children(parent){
                    var children = parent;
                    $table.find('tr[data-parent='+parent.attr('data-id')+']').each(function(){
                        children = children.add(find_children($(this)));
                    });
                    return children;
                }

                var placeholder = find_children(target_tr),
                    clone = placeholder.clone();

                var dragging = $('<table class="system-content-table"></table>').css({
                    position: 'absolute',
                    zIndex: 99,
                    background: 'white',
                    width: $table.width(),
                    backgroundColor: '#B0FFB0',
                    top: placeholder.eq(0).offset().top,
                    left: placeholder.eq(0).offset().left
                });

                clone.eq(0).children('td').each(function(i){
                    $(this).width(target_tr.children().eq(i).width());
                });
                dragging.append('<tbody></tbody>').append(clone).prependTo('body');
                placeholder.css('visibility', 'hidden');

                var deltaY = e.pageY - placeholder.eq(0).offset().top,
                    siblings_els = target_tr.parent().children('tr[data-parent='+target_tr.attr('data-parent')+']'),
                    old_position = siblings_els.index(target_tr)+ 1,
                    limit_top = siblings_els.eq(0).offset().top,
                    last_children = find_children(siblings_els.eq(-1)).eq(-1),
                    limit_bottom = last_children.offset().top + last_children.outerHeight(),
                    dragging_height = dragging.outerHeight(),
                    target_i = siblings_els.index(target_tr),
                    coords = [],
                    top_point,
                    bottom_point;

                //сохраняем координаты
                target_tr.siblings('tr[data-parent='+target_tr.attr('data-parent')+']').each(function(i){
                    var children = find_children($(this));
                    coords.push([children.eq(0).offset().top + (children.eq(-1).offset().top+children.eq(-1).outerHeight() - children.eq(0).offset().top)/2, children, i]);
                });

                top_point = coords[target_i-1]? coords[target_i-1]: null;
                bottom_point = coords[target_i]? coords[target_i]: null;


                $(document).on('mousemove.hierarchy_table_change_ordering', function(e){
                    var cond, allow_move = true;
                    if(e.pageY-deltaY <= limit_top){
                        dragging.offset({ top: limit_top });
                        allow_move = false;
                    }
                    if(e.pageY-deltaY+dragging_height >= limit_bottom){
                        dragging.offset({ top: limit_bottom-dragging_height });
                        allow_move = false;
                    }
                    if(allow_move){
                        dragging.offset({
                            top: e.pageY - deltaY
                        });
                    }
                    if((cond = top_point&&(e.pageY-deltaY+2 < top_point[0])) || (bottom_point&&(e.pageY-deltaY+dragging_height-2 > bottom_point[0]))){
                        if(cond){
                            top_point[1].insertAfter(placeholder.eq(-1));
                            top_point[0] = top_point[1].eq(0).offset().top + (top_point[1].eq(-1).offset().top+top_point[1].eq(-1).outerHeight() - top_point[1].eq(0).offset().top)/2;
                            bottom_point = top_point;
                            top_point = (top_point&&coords[top_point[2]-1])? coords[top_point[2]-1]: null;
                        }else{
                            bottom_point[1].insertBefore(target_tr);
                            bottom_point[0] = bottom_point[1].eq(0).offset().top + (bottom_point[1].eq(-1).offset().top+bottom_point[1].eq(-1).outerHeight() - bottom_point[1].eq(0).offset().top)/2;
                            top_point = bottom_point;
                            bottom_point = (bottom_point&&coords[bottom_point[2]+1])? coords[bottom_point[2]+1]: null;
                        }
                    }

                });

                $(document).on('mouseup.hierarchy_table_change_ordering', function(){
                    $(document).off('.hierarchy_table_change_ordering');
                    dragging.remove();
                    placeholder.css('visibility', '');
                    var new_position = target_tr.parent().children('tr[data-parent='+target_tr.attr('data-parent')+']').index(target_tr)+1;
                    if(old_position === new_position) return;
                    $($table).off('.hierarchy_table_change_ordering');
                    $.post(params.mainUrl+'&action=change_ordering',{
                        id: target_tr.attr('data-id'),
                        new_order: new_position
                    })
                        .done(function(){
                            content_table.refresh();
                            Notice.showSuccess('Порядок изменен');
                        })
                        .fail(function(){
                            content_table.refresh();
                        });
                });
            });


        }

        //ИЕРАРХИЯ
        //создаем ассоц. массив {id_элемента: его_родитель}
        var conformity = [], result = [], ii = 0;
        $table.children('tbody').children('tr').each(function(){
            var $tr = $(this),
                parent = $tr.children('td[data-name=parent]').text();
            conformity.push([$tr.attr('data-parent', parent).attr('data-id'), parent]);
        });

        function parse_category(id){
            var str = '';
            for(var i = 0; i < ii; i++) str += '&ndash;&ndash;&ndash;&nbsp;|&nbsp;';
            result.push([id, str.slice(0, -13)+'&nbsp;&nbsp;']);
            //цикл по дочерним категориям
            conformity.forEach(function(el){
                if(el[1] === id){
                    ii++;
                    parse_category(el[0]);
                    ii--;
                }
            });
        }
        //цикл по категориям верхнего уровня
        conformity.forEach(function(el){
            if(el[1] == 0){
                ii = 0;
                parse_category(el[0]);
            }
        });
        result.forEach(function(el){
            var $tr = $table.children('tbody').children('tr[data-id='+el[0]+']');
            $tr.children('td[data-name=name]').prepend(el[1]);
            $tr.appendTo($table.children('tbody'));
        });
        $table.find('td[data-name=parent]').remove();

    });
    return content_table;
}