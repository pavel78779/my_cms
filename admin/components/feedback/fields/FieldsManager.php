<?php
class FieldsManager extends DbManager{
	public function __construct(){
		parent::setGrouping('form_id');
		parent::__construct('feedback_fields');
	}
}