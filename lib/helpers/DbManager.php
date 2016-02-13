<?php
//класс для управления контентом (в базе данных)
class DbManager extends ContentManager{
    protected $db;
    protected $orderGrouping;
    protected $fieldOptions = [
        'id' => ['r'],
        'ordering' => ['r'],
        'creation_date' => ['r']
    ];

    //конструктор принимает имя таблицы БД
    protected function __construct($db_table){
        $this->db = Db::connect()->setTable($db_table);
        //сохраняем имена всех столбцов таблицы в бд
        $fields = [];
        $columns = $this->db->getAll('SHOW COLUMNS FROM #', null, MYSQLI_ASSOC);
        foreach($columns as $column){
            $fields[] = $column['Field'];
        }
        parent::__construct($fields);
    }

    //метод задает поле БД по которому будет группироваться порядок
    protected function setGrouping($field){
        $this->fieldOptions[$field] = ['rw', true];
        $this->orderGrouping = $field;
    }

    //метод получает данные из бд
    protected function getData($fields, $filter=[], $id=null){
        if($id !== null){
            $filter = array_merge($filter, ['id'=>$id]);
        }
        $conditions = [];
        foreach($filter as $key=>$value){
            $conditions[] = $this->db->parse('?n=?s', [$key, $value]);
        }
        $where = '';
        if($conditions){
            $where = 'WHERE '.implode(' AND ', $conditions).' ';
        }
        $order = [];
        if($this->orderGrouping){
            $order[] = $this->orderGrouping;
        }
        if(in_array('ordering', $this->fields)){
            $order[] = 'ordering';
        }
        $order = $order? 'ORDER BY '.implode(',', $order): '';
        return $this->db->getAll('SELECT ?an FROM # '.$where.$order, [$fields]);
    }


    //метод удаляет данные
    protected function deleteData($id_arr){
        if(in_array('ordering', $this->fields) && $this->orderGrouping){
            $gr_field_values = $this->db->getCol('SELECT DISTINCT ?n FROM # WHERE id IN(?a)', [$this->orderGrouping, $id_arr]);
        }
        $this->db->query('DELETE FROM # WHERE id IN(?a)', [$id_arr]);
        $deleted_rows = $this->db->getMysqli()->affected_rows;
        //обновляем порядок
        if(in_array('ordering', $this->fields)){
            if(isset($gr_field_values)){
                $this->refreshOrdering($gr_field_values);
            }else{
                $this->refreshOrdering();
            }
        }
        return $deleted_rows;
    }



    //метод добавляет новый элемент
    protected function addData($data){
        $auto_fields = [];
        if(in_array('creation_date', $this->fields)){
            $auto_fields['creation_date'] =	date("Y-m-d");
        }
        if(in_array('ordering', $this->fields)){
            $where = '';
            if($this->orderGrouping){
                $where = $this->db->parse(' WHERE ?n=?s', [$this->orderGrouping, $data[$this->orderGrouping]]);
            }
            $auto_fields['ordering'] = $this->db->getOne('SELECT MAX(`ordering`) FROM #'.$where) + 1;
        }
        $data = array_merge($data, $auto_fields);
        $this->db->query('INSERT INTO # (?an) VALUES (?a)', [array_keys($data), array_values($data)]);
        return $this->db->getMysqli()->insert_id;
    }



    //метод изменяет данные
    protected function updateData($data, $id){
        if(in_array('ordering', $this->fields) && $this->orderGrouping){
            //обновляем порядок
            $old_value = $this->db->getOne('SELECT ?n FROM # WHERE `id`=?i', [$this->orderGrouping, $id]);
            $this->db->query('UPDATE # SET ?u WHERE id=?i', [$data, $id]);
            $affected_rows = $this->db->getMysqli()->affected_rows;
            $new_value = $this->db->getOne('SELECT ?n FROM # WHERE `id`=?i', [$this->orderGrouping, $id]);
            if($old_value !== $new_value){
                $this->refreshOrdering([$old_value, $new_value]);
            }
        }else{
            $this->db->query('UPDATE # SET ?u WHERE id=?i', [$data, $id]);
            $affected_rows = $this->db->getMysqli()->affected_rows;
        }
        return $affected_rows;
    }



    protected function changeOrdering($id, $new_order){
        if(!in_array('ordering', $this->fields)){
            throw new ValidatorException('Изменение порядка невозможно');
        }
        $current_place = $this->db->getOne('SELECT `ordering` FROM # WHERE `id`=?i', $id);
        if(!$current_place){
            throw new ValidatorException('Элемента с заданным id не существует');
        }
        if($current_place === $new_order) return;
        $gr = '';
        $where = '';
        if($this->orderGrouping){
            $gr_value = $this->db->getOne('SELECT ?n FROM # WHERE `id`=?i', [$this->orderGrouping, $id]);
            $gr = $this->db->parse(' AND ?n=?s', [$this->orderGrouping, $gr_value]);
            $where = $this->db->parse(' WHERE ?n=?s', [$this->orderGrouping, $gr_value]);
        }
        //проверяем, не больше ли максимального значения новое значение порядка
        $max_order = $this->db->getOne('SELECT MAX(`ordering`) FROM #'.$where);
        if($new_order > $max_order){
            throw new ValidatorException('Значение порядка больше максимального');
        }

        //если перемещаем вверх
        if($current_place > $new_order){
            $query = 'UPDATE # SET `ordering`=`ordering`+1 WHERE `ordering`>=?i AND `ordering`<?i';
        }
        //если вниз
        else{
            $query = 'UPDATE # SET `ordering`=`ordering`-1 WHERE `ordering`<=?i AND `ordering`>?i';
        }
        $this->db->query($query.$gr, [$new_order, $current_place]);
        $this->db->query('UPDATE # SET `ordering`=?i WHERE `id`=?i', [$new_order, $id]);
    }


    //вспомогательная функция - обновляет значения порядка
    protected function refreshOrdering($gr_field_values=null){
        if($gr_field_values === null){
            $this->db->query('SET @i=0');
            $this->db->query('UPDATE # SET ordering=(@i:=@i+1) ORDER BY `ordering`');
        }else{
            foreach($gr_field_values as $value){
                $this->db->query('SET @i=0');
                $this->db->query('UPDATE # SET ordering=(@i:=@i+1) WHERE ?n=?s ORDER BY `ordering`', [$this->orderGrouping, $value]);
            }
        }
    }
}