/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global Strophe $pres localStorage */

/*

Status plugin for Strophe.js
----------------------------
Manages storing, persisting and sending status for currently logged in user

by: @HenrikJoreteg, (you should follow me and @andyet on twitter)

Copyright 2010 - &yet (http://andyet.net)

MIT licensed, enjoy.

*/

Strophe.addConnectionPlugin('status', {
	init: function (connection) {
		this.connection = connection;
		
		// set a flag for if we can save stuff to local
		this.storageAvailable = (JSON && localStorage) ? true : false;
		
		// try to retrieve status from localStorage
		if (this.storageAvailable && localStorage.otalk_status) {
			this.status = JSON.parse(localStorage.otalk_status);
		}
		else {
			this.status = {
				show: '',
				statusMessage: ''
			};
		}
	},
	
	// called when connection status is changed
	statusChanged: function (status) {
		// automaticall send our status when connected
		if (status === Strophe.Status.CONNECTED) {
			this.sendStatus();
			this.saveStatus();
		}
	},
	
	setShow: function (show, persist) {
		// set the persist default to true
		if (persist === undefined) {
			persist = true;
		}
		
		// TODO: this should have a check to make sure it's one
		// of the allowed states for 'show'
		this.status.show = show;
		
		// broadcast it
		this.sendStatus();
		
		// save it unless we're told not to
		if (persist) {
			this.saveStatus();
		}
	},
	
	setCustomStatus: function (status, persist) {
		// set the persist default to true
		if (persist === undefined) {
			persist = true;
		}
		
		// set it
		this.status.statusMessage = status;
		
		// broadcast it
		this.sendStatus();
		
		// save it unless we're told not to
		if (persist) {
			this.saveStatus();
		}
	},
	
	goOffline: function () {
		this.connection.send($pres({
			type: "unavailable"
		}));
	},
	
	sendStatus: function () {
		this.connection.send($pres()
			.c('show')
			.t(this.status.show)
			.up()
			.c('status')
			.t(this.status.statusMessage));
	},
	
	saveStatus: function () {
		// only saves if browser supports it
		if (this.storageAvailable) {
			localStorage.otalk_status = JSON.stringify(this.status);
		}
	}
});