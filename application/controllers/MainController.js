var App =  Backbone.Controller.extend({	
	paneView: null,
	headerView: null,
	connection:  null,
	routes: {
        "":       "index",
        "allfans":  "index",
		"myfriends": "goToMyFriends",
		"buzz":  "goToBuzz"
    },

	initialize: function() {
		// $('input[name=message]').focus();  
		// this.headerView = new HeaderView({view: this});
		// this.paneView = new PaneView();
		// return this;		
	},
	
    init: function (options) {
	
		var view;
		
		/*Start XMPP Connection */

		

		//JabberClient.init(connection);
		
		/* All Fans View Start up */
		//         this.model = new models.ChatRoomModel();
		// var remoteJid = '';
		//         var name = '';
		
		$('input[name=message]').focus();  
		this.headerView = new HeaderView({view: this});
		this.paneView = new PaneView();


      //  this.view = new ChatView({model: this.model, remoteJid: remoteJid, el: $('#all_fans_view'), name: name});


   //    this.view.render();

        return this;
    }, 

	index: function(){
		this.paneView.renderAllFans();
	},

	goToMyFriends: function() {
		this.paneView.renderMyFriends();
	},
	
	goToBuzz: function() {
		this.paneView.renderBuzz();
	},
	
	msgReceived: function (message) {
		console.log('msgReceived')
    },

	onResult: function (message) {
		console.log('result')

    },

});
