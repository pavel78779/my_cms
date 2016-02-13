<?php
class FormsManager extends DbManager{

	public function __construct(){
		parent::__construct('feedback_forms');
	}

	//при удалении формы удаляем и все ее поля
	protected function deleteData($id_arr){
		parent::deleteData($id_arr);
		$this->db->query('DELETE FROM ##feedback_fields WHERE `form_id` IN(?a)', [$id_arr]);
	}

}