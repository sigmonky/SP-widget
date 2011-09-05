var HeaderView = Backbone.View.extend({
	el: $('#header_view'),
	
	initialize: function() {
		_.bindAll(this);

		
		$('.mainNav').click(function(){
			$('.mainNav').each(function(item){
				$(this).css('color', '#A98A10');
			})
			$(this).css('color', '#FFF');
		})
		
		return this;
	},

});