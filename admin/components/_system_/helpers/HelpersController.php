<?php
class HelpersController{
	use Controller;

	//метод получает client.xml, скрипты и css компонента
	public function get_component_data(){
		$css = '';
		$css_path = ADMIN_ROOT.'/components/'.Request::get('component').'/client/css';
		if(is_dir($css_path)){
			foreach(FileSys::getFiles($css_path) as $css_file){
				$css .= file_get_contents($css_path.'/'.$css_file);
			}
		}
		$js = '';
		$js_path = ADMIN_ROOT.'/components/'.Request::get('component').'/client/js';
		if(is_dir($js_path)){
			foreach(FileSys::getFiles($js_path) as $js_file){
				$js .= file_get_contents($js_path.'/'.$js_file);
			}
		}
		$client_xml = '';
        $client_xml_path = ADMIN_ROOT.'/components/'.Request::get('component').'/client.xml';
        if(is_readable($client_xml_path)){
            $client_xml = file_get_contents($client_xml_path);
        }

		$com_title = (new Db())->getOne('SELECT `title` FROM ##extensions WHERE `name`=?s', Request::get('component'));
        $result = [preg_replace('/[\t\r\n]+/', '', $client_xml), preg_replace('/[\t\r]+/', '', $js), preg_replace('/[\t\r\n]+/', '', $css), $com_title];
		echo Json::encode($result);
	}


    //метод получает данные для главной страницы админки
	public function get_data_for_main_page(){
        $db = new Db();
        $components = $db->getAll("SELECT `title`,`name` FROM ##extensions WHERE `type`='component' AND `enabled`=1");
        $modules = $db->getAll('SELECT `name`,`id` FROM ##modules WHERE `published`=1');
        echo  Json::encode([$components, $modules]);
    }
}