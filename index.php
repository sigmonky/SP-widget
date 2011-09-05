<?php

include_once "fbmain.php";
include_once "user.php";
require_once(dirname(__FILE__)."/jabberclass/jabberclass.php");
require_once(dirname(__FILE__)."/xmppprebind.php");

/* Creates Session Attachment based on Anonymous or FB authenticated user */

if ($facebook_user_profile['id'] != "") {
	//Connect Facebook Authenticated User
	$user = new User($facebook_user_profile['id']);
	$facebook_id = $user->facebook_id;
	$facebook_name = $user->facebook_user_profile['name'];
}else{
	//Connect Anonymous User
	$user = new User();
}

?>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml">
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
		
		<title>South Park Chat Widget</title>
		
		<!--[if lt IE 9]>
			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
		
		<!-- Stylesheets !-->
		
		<link href="styles/global.css" rel="stylesheet" type="text/css" />
		<link type="text/css" href="styles/jquery.jscrollpane.css" rel="stylesheet" media="all" /> 
		 <link rel="stylesheet" href="styles/jquery-ui.css">
	
		<!-- <link type="text/css" href="styles/ui-lightness/jquery-ui-1.7.2.custom.css" rel="stylesheet" />
		<link type="text/css" href="styles/sh/sh_style.css" rel="stylesheet" /> -->
	
		<!-- XMPP Bootstrap from XMPP Session Attachment and Facebook !-->
		
		<script>
		Jabber = {};
		</script>
		
		
		<!-- Mustache.js / Handlebars.js templates  -->
		
		<script id="chat_window" type="text/x-handlebars-template">
			<div id="chat_body_{{ jid }}" class="friend_chat_body">
			</div>
			<div class="friend_bottom_panel">
				<input class="chat_input message_field" id="input_{{ jid }}" type="text" />
				<input type="submit" class="message_send_button" value="send">
			</div>
			<div class="clearfix"></div>
		</script>
		
		<script id="facebook_login_window" type="text/x-handlebars-template">
			<div class="facebook_login_panel">
			You are not currently logged in to Facebook. In order to participate with other Facebook friends using South Park Live, you must log in.
			<br/><br/>
				<center>
					<a href={{url}}><img src="images/facebook-connect-button.png" alt="Login to Facebook" title="Login to Facebook" /></a>
				</center>
			</div>
		</script>
		
		<script id="friends_main_window" type="text/x-handlebars-template">
		<div id='roster-area'>
			<div class="friends-scroll-pane">
			 	<ul class="friends-list"  style="height:400px"></ul>
			</div>
			<div class="invite-friends-btn">
				<a href="#" onclick="FacebookNewInvite(); return false;">Invite to SP Live</a>
			</div>
		</div>
		<div id="chat-area" class="tabs">
				<div id="friend-chat-message-panel">Start a chat with one or many of your friends by selecting from your friend list.<br/><br/>Invite other Facebook friends to joint South Park Live by clicking the Invite to SP Life button</div>
				<ul class="chat-tabs" style="height:30px">
				</ul>
		</div>

		<div class="clearfix"></div>
		</script>
		
		
		<script id="muc_window" type="text/x-handlebars-template">
			<div class="chat_body">
						<div class="chat_messages"></div>
			</div>
			
			<div class="bottom_panel">
				<div id="my_profile_photo"><img src="{{photo}}" width="50" height="50"></div>
				<input class="muc_input message_field" id="input_{{ jid }}" type="text" />
				<input type="submit" class="message_send_button" value="send">
			</div>
		</script>
		
		<script id="tweet_message_view" type="text/x-handlebars-template">
			<input class="tweet_input message_field" id="input_tweet" type="text" />
			<input type="submit" class="tweet_message_send_button" value="Tweet">
			<div id="tweet_count"></div>
		</script>

		<script id="tweetMainView" type="text/x-handlebars-template">
		<div class="getFeed" style="background:red; position:absolute; top:15px; right:15px">Refresh Feed </div>
		</script>
		
		<script id="user" type="text/x-handlebars-template">
			<li class="roster_user view-menu" id="roster_{{ uid }}" data-jid="{{ uid }}">
			<div class="roster-user-wrap">
				<div class="roster-thumb">
				   <img src="http://graph.facebook.com/{{uid}}/picture" class="avatar" width="38" height="38" alt=""/>
				</div>
				<div class="roster-details">
				  		{{name}}
				</div>
				<div class="friend_roster_menu">
					<ul class="friend-menu-options">
						<li><a href="#" class="start-chat" id="start-chat-{{ uid }}">Start Chat</a></li>
						<li><a href="#" class="add-togroup-chat" id="add-togroup-{{ uid }}">Add to Group Chat</a></li>
						<li><a href="#" class="start-group-chat" id="start-groupchat-{{ uid }}" >Create Group Chat</a></li>
					</ul>
				</div>
				</div>
				<div class="clearfix"></div>
			</li>
		</script>
		
		<script id="group" type="text/html">
			<div class="group" title="{{ title }}">
				<span class="group_title">{{{ title }}}</span>
				<ul></ul>
			</div>
		</script>
		
		<script id="add_user_dialog" type="text/html">
			<div>
				<label>JID:</label><input type="text" id="add_user_jid">
				<label>Name:</label><input type="text" id="add_user_name">
			</div>
		</script>

		<script id="edit_user_dialog" type="text/html">
			<div>
				<label>Name:</label><input type="text" id="add_user_name" value="{{ name }}">
			</div>
		</script>
		
		<script id="subscription_request" type="tex
		t/html">
			<div>
				<p>Subscription request received from {{ from }}</p>
				<label>Name:</label><input type="text" id="add_user_name">
			</div>
		</script>

		<script id="muc_dialog" type="text/html">
			<div>
				<label>Room:</label><input type="text" id="muc_room"/>
				<label>Nickname:</label><input type="text" id="muc_nickname"/>
			</div>
		</script>
		
		<script type="text/x-handlebars-template" id="tweet-template">
			<div class="thumb">
			   <a href="http://twitter.com/#!/{{screen_name}}" class="tweet-user"><img src="{{profile_image_url}}" class="avatar" width="48" height="48" alt=""/></a>
			</div>
			<div class="details">
			   <p>{{user_text}}</p>
			   <div class="date">
					<span>{{created_at}}</span><br/>
					<span><a href="http://twitter.com/#!/{{screen_name}}" class="tweet-user">{{screen_name}}</a></span>
				</div>
			</div>
			<div class="clearfix"></div>
		</script>
		
		
		<script id="chat_message" type="text/x-handlebars-template">
				<div class="thumb">
					<img src="{{ photo_url }}" width="48" height="48"  class="avatar" />
				</div>
				<div class="details">
					<p>{{{ text }}}</p>
					<div class="facebook-user">{{ nickname }}</div>
				</div>
				<div class="clearfix"></div>
		</script>
		
		
	</head>
	
	<body>
		
	<!-- Facebook SDK Begin -->
		
	<div id="fb-root"></div>
	<script src="http://connect.facebook.net/en_US/all.js"></script>
	<script type="text/javascript">
            FB.init({ appId: '103751443062683', 
                    status: true, 
                    cookie: true,
                    xfbml: true,
                    oauth: true,
			});
	</script>
	<div style="color:#FFF">
	<!-- Facebook SDK End -->
	<?php
	
	// session_start();
	// 
	// include 'twitter/lib/EpiCurl.php';
	// include 'twitter/lib/EpiOAuth.php';
	// include 'twitter/lib/EpiTwitter.php';
	// include 'twitter/lib/secret.php';
	// 
	// /*Twitter Auth */
	// 
	// $oauth_token = $_GET['oauth_token'];
	// 
	// if ($oauth_token != ''){
	// 	$twitterObj = new EpiTwitter($consumer_key, $consumer_secret);
	// 	$twitterObj->setToken($_GET['oauth_token']);
	// 	$token = $twitterObj->getAccessToken();
	// 	$twitterObj->setToken($token->oauth_token, $token->oauth_token_secret);	  	
	// 	$_SESSION['ot'] = $token->oauth_token;
	// 	$_SESSION['ots'] = $token->oauth_token_secret;
	// 	
	// 	// echo 'twitterObj'.$twitterObj;
	// 	 print_r($token);
	// 	
	// 	echo '$token->oauth_token '.$token->oauth_token;
	// 	echo '$token->oauth_token_secret '.$token->oauth_token_secret;
	// 	echo '<br>';
	// 	echo '<br>';
	// 	echo 'session1 '.$_SESSION['ot'];
	// 	echo '<br>';
	// 	
	// 	echo 'session 2'.$_SESSION['ot'];
	// 	
	// 	 // print_r($token->oauth_token_);
	// 	// echo 'session 2'.$_SESSION['ots'];
	// }

	?>
	
	</div>
	<div id="body_wrapper">
		<!-- Main Menu Begin -->
	 	<div id="header_view">
		<div class="top_panel">
			<ul class="main_menu">
				<li><a class="mainNav" href="#allfans">All Fans</a></li>
				<li><a class="mainNav"href="#myfriends">My Friends</a></li>
				<li><a class="mainNav" href="#buzz">Buzz</a></li>
			</ul>	
			<div class="clearfix"></div>
		</div>
		</div>
		<!-- Main Menu End -->
		
		
		<div id="pane-content">
		
		<!-- All Fans View Begin -->
		
		<div class="pane-section" id="all_fans_view">

				
				<div id="room_chat_area">
					
				</div>
				

		</div>
		<div class="clearfix"></div>			
		
		<!-- All Fans View End -->
		
		<!-- My Friends View-->
		
		<div class="pane-section" id="friends_view">
			
			<div class="main_panel">
				<div id="facebook_login"></div>
				<div id="friends_main_panel"></div>
			</div>

		</div>
		
		<!-- My Friends End-->
		
		<!-- Buzz View Begin -->
		
		<div class="pane-section" id="buzz_view">
			<div class="main_panel">
				<div class="scroll-pane">
					<div id="rows-content"  style="">
						<div id="buzz_main_panel"><div id="buzz-rows"></div></div>
					</div>
				</div>
			</div>
			<div id="twitter_message_panel" class="bottom_panel">
				<!-- <input class="tweet_input message_field" id="input_tweet" type="text" />
				<input type="submit" class="message_send_button" value="Tweet"> -->
				<div id="tweet_count"></div>
			</div>
			<div class="clearfix"></div>
		</div>
		
		<!-- Buzz View End -->
	
		</div>
	
		<!--<section id="roster">
		</section>

		<section id="chats">
			<ul></ul>
		</section> -->
		
		
		<span id="load" style="display: none; ">loading...</span>					
		
		
		<!-- Log Debug Console Begin -->
		
		<div id="facebook_debug">
	    	<?php if (!$facebook_user) { ?>
	        	<a href="<?=$loginUrl?>">Facebook Login</a>
	    	<?php } else { ?>
	        	<a href="<?=$logoutUrl?>">Facebook Logout</a>
	    		<?php } ?>
		</div>
			
			
		<div id='log'>
	    </div>
	
		<!-- Log Debug Console End -->
	
	</div>
	<script>
	
	var isLoggedIn = false;
	
	var Attacher = {
		JID: '<?=$user->sessionInfo['jid']?>',
		SID: '<?=$user->sessionInfo['sid']?>',
		RID: '<?=$user->sessionInfo['rid']?>'
	};
	// 
	// var FriendsWhoInstalledApp = {
	// 	data: <?php print json_encode($fqlResult); ?>
	// }

	var FriendsWhoInstalledApp = {
		data: [
			{"uid":"527305423","name":"Isaac Da Silva","pic_square":"http:\/\/profile.ak.fbcdn.net\/hprofile-ak-snc4\/27460_527305423_9254_q.jpg"},
			{"uid":"618523003","name":"Raphael Cordero","pic_square":"http:\/\/profile.ak.fbcdn.net\/hprofile-ak-snc4\/27460_527305423_9254_q.jpg"},
			{"uid":"788994656","name":"Flora Gillon","pic_square":"http:\/\/profile.ak.fbcdn.net\/hprofile-ak-snc4\/27460_527305423_9254_q.jpg"},
			{"uid":"679733001","name":"Wagner Az","pic_square":"http:\/\/profile.ak.fbcdn.net\/hprofile-ak-snc4\/27460_527305423_9254_q.jpg"},
			{"uid":"556531140","name":"Julio Cezar Cruz","pic_square":"http:\/\/profile.ak.fbcdn.net\/hprofile-ak-snc4\/27460_527305423_9254_q.jpg"},
			
		]
	}

	// var RoomJid = '<?=$user->roomJid?>@conference.logoslogic.com';
	var RoomJid = 'southpark100@conference.logoslogic.com';
	
	
	var MyFacebookUser = {
		id: '<?=$facebook_user_profile['id']?>',
		name: '<?=$facebook_user_profile['name']?>',
		loginUrl: '<?=$loginUrl?>',
	}
	
	 // var MyFacebookUser = {
	 // 	id: '100001502348575',
	 // 	name: 'Isaac s',
	 // }
	
	if (MyFacebookUser.id != ''){
		isLoggedIn = true;
	}
	
