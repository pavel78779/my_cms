<?php
class Load{

    //метод подключает и запустает контроллер
    public static function controller($path, $param=null){
        //подключаем файл с контроллером
        FileSys::includeFile($path);
        //создаем объект контроллера
        $controller_name = basename($path, '.php');
        $controller = new $controller_name($param);
        //запускаем
        $controller->_run_($param);
    }

	public static function manager($path){
		Load::controller($path, Request::get('action', false));
	}

    //метод подключает модель
    public static function model($path){
        //подключаем файл
        FileSys::includeFile($path);
        //получаем имя модели
        $model_name = basename($path, '.php');
        //создаем объект модели
        return new $model_name();
    }

    //метод подключает файл вида
    public static function view($path, $data=null){
        FileSys::includeFile($path, $data);
    }

    //метод подключает файл (если не находит - вызывает ошибку 404)
    public static function file($path, $data=null){
        try{
            FileSys::includeFile($path, $data);
        }catch(SystemException $e){
            Router::set404();
        }
    }


	//метод подключает javascript скрипты из директории
	static public function js($path, $url){
		foreach(FileSys::getFiles($path) as $js){
			echo '<script type="text/javascript" src="'.$url.$js.'"></script>';
		}
	}
}