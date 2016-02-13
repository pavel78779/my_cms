<?php
$items = Db::connect()->getAll('SELECT `name`,`item_url` FROM ##menu_items WHERE `menu_id`=?i AND `published`=1 ORDER BY `ordering`', $data['id'], MYSQLI_ASSOC);
Load::view(__DIR__.'/view.php', [
    'items' => $items,
    'params' => $params
]);