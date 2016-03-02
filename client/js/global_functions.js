//функция возвращает уникальное случайное целое положительное число
function random_temp_number(){
	var date = new Date();
	return date.getTime().toString().slice(6) + Math.random().toString().substr(2);
}

//функция задает правильное окончание числительным
function ending_numerals(endings, number){
	var end_num = number.toString().slice(-1);
	number = number.toString();
	var en1 = ['5', '6', '7', '8', '9', '0'];
	var num1 = ['10', '11', '12', '13', '14'];
	if(en1.indexOf(end_num) != -1 || num1.indexOf(number) != -1){
		return endings[2];
	}
	else if(end_num == 1){
		return endings[0];
	}
	else{
		return endings[1];
	}
}


/*function call_func(f, args){
    var d = $.Deferred();
    var f_return = f.apply(null, (args || []));
    if(f_return.done){
        f_return.done(function(res){
            d.resolve(res);
        });
    }
    else{
        d.resolve(f_return);
    }
    return d.promise();
}*/

//функция заворачивает значение в массив
function toArr(data){
    if(data instanceof Array){
        return data;
    }else if(data === undefined || data === null){
        return [];
    }else{
		return [data];
	}
}

//функция возвращает массив свойств объекта
function get_object_props(obj){
	var props = [];
	for(var p in obj){
		if(!obj.hasOwnProperty(p)) continue;
		props.push(p);
	}
	return props;
}

//функция экранирует html-спецсимволы  в строке
function htmlspecialchars(str){
	return str
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

//функция чистит массив: удаляет null, undefined, пустые строки
function clean_arr(arr){
	var res = [];
	arr.forEach(function(el){
		if(el !== null && el !== undefined && el !== ''){
			res.push(el);
		}
	});
	return res;
}