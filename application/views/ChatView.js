var ChatView = Backbone.View.extend({
    events: {
        'click .message_send_button': 'sendMessage'
     }, 
	template: $('#muc_window'),

	initialize: function (options) {
        _.bindAll(this, "render", 'sendMessage', 'addMessage');
        this.collection.bind("add", this.render);
		var jid = options.jid;
		console.log('initialize jid'+jid);
	//	console.log('initialize JabberClient chatViews'+JabberClient.chatViews);
		
    }, 

	render: function() {
		var template = Handlebars.compile(this.template.html());
		$(this.el).html(template(this.model));
		var messageList = $(this.el).find('.chat_messages');
		//console.log('message list'+$(this.el).find('.chat_messages'));
        messageList.empty();
        this.collection.each(function (message) {
	
			var photo_url = 'http://graph.facebook.com/'+message.get('facebook_id')+'/picture';
		
			console.log('chatView render photo_url' +photo_url);
			console.log('chatView render nick' +message.get('from'));
			
			var chatEntry = {};
			chatEntry.text = message.get('text');
			chatEntry.nickname = message.get('from');
			chatEntry.photo_url = photo_url;
			

			
            var chatMsg = new ChatMessageView({ model: chatEntry });
            messageList.append(chatMsg.render().el);
        });
		
		var messagesContainer = $(this.el).find('.chat_body');
		$(messagesContainer)[0].scrollTop = $(messagesContainer)[0].scrollHeight;
		
        return this;
    }, 

	sendMessage: function () {
		console.log('send message');
		var remoteJid = $(this.el).find('.message_field').attr('id').split('_')[1];
		console.log('send message to remoteJid' +remoteJid);
		var message = $(this.el).find('.muc_input').val();
		var message2 = $(this.el).find('.muc_input');
		console.log('send message ' +message2);
		
		if (isLoggedIn == true){
			
			// JabberClient.send_muc_message(remoteJid, message)
			this.trigger('send:message', message, remoteJid);
			
			// var message = new Jabber.Message({jid:'111', text:'cueca'});
			// this.collection.add(message);
			
			// var msg = new models.ChatEntry({
			// 	text: message,
			// //	from: $(message).attr('from'),
			// 	to: remoteJid,
			// 	incoming: true,
			// 	dt: new Date()
			// });
			// this.collection.add(msg);
			
		}else{
			location.href= MyFacebookUser.loginUrl
		}
    }, 

	addMessage: function(chatEntryModel){
        var chatMsg = new ChatMessageView({ model: chatEntry });
		this.collection.add(chatMsg);
		//         $('#chat_list').append(view.render().el);
		//         $('#chat_list')[0].scrollTop = $('#chat_list')[0].scrollHeight;
	}

	
});