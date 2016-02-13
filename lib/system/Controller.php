<?php

trait Controller{
    protected $param;

    public function _run_($param=null){
        $this->param = $param;
        //если параметр не передан
        if(is_null($param)){
            //если в контроллере существует метод _absent_ - вызываем его
            if(method_exists($this, '_absent_')){
                $this->_absent_();
            }else{
                Router::set404();
            }
            return;
        }
        //если в контроллере есть метод, который надо выздать в любом случае
        if(method_exists($this, '_always_')){
            //если он возвратил false - прекращаем выполнение
            if($this->_always_() === false) return;
        }
        //если параметр передан, но он пустой
        if($param === ''){
            //если в контроллере существует метод _empty для обработки пустого параметра - вызываем его
            if(method_exists($this, '_empty_')){
                $this->_empty_();
            }else{
                Router::set404();
            }
        }
        //если параметр передан не пустой и он не начинается со знака _ и в контроллере существует метод для такого параметра
        elseif((mb_substr($param, 0, 1) !== '_') && method_exists($this, $param)){
            $rm = new ReflectionMethod($this, $param);
            //если этот метод публичный
            if($rm->isPublic()){
                $this->$param();
            }else{
                Router::set404();
            }
        }
        else{
            Router::set404();
        }
    }
}