<?php
class UsersManager extends DbManager{
    public function __construct(){
        parent::__construct('users');
        parent::setFieldsOptions([
            'password' => ['', false]
        ]);
    }

    //метод меняет пароль у заданного пользователя
    public function change_password(){
        $id = Request::post('id', true, Validator::INT);
        $old_password = Request::post('old_password');
        $new_password = Request::post('new_password');

        $db = Db::connect()->setTable('users');
        $user = $db->getRow('SELECT `password`,`id` FROM # WHERE `id`=?i LIMIT 1', $id, MYSQLI_ASSOC);
        if(!$user || !password_verify($old_password, $user['password']) || ($user['id'] !== $id)){
            throw new ValidatorException('Неверное имя пользователя или пароль');
        }else{
            $db->query('UPDATE # SET `password`=?s WHERE `id`=?i', [password_hash($new_password, PASSWORD_DEFAULT), $id]);
        }
    }

}