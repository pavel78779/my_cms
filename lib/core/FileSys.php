<?php
//класс для работы с файловой системой
class FileSys{

    //метод подключает файл
    static public function includeFile($path, $vars=null){
        if(is_readable($path)){
            if($vars) extract($vars);
            require $path;
        }
        else{
            throw new SystemException('Не удалось подключить файл '.$path);
        }
    }

	//метод получает все файлы из директории
	static public function getFiles($path){
		if(is_dir($path)){
			$files = scandir($path);
            return array_filter($files, function($file)use($path){
                return is_file($path.'/'.$file);
            });
		}else{
			throw new SystemException($path.' не является директорией');
		}
	}

	//метод получает все папки из директории
	static public function getDirs($path){
		if(is_dir($path)){
			$dirs = scandir($path);
            return array_filter($dirs, function($dir)use($path){
                return is_dir($path.'/'.$dir) && ($dir !== '.') && ($dir !== '..');
            });
		}else{
			throw new SystemException($path.' не является директорией');
		}
	}

}