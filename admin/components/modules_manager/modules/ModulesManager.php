<?php
class ModulesManager extends DbManager{

	public function __construct(){
		parent::setGrouping('position');
		parent::__construct('modules');
	}

	//метод выводит список всех меню с их пунктами
	public function get_menu(){
		$result = [];
		$menus = $this->db->getAll('SELECT `name`,`id` FROM ##modules WHERE `module_type`="menu"');
		foreach($menus as $menu){
			$items = $this->db->getAll('SELECT `item_url`,`name` FROM ##menu_items WHERE menu_id=?i', [$menu[1]]);
			$result[] = [$menu[0], $items];
		}
		echo Json::encode($result);
	}

	//метод выводит список всех позиций текущего шаблона
	public function get_modules_positions(){
		$params = $this->db->getOne('SELECT `params` FROM ##extensions WHERE `name`=?s AND `type`="template"', [SConfig::SITE_TEMPLATE]);
		echo Json::encode(Json::decode($params)['module_positions']);
	}

	//метод выводит параметры определенного типа модуля
	public function get_module_params(){
        $module_name = Request::get('module_name');
		if(is_readable(ADMIN_ROOT.'/modules/'.$module_name.'/params.json')){
			echo file_get_contents(ADMIN_ROOT.'/modules/'.$module_name.'/params.json');
		}
	}
}