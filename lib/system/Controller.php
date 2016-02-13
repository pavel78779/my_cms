<?php

trait Controller{
    protected $param;

    public function _run_($param=null){
        $this->param = $param;
        //���� �������� �� �������
        if(is_null($param)){
            //���� � ����������� ���������� ����� _absent_ - �������� ���
            if(method_exists($this, '_absent_')){
                $this->_absent_();
            }else{
                Router::set404();
            }
            return;
        }
        //���� � ����������� ���� �����, ������� ���� ������� � ����� ������
        if(method_exists($this, '_always_')){
            //���� �� ��������� false - ���������� ����������
            if($this->_always_() === false) return;
        }
        //���� �������� �������, �� �� ������
        if($param === ''){
            //���� � ����������� ���������� ����� _empty ��� ��������� ������� ��������� - �������� ���
            if(method_exists($this, '_empty_')){
                $this->_empty_();
            }else{
                Router::set404();
            }
        }
        //���� �������� ������� �� ������ � �� �� ���������� �� ����� _ � � ����������� ���������� ����� ��� ������ ���������
        elseif((mb_substr($param, 0, 1) !== '_') && method_exists($this, $param)){
            $rm = new ReflectionMethod($this, $param);
            //���� ���� ����� ���������
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