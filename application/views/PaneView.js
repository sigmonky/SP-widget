var PaneView = Backbone.View.extend({
	el: $('#pane-content'),

	initialize: function() {
		_.bindAll(this, 'render', 'getScrollPane', 'renderAllFans', 'renderMyFriends', 'renderBuzz');
		var self = this;
				
	//	- when window is resized, recalc pane
		$(window).resize(function() {
			self.getScrollPane().reinitialise();
		});
		
		//
		this.render();
		return this;
	},
	
	getScrollPane: function() {
		  // return $('.scroll-pane').jScrollPane({scrollbarWidth:3}).data('jsp');
	},
	
	render: function() {
		
		/* All Fans View Begin  */
		
		var main_chat = $("#room_chat_area");
		var room = {};
		room.jid = RoomJid;
		//console.log('facebook id'+Attacher.JID);
		//console.log('isLoggedIn ='+isLoggedIn)
		if (isLoggedIn == true){
			var photo = 'https://graph.facebook.com/'+MyFacebookUser.id+'/picture';
		}else{
			var photo = 'http://www.logoslogic.com/chat/LivingRoom/southpark/images/no_user.png';
		}
		room.photo = photo;
		
		 var chatCollection = new models.ChatCollection();
	//	var chatCollection = new Jabber.MessageCollection();
		var mainChatRoom = new ChatView({collection: chatCollection, model: room, jid: RoomJid});
		window.chat.chatViews[RoomJid] = mainChatRoom;
		window.chat.addView(RoomJid);
		
		$(mainChatRoom.render().el).prependTo(main_chat);
		/* All Fans View End  */
		
		
		/* Friends View Begin  */
		if (isLoggedIn != false){
			
			var friends_main_panel = $("#friends_main_panel");
			var rowView = new FriendsMainView();
			$(rowView.render().el).prependTo(friends_main_panel);
			
			var roster_area = $(".friends-list");
			_.each(FriendsWhoInstalledApp.data, function(friend){
				//console.log('friend '+friend.name);
				var rowView = new FriendRosterView({model: friend});
				$(rowView.render().el).prependTo(roster_area);
			})
		}else{
			var facebook_login = $("#facebook_login");
			var mainChatRoom = new FacebookLogin();
			$(mainChatRoom.render().el).prependTo(facebook_login);
		}
		
		/* Friends View End  */
		
		
		/* Buzz View Begin */
		var twitter_message_panel = $("#twitter_message_panel");
		var mainBuzzTweetView = new BuzzTweetInputView();
		$(mainBuzzTweetView.render().el).prependTo(twitter_message_panel);
		
		$("input#input_tweet").keyup(function(){
			console.log('keyup')
			var box=$(this).val();
			var main = box.length *100;
			var value= (main / 140);
			var count= 140 - box.length;

			if(box.length <= 140){
				$('#tweet_count').html(count);
			}
			else
			{
				alert('Character Limit Exceeded!');
				return false;
			}
		});
		
		
		var buzz_main_panel = $("#buzz_main_panel");
		var mainBuzzView = new BuzzMainView(this.model);
		$(mainBuzzView.render().el).prependTo(buzz_main_panel);
	// 	
	// 	var url = 'http://tweetriver.com/camilarc/south-park-test.json?';
	// 	
	// 	$.ajax({
	// 	    type: "GET",
	// 	    url: url,
	// 	    dataType: "jsonp",
	// 	    success: function(json) {
	// 				// clear 
	// 				$("#rows").html('');
	// 				if (json && json.length > 0) {
	// 					var $rows = $("#rows");
	// 					_.each(json, function(item) {
	// 						var rowView = new BuzzView({model: item});
	// 						$(rowView.render().el).prependTo($rows);
	// 					});
	// 				} else {
	// 					$("#rows").html('<div class="row"><div class="thumb"></div><div class="details">There is no tweet at this location.</div><div>');
	// 				}
	// 				//$('#load').fadeOut('fast');
	// 		}
	// 				// 
	// 				// $("#load").remove();
	// 				// $("#rows-content").append('<span id="load">Loading....</span>');
	// 				// $("#load").fadeIn();		    
	// 	});
		
		/* Buzz View End */
		
		
		return this;
	},
	
	renderAllFans: function() {
		$("#all_fans_view").css({'display': 'block', 'height': '100%'});
		$("#buzz_view").css('display', 'none');
		$("#friends_view").css('display', 'none');
		$('input.message_field').focus();

        var messagesContainer = $('.chat_body');
		$(messagesContainer)[0].scrollTop = $(messagesContainer)[0].scrollHeight;
	},
	
	renderMyFriends: function() {
		$("#friends_view").css({'display': 'block', 'height': '100%'});
		$("#buzz_view").css('display', 'none');
		$("#all_fans_view").css('display', 'none');
		// if (isLoggedIn == true){
		// 	 $('.friends-scroll-pane').jScrollPane();
		// }	
	},

	renderBuzz: function() {
		$("#buzz_view").css({'display': 'block', 'height': '100%'});
		$("#friends_view").css('display', 'none');
		$("#all_fans_view").css('display', 'none');
		$('input.message_field').focus();
		// $('.scroll-pane').jScrollPane();
		var messagesContainer = $('#buzz-rows');
		$('.scroll-pane')[0].scrollTop = $('#buzz-rows').prop('scrollHeight')
		
		console.log('messagesContainer.scrollHeight' +$('#buzz-rows')[0].scrollHeight);
	},

});