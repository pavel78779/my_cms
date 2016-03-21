CMS.component.register({
    name: 'config',
    sections: [
        {
            name: 'site_config',
            title: 'Конфигурация',
            actions: {
                edit: {
                    type: 'form',
                    title: 'Редактирование настроек',
                    onsuccess: 'Настройки сохранены',
                    params: {
                        fieldsets: [
                            {
                                title: 'Основные параметры',
                                fields: [
                                    {title:'Сайт отключен', type:'switch', name:'SITE_DISABLED', required:'required'},
                                    {title:'Название сайта', type:'text', name:'SITE_NAME', required:'required'},
                                    {title:'Отладка', type:'switch', name:'SITE_DEBUG', required:'required'},
                                    {title:'Ajax включен', type:'switch', name:'AJAX_ENABLED', required:'required'}
                                ]
                            },
                            {
                                title: 'База данных',
                                fields: [
                                    {title:'Хост', type:'text', name:'DB_HOST', required:'required'},
                                    {title:'Пользователь', type:'text', name:'DB_USER', required:'required'},
                                    {title:'Пароль', type:'text', name:'DB_PASS'},
                                    {title:'Имя базы данных', type:'text', name:'DB_NAME', required:'required'},
                                    {title:'Префикс таблиц', type:'text', name:'DB_TABLE_PREFIX', required:'required'}
                                ]
                            }
                        ]
                    }
                }
            }
        }
    ]
});
