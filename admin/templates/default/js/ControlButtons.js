//функция-конструктор создает блок с кнопками
function ControlButtons(buttons){
	var buttons_text = {
		save: 'Сохранить',
		new: 'Создать',
		back: 'Назад',
		remove: 'Удалить',
		apply: 'Применить'

	};
    var $div = $('<div />');

	for(var button in buttons){
		if(!buttons.hasOwnProperty(button)) continue;
        if(!buttons[button]) continue;
        var $a = $('<a></a>', {
            'class': 'button '+button,
            href: ($.type(buttons[button]) === 'string')? buttons[button]: 'javascript:void(0)',
            html: buttons_text[button]
        })
            .appendTo($div);

        if($.isFunction(buttons[button])){
            $a.on('click', (function(button){
                return function(){
                    buttons[button]();
                }
            })(button));
        }
	}

    ControlButtons.buttonsBlock = $('<div class="system-control-buttons"><hr /></div>').prepend($div);

	return ControlButtons.buttonsBlock;
}
