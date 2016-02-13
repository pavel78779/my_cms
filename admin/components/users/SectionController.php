<?php
class SectionController{
	use Controller;

	//авторизация и выход пользователя
	public function _absent_(){
		switch(Request::get('action')){
			case 'login':
                $username = Request::post('username', true, Validator::STRICT_STRING);
                $password = Request::post('password');
                $user = Db::connect()->getRow('SELECT * FROM ##users WHERE `username`=?s LIMIT 1', $username, MYSQLI_ASSOC);
                if(!$user || (crypt($password, $user['password']) !== $user['password']) || ($user['username'] !== $username)){
                    throw new ValidatorException('Неверное имя пользователя или пароль');
                }
                session_regenerate_id(true);
                $_SESSION['user'] = $user;
				break;
			case 'logout':
                $_SESSION = [];
                session_destroy();
                setcookie('PHPSESSID', '', time() - 3600);
				break;
			default:
				Router::set404();
		}
	}

    public function users(){
        Load::manager(__DIR__.'/users/UsersManager.php');
    }
}