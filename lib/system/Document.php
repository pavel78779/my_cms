<?php
class Document{
    static protected $title;
    static protected $description;
    static protected $keywords;
    static protected $robots;
    static protected $js = [];
    static protected $css = [];
    static protected $debug_info;

    static public function setTitle($title){
        self::$title = $title;
    }
    static public function setDescription($description){
        self::$description = $description;
    }
    static public function setKeywords($keywords){
        self::$keywords = $keywords;
    }
    static public function setRobots($robots){
        self::$robots = $robots;
    }
    static public function addCss($css){
        self::$css[] = $css;
    }
	static public function addJs($js){
		self::$js[] = $js;
	}

    //метод генерирует страницу
    static public function generate(){
        //генерируем компонент
        $output_content = self::generateComponent();
        //генерируем содержимое модулей:
        //получаем позиции модулей из шаблона
        $params = (new Db())->getOne('SELECT `params` FROM ##extensions WHERE `name`=?s', [SConfig::SITE_TEMPLATE]);
        $positions = Json::decode($params)['module_positions'];
        $modules_output = [];
        //генерируем вывод модулей каждой позиции
        foreach($positions as $position){
            $modules_output[$position] = self::generateModule($position);
        }
	    //если страница загружается методом AJAX
	    if(isset($_GET['_ajax_mode_'])){
		    echo Json::encode([
			    self::generateHeader(true),
			    $output_content,
			    $modules_output,
			    self::debugInfo()
		    ]);
	    }else{
		    //иначе подключаем ШАБЛОН
		    Load::view(SITE_ROOT.'/templates/'.SConfig::SITE_TEMPLATE.'/index.php', [
			    'content' => $output_content,
			    'modules' => $modules_output,
			    'header' => self::generateHeader(),
			    'debug' => self::debugInfo()
		    ]);
	    }
    }

    //метод генерирует компонент
    static public function generateComponent(){
        $com_name = Request::getUrlSegment(0);
        //проверяем наличие такого компонента
        if(!is_dir(SITE_ROOT.'/components/'.$com_name)){
            Router::set404();
        }
        ob_start();
        //запускаем работу компонента
        if(is_file(SITE_ROOT.'/components/'.$com_name.'/index.php')){
            Load::file(SITE_ROOT.'/components/'.$com_name.'/index.php');
        }else{
            $section = Request::getUrlSegment(1);
            if(is_file(SITE_ROOT.'/components/'.$com_name.'/'.$section.'/'.$section.'.php')){
                Load::file(SITE_ROOT.'/components/'.$com_name.'/'.$section.'/'.$section.'.php');
            }else{
                Router::set404();
            }
        }
        return ob_get_clean();
    }


    //метод генерирует header
    static protected function generateHeader($ajax_mode=false){
	    if(SConfig::SITE_DEBUG){
		    self::addCss(SConfig::SITE_MAIN_URI.'client/styles/debug.css');
	    }
	    if(SConfig::AJAX_ENABLED){
		    self::addJs(SConfig::SITE_MAIN_URI.'client/js/site/ajax.js');
	    }
	    if($ajax_mode){
		    $r = [
			    'title'=> self::$title,
			    'css'=> self::$css,
			    'js'=> self::$js
		    ];
	    }else{
		    $r = '<title>'.self::$title.'</title>';
		    if(self::$description)  $r .= '<meta name="description" content="'.self::$description.'">';
		    if(self::$keywords)     $r .= '<meta name="keywords" content="'.self::$keywords.'">';
		    if(self::$robots)       $r .= '<meta name="robots" content="'.self::$robots.'">';
		    foreach(self::$js as $js){
			    $r .= '<script type="text/javascript" src="'.$js.'"></script>';
		    }
		    foreach(self::$css as $css){
			    $r .= '<link rel="stylesheet" href="'.$css.'" type="text/css" />';
		    }
	    }
        return $r;
    }

    //метод генерирует отладочную информацию
    static protected function debugInfo(){
	    if(!SConfig::SITE_DEBUG) return '';
        global $global_start_time;
        $total_time = round(microtime(true) - $global_start_time, 5);
        $res = '<div class="header">Запросов к базе данных: <span class="value">'.count(Db::getStats()).'</span></div>';
        foreach(Db::getStats() as $st){
            $res .= '<div class="line">'.$st['query'].' (<span class="value">'.round($st['timer']*1000, 3).' мс</span>)</div>';
        }
        $res .= '<div class="header">Память: <span class="value">'.round(memory_get_peak_usage()/1024/1024, 3).' Мб</span></div>';
        $res .= '<div class="header">Время генерации страницы: <span class="value">'.$total_time.' с</span></div>';
        $res .= '<div class="header">Реальный URL: <span class="value">'.Request::getRealUrl().'</span></div>';
        return $res;
    }

    //метод генерирует модули определенной позиции
    static protected function generateModule($position){
        $db = (new Db())->setTable('modules');
        $modules = $db->getAll('SELECT module_type,name,assignment_type,assignment_urls,show_header,params,id FROM # WHERE position=?s AND published=1 ORDER BY ordering', $position, MYSQLI_ASSOC);
        ob_start();
        foreach($modules as $module){
            //проверяем, должен ли модуль отображаться на данной странице
            if($module['assignment_type'] != 'all'){
                $assig_urls = Json::decode($module['assignment_urls']);
                if($module['assignment_type'] == 'on'){
                    if(!in_array(Request::getOriginalUrl(), $assig_urls)){
                        continue;
                    }
                }
                elseif($module['assignment_type'] == 'except'){
                    if(in_array(Request::getOriginalUrl(), $assig_urls)){
                        continue;
                    }
                }
            }
            ob_start();
            FileSys::includeFile(SITE_ROOT.'/modules/'.$module['module_type'].'/index.php', [
                    'data' => $module,
                    'params' => Json::decode($module['params'])
            ]);
            $module_output = ob_get_clean();
            FileSys::includeFile(SITE_ROOT.'/modules/common_template.php', [
                'data' => $module,
                'module_output' => $module_output
            ]);
        }
        return ob_get_clean();
    }
}