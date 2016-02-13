<?php
class Request{
    static protected $original_url;
    static protected $real_url;
	static protected $url_segments = [];
    static protected $menu_item_params = null;

    static public function get($key, $required=true, $pattern=Validator::STRICT_STRING){
        return self::getFromArr($_GET, $key, $required, $pattern, 'Не передан GET параметр '.$key);
    }

    static public function post($key, $required=true, $pattern=null){
        return self::getFromArr($_POST, $key, $required, $pattern, 'Не передан POST параметр '.$key);
    }

    static public function getUrlSegment($part, $required=true, $pattern='/^[-a-z0-9_]+$/i'){
        try{
            return self::getFromArr(self::$url_segments, $part, $required, $pattern, '');
        }catch(ValidatorException $e){
            Router::set404();
        }
    }

    static private function getFromArr($arr, $key, $required, $pattern, $error_text){
        if(!isset($arr[$key])){
            if($required){
                throw new ValidatorException($error_text);
            }else{
                return null;
            }
        }
        if($pattern !== null){
            Validator::regExp($arr[$key], $pattern, 'Некорректный параметр '.$key);
        }
        return $arr[$key];
    }


    static public function getRealUrl(){
        return self::$real_url;
    }
    static public function setRealUrl($url){
        self::$real_url = $url;
    }

    static public function getOriginalUrl(){
        return self::$original_url;
    }
    static public function setOriginalUrl($url){
        self::$original_url = $url;
    }

	static public function setUrlSegments($segments){
		self::$url_segments = $segments;
	}

	static public function getUrlSegments(){
		return self::$url_segments;
	}

    static public function getItemParams(){
        return self::$menu_item_params;
    }

    static public function setItemParams($params){
        self::$menu_item_params = $params;
    }
}