ContentForm = function(params){

	params = JSON.parse(JSON.stringify(params));
	var self = this;

	this.form = new Form({
		className: 'system-options-form'
	});

	//добавляем fieldset-ы в форму
	toArr(params.fieldset).forEach(function(fieldset){
		self.form.addFieldset(fieldset.title||'', toArr(fieldset.field), fieldset.name||'');
	});

	this.getResult = function(){
		var $res = self.form.getResult();
		$res.find('select').trigger('change');
		return $res;
	};

	this.setDefaultValues = function(values){
		this.form.setDefaultValues(values);
	};

};


