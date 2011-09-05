/* Online Friends or Room Participants */

var RoomRoster = Backbone.Model.extend({
  defaults: {
    jid: '',
    facebook_id: '',
	nickname: '',
	profile_thumb_url: '',
	subscription: '',
	chatActive: ''
  }
});

// models.RoomRosterCollection = Backbone.Collection.extend({
//     model: models.RoomRoster
// });

var FriendRoster = Backbone.Model.extend({
	//   defaults: {
	//     jid: '',
	//     facebook_id: '',
	// nickname: '',
	// profile_thumb_url: '',
	// subscription: '',
	// chatActive: ''
	//   }
});

// models.FriendRosterCollection = Backbone.Collection.extend({
//     model: models.FriendRoster
// });