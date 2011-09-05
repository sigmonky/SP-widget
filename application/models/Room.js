/* Main Room  */

var Room = Backbone.Model.extend({
	  defaults: {
	    jid: '',
	    name: '',
	isPrivate: '',
	isActive: ''
	  },
	  initialize: function() {
	      this.users = new models.RoomCollection();
	  }
});


// models.RoomCollection = Backbone.Collection.extend({
//     model: models.Room
// });