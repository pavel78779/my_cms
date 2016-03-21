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

	//метод получает данные параметров одного типа пункта меню
	public function get_item_params(){
		echo $this->db->getOne('SELECT `params` FROM ##items_types WHERE `id`=?i LIMIT 1', Request::get('item_type', true, Validator::INT));
	}

	public function update(){
        $data = Json::decode(Request::post('data'));
        $id = Request::post('id', true, Validator::INT);
		if(isset($data['item_params'])){
            if(!isset($data['type'])){
                throw new ValidatorException('Не передан параметр type');
            }
            Validator::int($data['type']);
            $url_maker = $this->db->getOne('SELECT `url_maker` FROM ##items_types WHERE `id`=?i LIMIT 1', [$data['type']]);
            if(!$url_maker){
                throw new ValidatorException('Некорректный параметр type');
            }
            $real_url = eval($url_maker).'.html';
            $data['params'] = Json::encode($data['item_params']);
            $this->db->query('UPDATE ##url_redirects SET `old_url`=?s,`new_url`=?s WHERE `comment`=?i', [$data['item_url'], $real_url, $id]);
            unset($data['item_params']);
        }
        $this->_update($data, $id);
	}


	//метод создает пункт меню
	public function add(){
		$data = Json::decode(Request::post('data'));
        if(empty($data['type'])){
            throw new ValidatorException('Параметр "type" не передан или пустой');
        }
		$real_url = eval($this->db->getOne('SELECT `url_maker` FROM ##items_types WHERE `id`=?i LIMIT 1', [$data['type']])).'.html';
		$data['params'] = Json::encode($data['item_params']);
        unset($data['item_params']);
		$id = parent::_add($data);
		$this->db->query("INSERT INTO ##url_redirects (`old_url`,`new_url`,`type`,`system`,`comment`) VALUES (?s,?s,'I',1,?i)", [$data['item_url'], $real_url, $id]);
		echo $id;
	}


	public function get_com_and_type_title(){
		$item_type = Request::get('item_type', true, Validator::INT);
		$res = $this->db->getRow('SELECT ##extensions.title,##items_types.title FROM ##extensions,##items_types WHERE ##items_types.id=?i AND ##extensions.id=##items_types.component_id LIMIT 1', $item_type);
		echo Json::encode($res);
	}


	public function _delete($id_list){
		parent::_delete($id_list);
		$this->db->query('DELETE FROM ##url_redirects WHERE `comment` IN(?a)', [$id_list]);
	}

}