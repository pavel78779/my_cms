<?php
class ArticlesManager extends DbManager{
	public function __construct(){
		parent::setGrouping('category');
		parent::__construct('content_articles');
		parent::setFieldsOptions([
			'name' => ['rw', true],
            'published' => ['rw', true, '/^[01]$/'],
            'category' => ['rw', true, '/^[0-9]+$/']
		]);
	}

}