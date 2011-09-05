var FriendChatView = Backbone.View.extend({
    events: {
        'click .message_send_button': 'sendMessage'
     }, 
	template: $('#chat_window'),

	initialize: function (options) {
        // 
        //this.jid = options.jid;
         _.bindAll(this, 'sendMessage');
        $('input#message_field').focusin(function () {});
        _.bindAll(this, 'render');
    }, 

	render: function() {
		var template = Handlebars.compile(this.template.html());
		$(this.el).html(template(this.model));
        return this;
    }, 

	sendMessage: function () {
	//	console.log('send message');
		var remoteJid = $(this.el).find('.message_field').attr('id').split('_')[1];
	//	console.log('send message to remoteJid' +remoteJid);
		var message = $(this.el).find('.muc_input').val();
		if (isLoggedIn == true){
			JabberClient.send_muc_message(remoteJid, message)
		}else{
			location.href= MyFacebookUser.loginUrl
		}
    }, 

	
});