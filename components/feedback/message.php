<table>
	<?php foreach($data as $name=>$value): ?>
		<tr>
			<td><?=htmlspecialchars($name)?></td>
			<td style="padding: 10px"><?=htmlspecialchars($value)?></td>
		</tr>
	<?php endforeach; ?>
</table>