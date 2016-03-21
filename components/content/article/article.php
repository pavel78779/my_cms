<?php
//отображаем статью
$article_id = Request::getUrlSegment(2, true, Validator::INT);
$article = (new Db())->getRow('SELECT `name`,`content` FROM ##content_articles WHERE `id`=?i', $article_id, MYSQLI_ASSOC);
if(!$article){
    Router::set404();
}
Document::setTitle($article['name']);
Load::view(__DIR__.'/view.php', [
    'data' => $article,
    'params' => Request::getItemParams()['params']
]);