/*https://async.fi/2011/07/backbone-js-automagic-syncing-of-collections-and-models/ */

/* Twitter Message  */

TweetEntry = Backbone.Model.extend({
  defaults: {
    author: '',
    image_url: '',
	time: '',
	text:''
  }
});

// TweetCollection = Backbone.Collection.extend({
//   model: TweetEntry,
//   value: null,
//   // url: function(){ return "http://tweetriver.com/camilarc/south-park-test.json?callback=?"}
//   // url: function(){ return "http://www.logoslogic.com/chat/LivingRoom/southpark/service/south-park-test.json"}
//   // url: function(){ return "http://localhost/LivingRoom/southpark/service/south-park-test.json"}
//   url: function(){ return "service/tweet-river-redirect.php"}
// 
// });


TweetCollection = Backbone.Collection.extend({
	model: TweetEntry,
	value: null,
	comparator: function(TweetEntry){
		return -TweetEntry.get("created_at");
	},
	//url: function(){ return "service/tweet-river-redirect.php"},
	sync: function(method, collection, success, error) {
		var requestData={};
		var last_id  = ''
		if(collection.length>0) {
		    requestData.since_id=collection.last().get('order_id'); 
			console.log('tweetCollection sync collection.last.id '+collection.last().get('order_id') );
			last_id = collection.last().get('id');
		}
	
		var params = {
		    url:          "service/tweet-river-redirect.php",
		    type:         "GET",
		    data:         requestData,
		    success:      success,
		    error:        error
		};
		$.ajax(params);
		
	}

});




// TweetCollection2 = Backbone.Model.extend({
//     url: 'http://localhost/LivingRoom/southpark/service/south-park-test.json',
//     defaults: {
//         models: new TweetCollection()
//     },
//     parse: function(data) {
//         var attrs = data && data.objects && ( _.isArray( data.objects ) ? data.objects[ 0 ] : data.objects ) || data;
//         var model = this;
//         incoming_model_uris = _.map(attrs.models, function(model) {
//             return model.id;
//         });
//         existing_model_uris = this.get('models').map(function(model) {
//             return model.get('id');
//         });
//         _.each(existing_model_uris, function(uri) {
//             if(incoming_model_uris.indexOf(uri) == -1) {
//                 model.get('models').remove(model.get('models').get(uri));
//             }
//         });
//         _.each(incoming_model_uris, function(uri) {
//             if(existing_model_uris.indexOf(uri) == -1) {
//                 model.get('models').add(_.detect( attrs.models, function(model) { return model.id == uri; }));
//             }
//         });
//         // _.each(attrs.models, function(model) {
//         //     if(Sha1.hash(JSON.stringify(model)) != Sha1.hash(JSON.stringify(model.get('models').get(model.resource_uri)))) {
//         //         model.get('models').get(model.resource_uri).set(model);
//         //     }
//         // });
//         delete attrs.models;
//         return attrs;
//     },
//     initialize: function() {
//         _.bindAll(this, 'parse');
//         this.fetch();
//     }
// });


	/*http://stackoverflow.com/questions/5963324/polling-a-collection-with-backbone-js */
	/*http://stackoverflow.com/questions/5427038/backbone-js-updating-of-models-in-a-collection */


/*	 */

// models.TweetCollection = Backbone.Collection.extend({
//     model: models.TweetEntry
// });

/*var TweetCollection = Backbone.Collection.extend({
  model: TweetModel,
  sync: function(method, collection, success, error) {
    var requestData={};
    if(collection.length>0) {
        requestData.last_tweet_id=collection.last.id 
    }
    var params = {
        url:          "/tweet",
        type:         "POST",
        data:         requestData,
        success:      success,
        error:        error
    };
    $.ajax(params);
  }
}
*/