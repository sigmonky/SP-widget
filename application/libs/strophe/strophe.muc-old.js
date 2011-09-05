/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global $ Strophe $pres $msg, $iq, $build */

/*
Plugin to implement the MUC extension. http://xmpp.org/extensions/xep-0045.html
*/

Strophe.addConnectionPlugin('muc', {
	// The plugin must have the init function
	/***Function
	Initialize the MUC plugin. Sets the correct connection object and
	extends the namesace.
	*/
	init: function (connection) {
		this.connection = connection;
		/* extend name space 
		* NS.MUC - XMPP Multi-user chat namespace
		* from XEP 45.
		*
		*/
		Strophe.addNamespace('MUC_OWNER', Strophe.NS.MUC + "#owner");
		Strophe.addNamespace('MUC_ADMIN', Strophe.NS.MUC + "#admin");
	},
	
		
	/***Function
	Join a multi-user chat room
	Parameters:
	(String) room - The multi-user chat room to join.
	(String) nick - The nickname to use in the chat room. Optional
	(Function) msg_handler_cb - The function call to handle messages from the
	specified chat room.
	(Function) pres_handler_cb - The function call back to handle presence
	in the chat room.
	(String) password - The optional password to use. (password protected
	rooms only)
	*/
	join: function (room, nick, msg_handler_cb, pres_handler_cb, password) {
		var room_nick, msg, password_elem;
		
		room_nick = this.test_append_nick(room, nick);		
		
		msg = $pres({
				from: this.connection.jid,
				to: room_nick
			})
			.c("x", {xmlns: Strophe.NS.MUC});
			
		if (password) {
			password_elem = Strophe.xmlElement("password", [], password);
			msg.cnode(password_elem);
		}
		
		// add handler for the group chat messages
		// this.connection.addHandler(this.handleMucMessage.bind(this), null, "message", "groupchat");
		
		// we'll sort through the message in this handler
		this.connection.addHandler(this.handleMucPresence.bind(this));
		
		// send our room presence
		this.connection.send(msg);
	},
	
	
	handleMucMessage: function (message) {
		var result = {};
		
		console.log('handleMucMessage called');
		
		// we'll just cache the jquery object for efficiency
		message = $(message);
		
		result.room = message.attr('from').split('/')[0];
		result.nickname = message.attr('from').split('/')[1];
		result.body = message.find('> body').text();
		result.html_body = message.find('html[xmlns="http://jabber.org/protocol/xhtml-im"] > body').html();
		
		// look for the global StropheConfig object
		// otherwise just trigger an event on the document that can be listened for
		if (StropheConfig && $.isFunction(StropheConfig.handleMucMessage)) {
			StropheConfig.handleMucMessage(result);
		}
		else {
			$(document).trigger('mucMessageReceived', result);
		}
		
		// return true so Strophe doesn't delete the handler stays
		return true;
	},
	
	
	handleMucPresence: function () {
		// write this
	},
	
	
	/***Function
	Leave a multi-user chat room
	Parameters:
	(String) room - The multi-user chat room to leave.
	(String) nick - The nick name used in the room.
	(Function) handler_cb - Optional function to handle the successful leave.
	Returns:
	iqid - The unique id for the room leave.
	*/
	leave: function (room, nick, handler_cb) {
		var room_nick, presenceid, presence;
		
		room_nick = this.test_append_nick(room, nick);		
		presenceid = this.connection.getUniqueId();
		presence = $pres({
				type: "unavailable",
				id: presenceid,
				from: this.connection.jid,
				to: room_nick
			})
			.c("x", {xmlns: Strophe.NS.MUC});
		
		this.connection.addHandler(handler_cb, null, "presence", null, presenceid, null);
		
		this.connection.send(presence);
		
		return presenceid;
	},
	
	/***Function
	Parameters:
	(String) room - The multi-user chat room name.
	(String) nick - The nick name used in the chat room.
	(String) message - The message to send to the room.
	Returns:
	msgiq - the unique id used to send the message
	*/
	message: function (room, nick, message) {
		var room_nick, msgid, msg;
		
		room_nick = this.test_append_nick(room, nick);		
		msgid = this.connection.getUniqueId();
		msg = $msg({
				to: room,
				from: this.connection.jid,
				type: "groupchat",
				id: msgid
			})
			.c("body", {xmlns: Strophe.NS.CLIENT})
			.t(message);
		
		this.connection.send(msg);
		
		return msgid;
	},
	
	/***Function
	Start a room configuration.
	Parameters:
	(String) room - The multi-user chat room name.
	Returns:
	id - the unique id used to send the configuration request
	*/
	configure: function (room) {
		//send iq to start room configuration
		var config, stanza;
		
		config = $iq({
				to: room,
				type: "get"
			})
			.c("query", {xmlns: Strophe.NS.MUC_OWNER});
			
		stanza = config.tree();
		
		return this.connection.sendIQ(stanza, function () {}, function () {});
	},
	
	/***Function
	Cancel the room configuration
	Parameters:
	(String) room - The multi-user chat room name.
	Returns:
	id - the unique id used to cancel the configuration.
	*/
	cancelConfigure: function (room) {
		//send iq to start room configuration
		var config, stanza;
		
		config = $iq({
				to: room,
				type: "set"
			})
			.c("query", {xmlns: Strophe.NS.MUC_OWNER})
			.c("x", {xmlns: "jabber:x:data", type: "cancel"});
			
		stanza = config.tree();
		
		return this.connection.sendIQ(stanza, function () {}, function () {});
	},
	
	/***Function
	Save a room configuration.
	Parameters:
	(String) room - The multi-user chat room name.
	(Array) configarray - an array of form elements used to configure the room.
	Returns:
	id - the unique id used to save the configuration.
	*/
	saveConfiguration: function (room, configarray) {
		var config, stanza, i;
		
		config = $iq({
				to: room,
				type: "set"
			})
			.c("query", {xmlns: Strophe.NS.MUC_OWNER})
			.c("x", {xmlns: "jabber:x:data", type: "submit"});
		
		for (i = 0; i >= configarray.length; i += 1) {
			config.cnode(configarray[i]);
		}
		
		stanza = config.tree();
		
		return this.connection.sendIQ(stanza, function () {}, function () {});
	},
	
	/***Function
	Parameters:
	(String) room - The multi-user chat room name.
	Returns:
	id - the unique id used to create the chat room.
	*/
	createInstantRoom: function (room) {
		var roomiq = $iq({to: room,
						type: "set"})
			.c("query", {xmlns: Strophe.NS.MUC_OWNER})
			.c("x", {
				xmlns: "jabber:x:data",
				type: "submit"
			});
		
		return this.connection.sendIQ(roomiq.tree(), function () {}, function () {});
	},
	
	/***
	Set the topic of the chat room.
	Parameters:
	(String) room - The multi-user chat room name.
	(String) topic - Topic message.
	*/
	setTopic: function (room, topic) {
		var msg = $msg({
				to: room,
				from: this.connection.jid,
				type: "groupchat"
			})
			.c("subject", {xmlns: "jabber:client"}).t(topic);
		this.connection.send(msg.tree());
	},
	
	/***Function
	Changes the role and affiliation of a member of a MUC room.
	The modification can only be done by a room moderator. An error will be
	returned if the user doesn't have permission.
	Parameters:
	(String) room - The multi-user chat room name.
	(String) nick - The nick name of the user to modify.
	(String) role - The new role of the user.
	(String) affiliation - The new affiliation of the user.
	(String) reason - The reason for the change.
	Returns:
	iq - the id of the mode change request.
	*/
	modifyUser: function (room, nick, role, affiliation, reason) {
		var item_attrs, item, roomiq;
		
		item_attrs = {
			nick: Strophe.escapeNode(nick)
		};
		
		if (role !== null) {
			item_attrs.role = role;
		}
		
		if (affiliation !== null) {
			item_attrs.affiliation = affiliation;
		}
		item = $build("item", item_attrs);
		
		if (reason !== null) {
			item.cnode(Strophe.xmlElement("reason", reason));
		}
		roomiq = $iq({
				to: room,
				type: "set"
			})
			.c("query", {xmlns: Strophe.NS.MUC_OWNER}).cnode(item.tree());
		
		return this.connection.sendIQ(roomiq.tree(), function () {}, function () {});
	},
	
	/***Function
	Change the current users nick name.
	Parameters:
	(String) room - The multi-user chat room name.
	(String) user - The new nick name.
	*/
	changeNick: function (room, user) {
		var room_nick = this.test_append_nick(room, user);
		
		this.connection.send($pres({
				from: this.connection.jid,
				to: room_nick
			})
			.c("x", {
				xmlns: Strophe.NS.MUC
			})
		);
	},
	
	/***Function
	List all chat room available on a server.
	Parameters:
	(String) server - name of chat server.
	(String) handle_cb - Function to call for room list return.
	*/
	listRooms: function (server, handle_cb) {
		var iq = $iq({
				to: server,
				from: this.connection.jid,
				type: "get"
			})
			.c("query", {xmlns: Strophe.NS.DISCO_ITEMS}
		);		
		
		this.connection.sendIQ(iq, handle_cb, function () {});		
	},
	
	test_append_nick: function (room, nick) {
		var room_nick = room;
		
		if (nick) {
			room_nick += "/" + Strophe.escapeNode(nick); 
		}
		
		return room_nick;
	}
});