//
// Declare namespace


//
//Models
//=======
// This is tool from [JavascriptMVC](http://javascriptmvc.com/) framework.
// It used to create binded to `this` callbacks, when _.bind() can not do this.
Jabber.JsmvcCallback = {
	callback: function( funcs ) {
		var makeArray = $.makeArray,
		isFunction = $.isFunction,
		isArray = $.isArray,
		extend = $.extend,
		concatArgs = function(arr, args){
			return arr.concat(makeArray(args));
		};
		
		// args that should be curried
		var args = makeArray(arguments),
		self;
		
		funcs = args.shift();
		
		if (!$.isArray(funcs) ) {
			funcs = [funcs];
		}
		
		self = this;
		for( var i =0; i< funcs.length;i++ ) {
			if(typeof funcs[i] == "string" && !isFunction(this[funcs[i]])){
				throw ("class.js  does not have a "+funcs[i]+" method!");
			}
		}
		return function class_cb() {
			var cur = concatArgs(args, arguments),
			isString, 
			length = funcs.length,
			f = 0,
			func;
			
			for (; f < length; f++ ) {
				func = funcs[f];
				if (!func ) {
					continue;
				}
				
				isString = typeof func == "string";
				if ( isString && self._set_called ) {
					self.called = func;
				}
				cur = (isString ? self[func] : func).apply(self, cur || []);
				if ( f < length - 1 ) {
					cur = !isArray(cur) || cur._use_call ? [cur] : cur;
				}
			}
			return cur;
		};
	}
};

//
//Main class
//==========
//
Jabber.Xmpp = function(options) {
	if (!options) options = {}; 
    if (this.defaults) options = _.extend(this.defaults, options);
    this.options = options;
    this.initialize();
};


//Xmpp class implementation
//-------------------------
 
