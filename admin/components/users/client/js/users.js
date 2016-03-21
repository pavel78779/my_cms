CMS.component.register({
    name: 'users',
    sections: [
        {
            name: 'users',
            title: 'Пользователи',
            actions: {
                show: {
                    title: 'Все пользователи',
                    type: 'table',
                    params: {
                        changeOrdering: {disabled: true},
                        columns: [
                            {title:'Имя пользователя', type:'name', name:'name'},
                            {title:'Логин', name:'username'},
                            {title:'E-mail', name:'email'},
                            {title:'Дата регистрации', type:'date', name:'register_date'},
                            {title:'ID', type:'id', name:'id'}
                        ]
                    }
                },
                edit: {
                    title: 'Редактирование пользователя',
                    type: 'form',
                    params: {
                        fieldsets: [
                            {
                                title: 'Параметры пользователя',
                                fields: [
                                    {title:'Имя пользователя', type:'text', name:'name', required:'required'},
                                    {title:'Логин', type:'text', name:'username', required:'required'},
                                    {title:'E-mail', type:'text', name:'email', required:'required'},
                                    {title:'Пароль', type:'comUsersChangePasswordButton', text:'Изменить'}
                                ]
                            }
                        ]
                    }
                }
            }
        }
    ]
});
