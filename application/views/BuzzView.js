var BuzzMainView = Backbone.View.extend({
	events: {
        'click .getFeed': 'getFeedLoop'
     },
	template: $('#tweetMainView'),
	
	initialize: function() {
	  _.bindAll(this, 'render');
	  $("#rows").html('');
	  this.tweetsCollection = new TweetCollection( null, { view: this });
	  // this.tweetsCollection2 = new TweetCollection2( {model:this.tweetsCollection, view: this });
	  this.tweetsCollection.bind("refresh", this.render);
		this.getFeed();
	},
	
	getFeedLoop: function(){
		console.log('getFeedLoop');
		
		this.tweetsCollection.fetch();
	},
	
	render: function() {
		console.log('buzz render');
		// var $rows = $("#buzz-rows");
		// this.tweetsCollection.fetch()
		// var num = this.tweetsCollection.length;	    
		// 
		// console.log('tweets num'+num);
		// this.tweetsCollection.each(function(model){
		// 	console.log('test model ='+model);
		// 	// var rowView = new BuzzMessageView({model: model});
		// 	// $(rowView.render().el).prependTo($rows);
		// });
		// 
		var $rows = $("#buzz-rows");
		$rows.html("");
		console.log('collection lenght' +this.tweetsCollection.length);
		
		this.tweetsCollection.each(function (tweetEntry) {
			// console.log('tweetEntry '+tweetEntry.screen_name);
			// console.log('tweetEntry '+tweetEntry.get('profile_image_url'));
			// console.log('tweetEntry '+tweetEntry.get('screen_name'));
			var tweet = {};
			tweet.screen_name = tweetEntry.get('user').screen_name;
			tweet.profile_image_url = tweetEntry.get('user').profile_image_url;
			tweet.user_text = tweetEntry.get('text');
			var date = tweetEntry.get('created_at');
			// console.log('date '+date);
			
			var day = date.substring(8, 10);
			var month = date.substring(4, 7);
			var year = date.substring(26, 30);
			
			var hour = date.substring(11, 13) -4;
			var minute = date.substring(14, 16);
			var second = date.substring(17, 19);
			
			shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			
			for (i=0; i<12; i++){
				if (shortMonths[i] == month){
					month_integer = i+1;
				}
			}
			
			// console.log('day '+day);
			// console.log('month '+month);
			// console.log('month intger '+month_integer);
			// console.log('year '+year);
			// console.log('hour '+hour);
			// console.log('minute '+minute);
			// console.log('second '+second);
			
			var dateStr = year+'-'+month_integer+'-'+day+' '+hour+':'+minute+':'+second;
			var date = dateStringPastTense(dateStr);
			tweet.created_at = date;
			
			var rowView = new BuzzMessageView({model: tweet});
			$(rowView.render().el).prependTo($rows);

		});
		
		var totalHeight = this.tweetsCollection.length*50;
		console.log('this.tweetsCollection' +this.tweetsCollection.length);
		console.log('totalheight' +totalHeight);
		$('#rows-content').css('height', totalHeight);
		
		var template = Handlebars.compile(this.template.html());
		$(this.el).html(template(this.model));
		
		var messagesContainer = $('#buzz-rows');
		console.log('messagesContainer.scrollHeight' +$('#buzz-rows')[0].scrollHeight);
		$('.scroll-pane')[0].scrollTop = $('#buzz-rows').prop('scrollHeight')
		
		return this;
	}, 
	
	addTweet: function(tweetModel){
		this.tweetsCollection.add(tweetModel);
	},
	
	getFeed: function(){
		console.log('getFeed');
		var that = this;
		this.tweetsCollection.fetch();
		// $.ajax({
		//     type: "GET",
		//     url: url,
		//     dataType: "jsonp",
		//     success: function(json) {
		// 			// clear 
		// 			$("#rows").html('');
		// 			if (json && json.length > 0) {
		// 				var $rows = $("#buzz-rows");
		// 				_.each(json, function(item) {
		// 					that.addTweet(item);
		// 					// var rowView = new BuzzMessageView({model: item.user});
		// 					// $(rowView.render().el).prependTo($rows);
		// 				});
		// 			} else {
		// 				$("#rows").html('<div class="row"><div class="thumb"></div><div class="details">There is no tweet at this time.</div><div>');
		// 			}
		// 			
		// 			//$('#rows-content').css('height', '')
		// 			
		// 			//$('#load').fadeOut('fast');
		// 	}
		// 			// 
		// 			// $("#load").remove();
		// 			// $("#rows-content").append('<span id="load">Loading....</span>');
		// 			// $("#load").fadeIn();		    
		// });
	},
	
});