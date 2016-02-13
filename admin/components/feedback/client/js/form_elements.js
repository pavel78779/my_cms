FormElements.comFeedbackFieldForSubjectOrSender = function(param){
    var $element = $('<select />');
    $element.on('element_inserted', function(){
        var id = $(this).parents('form.system-options-form').attr('data-id');
        param = JSON.parse(JSON.stringify(param));
        if(id !== undefined){
            param.options = {from_url: 'admin/index.php?com=feedback&section=fields&action=get&fields=name,id&filter='+encodeURIComponent(JSON.stringify({'form_id':id}))};
        }else{
            param.options = [];
        }
        $element.replaceWith(FormElements.select(param));
    });
    return $element;
};