<?php
class Json{
	public static function encode($data){
		$json = json_encode($data, JSON_UNESCAPED_UNICODE);
		if(json_last_error()){
			throw new SystemException('Ошибка JSON: '.json_last_error_msg());
		}
		return $json;
	}

	public static function decode($json){
		$data = json_decode($json, true);
		if(json_last_error()){
			throw new SystemException('Ошибка JSON: '.json_last_error_msg());
		}
        if(!is_array($data)){
            throw new SystemException('JSON должен быть преобразован в массив');
        }
		return $data;
	}
}