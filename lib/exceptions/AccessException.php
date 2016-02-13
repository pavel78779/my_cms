<?php
class AccessException extends Exception{
	public function getError(){
		return 'Ошибка доступа';
	}
}