<!DOCTYPE html>
<html>
<head lang="ru">
	<meta charset="UTF-8" />
	<script type="text/javascript" src="<?= SConfig::SITE_MAIN_URI ?>client/js/jquery/jquery-1.11.3.min.js"></script>
	<script>
		$(document).ready(function(){
			$('form').on('submit', function(){
				var username = $('#username').val(),
					password = $('#password').val(),
					$status = $('.status');
				if(username==='' || password===''){
					$status.html('Пустой логин или пароль');
				}else{
					$status.removeClass('error success').html('Загрузка...');
					$.post('<?=SConfig::SITE_MAIN_URI ?>admin/index.php?com=users&action=login', {username:username, password:password})
						.done(function(){
							$status.addClass('success').html('Вход выполнен успешно');
							location.reload();
						})
						.fail(function(xhr){
							$status.addClass('error').html(xhr.responseText);
						});
				}
				return false;
			});
		});
	</script>
	<title>Вход в админку</title>
	<style>
		body, h1{
			margin: 0;
			padding: 0;
			font-size: 16px;
		}
		html{
			height: 100%;
		}
		body{
			display: table;
			height: 95%;
			width: 100%;
		}
		.outer{
			display: table-cell;
			width: 100%;
			height: 100%;
			vertical-align: middle;
			text-align: center;
		}
		.login_block{
			border: 2px solid #acabc8;
			display: inline-block;
			padding: 25px;
			color: rgb(54, 56, 97);
			background: rgb(242, 243, 244);
			text-align: center;
		}
		h1{
			font-size: 22px;
			color: #956538;
		}
		table{
			border: 0;
			color: #000000;
			margin: 9px auto;
		}
		.status{
			margin: 10px 0 -27px 0;
			min-height: 25px;
			color: #956538;
		}
		.error{
			color: red;
		}
		.success{
			color: #008000;
		}

	</style>
</head>
<body>
<div class="outer">
	<div class="login_block">
		<h1>Вход в админку</h1>
		<form method="post">
			<table>
				<tr>
					<td><label for="username">Логин</label></td>
					<td><input type="text" name="username" id="username" autofocus="autofocus" /></td>
				</tr>
				<tr>
					<td><label for="password">Пароль</label></td>
					<td><input type="password" name="password" id="password" /></td>
				</tr>
			</table>
			<input type="submit" value="Войти" />
		</form>
		<div class="status"></div>
	</div>
</div>
</body>
</html>