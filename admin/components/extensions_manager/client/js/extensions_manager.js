CMS.component.register({
    name: 'extensions_manager',
    sections: [
        {
            name: 'extensions',
            title: 'Все расширения',
            actions: {
                show: {
                    title: 'Управление расширениями',
                    type: 'table',
                    params: {
                        changeOrdering: {disabled: true},
                        markCheckboxes: {disabled: true},
                        columns: [
                            {title:'Название', name:'title', type:'name'},
                            {title:'Включено', type:'switch', name:'enabled'},
                            {title:'Тип', name:'type', replaced:'component:Компонент, module:Модуль, plugin:Плагин, template:Шаблон'},
                            {title:'Версия', name:'version'},
                            {title:'Дата создания', name:'creation_date', type:'date'},
                            {title:'Описание', name:'description'},
                            {title:'Автор', name:'author'},
                            {title:'ID', type:'id', name:'id'}
                        ]
                    }
                }
            }
        }
    ]
});