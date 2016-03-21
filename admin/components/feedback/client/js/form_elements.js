$.formElements.comFeedbackFieldForSubjectOrSender = function(param, $form){
    var $element = $('<select />');
    $form.on('form_load', function(){
        setTimeout(function(){
            var id = $form.attr('data-id');
            if(id){
                param = $.extend({optionsFromUrl:'admin/index.php?com=feedback&section=fields&action=get&fields=name,id&filter='+encodeURIComponent(JSON.stringify({'form_id':id}))}, param);
            }else{
                param = $.extend({options:[]}, param);
            }
            $element.replaceWith($.formElements.select(param));
        },0);
    });
    return $element;
};