<?php
//класс для работы с базой данных
class Db{
    static private $mysqli;
    static private $stats;
    private $table;

    function __construct(){
        if(!self::$mysqli){
            self::$mysqli = @new mysqli(SConfig::DB_HOST, SConfig::DB_USER, SConfig::DB_PASS, SConfig::DB_NAME);
            if(mysqli_connect_errno()){
                $this->error(mysqli_connect_errno().' '.mysqli_connect_error());
            }
            if(!self::$mysqli->set_charset('utf8')){
                $this->error(self::$mysqli->error);
            }
        }
    }

	public function getMysqli(){
		return self::$mysqli;
	}

    public function setTable($table){
        $this->table = SConfig::DB_TABLE_PREFIX.$table;
        return $this;
    }

    //метод выполняет запрос
    public function query($query, $values=[]){
        $query = $this->parse($query, $values);
        $start = microtime(TRUE);
        $res   = self::$mysqli->query($query);
        self::$stats[] = [
            'query' => $query,
            'timer' => microtime(TRUE) - $start,
        ];
        //если ошибка при запросе
        if(!$res){
            $this->error(self::$mysqli->error.' Запрос: ['.$query.']');
        }
        return $res;
    }

    //возвращает первый элемент первой строки результата запроса
    public function getOne($query, $values=[]){
        $res = $this->query($query, $values);
        $row = $res->fetch_row();
        $res->free();
        if(is_array($row)){
            return $row[0];
        }
        else{
            return null;
        }
    }

    //возвращает одну строку - одномерный массив
    public function getRow($query, $values=[], $res_type=MYSQLI_NUM){
        $res = $this->query($query, $values);
        $row = $res->fetch_array($res_type);
        $res->free();
        return $row;
    }

    //возвращает одну колонку из бд
    public function getCol($query, $values=[]){
        $res_arr = [];
        $res = $this->query($query, $values);
        while($row = $res->fetch_row()){
            $res_arr[] = $row[0];
        }
        $res->free();
        return $res_arr;
    }

    //возвращает все записи в виде двумерного массива
    public function getAll($query, $values=[], $res_type=MYSQLI_NUM){
        return $this->query($query, $values)->fetch_all($res_type);
    }

    //метод обрабатывает строку запроса, подставляя значения плэйсхолдеров и имя таблицы
    public function parse($query, $values=[]){
        $query = str_replace('##', SConfig::DB_TABLE_PREFIX, $query);
        $query = str_replace('#', $this->table, $query);
        //если передан не массив значений, а одно значение - делаем его массивом
        if(!is_array($values)) $values = [$values];
        $placeholders = [
            '?n' => 'escapeIdent',
            '?s' => 'escapeString',
            '?i' => 'escapeInt',
            '?a' => 'createIN',
            '?u' => 'createSET',
            '?p' => 'escapeParsed',
            '?an'=> 'escapeArrNames'
        ];
        $i = -1;
        return preg_replace_callback('/\?[a-z]+/u', function($match) use (&$i, $values, $placeholders){
            $i++;
            if(!isset($values[$i])) $this->error('Количество значений не равно количеству плэйсхолдеров');
            if(isset($placeholders[$match[0]])){
                $method = $placeholders[$match[0]];
                return $this->$method($values[$i]);
            }else{
                $this->error('Некорректный плэйсхолдер '.$match[0]);
            }

        }, $query);
    }

    static public function getStats(){
        return self::$stats;
    }

    private function escapeParsed($data){
        return $data;
    }

	private function escapeArrNames($data){
		if(!is_array($data)){
			$this->error("Значение для ?an плэйсхолдера должно быть массивом");
		}
		$data = array_map(function($el){
            return $this->escapeIdent($el);
        }, $data);
        return implode(',', $data);
	}

    private function escapeInt($value){
        if($value === null){
            return 'NULL';
        }
        elseif(is_numeric($value)){
            return (int)$value;
        }
        else{
            $this->error('Значение для ?i плэйсхолдера должно быть числом. '.gettype($value).' передано');
        }
    }

    private function escapeString($value){
        if($value === null){
            return 'NULL';
        }
        return	"'".self::$mysqli->real_escape_string($value)."'";
    }

    private function escapeIdent($value){
        if($value){
            return '`'.str_replace('`', '``', $value).'`';
        }else{
            $this->error('Значение для плэйсхолдера ?n не должно быть пустым');
        }
    }

    private function createIN($data){
        if(!is_array($data)){
            $this->error('Значение для плэйсхолдера ?a должно быть массивом');
        }
        if(!$data){
            return 'NULL';
        }
        $data = array_map(function($el){
            return $this->escapeString($el);
        }, $data);
        return implode(',', $data);
    }

    private function createSET($data){
        if(!is_array($data)){
            $this->error('Значение плэйсхолдера ?u должно быть массивом, а передано '.gettype($data));
        }
        if(!$data){
            $this->error('Массив для плэйсхолдера ?u не должен быть пустым');
        }
        $query = $comma = '';
        foreach ($data as $key=>$value){
            $query .= $comma.$this->escapeIdent($key).'='.$this->escapeString($value);
            $comma  = ',';
        }
        return $query;
    }

    private function error($err){
        throw new SystemException(__CLASS__.': '.$err);
    }
}