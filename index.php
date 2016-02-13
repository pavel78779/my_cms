<?php
$global_start_time = microtime(true);
try{
    define('SITE_ROOT', __DIR__);
    define('ADMIN_ROOT', SITE_ROOT.'/admin');
    mb_internal_encoding('UTF-8');
    require_once(SITE_ROOT.'/config.php');
    if(SConfig::SITE_DEBUG){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        ini_set('error_reporting', E_ALL);
    }
    //подключаем классы
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

    //запускаем выполнение
    Router::start();
}
catch (SystemException $e){
	header('HTTP/1.0 500 Internal Server Error');
	echo $e->getError();
}
catch(ValidatorException $e){
	header('HTTP/1.0 400 Bad Request');
	echo $e->getError();
}