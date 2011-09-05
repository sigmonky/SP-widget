<?php 

session_start();

include 'lib/EpiCurl.php';
include 'lib/EpiOAuth.php';
include 'lib/EpiTwitter.php';
include 'lib/secret.php';

	if(isset($_SESSION['oauth_token'])){
		$twitterObj = new EpiTwitter($consumer_key, $consumer_secret);
		$msg = $_REQUEST['tweet'];
		$twitterObj->setToken($_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);
		//echo '1 - '.$_SESSION['ot'];
		//echo '2 -'.$_SESSION['ots'];
		// $twitterInfo= $twitterObj->get_accountVerify_credentials();
		// $twitterInfo->response;
		//$username = $twitterInfo->screen_name;
		$update_status = $twitterObj->post_statusesUpdate(array('status' => $msg));
		$temp = $update_status->response;
		// header('Cache-Control: no-cache, must-revalidate');
		// 	  	header('Expires: Mon, 26 Jul 2222 05:00:00 GMT');
	  	header('Content-type: application/json');
		echo "{\"status\": \"posted\"}";
	
	}
	else{
		// header('Cache-Control: no-cache, must-revalidate');
		// header('Expires: Mon, 26 Jul 2222 05:00:00 GMT');
	  	header('Content-type: application/json');
		echo "{\"status\": \"not_connected\"}";
	}
?> 