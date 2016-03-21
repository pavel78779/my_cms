<?php $user = $_SESSION['user'] ?>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Главная страница - панель управления</title>
		<link rel="stylesheet" type="text/css" href="templates/default/css/style.css">
        <!-- подключаем jquery -->
		<script type="text/javascript" src="../client/js/jquery/jquery-1.11.3.min.js"></script>
		<!-- подключаем ядро -->
		<?php Load::js(SITE_ROOT.'/client/js', '../client/js/') ?>
		<!--  подключаем скрипты шаблона -->
		<?php Load::js(ADMIN_ROOT.'/templates/'.SConfig::ADMIN_TEMPLATE.'/js', 'templates/'.SConfig::ADMIN_TEMPLATE.'/js/') ?>
		<!-- Подключаем редактор -->
		<script type="text/javascript" src="../client/js/tinymce/tinymce.min.js"></script>
		<!-- подключаем плагины JQuery -->
        <?php foreach(FileSys::getDirs(SITE_ROOT.'/client/js/jquery_plugins') as $plugin): ?>
            <script type="text/javascript" src="../client/js/jquery_plugins/<?=$plugin?>/<?=$plugin?>.js"></script>
            <?php if(is_readable(SITE_ROOT.'/client/js/jquery_plugins/'.$plugin.'/'.$plugin.'.css')): ?>
                <link rel="stylesheet" type="text/css" href="../client/js/jquery_plugins/<?=$plugin?>/<?=$plugin?>.css">
            <?php endif; ?>
        <?php endforeach; ?>
	</head>
	<body>
		<div class="system-outer">
			<div class="system-logo">"<?=SConfig::SITE_NAME?>" - панель управления</div>
			<div class="system-user-block">
				Вы вошли как <span class="username"><?=$user['username']?></span>
				<a class="logout" href="#">Выйти</a>
			</div>
            <script language="JavaScript">
                //обработчик на ссылку "Выйти"
                $('.system-user-block .logout').on('click', function(){
                    $.get('index.php?com=users&action=logout')
                        .always(function(){
                            location.reload();
                        });
                    return false;
                });
            </script>
			<div class="system-main-menu"></div>
            <script language="JavaScript">
                //создаем меню
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
			<div class="system-content-outer"></div>
		</div>
	</body>
</html>