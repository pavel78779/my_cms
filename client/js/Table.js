function Table(header, data){
	var self = this;
	//копируем параметры
	this.header = JSON.parse(JSON.stringify(header));
	this.data = JSON.parse(JSON.stringify(data));
	this.$table = $('<table />');

	//метод возвращает таблицу в виде объекта JQuery
	this.getResult = function(){
		return this.$table;
	};

	//метод генерирует HTML-код таблицы
	this.generateTableHTML = function(header, data){
		var result = '<thead><tr class="header">';
		//генерируем заголовок таблицы
		header.forEach(function(el){
			result+= '<td data-name="'+el.name+'" class="'+(el.className||'')+'">'+el.title+'</td>';
		});
		result += '</tr></thead><tbody>';
		//генерируем содержимое таблицы
		data.forEach(function(line){
			result += '<tr>';
			line.forEach(function(cell, i){
				result+= '<td data-name="'+header[i].name+'" class="'+(header[i].className||'')+'">'+(cell||'')+'</td>';
			});
			result += '</tr>';
		});
        result += '</tbody>';
		return result;
	};

    //метод обновляет содержимое таблицы
    this.refresh = function(header, data){
        this.$table
			.html(self.generateTableHTML(header, data))
			.triggerHandler('table_load', [this.$table]);
		//вызываем пользовательские функции изменения таблицы
		//this.transformTableFn.fire(this.$table);
    };

	//создаем таблицу
	this.refresh(header, data);
}