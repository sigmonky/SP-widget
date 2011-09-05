<?php

require_once 'twitter.class.php';

// ENTER HERE YOUR CREDENTIALS (see readme.txt)
$consumerKey = 'oKUhWQf1CK1VRaaCgRSw';
$consumerSecret = 'KDdgkDU6U4c7ttVdlrJ10E8k5cdTsmIkkl5RHt640';
$accessToken = '110661452-zxiiSQAkgFUGYkG1kiq5ohk6rrzUBP0Tpg4IGs1m';
$accessTokenSecret = 'XacZJJmNc095dOXCuXCwR6HXbPDfUkC8RmQdxvQ';

$twitter = new Twitter($consumerKey, $consumerSecret, $accessToken, $accessTokenSecret);

$msg = $_REQUEST['tweet'];

$status = $twitter->send($msg);

echo $status ? 'OK' : 'ERROR';
