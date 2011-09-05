var BuzzTweetInputView = Backbone.View.extend({
	events: {
        'click .tweet_message_send_button': 'sendTweetMessage',
     },
	template: $('#tweet_message_view'),
	initialize: function() {

			
	  _.bindAll(this, 'render');
	
	},
	render: function() {

		var template = Handlebars.compile(this.template.html());
		$(this.el).html(template(this.model));
		return this;
	},
	sendTweetMessage: function(){
		console.log('sendTweetMessage')
		var message = $('.tweet_input').val();
		var dataString = 'tweet='+ message;  
		$.ajax({
		  type: 'POST',
		   url: 'http://www.logoslogic.com/chat/LivingRoom/southpark/twitter/post.php',
		  // url: 'http://localhost/LivingRoom/southpark/twitter/post.php',
		  data: dataString,
		  success: function(data){
			console.log('sendTweetMessage data '+data.status);
			if (data.status == 'not_connected'){
				// window.location = 'http://localhost/LivingRoom/southpark/twitter/index.php';
				 window.location = 'http://www.logoslogic.com/chat/LivingRoom/southpark/twitter/index.php';
			}
		  },
		});
	},
	
});