$(function(){

	// Create a model for the services
	var Service = Backbone.Model.extend({

		// Will contain three attributes.
		// These are their default values

		defaults:{
			title: 'title',
			value: 100,
      state: 0,
			checked: false
		},

		// Helper function for checking/unchecking a service
		toggle: function(){
			this.set('checked', !this.get('checked'));
      this.set('state', (this.get('state') + 1) % 4);
		}
	});

	// Create a collection of services
	var ServiceList = Backbone.Collection.extend({

		// Will hold objects of the Service model
		model: Service,

		// Return an array only with the checked services
		getChecked: function(){
			return this.where({checked:true});
		}
	});

	// Prefill the collection with a number of services.
	var services = new ServiceList();

  for (var i=0; i < 16; i++) {
    var rnd = Math.ceil(Math.random()*8)+2;
    var rndState = Math.ceil(Math.random() * 4);
    services.add(new Service({ title: rnd, value: rnd, state: rndState }));
  }

	// This view turns a Service model into HTML
	var ServiceView = Backbone.View.extend({
		tagName: 'div',
    className: 'mybox',


		events:{
			'click': 'toggleService'
		},

		initialize: function(){

			// Set up event listeners. The change backbone event
			// is raised when a property changes (like the checked field)

			this.listenTo(this.model, 'change', this.render);
		},

		render: function(){
      if (this.model.get('checked') == true) {
        $(this.el).addClass('checked');
      } else {
        $(this.el).removeClass('checked');
      };

			// Create the HTML
			this.$el.html('<input type="checkbox" style="display: none;" value="1" name="' + this.model.get('title') + '" /> ' + this.model.get('value') + " S" + this.model.get('state'));
			this.$('input').prop('checked', this.model.get('checked'));
    
    	// Returning the object is a good practice
			// that makes chaining possible
			return this;
		},

		toggleService: function(){
			this.model.toggle();
		}
	});


	// The main view of the application
	var App = Backbone.View.extend({
		// Base the view on an existing element
		el: $('#main'),


    events : {
      'click #order' : 'hitbox'
    },

    hitbox : function () {
			var total = 0;

			_.each(services.getChecked(), function(elem){
				total += elem.get('value');
        elem.set('checked', false);
			});
     
      console.log (this.wantmod); 
      if (total % this.wantmod == 0) {
        console.log ('valid hit : ' + this.wantmod);
        this.score = this.score + total;
        this.wantmod = Math.ceil(Math.random()*8)+2;
        do {
          this.avoidmod = Math.ceil(Math.random()*8)+2;
        } while (this.avoidmod % this.wantmod == 0)
      }
      this.$score.text(this.score);
      this.render();

    },

		initialize: function(){
      this.startTime = new Date();

			// Cache these selectors
			this.total = $('#total span');
			this.list = $('#services');

      this.timePermitted = 60; // in seconds
      this.timePassed = 0; // in seconds
		
      this.wantmod = 3;
      this.avoidmod = 4;
      this.score = 0;

      this.$timeElapsed = $('#timeElapsed span');
      this.$wantmod = $('#wantmod span');
      this.$avoidmod = $('#avoidmod span');	
      this.$score = $('#score span');

			// Listen for the change event on the collection.
			// This is equivalent to listening on every one of the 
			// service objects in the collection.
			this.listenTo(services, 'change', this.render);

			
			// Create views for every one of the services in the
			// collection and add them to the page

			services.each(function(service){
				var view = new ServiceView({ model: service });
				this.list.append(view.render().el);

			}, this);	// "this" is the context in the callback

      this.render();
		},

		render: function(){
      setInterval (function() {
        var total = 0;
      
        _.each(services.getChecked(), function(elem){
          total += elem.get('value');
        });

        this.total.text(total);
        this.$wantmod.text(this.wantmod);
        this.$avoidmod.text(this.avoidmod);
        this.$('#score span').text(this.score);
    
        if (total % this.avoidmod == 0 && total != 0) {
          console.log ('you hit avoidmod value: ' + this.avoidmod);
        }

        if (this.timePassed < this.timePermitted) {
          curTime = new Date();
          this.timePassed = Math.floor((curTime.getTime() - this.startTime.getTime()) / 1000);
          this.$timeElapsed.text(this.timePermitted - this.timePassed);
        }

        return this;

		}.bind(this), 1000
  )},

	});

	new App();

});
