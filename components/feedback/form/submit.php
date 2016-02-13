<?php
$data = [];
$errors = [];
$sender = '';
$subject = '';

foreach($fields as $field){
    if(!isset($_POST[$field['id']]) || trim($_POST[$field['id']]) === ''){
        //проверяем заполнение обязательного поля
        if($field['required']){
            $errors[] = 'Не заполнено обязательное поле <b>'.$field['name'].'</b>';
            continue;
        }
    }else{
        //проверяем на pattern
        if(($field['pattern'] !== null) && ($field['pattern'] !== '')){
            if(!preg_match($field['pattern'], $_POST[$field['id']])){
                $errors[] = $field['invalid_description']?: 'Поле <b>'.$field['name'].'</b> заполнено некорректно';
                continue;
            }
        }
    }

    switch($field['type']){
        case 'checkbox':
            $data[$field['name']] = isset($_POST[$field['id']])? 'Да': 'Нет';
            break;
        case 'select':
            $options = explode("\n", $field['select_options']);
            if(isset($_POST[$field['id']]) && (trim($_POST[$field['id']]) !== '')){
                if(preg_match('/^[0-9]+$/', $_POST[$field['id']]) && ($_POST[$field['id']] < count($options))){
                    $data[$field['name']] = $options[$_POST[$field['id']]];
                }else{
                    $errors[] = 'Поле '.$field['name'].' заполнено некорректно';
                }
            }else{
                $data[$field['name']] = '';
            }
            break;
        default:
            $data[$field['name']] = isset($_POST[$field['id']])? $_POST[$field['id']]: '';
    }

    if(($field['id'] === $form_data['field_for_subject'])){
        $subject = $data[$field['name']];
    }
    if(($field['id'] === $form_data['field_for_sender'])){
        $sender = $data[$field['name']];
    }
}

//проверяем капчу
if($form_data['enable_captcha']){
    session_start();
    if(!(isset($_POST['_captcha_']) && isset($_SESSION['captcha']) && md5(md5($_POST['_captcha_'])) === $_SESSION['captcha'])){
        $errors[] = 'Неверно введены <b>символы с картинки</b>';
    }
    if(isset($_SESSION['captcha'])){
        unset($_SESSION['captcha']);
    }
}
//если ошибок нет
if(!$errors){
    //отправляем письмо
    $headers  = 'MIME-Version: 1.0'."\r\n";
    $headers .= 'Content-type: text/html; charset=utf-8'."\r\n";
    $headers .= 'From: '.$sender."\r\n";
    $headers .= 'Reply-To: '.$sender."\r\n";
    //генерируем тело письма
    ob_start();
    FileSys::includeFile(SITE_ROOT.'/components/feedback/message.php', ['data'=>$data]);
    $message = ob_get_clean();
    if($subject === '') $subject = 'Без темы';
    if(!mail($form_data['addressee_email'], '=?UTF-8?B?'.base64_encode($subject).'?=', $message, $headers)){
        $errors[] = 'Ошибка при отправке письма';
    }
}

if(isset($_POST['_ajax_mode_'])){
    if($errors){
        throw new ValidatorException(implode('<br />', $errors));
    }else{
        echo 'Сообщение успешно отправлено';
    }
    exit;
}else{
    session_start();
    if($errors){
        $_SESSION['feedback_send_status'] = ['error', implode('<br />', $errors)];
    }else{
        $_SESSION['feedback_send_status'] = ['success', 'Сообщение успешно отправлено!!'];
    }
    //переадресовываем на страницу с формой
    header('Location: '.SConfig::SITE_MAIN_URI.'feedback/form/'.$form_data['id'].'.html');
    exit;
}