//	isLoggedIn = true;
	
	
	</script>
	

	<!-- LAB.js Asynchronous Script Loading -->
	<!-- http://addyosmani.com/blog/building-spas-jquerys-best-friends/ -->
	
	
	<!-- JQuery core and plugins !-->
	
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>
	<!-- // <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.1/jquery-ui.min.js"></script> -->
	
	<script type="text/javascript" src="application/libs/jquery/jquery-ui.js"></script>
	
	<script type="text/javascript" src="application/libs/jquery/jquery.scrollabletab.js"></script>
	
	<script type="text/javascript" src="application/libs/jquery/jquery.timeago.js"></script>

	<!-- the mousewheel plugin -->
	<script type="text/javascript" src="application/libs/jquery/jquery.mousewheel.js"></script>
	<!-- the jScrollPane script -->
	<script type="text/javascript" src="application/libs/jquery/jquery.jscrollpane.min.js"></script>
	
	<!-- Template Engine  !-->
	
	<script src="application/libs/mustache.js" type="text/javascript"></script>
	<script src="application/libs/handlebars.js" type="text/javascript"></script>
	
	<script type="text/javascript" src="application/libs/jquery/jquery.mustache.js"></script>
	
	<script src="application/components/ICanHaz.js" type="text/javascript"></script>
	
	<!-- Strophe core and plugins  !-->
	<script src="application/libs/strophe/md5.js" type="text/javascript"></script>
	<script src="application/libs/strophe/base64.js" type="text/javascript"></script>
	
	<script src="application/libs/strophe/strophe.js" type="text/javascript"></script>
	<!-- // <script src="application/libs/strophe/strophe.roster.js" type="text/javascript"></script>
	// <script src="application/libs/strophe/strophe.status.js" type="text/javascript"></script>
	// <script src="application/libs/strophe/strophe.chat.js" type="text/javascript"></script> -->
	<script src="application/libs/strophe/strophe.muc.js" type="text/javascript"></script>
	<script src="application/libs/strophe/strophe.vcard.js" type="text/javascript"></script>
	
	
	<!-- Backbone MVC  !-->
	<script src="application/libs/underscore.js"></script> 
	<script src="application/libs/backbone-min.js"></script>
	

	
	<!-- Backbone Models !-->
	
	<script>
	
    var server = false, models;
    if (typeof exports !== 'undefined') {
        _ = require('underscore')._;
        Backbone = require('backbone');
        models = exports;
        server = true;
    } else {
        models = this.models = {};
    }
    // 
    // models.ChatRoomModel = Backbone.Model.extend({
    //     initialize: function() {
    //         this.chats = new models.ChatCollection();
    //         this.users = new models.RoomRosterCollection();
    //     }
    // });

	</script>

	
	<!-- Startup Script !-->
	
	
	<script src="application/models/ChatEntry.js" type="text/javascript"></script>
	<script src="application/models/Room.js" type="text/javascript"></script>
	<script src="application/models/User.js" type="text/javascript"></script>
	<script src="application/models/TweetEntry.js" type="text/javascript"></script>
	
	<!-- Backbone Views !-->
	<script src="application/views/BuzzTweetInputView.js" type="text/javascript"></script>
	
	<script src="application/views/BuzzMessageView.js" type="text/javascript"></script>
	<script src="application/views/BuzzView.js" type="text/javascript"></script>
	<script src="application/views/ChatMessageView.js" type="text/javascript"></script>
	<script src="application/views/ChatView.js" type="text/javascript"></script>
	<script src="application/views/FriendRosterView.js" type="text/javascript"></script>
	
	<script src="application/views/PaneView.js" type="text/javascript"></script>
	<script src="application/views/HeaderView.js" type="text/javascript"></script>
	<script src="application/views/FriendChatView.js" type="text/javascript"></script>
	<script src="application/views/FacebookLogin.js" type="text/javascript"></script>
	<script src="application/views/FriendsMainView.js" type="text/javascript"></script>
	

	<!-- Backbone Controller !-->

	
	<script src="application/components/jabberclient.js" type="text/javascript"></script>
	
	<script>
	
	// var StropheConfig = {
	// 
	// // Settings
	// 	boshUrl: 'http://www.logoslogic.com/http-bind',
	// 
	// // Implemented event handlers
	// 	subscriptionRequested: JabberClient.subscription_requested,
	// 	chatReceived: JabberClient.on_chat_message,
	// 	rosterChanged: JabberClient.update_roster,
	// 
	// // Not implemented in UI
	// 	handleMucMessage: JabberClient.handle_muc_message,
	// 	chatStateReceived: JabberClient.chat_state_received
	// };

	</script>
	
	<script src="application/controllers/MainController.js" type="text/javascript"></script>
	<!-- Jabber/XMPP Client  !-->
	<script src="application/main.js"></script>
	

	</body>
</html>