<ul class="items">
    <?php foreach($items as $item): ?>
        <li<?= (Request::getOriginalUrl()===$item['item_url'])? ' class="active"':''; ?>>
            <a href="<?=$item['item_url']?>"><?=$item['name']?></a>
        </li>
    <?php endforeach; ?>
</ul>