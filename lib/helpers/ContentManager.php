<?php
abstract class ContentManager{
    use Controller;

    protected $fields = [];
    protected $fieldOptions = [];

    protected function __construct($fields){
        $this->fields = $fields;
    }

    //метод задает параметры полей таблицы БД
    protected function setFieldsOptions($options){
        $this->fieldOptions = array_merge($this->fieldOptions, $options);
    }

    public function get(){
        if(!is_callable([$this, 'getData'])){
            Router::set404();
        }
        $fields = explode(',', Request::get('fields', true, Validator::STRICT_STRING_COMMAS));
        $id = Request::get('id', false, Validator::INT);
        $filter = Request::get('filter', false, null);
        if($filter !== null){
            $filter = Json::decode($filter);
            if(!$filter){
                throw new ValidatorException('Некорректный параметр filter');
            }
            foreach($filter as $key=>$value){
                Validator::strictString($key, 'Некорректный ключ для фильтра');
                if(!in_array($key, $this->fields)){
                    throw new ValidatorException('Поля для фильтра с именем "'.$key.'" не существует в таблице базы данных');
                }
            }
        }else{
            $filter = [];
        }
        foreach($fields as $field){
            if(!in_array($field, $this->fields)){
                throw new ValidatorException('Поля с именем "'.$field.'" не существует в таблице базы данных');
            }
            if(isset($this->fieldOptions[$field])){
                if(strripos($this->fieldOptions[$field][0], 'r') === false){
                    throw new ValidatorException('Поле "'.$field.'" недоступно для чтения');
                }
            }
        }
        echo Json::encode($this->getData($fields, $filter, $id));
    }

    public function delete(){
        if(!is_callable([$this, 'deleteData'])){
            Router::set404();
        }
        $id_list = Json::decode(Request::post('id_list'));
        if(!$id_list){
            throw new ValidatorException(__METHOD__.': некорректный список ID');
        }
        foreach($id_list as $value){
            Validator::int($value, 'ID должен быть числом');
        }
        echo $this->deleteData($id_list);
    }


    public function add(){
        if(!is_callable([$this, 'addData'])){
            Router::set404();
        }
        $data = Json::decode(Request::post('data'));
        if(!$data){
            throw new ValidatorException(__METHOD__.': некорректный параметр data');
        }
        //проверяем, все ли обязательные поля заполнены
        foreach($this->fieldOptions as $field=>$options){
            if(!empty($options[1]) && !isset($data[$field])){
                throw new ValidatorException('Обязательное поле "'.$field.'" не заполнено');
            }
        }
        $this->validateDataForSave($data);
        echo $this->addData($data);
    }


    public function update(){
        if(!is_callable([$this, 'updateData'])){
            Router::set404();
        }
        $data = Json::decode(Request::post('data'));
        $id = Request::post('id', true, Validator::INT);
        if(!$data){
            throw new ValidatorException('Некорректный параметр data');
        }
        //проверка данных
        $this->validateDataForSave($data);
        echo $this->updateData($data, $id);
    }


    public function change_ordering(){
        if(!is_callable([$this, 'changeOrdering'])){
            Router::set404();
        }
        $id = Request::post('id', true, Validator::INT);
        $new_order = Request::post('new_order', true, Validator::INT);
        if($new_order <= 0){
            throw new ValidatorException('Новое значение порядка должно быть больше нуля');
        }
        $this->changeOrdering($id, $new_order);
    }


    private function validateDataForSave($data){
        foreach($data as $key=>$value){
            Validator::strictString($key, 'Некорректное имя поля "'.$key.'"');
            //поверка поля на наличие его в таблице базы данных
            if(!in_array($key, $this->fields)){
                throw new ValidatorException('Поля "'.$key.'" нет в таблице базы данных');
            }
            if(isset($this->fieldOptions[$key])){
                //проверка, доступно ли поле для записи
                if(isset($this->fieldOptions[$key][0]) && (strripos($this->fieldOptions[$key][0], 'w') === false)){
                    throw new ValidatorException('Поле "'.$key.'" недоступно для записи');
                }
                //проверка на заполненение обязательного поля
                if(!empty($this->fieldOptions[$key][1]) && ($value === '')){
                    throw new ValidatorException('Обязательное поле "'.$key.'" не заполнено');
                }
                //проверка на соответсвие регулярному выражению
                if(isset($this->fieldOptions[$key][2]) && !preg_match($this->fieldOptions[$key][2], $value)){
                    throw new ValidatorException('Поле "'.$key.'" заполнено некорректно');
                }
            }
        }
    }
}