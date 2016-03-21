$.formElements.comUsersChangePasswordButton = function(params, $form){
    var $button = $.formElements.button(params);
    $button.on('click', function(){
        var form_data = {
            fieldsets: [
                {
                    fields:[
                        {name: 'old_password', required: 'required', title: 'Старый пароль', type: 'text'},
                        {name: 'new_password', required: 'required', title: 'Новый пароль', type: 'text'},
                        {name: 'repeat_password', required: 'required', title: 'Повторите пароль', type: 'text'}
                    ]
                }
            ]
        };

        var $form_div = $('<div />');
        var $status = $('<div class="status" style="text-align:center" />').prependTo($form_div);
        $form_div.form(form_data);
        var popup = $form_div.popup({
            title: 'Изменение пароля',
            buttons:{
                'Ok': function(){
                    var data = $form_div.serializeForm();
                    if(data){
                        var $repeat_password = $form_div.find('input[name="repeat_password"]').popover('remove');
                        if(data.new_password !== data.repeat_password){
                            $repeat_password.popover({html:'Пароли не совпадают'})
                                .off('focus').on('focus', function(){
                                    $(this).popover('remove');
                                });
                        }else{
                            $status.css('color', '').html('Загрузка...');
                            $.post(SITE.MAIN_URL+'admin/index.php?com=users&section=users&action=change_password', {
                                    id: $form.attr('data-id'),
                                    old_password: data.old_password,
                                    new_password: data.new_password
                                })
                                .done(function(){
                                    popup.close();
                                    $('<div>Пароль успешно изменен</div>').popup({buttons:{'Ok':'close'}, showHeader:false});
                                })
                                .fail(function(){
                                    $status.css('color', 'red').html('Ошибка при изменении пароля');
                                });
                        }
                    }
                },
                'Отмена': 'close'
            }
        });
    });
    return $button;
};