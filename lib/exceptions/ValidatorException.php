<?php
class ValidatorException extends  Exception{
	public function getError(){
		return $this->getMessage();
	}
}