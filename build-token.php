<?php

use unscalable\vinylpad\TokenBuilder;

date_default_timezone_set('America/Toronto');
require_once 'vendor/autoload.php';

try{
    $config = json_decode(file_get_contents('config.json', true), true);
    if($config===null){
        throw new Exception("Invalid config.json");
    }
    $builder=new TokenBuilder(
        teamId: $config['team-id'],
        keyId: $config['key-id'],
        webAddress: $config['web-address'],
        keyFile: realpath(dirname(__FILE__)).'/'.$config['key-file'],
    );
    $token=$builder->build();
    //echo $token;
    //echo TokenBuilder::parse($token);
    file_put_contents(realpath(dirname(__FILE__)).'/www/token.json', $token);
}
catch(Exception $e){
    echo $e->getMessage();
    echo $e->getTraceAsString();
}

