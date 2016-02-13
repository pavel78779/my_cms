//функция для создания формы
function Form(params){
	params = params || {};
	var self = this;
	this.fieldsets = [];
	this.defaultValues = null;

	//метод возвращает результат - форму в виде объекта Jquery
	this.getResult = function(){
		var $form = $('<form />'),
			fieldsets = JSON.parse(JSON.stringify(self.fieldsets));
		//задаем значения по умолчанию
		if(self.defaultValues){
			fieldsets.forEach(function(fs){
				fs.elements.forEach(function(el){
					if(el.name in self.defaultValues) el.default = self.defaultValues[el.name];
				});
			});
		}
		//добавляем в форму fieldset-ы
		fieldsets.forEach(function(fs){
			$form.append(self.generateFieldset(fs.title, fs.elements, fs.name));
		});
		if(params.className) $form.addClass(params.className);
		return $form;
	};

	//метод добавляет fieldset с заданными элементами в форму
	this.addFieldset = function(title, elements, name){
        this.fieldsets.push({title:title, elements:JSON.parse(JSON.stringify(elements)), name: name});
	};

	//метод генерирует один fieldset
	this.generateFieldset = function(title, elements, name){
		elements = JSON.parse(JSON.stringify(elements));
		var $result = $('<div class="fieldset-outer"/>');
		if(name) $result.attr('data-name', name);
		var $fieldset = $('<fieldset />').append('<legend>'+htmlspecialchars(title)+'</legend>').appendTo($result);
		if(elements && elements.length){
			var $table = $('<table />'),
				editors = [];
			//цикл по элементам
			elements.forEach(function(el){
				if(el.type == 'absent') return;
				if(el.type == 'editor'){
					editors.push(el);
					return;
				}
				var $tr = $('<tr />');
				$tr.append('<td class="title" data-tooltip="'+(el.tooltip||'')+'">'+ el.title +(el.required?'<sup class="required">*</sup>':'') + '</td>');
				delete el.tooltip;
				delete el.title;
				//вставляем JQuery-элемент формы
				if(el.type in FormElements){
                    var $el = FormElements[el.type](el);
					$('<td />').append($el).appendTo($tr);
                    setTimeout(function(){
                        $el.triggerHandler('element_inserted');
                    }, 0);
				}else{
					console.log('Ошибка Form: елемент '+el.type+' не определен');
				}
				$table.append($tr);
			});
			$fieldset.append($table);

			//если есть редакторы - добавляем их в конце
			if(editors.length){
				editors.forEach(function(editor){
                    editor.class = 'editor';
                    $fieldset.append(FormElements.editor(editor));
				});
			}
		}
		//если полей в fieldset-е нет
		else{
			$fieldset.append('<span>Нет параметров</span>');
		}
		return $result;
	};

	//метод задает значения по умолчанию в элементах формы
	this.setDefaultValues = function(values){
		this.defaultValues = values;
	};
}