CMS.component.register({
    name: 'content',
    sections: [
        {
            title: 'Статьи',
            name: 'articles',
            actions: {
                show: {
                    type: 'table',
                    title: 'Управление статьями',
                    params: {
                        changeOrdering: {groupBy: 'category'},
                        columns: [
                            {title: 'Порядок', type: 'ordering', name: 'ordering'},
                            {title: 'Название', type: 'name', name: 'name'},
                            {title: 'Опубликовано', type: 'switch', name: 'published'},
                            {title: 'Дата создания', type: 'date', name: 'creation_date'},
                            {title: 'Категория', name: 'category', replaced: 'url:admin/index.php?com=content&section=categories&action=get&fields=id,name'},
                            {title: 'ID', type: 'id', name: 'id'}
                        ]
                    }
                },
                'new': {
                    type: 'form',
                    title: 'Создание новой статьи',
                    params: {
                        fieldsets: [
                            {
                                title: 'Параметры статьи',
                                fields: [
                                    {title: 'Название', type: 'text', name: 'name', required: 'required', tooltip: 'название статьи'},
                                    {title: 'Опубликовано', type: 'switch', name: 'published', required: 'required'},
                                    {title: 'Категория', type: 'hierarchySelect', name: 'category', options: [{value: '0', title: 'БЕЗ КАТЕГОРИИ'}], optionsFromUrl: 'admin/index.php?com=content&section=categories&action=get&fields=id,name,parent', required: 'required'},
                                    {title: 'Текст статьи', type: 'editor', name: 'content'}
                                ]
                            }
                        ]
                    }
                },
                edit: {
                    title: 'Редактирование статьи',
                    type: 'form'
                },
                'delete': {
                    confirm: 'Вы действительно хотите безвозвратно удалить выбранные статьи?'
                }
            }
        },
        {
            title: 'Категории',
            name: 'categories',
            actions: {
                show: {
                    type: 'hierarchyTable',
                    title: 'Управление категориями',
                    params: {
                        columns: [
                            {title: 'Порядок', type: 'ordering', name: 'ordering'},
                            {title: 'Название', type: 'name', name: 'name'},
                            {title: 'Опубликовано', type: 'switch', name: 'published'},
                            {title: 'Родитель', name: 'parent'},
                            {title: 'ID', type: 'id', name: 'id'}
                        ]
                    }
                },
                'new': {
                    type: 'form',
                    title: 'Создание новой категории',
                    params: {
                        fieldsets: [
                            {
                                title: 'Параметры категории',
                                fields: [
                                    {title: 'Название', type: 'text', name: 'name', required: 'required'},
                                    {title: 'Опубликовано', type: 'switch', name: 'published', required: 'required'},
                                    {title: 'Родительская категория', type: 'hierarchySelectForParent', name: 'parent', options: [{value: '0', title: 'ВЕРХНИЙ УРОВЕНЬ'}], optionsFromUrl: 'admin/index.php?com=content&section=categories&action=get&fields=id,name,parent', required: 'required'},
                                    {title: 'Описание категории', type: 'editor', name: 'description'}
                                ]
                            }
                        ]
                    }
                },
                edit: {
                    type: 'form',
                    title: 'Редактирование категории'
                },
                'delete': {
                    confirm: 'При удалении категории удалятся и все ее вложенные категории. Продолжить?'
                }
            }
        }
    ]
});
