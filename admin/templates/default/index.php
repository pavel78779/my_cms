<?php $user = $_SESSION['user'] ?>
<!DOCTYPE html>
<html>
	<head>

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Главная страница - панель управления</title>
		<link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>admin/templates/default/css/style.css">
		<script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery/jquery-1.11.3.min.js"></script>

		<!-- подключаем ядро -->
		<?php Load::js(SITE_ROOT.'/client/js', SConfig::SITE_MAIN_URI.'client/js/') ?>

		<!--  подключаем скрипты шаблона -->
		<?php Load::js(ADMIN_ROOT.'/templates/'.SConfig::ADMIN_TEMPLATE.'/js', SConfig::SITE_MAIN_URI.'admin/templates/'.SConfig::ADMIN_TEMPLATE.'/js/') ?>

		<!-- Подключаем редактор -->
		<script type="text/javascript" src="<?php echo SConfig::SITE_MAIN_URI ?>client/js/tinymce/tinymce.min.js"></script>


		<!-- подключаем плагины JQuery -->
		<script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/popup/popup.js"></script>
		<link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/popup/popup.css">

        <script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/popover/popover.js"></script>
        <link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/popover/popover.css">

		<script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/tooltip/tooltip.js"></script>
        <link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/tooltip/tooltip.css">

        <script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/tabs_menu/tabs_menu.js"></script>
        <link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/tabs_menu/tabs_menu.css">

        <script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/serialize_form/serialize_form.js"></script>

		<script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/table/table.js"></script>
		<link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/table/table.css">

		<script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/notice/notice.js"></script>
		<link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/notice/notice.css">

		<script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/control_buttons/control_buttons.js"></script>
		<link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/control_buttons/control_buttons.css">

        <script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/menu/menu.js"></script>
        <link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/menu/menu.css">

        <script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/form/form.js"></script>
        <link rel="stylesheet" type="text/css" href="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/form/form.css">

        <script type="text/javascript" src="<?=SConfig::SITE_MAIN_URI?>client/js/jquery_plugins/form_elements/form_elements.js"></script>
	</head>
	<body>
		<div class="system-outer">
			<div class="system-logo">"<?=SConfig::SITE_NAME?>" - панель управления</div>
			<div class="system-user-block">
				Вы вошли как <span class="username"><?=$user['username']?></span>
				<a class="logout" href="#">Выйти</a>
			</div>
			<div class="system-main-menu"></div>
            <script language="JavaScript">
                $('.system-main-menu').menu({
                    items: [
                        {text: 'Настройки', href: '#!component/config'},
                        {text: 'Материалы', href: '#!component/content'},
                        {text: 'Пользователи', href: '#!component/users'},
                        {text: 'Компоненты', subitems: [
                            <?php
                            $skip_com = ['_system_', 'modules_manager', 'extensions_manager', 'content'];
                            foreach((new Db())->getAll("SELECT `name`,`title` FROM ##extensions WHERE `enabled`=1 AND `type`='component'") as $com){
                                if(!in_array($com[0], $skip_com)){
                                    ?>
                                    {text: '<?= $com[1] ?>', href: '#!component/<?= $com[0] ?>'},
                                    <?php
                                }
                            }
                            ?>
                        ]},
                        {text: 'Расширения', subitems: [
                            {text: 'Модули', href: '#!component/modules_manager'},
                            'separator',
                            {text: 'Управление расширениями', href: '#!component/extensions_manager'}
                        ]}
                    ]
                });
            </script>
			<div class="system-content-outer">
				<div class="system-welcome">Добро пожаловать, <?=$user['name']?>.</div>
			</div>
		</div>
    <div id="test"></div>
    <script>
        $('#test').form({fieldsets: [
            {title: 'Фс1', name: 'fsssss', fields: [
                {title: 'Поле1', type: 'text', name: 'pole1', pattern: '/^[a-z]+$/', onclick: function(e){
                    console.warn(this);
                }},
                {title: 'Поле2', type: 'select', name: 'poleselect', options: [
                    {title: 'Опт1', value: 'opt1'},
                    {title: 'ОПТ2', value: 'OPT2'}
                ], onchange: function(){
                    console.log($(this).val());
                }}
            ]},
            {title: 'Доп параметры', fields:[
                {title: 'доппм1', name: 'dop1', type: 'select', optionsFromUrl: 'admin/index.php?com=content&section=articles&action=get&fields=name,id'},
                {title: 'доппарам2', name: 'dop2', type: 'editor'}
            ]}
        ], defaultValues: {
            pole1: 'Свинья',
            dop2: 'редакотрор',
            dop1: '64'
        }});
    </script>
	</body>
</html>