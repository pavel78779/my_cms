<?=$data['text_before_form']?>
<form class="com_feedback" method="post" action="<?=SConfig::SITE_MAIN_URI?>feedback/form/<?=$data['id']?>/submit.html">
	<table>
		<?php foreach($fields as $field): ?>
		<tr>
			<td class="name">
				<label for="<?=$field['id']?>"><?=$field['name']?><?php if($field['required']): ?><sup class="required">*</sup><?php endif; ?>
				</label>
			</td>
			<td class="field">
				<?php
                $attributes = 'name="'.$field['id'].'" id="'.$field['id'].'" ';
                if($field['required']) $attributes .= 'data-required="required" ';
                if($field['pattern']) $attributes .= 'data-pattern="'.htmlspecialchars($field['pattern']).'" ';
                if($field['invalid_description']) $attributes .= 'data-invalid_description="'.htmlspecialchars($field['invalid_description']).'" ';
				switch($field['type']){
					case 'text':
						echo '<input type="text" '.$attributes.'/>';
						break;
					case 'textarea':
						echo '<textarea '.$attributes.'"></textarea>';
						break;
					case 'select':
						echo '<select '.$attributes.'">';
						if($field['select_options']){
                            $i = 0;
							foreach(explode("\n", $field['select_options']) as $option){
								echo '<option value="'.$i.'">'.htmlspecialchars($option).'</option>';
                                $i++;
							}
						}
						echo '</select>';
						break;
					case 'checkbox':
						echo '<input type="checkbox" value="1" '.$attributes.'/>';
						break;
				}
				?>
			</td>
		</tr>
		<?php endforeach; ?>
		<?php if($data['enable_captcha']): ?>
			<tr>
				<td class="name">
					<label for="_captcha_">Введите символы<sup class="required">*</sup></label>
				</td>
				<td>
					<table class="captcha">
						<tr>
							<td rowspan="2">
								<img src="<?=SConfig::SITE_MAIN_URI?>feedback/captcha.html?<?=rand(0,999999999)?>" width="170" height="50"/>
							</td>
							<td>
								<a class="no_ajax" href="javascript:void(0)">Обновить</a>
							</td>
						</tr>
						<tr>
							<td>
								<input data-required="required" name="_captcha_" type="text" id="_captcha_" autocomplete="off" />
							</td>
						</tr>
					</table>
				</td>
			</tr>
		<?php endif; ?>
		<tr class="buttons">
			<td colspan="2">
				<input type="submit" value="Отправить" class="button">
			</td>
		</tr>
	</table>
</form>
