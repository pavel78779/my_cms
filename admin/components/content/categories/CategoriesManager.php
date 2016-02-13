<?php

class CategoriesManager extends HierarchyDbManager{

	public function __construct(){
		parent::__construct('content_categories');
	}
}