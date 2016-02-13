//функция иниц. редактор
function init_editor(){
	//удаляем редактор
	try{tinyMCE.remove();}catch (e){}
	//инициализируем
	tinymce.init({
		selector: "textarea.editor",
		width: 600,
		height: 250,
        toolbar: 'undo redo | styleselect | bold italic | link image',
        plugins : 'link image lists preview autosave',
        relative_urls: false
	});
}