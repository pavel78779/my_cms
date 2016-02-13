<?php
class SectionController{
	use Controller;

	public function helpers(){
		Load::controller(__DIR__.'/helpers/HelpersController.php', Request::get('action'));
	}
}