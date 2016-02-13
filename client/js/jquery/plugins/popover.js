(function($){
	jQuery.fn.popover = function(params){
		var $this = this,
			actions = {
				remove: function(){
					if($this.data('popover')) $this.data('popover').remove();
				},
				removeAll: function(){
					$('table.plugin-popover').remove();
				}
            };
		if(typeof params == 'string'){
			if(params in actions) actions[params]();
			return $this;
		}
		params = $.extend({
			html: '',
			background: 'black',
            type: 'warning'
		}, params);
        var types = {'warning': {
            'backgroundColor': 'rgb(255, 255, 186)',
            'borderColor': 'orange',
            icon: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAQCAYAAAAbBi9cAAAABGdBTUEAAK/INwWK6QAAAAlwSFlzAAAOwwAADsMBx2+oZAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAwhJREFUOE+VkntIk1EYxt9vc8tuWlnmBbKLRH/EiC7WwmZ2sbI2m2wFpcYsKrKo7GJ0J4r+sP/S0iAzahKWGnYv7EZlqMtW5maYQbWVjiUTs3J+39OrWzeKLg/8OOd7zvMezvnOS39SrZ7m29PJ8yyVbKen0ji2ZL6V/5AlkaJsabJHH8pD4C4I8j7UC6f2TKIwXhJ8iX9QjZGCH2sprzkn0is5D8DbsBFN2/u+vjqT0pZFUaA/9nfV6kjftEnmaKvNkGz1l/HCXoL3lxI6LenC2Xw1jeHI369Yr6dwe5pwve2axlt5Jw+pKTqsWmVE1aWNeJ093H1jHmWui6Ygf/z3qjOS0qqlvc7skNYuVwEulB+FRjMes2ZNQXHRTngqFknWlYp75hkUYySS+8t+1RMtqezL6cGHGq2Irpu4f78Q8fExSEqK5/kJiO6DcByO6Limo8yskRTsL/tZt+Io4ImBdrvODPGInhwAN2GzmTF37jSYTElobS0HxBJ0WBJRt07RkBdLk385FfhJny6khKZtyrqOZ0u5wMwblcHtLobBkIjMzFR8+lTE3klI7ZvgzI3Eg2TheLaKQrn8ezvwlYbaV1Pe+4sjP4sdWVxwmMntoaJiN4qK1vP8ELMfkLbC+2oSGncpXOcSaEnc13YoNpLclkJaR07vV53OeA52F23twevdgufP18Jq3QxRXMPeCiYF6JoDz91BeGQSarIn0ljeRkYWHUU0rBWueO6FS/DO5qCBMfZgtychI2M6X00DpzOBvZnMNCYGYtswvDkSIN6ZT7ncpAPo6WJKZaNdbIvkgIoZz0zooapKBZUqGmr1CDQ2jmZvFBPFcFYKxWeHEvYN9O6YmuZQw2qyfnypkCAN5kAYE+EL8tjeHobKylBUV4fwzx7IXjDTn+nDBPKjBKD1NkkP9VRN9enU/M4sh6u0L1xl/eE6H8QE+8bSIDSX9GP6oKU0EC0lvRglo0DLOTkjwJFPsCTTWzLHUexJDe0o0Aj7uinUyP34vr8R+yP0jfyptMMUTQu+AEV196lqsKauAAAAAElFTkSuQmCC')"
        }};

		//если popover уже есть у этого элемента - удаляем его
		$this.popover('remove');
		//создаем popover
		var $popover_block = $('<div class="jq-plugin-popover" style="opacity:0;position:absolute;border-spacing:0;border:0;margin:0;padding:0;white-space:nowrap;"></div>')
            .append('<div style="background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAICAYAAAA1BOUGAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAKRJREFUGFdjQAb/1RgY/00UE//TJxD/r1/gCFSYgeHfBCG+/xOEEv728x/9N0Hg6/8Jgv8Z/k1mYP/Xx2v+t0do+98JAp//TRD8B5IAS/7pF6gFCr4GCQLxfxgNlvzfz+/wt1fwNBD/humA6wSBT508In8mCGQCTbgEdMhPFEkQ+F/NwPyvT0TtzwT+MqCCy//6BX9DpRDgfw8D64+JvKp/+wT7AGuqY2JgvgOaAAAAAElFTkSuQmCC\') no-repeat right center;width:8px;position:absolute;height:100%;left:-8px;"></div>')
            .append('<div style="background:'+types[params.type].icon+' '+types[params.type].backgroundColor+' no-repeat 4px center;border: 1px solid '+types[params.type].borderColor+';padding:8px 8px 8px 31px;border-radius:3px;color:rgb(179, 76, 0);">'+params.html+'</div>')
			.prependTo($this.offsetParent());
        $popover_block.css({
			top: $this.position().top - $popover_block.outerHeight()/2 + $this.outerHeight()/2,
			left: $this.position().left + $this.outerWidth()
		})
			.stop().animate({left: '+=13', opacity: 1}, 100);
		$this.data('popover', $popover_block);
		return $this;
	};
})(jQuery);