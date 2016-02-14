<?php

trait Controller{

    public function _run_($param=null){
        if(is_null($param)){
            if(method_exists($this, '_absent_')){
                $this->_absent_();
            }else{
                Router::set404();
            }
            return;
        }
        if(method_exists($this, '_always_')){
            if($this->_always_() === false) return;
        }
        if($param === ''){
            if(method_exists($this, '_empty_')){
                $this->_empty_();
            }else{
                Router::set404();
            }
        }
        elseif((mb_substr($param, 0, 1) !== '_') && method_exists($this, $param)){
            $rm = new ReflectionMethod($this, $param);
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