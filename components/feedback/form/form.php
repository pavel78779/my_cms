<?php
$form_id = Request::getUrlSegment(2, true, Validator::INT);
$form_data = (new Db())->getRow('SELECT * FROM `##feedback_forms` WHERE `id`=?i', $form_id, MYSQLI_ASSOC);
if(!$form_data){
    Router::set404();
}
$fields = (new Db())->getAll('SELECT * FROM `##feedback_fields` WHERE `form_id`=?i AND `published`=1 ORDER BY `ordering`', $form_data['id'], MYSQLI_ASSOC);
if(Request::getUrlSegment(3, false) === 'submit'){
    Load::file(__DIR__.'/submit.php',[
        'form_data' => $form_data,
        'fields' => $fields
    ]);
}else{
    //отображаем форму
    Document::addCss(SConfig::SITE_MAIN_URI.'components/feedback/client/style.css');
    Document::addJs(SConfig::SITE_MAIN_URI.'components/feedback/client/script.js');
    Document::setTitle($form_data['name']);
    session_start();
    if(isset($_SESSION['feedback_send_status'])){
        echo '<div class="system-notice '.$_SESSION['feedback_send_status'][0].'">'.$_SESSION['feedback_send_status'][1].'</div>';
        unset($_SESSION['feedback_send_status']);
    }
    session_write_close();
    Load::view(__DIR__.'/view.php', [
        'data' => $form_data,
        'fields' => $fields,
        'params' => Request::getItemParams()
    ]);
}