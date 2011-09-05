<?php

/**
 * Start XMPP User Obj based on Facebook User ID
 * Creates XMPP user
 * Creates a XMPP session attachment
 *
 * @param String Facebook user ID
 */

class User {

    public $curl = null;
    public $facebook_token = null;
    public $facebook_id = null;
    public $facebook_name = null;
	public $password = null;
	public $sessionInfo = null;
	private $firePhp = null;
	public $roomJid = null;
	
	private function debug($msg, $label = null) {
		if ($this->firePhp) {
			$this->firePhp->log($msg, $label);
		}
	}
	
    public function __construct($facebook_id = NULL) {
        $this->curl = curl_init();
		$this->firePhp = FirePHP::getInstance(true);
		$this->firePhp->setEnabled(true);
		$this->debug($token, '__construct');
		if ($facebook_id != NULL){
			$this->debug($facebook_id, '__construct nao eh nulo');
			$this->facebook_id = $facebook_id;
			$this->generateUserPassword();
		}else{
			$this->debug($token, '__construct eh nulo -');
			$isAnonymous = true;
			$this->generateSessionAttachment($isAnonymous);
		}
        register_shutdown_function(array($this, 'shutdown'));
    }

    /**
     * Get FB User ID
     */
    public function getFBUser() {    
		// $fields = array(
		// 	'access_token'=>urlencode($this->facebook_token),
		// );
		// 
		// $url = "https://graph.facebook.com/me?access_token=".$this->facebook_token;
		// 
		// curl_setopt($this->curl,CURLOPT_URL, $url);
		// curl_setopt($this->curl, CURLOPT_CONNECTTIMEOUT, 10);
		// curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, 1);
		// foreach($fields as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
		// 	rtrim($fields_string,'&');
		// 	//open connection 
		//         	$response = curl_exec($this->curl);
		// if ($response){
		//         	$result_obj = json_decode($response);
		// 	$facebook_id = $result_obj->id;
		// 	$facebook_name = $result_obj->name;
		// 	$this->facebook_id = $facebook_id;
		// 	$this->facebook_name = $facebook_name;
		// 	$this->generateUserPassword();
		// }
		$this->shutdown();
    }

    /**
     * Cleanup resources
     */
    public function shutdown() {
        if($this->curl) {
            curl_close($this->curl);
        }
    }

	/**** MD5 String  */

	public function md5_salt($string) {
	    $chars = str_split('~`!@#$%^&*()[]{}-_\/|\'";:,.+=<>?');
	    $keys = array_rand($chars, 6);

	    foreach($keys as $key) {
	        $hash['salt'][] = $chars[$key];
	    }

	    $hash['salt'] = implode('', $hash['salt']);
	    $hash['salt'] = md5($hash['salt']);
	    $hash['string'] = md5($hash['salt'].$string.$hash['salt']);
	    return $hash;
	}
	
	public function generateUserPassword(){
		$facebook_id = $this->facebook_id;
		
		/* API Secret Key */
		$apiSalt = '1333232523232299852232';
		$token = $apiSalt.$facebook_id;
		
		$pass = $this->md5_salt($token);
		$this->password = $pass;
		$this->generateJabberUser();
	}
	
	public function generateJabberUser(){
		
		$display_debug_info = false;
		$AddUserErrorCode = 12000;
		 
		$jab = new CommandJabber($display_debug_info);
		$addmsg = new AddMessenger($jab, $this->facebook_id, $this->password);
		
		$jab->set_handler("connected",$addmsg,"handleConnected");
		$jab->set_handler("authenticated",$addmsg,"handleAuthenticated");
		$jab->set_handler("error",$addmsg,"handleError");
		
		//connect to the Jabber server
		if ($jab->connect(JABBER_SERVER))
		{
			$AddUserErrorCode=12001;
			$jab->execute(CBK_FREQ,RUN_TIME);
			$this->generateSessionAttachment();
			
		}

		$jab->disconnect();

		unset($jab,$addmsg);
		
		/* Set a property of VCard in order to verify user is authenticated. SET NICKNAME as equal to FULL NAME
		Only authenticated users should have the right to setup VCARD property*/
		
		// // If AddUserErrorCode is 0, we can try to fill user's Vcard, using brand new credentials :)
		// 
		// $AddVcardErrorCode = 14000;
		// $jab = new CommandJabber($display_debug_info);
		// $avcard = new AddVcard($jab,$UserLogin,$UserPass,$nickname,$fullname);
		// 
		// $jab->set_handler("connected",$avcard,"handleConnected");
		// $jab->set_handler("authenticated",$avcard,"handleAuthenticated");
		// 
		// if ($jab->connect(JABBER_SERVER))
		// {
		// $AddVcardErrorCode=14001;
		// $jab->execute(CBK_FREQ,RUN_TIME);
		// }
		// 
		// $jab->disconnect();
		// 
		// unset($jab,$avcard);
	}
	
	public function generateSessionAttachment($isAnonymous = false){
		$xmppPrebind = new XmppPrebind('logoslogic.com', 'http://www.logoslogic.com/http-bind/', '', false, true);
		if ($isAnonymous != true){
			$xmppPrebind->connect($this->facebook_id, $this->password);
		}else{
			$xmppPrebind->connect('', '');
		}
		$xmppPrebind->auth();
		$sessionInfo = $xmppPrebind->getSessionInfo(); // array containing sid, rid and jid
		$this->sessionInfo = $sessionInfo;
		$this->getAvailableRoomJidFromRoomProxyService();
	}

	public function getAvailableRoomJidFromRoomProxyService(){
		
		/* Fetch Available Room from Ejabberd */
		/*extended disco info has muc#roominfo_occupants 
		http://xmpp.org/extensions/xep-0045.html#example-8*/
		
		$ch = curl_init();
		$url = "http://www.logoslogic.com/chat/LivingRoom/southpark/service/room_proxy.json";
		curl_setopt($ch,CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			//open connection 
		$response = curl_exec($ch);
		
		if ($response){
		    $result_obj = json_decode($response);
			$roomJid = $result_obj[0]->jid;
			$this->roomJid = $roomJid;
		}else{
			/* A problem Happenned. Using Backup room */
			$this->roomJid = 'backup_room_JID';
			/* Admin Notification Email */
			$to = "isaac.dasilva@mtvncontractor.com";
			$subject = "Room Proxy Problem";
			$message = "There was a problem with the room Proxy at ".date("Y-m-d H:i:s");
			$from = "southpark@southpark.com";
			$headers = "From:" . $from;
			mail($to,$subject,$message,$headers);
		}
		
		curl_close($ch);
		
	}

}

?>