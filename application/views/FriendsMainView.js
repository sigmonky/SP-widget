var FriendsMainView = Backbone.View.extend({
	template: $('#friends_main_window'),

	initialize: function (options) {
        _.bindAll(this, 'render');
    }, 

	render: function() {
		var template = Handlebars.compile(this.template.html());
		$(this.el).html(template(this.model));
        return this;
    }, 
	
});