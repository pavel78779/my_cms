<?php

//класс для проверки данных на валидность
class Validator{
	const INT = '/^[0-9]+$/';
    const INT_COMMAS = '/^([0-9]+,)*[0-9]+$/';
    const BOOL = '/^[01]$/';
    const STRICT_STRING = '/^[a-z0-9_]+$/i';
    const STRICT_STRING_COMMAS = '/^([a-z0-9_]+,)*[a-z0-9_]+$/i';

	//целое число
	static public function int($data, $description_error='Необходимо целое число'){
		self::regExp($data, self::INT, $description_error);
	}

	//список целых чисел, разделенных запятыми
	static public function intCommas($data, $description_error='Необходим список целых чисел, разделенных запятыми'){
		self::regExp($data, self::INT_COMMAS, $description_error);
	}

	//логический тип (0 либо 1)
	static public function bool($data, $description_error='Необходим логический тип (0 либо 1)'){
		self::regExp($data, self::BOOL, $description_error);
	}

	//строгая строка (только англ. буквы, цифры и _)
	static public function strictString($data, $description_error='В строке могут быть только англ. буквы, цифры и _'){
		self::regExp($data, self::STRICT_STRING, $description_error);
	}

	//список строгих строк, разделенных запятыми
	static public function strictStringCommas($data, $description_error='Необходим список строк (англ. буквы, цифры и _), разделенных запятыми'){
        self::regExp($data, self::STRICT_STRING_COMMAS, $description_error);
	}

	//проверяет на соответствие рег. выражению
	static public function regExp($data, $reg_exp, $description_error='Данные не соответствуют регулярному выражению'){
		if(!preg_match($reg_exp, $data)){
			throw new ValidatorException($description_error);
		}
	}
}