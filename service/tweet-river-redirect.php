<?php

  $since_id = $_GET['since_id'];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  // curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_URL, 'http://tweetriver.com/camilarc/south-park-test.json?reverse=1&since_id='.$since_id);
  $result = curl_exec($ch);
  header('Cache-Control: no-cache, must-revalidate');
  header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
  header('Content-type: application/json');
  echo $result;

?>