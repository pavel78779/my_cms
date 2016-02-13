<?php
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
usleep(200000);
//$start_time = microtime(true);
ini_set("display_errors","1");
ini_set("display_startup_errors","1");
ini_set('error_reporting', E_ALL);
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

define('ADMIN_ROOT', __DIR__);
define('SITE_ROOT', realpath(__DIR__.'/../'));
mb_internal_encoding('UTF-8');

function toCamelCase($str){
    $res = preg_replace_callback('/_[a-z0-9]/', function($matches){
        return strtoupper(substr($matches[0], -1));
    }, $str);
    $res[0] = strtoupper($res[0]);
    return $res;
}

try{
	spl_autoload_register(function($class){
        $lib_dirs = ['core', 'exceptions', 'helpers', 'system'];
        foreach($lib_dirs as $dir){
            if(is_readable(SITE_ROOT.'/lib/'.$dir.'/'.$class.'.php')){
                require_once(SITE_ROOT.'/lib/'.$dir.'/'.$class.'.php');
                return;
            }
        }
        throw new SystemException('Класса '.$class.' не существует');
	});
    FileSys::includeFile(SITE_ROOT.'/config.php');
	//проверяем, авторизован ли пользователь
	session_start();
	if(!isset($_SESSION['user'])){
		//если запрошена главная страница админки - выводим страницу авторизации
		if($_SERVER['REQUEST_URI'] === '/admin/'){
            FileSys::includeFile(SITE_ROOT.'/client/pages/login.php');
			exit;
		}elseif($_SERVER['REQUEST_URI'] !== '/admin/index.php?com=users&action=login'){
			header("HTTP/1.0 401 Unauthorized");
            echo 'Необходима авторизация';
			exit;
		}
	}

    //если запрошена главная страница админки - выводим ее шаблон
	if($_SERVER['REQUEST_URI'] === '/admin/'){
		FileSys::includeFile(ADMIN_ROOT.'/templates/default/index.php');
	}
	//иначе ЗАГРУЖАЕМ КОМПОНЕНТ
	else{
		$com = Request::get('com');
        if(!is_dir(ADMIN_ROOT.'/components/'.$com)){
            Router::set404();
        }
        if(is_file(ADMIN_ROOT.'/components/'.$com.'/config.php')){
            require_once(ADMIN_ROOT.'/components/'.$com.'/config.php');
        }
		if(is_file(ADMIN_ROOT.'/components/'.$com.'/SectionController.php')){
            Load::controller(ADMIN_ROOT.'/components/'.$com.'/SectionController.php', Request::get('section', false));
		}else{
            $com_dirs = FileSys::getDirs(ADMIN_ROOT.'/components/'.$com);
            $forbidden_dir = ['client'];
            $section = Request::get('section');
            if(in_array($section, $com_dirs) && !in_array($section, $forbidden_dir)){
                Load::manager(ADMIN_ROOT.'/components/'.$com.'/'.$section.'/'.toCamelCase($section).'Manager.php');
            }else{
                Router::set404();
            }
        }
	}
}
catch (SystemException $e){
	header('HTTP/1.0 500 Internal Server Error');
	echo $e->getError();
}
catch(ValidatorException $e){
	header('HTTP/1.0 400 Bad Request');
	echo $e->getError();
}
catch(AccessException $e){
    header('HTTP/1.0 403 Forbidden');
    echo $e->getError();
}