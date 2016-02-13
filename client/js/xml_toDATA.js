//плагин к JQuery преобразует xml в javascript-объект
(function($){
    $.fn.toDATA = function(){
        function replace_spec_char(str){
            return str
				.replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&apos;/g, "'")
                .replace(/&quot;/g, '"');
        }
        function parse_element(el){
            var elem = {};
            //цикл по атрибутам xml-элемента
            for(var i=0; i<el.attributes.length; i++){
                //добавляем в элемент свойства с именами и значения соответствующих атрибутов
                elem[el.attributes[i].name] = replace_spec_char(el.attributes[i].value);
            }
            //если у xml-элемента нет дочерних элементов
            if(!el.children.length){
                //если у него нет атрибутов
                if(!el.attributes.length){
                    elem = replace_spec_char(el.innerHTML);
                }
                else{
                    //добавляем к элементу свойство _value_, в котором будет содержимое элемента
                    if(el.innerHTML !== ''){
                        elem._value_ = replace_spec_char(el.innerHTML);
                    }
                }
            }
            else{
                //обрабатываем кажый дочерний элемент
                for(var k=0; k<el.children.length; k++){
                    var elem_name = el.children[k].tagName;
                    //если узем с таким именем уже есть
                    if(elem_name in elem){
                        //если элемент не является массивом
                        if(!(elem[elem_name] instanceof Array)){
                            //делаем его массивом
                            elem[elem_name] = [elem[elem_name]];
                        }
                        //добавляем элемент в конец массива
                        elem[elem_name].push(parse_element(el.children[k]));
                    }
                    else{
                        //добавляем элемент
                        elem[elem_name] = parse_element(el.children[k]);
                    }
                }
            }
            return elem;
        }
        return parse_element(this[0]);
    }
})(jQuery);