/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global $ Strophe $msg */

/*

Chat plugin for Strophe.js
----------------------------
Adds handlers for sending and receiving chat messages

by: @HenrikJoreteg, (you should follow me and @andyet on twitter)

Copyright 2010 - &yet (http://andyet.net)

MIT licensed, enjoy.

*/

Strophe.addConnectionPlugin('chat', {
	init: function (connection) {
		this.connection = connection;
		// according to XEP-0085
		this.valid_chat_states = [
			'active',
			'composing',
			'paused',
			'inactive',
			'gone'
		];
		this.CHAT_STATE_NS = "http://jabber.org/protocol/chatstates";
	},
	
	// called when connection status is changed
	statusChanged: function (status) {
		// automaticall send our status when connected
		if (status === Strophe.Status.CONNECTED) {
			// add the handler for receiving chats when we first connect
			this.connection.addHandler(this.chatDelegator.bind(this), null, "message", "chat");
		}
	},
	
	// just a function to filter out chat messages
	// versus chat status updates
	chatDelegator: function (message) {
		var chat_state, jid;
		
		console.log(message);
		
		console.log('chatDelegator');
		
		jid = $(message).attr('from');
		
		// make sure it has a jid, as a sanity check
		if (jid) {
			// try to find a chat state
			chat_state = $(message).find('[xmlns="' + this.CHAT_STATE_NS + '"]');
			
			// route it to our handler
			if (chat_state.length) {
				this.handleChatState(jid, chat_state);
			}
			
			// pass it to our regular chat handler
			this.handleChat(jid, message);
		}
		
		return true;
	},
	
	sendChat: function (jid, body) {
		this.connection.send(
			$msg({
				to: jid,
				"type": "chat"
			})
			.c('body')
			.t(body)
			.up()
			.c('active', {
				xmlns: this.CHAT_STATE_NS
			}));
	},
	
	handleChatState: function (jid, state_elem) {
		var result = {
			jid: jid,
			status: state_elem.first()[0].localName
		};
		
		if (StropheConfig && $.isFunction(StropheConfig.chatStateReceived)) {
			StropheConfig.chatStateReceived(result);
		}
		else {
			$(document).trigger('chatStateReceived', result);
		}
	},
	
	handleChat: function (jid, message) {
		
		console.log('handleChat '+message);
		var mess = {};
		
		mess.full_jid = jid;
		mess.bare_jid = Strophe.getBareJidFromJid(jid);
		
		// try to find an html body
		mess.html_body = $(message).find('html[xmlns="http://jabber.org/protocol/xhtml-im"] > body').html();
		
		// try to find a plain text body
		mess.body = $(message).find('> body');
		
		/*		
		trigger the event so the implementing app can handle it.
		sends a message object with the following properties:
		
		- full_jid
		- bare_jid
		- body
		*/
		// since plain body is required in the spec, we will check for that
		// to determine whether it's a chat with content or not.
		if (mess.body.length) {
			// we want the text string now
			mess.body = mess.body.text();
			
			// look for the global StropheConfig object
			// otherwise just trigger an event on the document that can be listened for
			if (StropheConfig && $.isFunction(StropheConfig.chatReceived)) {
				StropheConfig.chatReceived(mess);
			}
			else {
				$(document).trigger('chatReceived', mess);
			}
		}
		
		return true;
	},
	
	sendChatState: function (jid, status) {
		this.connection.send(
			$msg({
				to: jid,
				'type': 'chat'
			})
			.c(status, {xmlns: this.CHAT_STATE_NS})
		);
	}
});