<?php
$width = 170;
$height = 50;
//количество символов в капче
$count_chars = rand(4, 5);
$font = __DIR__.'/dolores_cyrillic_regular.ttf';
$chars = ['q','w','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','b','n','m','2','3','4','5','6','7','8','9'];

$img = imagecreatetruecolor($width, $height);
//заливка
imagefill($img, 0, 0, imagecolorallocate($img, rand(220, 255), rand(220, 255), rand(220, 255)));
//случайные буквы
$rand1 = rand(40, 80);
for($i = 0; $i < $rand1; $i++){
	imagettftext($img, rand(10, 25) , rand(0, 360), rand(0, $width), rand(0, $height), imagecolorallocate($img, rand(100,255), rand(100,255), rand(100,255)), $font, $chars[rand(0,count($chars)-1)]);
}
//рисуем линии
$rand = rand(25, 40);
for($i = 0; $i < $rand; $i++){
	$color = imagecolorallocate($img , rand(100, 255), rand(100, 255), rand(100, 255));
	imageline($img, rand(0, $width), rand(0, $height), rand(0, $width), rand(0, $height), $color);
}
//рисуем текст
$text = '';
$pos = 30;
for($i = 0; $i < $count_chars; $i++){
	$char = $chars[rand(0,count($chars)-1)];
	$text .= $char;
	$pos = imagettftext($img, rand(32, 35) , rand(-12, 12), $pos+rand(0,1), 34+rand(-2,2), imagecolorallocate($img, rand(0,80), rand(0,80), rand(0,80)), $font, $char)[2];
}
session_start();
$_SESSION['captcha'] = md5(md5($text));
session_write_close();
//выводим изображение
header('Content-type: image/jpeg');
imagejpeg($img);
imagedestroy($img);
exit;