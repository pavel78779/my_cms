//методы для работы с уведомлениями
Notice = {
	//успешно
	showSuccess: function(text, values_obj){
		var notice_text = values_obj? this.generateText(text, values_obj): text;
		this.createDiv(notice_text)
			.addClass('success')
			.appendTo('body');
	},
	//ошибка
	showError: function(text, values_obj){
		var notice_text = values_obj? this.generateText(text, values_obj): text;
		this.createDiv(notice_text)
			.addClass('error')
			.appendTo('body');
	}
	,
	//метод создает div для уведомления
	createDiv: function(text){
		var notice_div = $('<div class="system-notice" />')
			.html(text)
			.on('click', function(){
				$(this).remove()
			});
		notice_div.css({
			opacity: 0,
			bottom: '-'+notice_div.height()+'px'
		})
			.animate({opacity: 1, bottom: 30}, 200, null, function(){
				//удаляем все уведомления кроме текущего
				$('.system-notice').not(notice_div).remove();
			});
		setTimeout(function(){
			notice_div.animate({opacity: 0}, 3000, null, function(){
				notice_div.remove();
			});
		}, 2000);
		return notice_div;
	}
	,
	//метод генерирует текст уведомления
	generateText: function(notice_text, values_obj){
			if(!notice_text) return '';
			var result = notice_text;
			var num = 0;
			for(var v in values_obj){
				if(!values_obj.hasOwnProperty(v)) continue;
				if(typeof values_obj[v] == 'number') num = values_obj[v];
				result = notice_text.replace(v, values_obj[v]);
			}
			//ищем и заменяем окончания числительных
			var m = result.match(/%(.+?)%/g);
			if(!m) return result;
			m.forEach(function(el){
				//получаем массив окочаний
				var arr_end = el.slice(2, -2).split('|');
				result = result.replace(el, ending_numerals(arr_end, num));
			});
			return result;
	}
};
