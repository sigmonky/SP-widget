/* Chat Message  */

// models.ChatEntry = Backbone.Model.extend({
//   defaults: {
//     jid: '',
// 	//     facebook_id: '',
// 	// nickname: '',
// 	// time: '',
// 	text:'',
//   }
// });
// 
// models.ChatCollection = Backbone.Collection.extend({
//     model: models.ChatEntry
// });


models.ChatEntry = Backbone.Model.extend({
	incoming: function(){
		var to = Strophe.getBareJidFromJid(this.to),
		myjid = Strophe.getBareJidFromJid(this.myjid);
		if (myjid === to) {
			return true;
		} else {
			return false;
		}
	},
	send: function(connection){
		connection.send($msg({
			to: this.get('to'),
			"type": 'groupchat'
		}).c('body').t(this.get('text')));
		return this;
	}
});

models.ChatCollection = Backbone.Collection.extend({
	model: Jabber.Message
});