<!DOCTYPE html>
<html>
<head lang="ru">
	<meta charset="UTF-8">
	<base href="<?= SConfig::SITE_MAIN_URI.'templates/'.SConfig::SITE_TEMPLATE.'/' ?>">
	<script src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery/jquery-1.11.3.min.js" type="text/javascript"></script>
	<script src="<?=SConfig::SITE_MAIN_URI?>client/js/site_config.js" type="text/javascript"></script>
	<script src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery/polyfills.js" type="text/javascript"></script>
	<script src="<?=SConfig::SITE_MAIN_URI?>client/js/serializeObject.js" type="text/javascript"></script>

	<script src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery/plugins/popover.js" type="text/javascript"></script>
	<?= $header ?>
	<link rel="stylesheet" href="style.css" type="text/css">
</head>
<body>
<div class="main-page">
	<div class="main-header">
		<div class="site-name"><?= SConfig::SITE_NAME ?></div>
		<div class="header-gradient"></div>
		<div class="header-image"></div>
	</div>
	<div data-include="module" data-position="top_menu" class="top-menu">
		<?= $modules['top_menu'] ?>
	</div>
	<div class="content-outer">
		<div data-include="module" data-position="left_column" class="left-column">
			<?= $modules['left_column'] ?>
		</div>
		<div data-include="content" class="content">
			<?= $content ?>
		</div>
		<div class="clr"></div>
	</div>
	<div data-include="module" data-position="footer" class="footer">
		<?= $modules['footer'] ?>
	</div>
</div>
<div data-include="debug" class="system-debug">
	<?= $debug ?>
</div>
</body>
</html>