var BuzzMessageView = Backbone.View.extend({
	className: 'row',
	template: $('#tweet-template'),
	initialize: function() {
	  _.bindAll(this, 'render');
	},
	render: function() {
		var template = Handlebars.compile(this.template.html());
		$(this.el).html(template(this.model));
		console.log('render BuzzMessageView')
		return this;
	}
});