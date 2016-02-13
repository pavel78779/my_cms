<div class="module <?=$data['module_type']?>">
    <?php if($data['show_header']): ?>
        <div class="header"><?=$data['name']?></div>
    <?php endif; ?>
    <div class="body">
        <?=$module_output?>
    </div>
</div>