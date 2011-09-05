<?php 

session_start();

include 'lib/EpiCurl.php';
include 'lib/EpiOAuth.php';
include 'lib/EpiTwitter.php';
include 'lib/secret.php';

$twitterObj = new EpiTwitter($consumer_key, $consumer_secret);
$oauth_token = $_GET['oauth_token'];
	if($oauth_token == '')
  	  { 
	  	$url = $twitterObj->getAuthorizationUrl();
		echo 'Authenticating to Twitter...';
		echo "<script text=\"text/javascript\">window.location = '$url'; </script>";
     } 
	else
	{
		$twitterObj->setToken($_GET['oauth_token']);
		$token = $twitterObj->getAccessToken();
		$twitterObj->setToken($token->oauth_token, $token->oauth_token_secret);	  	
		$_SESSION['oauth_token'] = $token->oauth_token;
		$_SESSION['oauth_token_secret'] = $token->oauth_token_secret;
		// echo $_SESSION['ot'];
		// echo $_SESSION['ots'];
		// echo 'connected';
		// echo '$token->oauth_token'.$token->oauth_token;
		// echo '<br>';
		// print_r($token);
		header('Location:http://www.logoslogic.com/chat/LivingRoom/southpark/index.php#buzz');
		// echo "<pre>200 OK</pre>";
     } 


?> 