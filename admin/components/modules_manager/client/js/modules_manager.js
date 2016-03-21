CMS.component.register({
    name: 'modules_manager',
    sections: [
        {
            name: 'modules',
            title: 'Модули',
            actions: {
                show: {
                    title: 'Управление модулями',
                    type: 'table',
                    params: {
                        changeOrdering: {groupBy: 'position'},
                        columns: [
                            {title:'Порядок', type:'ordering', name:'ordering'},
                            {title:'Название модуля', type:'name', name:'name'},
                            {title:'Позиция', name:'position'},
                            {title:'Опубликовано', type:'switch', name:'published'},
                            {title:'Отображать заголовок', type:'switch', name:'show_header'},
                            {title:'Страницы', name:'assignment_type', replaced:'all:Все, except:Кроме выбранных, on:Выбранные'},
                            {title:'Тип модуля', name:'module_type'},
                            {title:'ID', type:'id', name:'id'}
                        ]
                    }
                },
                'new': {
                    title: 'Создание модуля',
                    type: 'form',
                    saveFunc: modulesManagerSaveModule,
                    params: {
                        fieldsets: [
                            {
                                name: 'main_params',
                                title: 'Основные параметры',
                                fields: [
                                    {title:'Имя модуля', type:'text', name:'name', required:'required'},
                                    {title:'Отображать заголовок', type:'switch', name:'show_header', required:'required'},
                                    {title:'Опубликовано', type:'switch', name:'published', required:'required'},
                                    {title:'Страницы', type:'select', name:'assignment_type', required:'required', tooltip:'На каких страницах<br />будет отображаться модуль', options: [
                                        {title: 'все', value: 'all'},
                                        {title: 'выбранные', value: 'on'},
                                        {title: 'кроме выбранных', value: 'except'}
                                    ], 'onform_load change': function(){
                                        var $select_pages = $(this).parents('fieldset').eq(0).find('[name=assignment_urls]').parents('tr').eq(0);
                                        if($(this).val() === 'all'){
                                            $select_pages.css('display', 'none');
                                        }else{
                                            $select_pages.css('display', '');
                                        }
                                    }},
                                    {title:'Выберите страницы', type:'modulesManagerSelectPagesButton', name:'assignment_urls'},
                                    {title:'Позиция', type:'select', name:'position', required:'required', optionsFromUrl: 'admin/index.php?com=modules_manager&section=modules&action=get_modules_positions'},
                                    {title:'Тип модуля', type:'modulesManagerSelectModuleTypeButton', name:'module_type', required:'required'},
                                    {title:'', type:'hidden', name:'params'}
                                ]
                            },
                            {
                                name: 'module_params',
                                title: 'Параметры модуля',
                                fields: [
                                    {title:'Выберите тип модуля', type:'normalText', text:''}
                                ]
                            }
                        ]
                    }
                },
                edit: {
                    title: 'Редактирование модуля',
                    type: 'form',
                    saveFunc: modulesManagerSaveModule
                },
                'delete': {
                    confirm: 'Вы действительно хотите безвозвратно<br />удалить выбранные модули?'
                }
            }
        },
        {
            name: 'menu_items',
            title: 'Пункты меню',
            actions: {
                show: {
                    title: 'Управление пунктами меню',
                    type: 'table',
                    params: {
                        changeOrdering: {groupBy: 'menu_id'},
                        columns: [
                            {title:'Порядок', type:'ordering', name:'ordering'},
                            {title:'Имя', type:'name', name:'name'},
                            {title:'Опубликовано', type:'switch', name:'published'},
                            {title:'Меню', name:'menu_id', replaced:'url:admin/index.php?com=modules_manager&section=modules&action=get&fields=id,name&filter=%7B%22module_type%22%3A%22menu%22%7D'},
                            {title:'Тип пункта', name:'type', replaced:'url:admin/index.php?com=modules_manager&section=menu_items&action=get_types'},
                            {title:'URL', name:'item_url'},
                            {title:'ID', type:'id', name:'id'}
                        ]
                    }
                },
                'new': {
                    title: 'Создание пункта меню',
                    type: 'form',
                    params: {
                        fieldsets: [
                            {
                                title: 'Параметры пункта меню',
                                fields: [
                                    {title:'Имя', type:'text', name:'name', required:'required'},
                                    {title:'Опубликовано', type:'switch', name:'published', required:'required'},
                                    {title:'Меню', type:'select', name:'menu_id', required:'required', optionsFromUrl: 'admin/index.php?com=modules_manager&section=modules&action=get&fields=name,id&filter=%7B%22module_type%22%3A%22menu%22%7D'},
                                    {title:'URL', type:'text', name:'item_url', required:'required', pattern:/^\/((([a-z0-9\-_]+\/)+)?[a-z0-9\-_]+\.html)?$/, invalid_description:'Неверный формат url<br />образец: <b>/test/page.html</b>'},
                                    {title:'Тип', type: 'modulesManagerMenuItemsSelectItemTypeButton', name:'type', required:'required'},
                                    {title: '', type:'hidden', name:'params'}
                                ]
                            },
                            {
                                title: 'META-теги',
                                fields: [
                                    {title:'Robots', type:'textarea', name:'meta_robots'},
                                    {title:'Description', type:'textarea', name:'meta_description'},
                                    {title:'Keywords', type:'textarea', name:'meta_keywords'},
                                ]
                            },
                            {
                                title: 'Параметры пункта меню',
                                name: 'item_params',
                                fields: [
                                    {title:'Выберите тип пункта меню', type:'normalText'}
                                ]
                            }
                        ]
                    }
                },
                edit: {
                    title: 'Редактирование пункта меню',
                    type: 'form',
                },
                'delete': {
                    confirm: 'Вы действительно хотите безвозвратно удалить<br />отмеченные пункты меню?'
                }
            }
        }
    ]
});
