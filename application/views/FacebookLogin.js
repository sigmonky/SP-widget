var FacebookLogin = Backbone.View.extend({
    events: {
        'click .facebook_connect': 'facebookConnect'
     }, 
	template: $('#facebook_login_window'),

	initialize: function (options) {
        _.bindAll(this, 'facebookConnect');
        _.bindAll(this, 'render');
    }, 

	render: function() {
		var template = Handlebars.compile(this.template.html());
		var facebook = {};
		facebook.url  = MyFacebookUser.loginUrl;
		$(this.el).html(template(facebook));
        return this;
    }, 

	facebookConnect: function () {
		location.href= MyFacebookUser.loginUrl
    }, 

	
});