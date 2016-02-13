<?php
abstract class HierarchyDbManager extends DbManager{


	public function __construct($db_table){
		parent::setGrouping('parent');
		parent::__construct($db_table);
	}


	//при удалении категории нужно удалить и всех ее детей
	protected function deleteData($id_arr){
        function find_children($id, $db){
            //получаем детей категории
            $children = $db->getCol('SELECT `id` FROM # WHERE `parent`=?i', $id);
            $child_id = $children;
            foreach($children as $child){
                $child_id = array_merge($child_id, find_children($child, $db));
            }
            return $child_id;
        }
        $deleted_id = [];
        foreach($id_arr as $id){
            $deleted_id[] = $id;
            $deleted_id = array_merge($deleted_id, find_children($id, $this->db));
        }
        $deleted_id = array_unique($deleted_id);
        parent::deleteData($deleted_id);
        //изменяем категорию на "Без категории" у элемнтов из удаленных категорий
        //$this->db->query('UPDATE ##content_articles SET `category`=0 WHERE `category` IN(?a)', [$deleted_id]);
	}
}