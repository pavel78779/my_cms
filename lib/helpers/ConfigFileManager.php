<?php
class ConfigFileManager extends ContentManager{

	protected $path;
	protected $className;

    protected function __construct($path, $class_name){
		if(!is_readable($path) || !is_writable($path)){
			throw new SystemException($path.' не найден или недоступен для чтения или записи');
		}
        require_once $path;
        if(!class_exists($class_name)){
            throw new SystemException('Класс '.$class_name.' не найден в '.$path);
        }
		$this->path = $path;
		$this->className = $class_name;
        //получаем все константы в классе
        $fields = array_keys((new ReflectionClass($class_name))->getConstants());
        if(!$fields){
            throw new SystemException('В классе ' . $class_name . ' нет ни одной константы');
        }
        parent::__construct($fields);
	}


    protected function _get($fields, $filter=[]){
        require_once $this->path;
		$result = [];
		foreach($fields as $key){
            $result[] = constant($this->className.'::'.$key);
		}
		return $result;
	}


    protected function _update($data, $id){
		$file_content = file_get_contents($this->path);
		foreach($data as $key=>$value){
			$count = 0;
            $value = str_replace('\\', '\\\\', str_replace('\'', '\\\'', str_replace('\\', '\\\\', str_replace(chr(0), '', $value))));
            $file_content = preg_replace('/([\n\r]\s*const '.$key.' = ).*?(;[\r\n])/u', '$1\''.$value.'\'$2', $file_content, -1, $count);
			if($count !== 1){
				throw new SystemException('Ошибка при обновлении значения');
			}
			file_put_contents($this->path, $file_content);
		}
	}

	protected function _add($data){
        Router::set404();
    }

    protected function _delete($id_list){
        Router::set404();
    }

    protected function _changeOrdering($id, $new_order){
        Router::set404();
    }
}