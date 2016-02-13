<?php
class SiteConfigManager extends ConfigFileManager{

	public function __construct(){
		parent::__construct(SITE_ROOT.'/config.php', 'SConfig');
	}

}