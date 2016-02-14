<?php

class Router{

    static public function start(){
	    //если сайт отключен
	    if(SConfig::SITE_DISABLED){
		    FileSys::includeFile(SITE_ROOT.'/client/pages/site_disabled.php');
		    exit;
	    }
        //в переменную $request_url заносим url без GET-параметров
        $request_url = explode('?', $_SERVER['REQUEST_URI'])[0];
        //проверяем url
        if(!preg_match('/^\/(([-a-z0-9_]+\/)*[-a-z0-9_]+\.html)?(\?.*)?$/', $request_url)){
            Router::set404();
        }
        Request::setOriginalUrl($request_url);
        $db = (new Db())->setTable('url_redirects');
        //если у страницы есть новый адрес - перенаправляем, чтобы избежать дублей страниц
        if($ou = $db->getOne('SELECT `old_url` FROM # WHERE new_url=?s AND type="I"', $request_url)){
            Router::redirect($ou);
        }

        //проверяем, есть ли редиректы
        $r = $db->getRow('SELECT `new_url`,`type`,`comment` FROM # WHERE old_url=?s', $request_url);
        if($r){
            //если редирект внутренний
            if($r[1] === 'I'){
                $request_url = $r[0];
            }
            //если внешний
            elseif($r[1] === 'E'){
                Router::redirect($r[0]);
            }
        }

        //получаем параметры пункта меню (если есть)
        $item = $db->getOne('SELECT `params` FROM ##menu_items WHERE `item_url`=?s', [Request::getOriginalUrl()]);
        if($item){
            Request::setItemParams(Json::decode($item));
        }

        Request::setRealUrl($request_url);
	    Request::setUrlSegments(explode('/', substr($request_url, 1, -5)));

        //запускаем вывод страницы
        Document::generate();
    }

    //метод вызывает ошибку 404
    static public function set404(){
        header('HTTP/1.0 404 Not Found');
        echo SConfig::HTTP_ERROR_404;
        exit;
    }

    //метод выполняет 301 редирект
    static public function redirect($url){
        header('HTTP/1.1 301 Moved Permanently');
        header('Location: '.$url);
        exit;
    }
}