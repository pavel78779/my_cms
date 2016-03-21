CMS.component.register({
    name: 'feedback',
    sections: [
        {
            name: 'forms',
            title: 'Формы',
            actions: {
                show: {
                    title: 'Все формы',
                    type: 'table',
                    params: {
                        changeOrdering: {disabled: true},
                        columns: [
                            {title:'Название', type:'name', name:'name'},
                            {title:'ID', type:'id', name:'id'}
                        ]
                    }
                },
                'new': {
                    title: 'Создание новой формы',
                    type: 'form',
                    params: {
                        fieldsets: [
                            {
                                title: 'Параметры формы',
                                fields: [
                                    {title:'Имя формы', type:'text', name:'name', required:'required'},
                                    {title:'E-mail получателя', type:'text', name:'addressee_email', required:'required', tooltip:'E-mail, на который будут <br />приходить письма с формы', pattern:/^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/, invalid_description:'Некорректный E-mail'},
                                    {title:'Капча включена', type:'switch', name:'enable_captcha'},
                                    {title:'Поле для темы письма', type:'comFeedbackFieldForSubjectOrSender', name:'field_for_subject'},
                                    {title:'Поле для отправителя', type:'comFeedbackFieldForSubjectOrSender', name:'field_for_sender'},
                                    {title:'Текст перед формой', type:'editor', name:'text_before_form'}
                                ]
                            }
                        ]
                    }
                },
                edit: {
                    title: 'Редактирование формы',
                    type: 'form'
                },
                'delete': {
                    confirm: 'При удалении формы удалятся и все ее поля. Удалить?'
                }
            }
        },
        {
            name: 'fields',
            title: 'Поля форм',
            actions: {
                show: {
                    title: 'Поля форм',
                    type: 'table',
                    params: {
                        changeOrdering: {groupBy: 'form_id'},
                        columns: [
                            {title:'Порядок', type:'ordering', name:'ordering'},
                            {title:'Имя', type:'name', name:'name'},
                            {title:'Опубликовано', type:'switch', name:'published'},
                            {title:'Обязательное', type:'switch', name:'required'},
                            {title:'Форма', name:'form_id', replaced:'url:admin/index.php?com=feedback&section=forms&action=get&fields=id,name'},
                            {title:'Тип', name:'type', replaced:'textarea:Текстовая область, text:Текстовое поле, checkbox:Чекбокс, select:Список выбора'},
                            {title:'ID', type:'id', name:'id'}
                        ]
                    }
                },
                'new': {
                    title: 'Создание нового поля',
                    type: 'form',
                    params: {
                        fieldsets: [
                            {
                                title: 'Параметры поля',
                                fields: [
                                    {title:'Имя поля', type:'text', name:'name', required:'required'},
                                    {title:'Форма', type:'select', name:'form_id', required:'required', optionsFromUrl: 'admin/index.php?com=feedback&section=forms&action=get&fields=name,id'},
                                    {title:'Опубликовано', type:'switch', name:'published', required:'required'},
                                    {title:'Обязательное', type:'switch', name:'required', required:'required'},
                                    {title:'Тип', type:'select', name:'type', required:'required', options: [
                                        {title:'текстовое поле', value:'text'},
                                        {title:'текстовая область', value:'textarea'},
                                        {title:'чекбокс', value:'checkbox'},
                                        {title:'список выбора', value:'select'}
                                    ], 'onform_load change': function(){
                                        var $options_field = $(this).parents('fieldset').eq(0).find('[name=select_options]').parents('tr').eq(0);
                                        if($(this).val() === 'select'){
                                            $options_field.css('display', '');
                                        }else{
                                            $options_field.css('display', 'none');
                                        }
                                    }},
                                    {title:'Опции для<br />списка выбора', tooltip:'каждый с новой строки', name:'select_options', type:'textarea', rows: '5'},
                                    {title:'Подсказка', type:'text', name:'tooltip'},
                                    {title:'Шаблон', type:'text', name:'pattern', tooltip: 'Регулярное выражение.<br />Пример: <code>/^[a-z]+$/i</code>'},
                                    {title:'Некорр. описание', type:'text', name:'invalid_description'}
                                ]
                            }
                        ]
                    }
                },
                edit: {
                    title: 'Редактирование поля',
                    type: 'form'
                },
                'delete': {
                    confirm: 'Вы действительно хотите удалить выбранные поля?'
                }
            }
        }
    ]
});
