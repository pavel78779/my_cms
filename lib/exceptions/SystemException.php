<?php
class SystemException extends  Exception{
    public function getError(){
        return $this->getMessage().' в файле '.$this->getFile().' в строке '.$this->getLine();
    }
}