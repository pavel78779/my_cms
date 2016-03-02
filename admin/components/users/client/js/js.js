FormElements.comUsersChangePasswordButton = function(params){
    var $button = FormElements.button(params);
    $button.on('click', function(){
        var form_data = {
            fieldset: {
                field: [
                    {
                        name: 'old_password',
                        required: 'required',
                        title: 'Старый пароль',
                        type: 'text'
                    },
                    {
                        name: 'new_password',
                        required: 'required',
                        title: 'Новый пароль',
                        type: 'text'
                    },
                    {
                        name: 'repeat_password',
                        required: 'required',
                        title: 'Повторите пароль',
                        type: 'text'
                    }
                ]
            }
        };

        var $popup_content = $(new ContentForm(form_data).getResult()),
            $popup = $popup_content.popup({
                title: 'Изменение пароля',
                buttons:{
                    'Ok': function(){
                        var data = $popup_content.serializeForm();
                        if(data){
                            var $repeat_password = $popup_content.find('input[name="repeat_password"]').popover('remove');
                            if(data.new_password !== data.repeat_password){
                                $repeat_password.popover({html:'Пароли не совпадают'})
                                    .off('focus').on('focus', function(){
                                        $(this).popover('remove');
                                    });
                            }else{
                                $popup_content.css('visibility', 'hidden');
                                $status.css('color', '').html('Загрузка...');
                                $.post(SITE.MAIN_URL+'admin/index.php?com=users&section=users&action=change_password', {
                                    id: $button.parents('form').eq(0).attr('data-id'),
                                    old_password: data.old_password,
                                    new_password: data.new_password
                                })
                                    .done(function(){
                                        $popup.close();
                                        $('<div>Пароль успешно изменен</div>').popup({buttons:{'Ok':'close'}, showHeader:false});
                                    })
                                    .fail(function(){
                                        $status.css('color', 'red').html('Ошибка при изменении пароля');
                                        $popup_content.css('visibility', 'visible');
                                    });
                            }
                        }
                    },
                    'Отмена': 'close'
                }
            });
        var $status = $('<div class="status" style="text-align:center" />').insertBefore($popup_content);
        $popup_content.find('fieldset').css({whiteSpace:'nowrap', border:0});
    });
    return $button;
};