_.extend(Jabber.Xmpp.prototype, Jabber.JsmvcCallback, Backbone.Events, {

	initialize: function(){
		
		var BOSH_SERVICE = '/http-bind';
		this.connection = new Strophe.Connection(BOSH_SERVICE);
		
		// Strophe.log = function (lvl, msg) { log(msg); };
		this.connection.attach(Attacher.JID, Attacher.SID, Attacher.RID, this.callback('onConnect'));
		
		this.connection.rawInput = function (data) {
				log('RECV: ' + data);
			};
		
			this.connection.rawOutput = function (data) {
				log('SENT: ' + data);
			};
		
		// send disco#info to jabber.org
		var iq = $iq({to: 'jabber.org',	type: 'get',id: 'disco-1'}).c('query', {xmlns: Strophe.NS.DISCO_INFO}).tree()
		
		this.connection.send(iq);
		
		// this.bind('connected', this.onConnect);
		this.chatViews = new Array();


	},
	
	addView: function(jid){
		this.chatViews[jid].bind('send:message', this.callback('sendMessage'));
		
	},
	
	onMessage: function(msg){
	//	console.log('onmessage');
	},
	
	
	onConnect: function(){
		// console.log('onConnect join Room'+this.joinRoom() );
		this.joinRoom();
		this.setVcard();
		this.connection.addHandler(this.callback('onContactPresence'), null, 'presence');
		this.connection.addHandler(this.callback('onMessage'), null, 'message', 'chat');
		this.connection.addHandler(this.callback('onMessage'), null, 'message', 'groupchat');
		return true;
	},
	
	joinRoom: function(){
		console.log('join Room');
		
		//* IF MY FACEBOOK ID */
		var facebook_user_id = MyFacebookUser.id;
		var facebook_name = MyFacebookUser.name;
		
		//* OTHERWISE JOIN AS GUEST */
		if (facebook_user_id == ''){
			var nickname = 'guest_'+Math.floor(Math.random()*9999);
		}else{
			facebook_name = facebook_name.replace(/ /g,"_")
			var nickname = facebook_name+'-'+facebook_user_id;
		}
		console.log('join Room facebook_name'+facebook_name);
		this.connection.muc.join(RoomJid, nickname);
	},
	
	onSetVcard: function(){
		console.log('onSetVcard')
	},
	
	setVcard: function(){
		console.log('setVcard');
		console.log('setVcard FB ID' +MyFacebookUser.id);

		var facebook_user_id = MyFacebookUser.id;

		var vCardEl = document.createElement('nickname');
		var text = document.createTextNode(facebook_user_id);
		vCardEl.appendChild(text);

		this.connection.vcard.set(this.callback('onSetVcard'), vCardEl, facebook_user_id+'@logoslogic.com');
	   // set: function(handler_cb, vCardEl, jid) {


		// var iq = App.util.Strophe.buildIq("set", App.util.Strophe.connection.jid, App.util.Strophe.username, vCardEl);
		//         App.util.Strophe.connection.sendIQ(iq.tree(), App.util.Strophe.setVcardCallBack, null);
		// 
		// 	    console.log('setVcard 2');
	},
	
	roomPresenceHandler : function(obj){
		console.log('room presence handler '+obj)
	},
	
	roomMessageHandler : function(obj){
		console.log('room roomMessageHandler '+obj)
	},
	
	send_muc_message: function (room, body) {
		this.connection.muc.message(room, 'nickxx', body);
	},
	
	// 
	// onConnect: function(){
	// 	console.log('onConnect ')
	// 	
	// 	// request roster
	// 	var roster_iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
	// 	this.connection.sendIQ(roster_iq, this.callback('onRoster'));
	// 	this.trigger('ui:roster');
	// 	// add handlers
	// 	this.connection.addHandler(this.callback('onContactPresence'), null, 'presence');
	// 	this.connection.addHandler(this.callback('onMessage'), null, 'message', 'chat');
	// 	this.connection.addHandler(this.callback('onMessage'), null, 'message', 'groupchat');
	// 	
	// },
	
	onRoster: function(roster){
		// this.connection.send($pres());
		// this.trigger('ui:ready');
		// this.view.setStatus(Jabber.viewstates.online);
		// 
		// var items = Jabber.Roster.serializeRoster(roster);
		// 
		// for (var i=0; i<items.length; i++) {
		// 	this.roster.add(items[i]);
		// }
		// return true;
	},
	
	onContactPresence: function(presence){
		console.log('onContactPresence ')
		// var from = Strophe.getBareJidFromJid($(presence).attr('from')),
		// 	contact = this.roster.detect(function(c){return c.get('bare_jid') === from;});
		// if (contact) {
		// 	contact.updatePrecense(presence);
		// }
		//         if(this.options.autoChat){
		//         	_.delay(function(self){
		//         		self.sendWelcome();
		//         	}, '2000', this);
		//         }
		// return true;
	},
//	Public method, use it directly if you set `{autoChat: false}`
	sendWelcome: function(){
    	// if (!this._welcomeSent) {
    	// 	var userinfo = this.getUserinfo();
    	// 	this.roster.freezeManager();
    	// 	this._welcomeSent = true;
    	// 	this.sendMessage({
    	// 		text: userinfo,
    	// 		from: this.options.jid,
    	// 		to: this.roster.manager.get('jid'),
    	// 		hidden: true,
    	// 		dt: new Date()
    	// 	});
    	// }
	},
//	`sendMessage` used for send all messages 
	sendMessage: function(message, to){

		console.log('send message');
		
		if (typeof(message) === 'string'){
			var msg = new models.ChatEntry({
				text: message,
				from: '',
				to: to,
				facebook_id: '', 
				incoming: false,
				dt: new Date()
			});
		} else {
			var msg = new models.ChatEntry(message);
		}
		msg.send(this.connection);

	},

//	Handler for incoming messages
	onMessage: function(message){
		
		//console.log('onMessage ')
		
		/* Nickname is Equal to FB Photo ID */
		 var photo = $(message).find('nick').text();
		console.log('onMessage photo' +photo);
		
		var from = $(message).attr('from');
		var pos = from.indexOf('/') + 1;
		//console.log('pos '+pos);
		var full_nickname = from.substring(pos,from.length);
		var user_nick  = full_nickname.split('-')[0];
		var facebook_id  = full_nickname.split('-')[1];
		
		user_nick=user_nick.replace(/_/g," ");
		
		
		console.log('onMessage photo from' +from);
		console.log('onMessage photo full_nickname' +full_nickname);
		console.log('onMessage photo user_nick' +user_nick);
		console.log('onMessage photo facebook_id' +facebook_id);
		
		
		var messageSrc = $(message).find('body').text();
		var formattedMsg = emoticons(messageSrc);
		
		 var msg = new models.ChatEntry({
		 	text: formattedMsg,
		 	from: user_nick,
		 	to: $(message).attr('to'),
			facebook_id: facebook_id, 
		 	incoming: true,
		 	dt: new Date()
		 });
		
		//console.log('onmessage from = '+$(message).attr('from'));
		///console.log('onmessage to = '+$(message).attr('to'));
		
		 this.chatViews[RoomJid].collection.add(msg);
		
		 return true;
	},
//	Only trigger view event
	onMessageAdd: function(message){
		this.view.trigger('add:message', message);
	}
});