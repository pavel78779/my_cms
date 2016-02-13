//скрипт отвечает за создание всплывающих подсказок у элементов с атрибутом data-tooltip
$(document).ready(function(){
	$('body').on('mouseenter', '[data-tooltip]', function(e){
		var self = $(this);
		var div_tooltip;
		var tooltip_text = $(this).attr('data-tooltip');
		if(tooltip_text == '') return;
		if($('body>div.system-tooltip').length){
			div_tooltip = $('body>div.system-tooltip');
		}
		else{
			div_tooltip = $('<div class="system-tooltip" />').css({
				position: 'absolute',
				zIndex: 9999999,
				top: e.pageY+6,
				left: e.pageX+6,
				border: '1px solid rgb(100, 100, 100)',
				borderRadius: '5px',
				padding: '4px',
				background: 'black',
				color: 'white',
				opacity: 0.75
			});
		}
		div_tooltip.html(tooltip_text).prependTo('body');
		//обработчик перемещения курсора
		self.on('mousemove', function(e){
			div_tooltip.css({top: e.pageY+6, left: e.pageX+6});
		});

		//обработчик ухода курсора с элемента
		self.on('mouseleave', function(){
			div_tooltip.remove();
			self.off('mouseleave mousemove');
		});
	});
});