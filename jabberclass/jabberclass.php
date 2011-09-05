<?php


// set your Jabber server hostname, username, and password here
define('JABBER_SERVER','logoslogic.com');
define('JABBER_USERNAME','isaacueca');
define('JABBER_PASSWORD','cigano');
define('RUN_TIME',5); // set a maximum run time of 5 seconds
define('CBK_FREQ',1); // fire a callback event every second

// This class handles events fired by the first call of CommandJabber client class (to create a user);

class AddMessenger
{

	function AddMessenger(&$jab,$name,$pass)
	{
		$this->jab = &$jab;
		$this->jab->NewUserName = $name;
		$this->jab->NewUserPass = $pass;
	}

// called when a connection to the Jabber server is established
	function handleConnected()
	{
		global $AddUserErrorCode;
		$AddUserErrorCode=12002;
		// now that we're connected, tell the Jabber class to login
		$this->jab->login(JABBER_USERNAME,JABBER_PASSWORD);

	}

	// called after a login to indicate the the login was successful
	function handleAuthenticated()
	{
		global $AddUserErrorCode;
		$AddUserErrorCode=12003;
		$this->jab->adduser_init();
	}

}
// End of AddMessenger class

/******************************************************************************************************/

// Here is class to handle second call to CommandJabber clase - to fill out vcard

class AddVcard
{

	function AddVcard(&$jab,$name,$pass,$nickname, $fullname,$role)
	{
		$this->jab = &$jab;
		$this->jab->NewUserName = $name;
		$this->jab->NewUserPass = $pass;
		$this->nickname = $nickname;
		$this->fullname = $fullname;
	}

	function handleConnected()
	{
		global $AddVcardErrorCode;
		$AddVcardErrorCode=14002;
		
		$this->jab->login($this->jab->NewUserName,$this->jab->NewUserPass);
	}

	function handleAuthenticated()
	{
		global $AddVcardErrorCode;
		$AddVcardErrorCode=14003;
		$this->jab->addvcard_request($this->nickname, $this->fullname/*, $this->UserRole*/);
	}

} // End of AddVcard class

/******************************************************************************************************/

// Including original "Jabber Client Library" - class
require_once(dirname(__FILE__).'/jabber.php');

/******************************************************************************************************/

// This is extension to basic Jabber class

class CommandJabber extends Jabber
{
	var $AddUserDialogID=0;
	var $NewUserName, $NewUserPass;

	function adduser_init()
	{
		$this->AddUserDialogID = $this->_unique_id('adduserproc');

		$this->_set_iq_handler('_on_adduser_initanswer',$this->AddUserDialogID);

		$xml = '<iq from="'.($this->jid).'" id="'.$this->AddUserDialogID.'" to="'.($this->_server_host).'" type="set">
<command xmlns="http://jabber.org/protocol/commands" action="execute" node="http://jabber.org/protocol/admin#add-user"/>
</iq>';
	return $this->_send($xml);
}

	function _on_adduser_initanswer(&$packet)
	{
		global $AddUserErrorCode;
		$AddUserErrorCode=12004;
		if ($this->_node($packet,array('iq','@','type'))=='result') // if isn't an error response
		{
			$AddUserErrorCode=12005;
			$sessionid=$this->_node($packet,array('iq','#','command','0','@','sessionid'));
			if (strlen($sessionid) && $this->_node($packet,array('iq','#','command','0','@','status'))=='executing') // response seems to be OK
  			{
  				$AddUserErrorCode=12006;
  				$xml='<iq from="'.($this->jid).'" id="'.$this->AddUserDialogID.'" to="'.($this->_server_host).'" type="set"><command xmlns="http://jabber.org/protocol/commands" node="http://jabber.org/protocol/admin#add-user" sessionid="'.$sessionid.'"><x xmlns="jabber:x:data" type="submit">';
  				$fieldsnode=$this->_node($packet,array('iq','#','command','0','#','x','0','#','field'));
  				$i=0;
  				do
    			{
					$field_type=$this->_node($fieldsnode,array($i,'@','type'));
					$field_var=$this->_node($fieldsnode,array($i,'@','var'));
					$field_value=$this->_node($fieldsnode,array($i,'#','value','0','#'));
					
					if ($field_type=='hidden') $xml.='<field type="hidden" var="'.$field_var.'"><value>'.$field_value.'</value></field>';
					if ($field_var=='accountjid') $xml.='<field type="'.$field_type.'" var="accountjid"><value>'.$this->NewUserName.'@'.$this->_server_host.'</value></field>';
					if ($field_var=='password') $xml.='<field type="'.$field_type.'" var="password"><value>'.$this->NewUserPass.'</value></field>';
					if ($field_var=='password-verify') $xml.='<field type="'.$field_type.'" var="password-verify"><value>'.$this->NewUserPass.'</value></field>';
					$i++;
				}
  				while (strlen(trim($field_type)) && $i<20);
 
  				$xml.='</x></command></iq>';
  				$this->_set_iq_handler('_on_adduser_getresult',$this->AddUserDialogID);
  				$this->_send($xml);
  			}
		}
	}

	function _on_adduser_getresult(&$packet)
	{
		global $AddUserErrorCode;
		$AddUserErrorCode=12007;
		if ($this->_node($packet,array('iq','@','type'))=='result')
		{
			if ($this->_node($packet,array('iq','#','command','0','@','status'))=='completed');
			$AddUserErrorCode=0;
		}

		$this->terminated = true;
	}

// following functions - for fill Vcard only

	function addvcard_request($nickname, $fullname)
	{
		$DialogID = $this->_unique_id('addvcard');

		$this->_set_iq_handler('_on_addvcard_reply',$DialogID);

		$xml = '<iq from="'.($this->jid).'" id="'.$DialogID.'" type="set">
			<vCard xmlns="vcard-temp">
			<FN>'.$nickname.'</FN><NICKNAME>'.$fullname.'</NICKNAME>
			</vCard>
			</iq>';
		return $this->_send($xml);
	}

	function _on_addvcard_reply(&$packet)
	{
		global $AddVcardErrorCode;
		$AddVcardErrorCode=14004;

		if ($this->_node($packet,array('iq','@','type'))=='result') $AddVcardErrorCode=0;

		$this->terminated = true;
	}

} // End of Jabber class extension

?>