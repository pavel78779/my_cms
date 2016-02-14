<?php $user = $_SESSION['user'] ?>
<!DOCTYPE html>
<html>
	<head>

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Главная страница - панель управления</title>
		<link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>admin/templates/default/css/style.css">
		<script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery/jquery-1.11.3.min.js"></script>
        <!-- подключаем Jquery UI -->
        <script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery/jquery-ui-1.11.4.custom/jquery-ui.min.js"></script>
        <link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery/jquery-ui-1.11.4.custom/jquery-ui.min.css">

        <script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery/plugins/popover.js"></script>

		<!-- подключаем ядро -->
		<?php Load::js(SITE_ROOT.'/client/js', SConfig::SITE_MAIN_URI.'client/js/') ?>

		<!--  подключаем скрипты шаблона -->
		<?php Load::js(ADMIN_ROOT.'/templates/'.SConfig::ADMIN_TEMPLATE.'/js', SConfig::SITE_MAIN_URI.'admin/templates/'.SConfig::ADMIN_TEMPLATE.'/js/') ?>

		<!-- Подключаем редактор -->
		<script type="text/javascript" src="<?php echo SConfig::SITE_MAIN_URI ?>client/js/tinymce/tinymce.min.js"></script>


		<!-- подключаем плагины JQuery -->
		<script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/popup.js"></script>
	</head>
	<body>
		<div class="system-outer">
			<div class="system-logo">"<?=SConfig::SITE_NAME?>" - панель управления</div>
			<div class="system-user-block">
				Вы вошли как <span class="username"><?=$user['username']?></span>
				<a class="logout" href="#">Выйти</a>
			</div>
			<div class="system-main-menu">
				<a class="item" href="#!component/config">Настройки</a>
				<a class="item" href="#!component/content">Материалы</a>
                <a class="item" href="#!component/users">Пользователи</a>
				<div class="item" data-dropdown-menu="components">Компоненты<div class="arrow-down"></div></div>
				<div class="system-dropdown-menu components" style="display:none;">
					<?php
					$skip_com = ['_system_', 'modules_manager', 'extensions_manager', 'content'];
					foreach((new Db())->getAll("SELECT `name`,`title` FROM ##extensions WHERE `enabled`=1 AND `type`='component'") as $com){
						if(!in_array($com[0], $skip_com)) echo '<a class="item" href="#!component/'.$com[0].'">'.$com[1].'</a>';
					}
					?>
				</div>
				<div class="item" data-dropdown-menu="extensions">Расширения<div class="arrow-down"></div></div>
				<div class="system-dropdown-menu extensions" style="display:none;">
					<a class="item" href="#!component/modules_manager">Модули</a>
					<!-- <div class="item" data-com="plugins_manager">Плагины</div> -->
					<div class="separator"></div>
					<a class="item" href="#!component/extensions_manager">Управление расширениями</a>
				</div>
				<div class="clr"></div>
			</div>
			<div class="system-content-outer">
				<div class="system-welcome">Добро пожаловать, <?=$user['name']?>.</div>
			</div>
		</div>
	</body>
</html>