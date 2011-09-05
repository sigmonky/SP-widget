var ChatMessageView = Backbone.View.extend({
	template: $('#chat_message'),
	className: 'chat-row',
	
    initialize: function (options) {
        _.bindAll(this, 'render');
    }
    , render: function () {
        // var text = this.model.get('text');
        // var userName = this.model.get('user').replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // $(this.el).html(userName + ': ' + text);
        // return this;
        var template = Handlebars.compile(this.template.html());
		$(this.el).html(template(this.model));
		return this;
    }
    , remove: function () {
        $(this.el).remove();
    }
});