<?php
class MenuItemsManager extends DbManager{

	public function __construct(){
		parent::setGrouping('menu_id');
		parent::__construct('menu_items');
	}

	//метод выводит список типов пунктов меню всех компонентов
	public function get_items_types(){
		$res = [];
		$components = $this->db->getAll("SELECT `id`,`title` FROM ##extensions WHERE `type`='component' AND `enabled`=1");
		foreach($components as $com){
			$items = $this->db->getAll('SELECT `id`,`title`,`description` FROM ##items_types WHERE `component_id`=?i', [$com[0]]);
			if(!empty($items)) $res[] = [$com[0], $com[1], $items];
		}
		echo Json::encode($res);
	}



    public function get_types(){
        echo Json::encode($this->db->getAll('SELECT `id`,`title` FROM ##items_types'));
    }

	//метод получает xml-данные параметров одного типа пункта меню
	public function get_item_params(){
		echo $this->db->getOne('SELECT `params` FROM ##items_types WHERE `id`=?i LIMIT 1', Request::get('item_type', true, Validator::INT));
	}

	public function update(){
        $data = Json::decode(Request::post('data'));
        $id = Request::post('id', true, Validator::INT);
        if(!isset($data['main_params']) || !isset($data['item_params'])){
            $this->updateData($data, $id);
            return;
        }
        $main_params = $data['main_params'];
        $item_params = $data['item_params'];

        if(!isset($main_params['type'])){
            throw new ValidatorException('Не передан параметр type');
        }
        Validator::int($main_params['type']);
        $url_maker = $this->db->getOne('SELECT `url_maker` FROM ##items_types WHERE `id`=?i LIMIT 1', [$main_params['type']]);
        if(!$url_maker){
            throw new ValidatorException('Некорректный параметр type');
        }

        //data для eval-а
        $data = $item_params;
        $real_url = eval($url_maker).'.html';
        $data = $main_params;

        $data['params'] = Json::encode($item_params);

		$this->db->query('UPDATE ##url_redirects SET `old_url`=?s,`new_url`=?s WHERE `comment`=?i', [$main_params['item_url'], $real_url, $id]);
		$this->updateData($data, $id);
	}

	//метод создает пункт меню
	public function add(){
		$full_data = Json::decode(Request::post('data'));
		$data = $full_data['item_params'];
		$real_url = eval($this->db->getOne('SELECT `url_maker` FROM ##items_types WHERE `id`=?i LIMIT 1', [$full_data['main_params']['type']])).'.html';
		$full_data['main_params']['params'] = Json::encode($full_data['item_params']);
		$data = $full_data['main_params'];
		$id = parent::addData($data);
		$this->db->query("INSERT INTO ##url_redirects (`old_url`,`new_url`,`type`,`system`,`comment`) VALUES (?s,?s,'I',1,?i)", [$data['item_url'], $real_url, $id]);
		echo $id;
	}


	public function get_com_and_type_title(){
		$item_type = Request::get('item_type', true, Validator::INT);
		$res = $this->db->getRow('SELECT ##extensions.title,##items_types.title FROM ##extensions,##items_types WHERE ##items_types.id=?i AND ##extensions.id=##items_types.component_id LIMIT 1', $item_type);
		echo Json::encode($res);
	}


	public function deleteData($id_list){
		parent::deleteData($id_list);
		$this->db->query('DELETE FROM ##url_redirects WHERE `comment` IN(?a)', [$id_list]);
	}

}