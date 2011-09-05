/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global $ Strophe $iq $pres document StropheConfig */

/* 
Roster plugin.

This thing still needs a lot of work. It's pretty much just straight out of @metajacks' book which is 
intended for learning not for being feature complete.

It needs to send events for user changes individually instead of just sending a single roster changed
event. It should send an event for each user change individually.

*/


// Contact object
function Contact() {
	this.name = "";
	this.resources = {};
	this.subscription = "none";
	this.ask = "";
	this.groups = [];
}

Contact.prototype = {
	// compute whether user is online from their
	// list of resources
	online: function () {
		var k, result = false;
		
		for (k in this.resources) {
			if (this.resources.hasOwnProperty(k)) {
				result = true;
				break;
			}
		}
		
		return result;
	}
};

// example roster plugin
Strophe.addConnectionPlugin('roster', {
	init: function (connection) {
		this.connection = connection;
		this.contacts = {};

		Strophe.addNamespace('ROSTER', 'jabber:iq:roster');
	},

	// called when connection status is changed
	statusChanged: function (status) {
		var that, contact, roster_iq;
		
		if (status === Strophe.Status.CONNECTED) {
			this.contacts = {};

			// set up handlers for updates
			this.connection.addHandler(this.rosterChanged.bind(this), Strophe.NS.ROSTER, "iq", "set");
			this.connection.addHandler(this.presenceChanged.bind(this), null, "presence");

			// build and send initial roster query
			roster_iq = $iq({type: "get"}).c('query', {xmlns: Strophe.NS.ROSTER});

			that = this;
			this.connection.sendIQ(roster_iq, function (iq) {
				$(iq).find("item").each(function () {
					// build a new contact and add it to the roster
					var contact = new Contact();
					contact.name = $(this).attr('name') || "";
					contact.subscription = $(this).attr('subscription') ||
						"none";
					contact.ask = $(this).attr('ask') || ""; 
					$(this).find("group").each(function () {
						contact.groups.push($(this).text());
					});
					that.contacts[$(this).attr('jid')] = contact;
				});

				// let user code know something happened
				that.sendTrigger(that);
			});
		} else if (status === Strophe.Status.DISCONNECTED) {
			// set all users offline
			for (contact in this.contacts) {
				if (this.contacts.hasOwnProperty(contact)) {
					this.contacts[contact].resources = {};
				}
			}
			
			// notify user code
			this.sendTrigger(this);
		}
	},

	// called when roster udpates are received
	rosterChanged: function (iq) {
		var item, jid, subscription, contact;
		
		item = $(iq).find('item');
		jid = item.attr('jid');
		subscription = item.attr('subscription') || "";
		
		if (subscription === "remove") {
			// removing contact from roster
			delete this.contacts[jid];
		} else if (subscription === "none" || subscription === "from") {
			// adding contact to roster
			contact = new Contact();
			contact.name = item.attr('name') || "";
			item.find("group").each(function () {
				contact.groups.push(this.text());
			});
			this.contacts[jid] = contact;
		} else {
			// modifying contact on roster
			contact = this.contacts[jid];
			contact.name = item.attr('name') || contact.name || '';
			contact.subscription = subscription || contact.subscription;
			contact.ask = item.attr('ask') || contact.ask;
			contact.groups = [];
			item.find("group").each(function () {
				contact.groups.push(this.text());
			});
		}
		
		// acknowledge receipt
		this.connection.send($iq({type: "result", id: $(iq).attr('id')}));
		
		// notify user code of roster changes
		this.sendTrigger(this);
		
		return true;
	},

	// called when presence stanzas are received
	presenceChanged: function (presence) {
		var from, jid, resource, ptype;
		
		from = $(presence).attr("from");
		jid = Strophe.getBareJidFromJid(from);
		resource = Strophe.getResourceFromJid(from);
		ptype = $(presence).attr("type") || "available";

		if (ptype === "error") {
			// ignore presence updates from things not on the roster
			// as well as error presence
			return true;
		}
		
		if (ptype === "unavailable") {
			// remove resource, contact went offline
			if (this.contacts[jid]) {
				delete this.contacts[jid].resources[resource];
			}
		} else if (ptype === "subscribe") {
			// handle incoming subscription requests
			if (this.contacts[jid]) {
				// if we have them in our roster approve them
				this.connection.send($pres({
					to: jid, 
					'type': 'subscribed'
				}));
			} else {
				// look for the global StropheConfig object
				// otherwise just trigger an event on the document that can be listened for
				if (StropheConfig && $.isFunction(StropheConfig.subscriptionRequested)) {
					StropheConfig.subscriptionRequested({from: jid});
				}
				else {
					$(document).trigger('subscriptionRequested', {from: jid});
				}
			}
		}
		else {
			// contact came online or changed status
			if (this.contacts[jid]) {
				this.contacts[jid].resources[resource] = {
					show: $(presence).find("show").text() || "online",
					status: $(presence).find("status").text()
				};
			}
		}
		
		// notify user code of roster changes
		this.sendTrigger(this);
		
		return true;
	},

	// add a contact to the roster
	addContact: function (jid, name, groups) {
		var iq = $iq({type: "set"})
			.c("query", {xmlns: Strophe.NS.ROSTER})
			.c("item", {name: name || "", jid: jid});
		if (groups && groups.length > 0) {
			$.each(groups, function () {
				iq.c("group").t(this).up();
			});
		}
		this.connection.sendIQ(iq);
	},
	
	// delete a contact from the roster
	deleteContact: function (jid) {
		var iq = $iq({type: "set"})
			.c("query", {xmlns: Strophe.NS.ROSTER})
			.c("item", {jid: jid, subscription: "remove"});
		this.connection.sendIQ(iq);
	},


	// modify a roster contact
	modifyContact: function (jid, name, groups) {
		this.addContact(jid, name, groups);
	},
	
	// approve subscription request
	approveSubscription: function (jid, name) {
		name = name || '';
		
		// send the approval
		this.connection.send($pres({
			to: jid, 
			'type': 'subscribed'
		}));
		
		// add to our roster
		this.subscribe(jid, name);
	},
	
	// deny subscription request
	denySubscription: function (jid) {
		this.connection.send($pres({
			to: jid, 
			'type': 'unsubscribed'
		}));
	},
	
	// subscribe to a new contact's presence
	subscribe: function (jid, name, groups) {
		name = name || '';
		
		this.addContact(jid, name, groups);
		
		var presence = $pres({to: jid, "type": "subscribe"});
		this.connection.send(presence);
	},
	
	// unsubscribe from a contact's presence
	unsubscribe: function (jid) {
		var presence = $pres({to: jid, "type": "unsubscribe"});
		this.connection.send(presence);
		
		this.deleteContact(jid);
	},
	
	// this is just a convenience since it's triggered from multiple
	// places and I want to run a quick check to see if we've already registered
	// a handler.
	sendTrigger: function (stuff) {
		// look for the global StropheConfig object
		// otherwise just trigger an event on the document that can be listened for
		if (StropheConfig && $.isFunction(StropheConfig.rosterChanged)) {
			StropheConfig.rosterChanged(stuff);
		}
		else {
			$(document).trigger('rosterChanged', stuff);
		}
	}
});
