;
(function ($) {
  var methods = {
		init: function(options) {
			return this.each(function () {
				var $this = $(this),
					settings = {
						self: $this,
						date: null,
						
					};

				$.extend(settings, options);

				if (typeof $this.data('settingsDeadlineControl') == 'undefined') {
					$this.data('settingsDeadlineControl', settings);
					$this.selectControl({
						width: 150,
						setTextOnInit: false,
						data: settings.data
					});

					// init
				}
			});
		},
		setByDate: function(date) {
			var $this = $(this),
				settings = $this.data('settingsDeadlineControl');
		},
		setByTimestamp: function(timestamp) {

		},
		setById: function(id) {
			var $this = $(this),
				settings = $this.data('settingsDeadlineControl');

		},
		setToday: function() {
			var $this = $(this),
				settings = $this.data('settingsDeadlineControl');

		},
		nextDay: function() {
			var $this = $(this),
				settings = $this.data('settingsDeadlineControl');

		},
		prevDay: function() {
			var $this = $(this),
				settings = $this.data('settingsDeadlineControl');

		},
		getDate: function () {
			var $this = $(this),
				settings = $this.data('settingsDeadlineControl');

		},
	};

	var DeadlineControl = function(element, options) {
		this.el = element;
		this.$el = $(element);
		this.opts = options;

		this._init();
	};

	$.extend(DeadlineControl.prototype, {
		_init: function() {
			this.$el.selectControl({
				width: 150,
				setTextOnInit: false,
				data: this.opts.data
			});
		}
	});

	$.extend(DeadlineControl, {
		dateSeparator: '.',
		formatDate: function(date, separator) {
			var formatedStr;
			separator = separator || DeadlineControl.dateSeparator;
			if (date instanceof Date) {
				formatedStr = date.getDate() + 
			}
			return;
		}
	});

	var idList = {
			CUSTOM_DATE: 'customDate'
		},
		defaults = {
			className: 'deadlineControl',
			date: null,
			idList: idList,
			data: {
	            'notSet': 		{id: 'notSet', 		value: 'notSet', 	text: 'Не утановлен',	optionText: 'Не утановлен'},
	            'yesterday': 	{id: 'yesterday', 	value: 'yesterday', text: 'Вчера',			optionText: 'Вчера'},
	            'today': 		{id: 'today', 		value: 'today', 	text: 'Сегодня', 		optionText: 'Сегодня'},
	            'tomorrow': 	{id: 'tomorrow', 	value: 'tomorrow', 	text: 'Завтра', 		optionText: 'Завтра'},
	            'in2Days': 		{id: 'in2Days', 	value: 'in2Days', 	text: 'Через 2 дня', 	optionText: 'Через 2 дня'},
	            'in4Days': 		{id: 'in4Days', 	value: 'in4Days', 	text: 'Через 4 дня', 	optionText: 'Через 4 дня'},
	            'in1Week': 		{id: 'in1Week', 	value: 'in1Week', 	text: 'Через неделю', 	optionText: 'Через неделю'},
	            'customDate': {
	            	id: 'customDate', value: 'customDate', text: 'Произвольная дата', optionText: 'Произвольная дата',
	            	closeOnClick: false,
	            	setActiveOnClick: false,
	            	onClick: function($option, id, value, text, optionText) {
	            		var $that = this;

	            		$option.datePickerControl({
							saveDate: true,
							onSave: function(date) {                
								$that.selectControl('set', idList.CUSTOM_DATE, date, date.toLocaleString());
								//TODO: chaining is broken in selectControl methods
								$that.selectControl('close');
							}
						});
	            	}
	           	}
	        }
		};

	/**
	 * jQuery.deadlineControl
	 *
	 */

	$.fn.deadlineControl = function(options) {
		var isMethod = options in DeadlineControl.prototype,
			args = arguments;

		if (!isMethod) {
			options = $.extend({}, defaults, options);
		}
        
        return this.each(function() {
        	var that = this,
        		$this = $(this),
        		instance = $this.data('deadlineControl');
        		
        	if (!(instance && isMethod)) {
	            $this.data('deadlineControl', new DeadlineControl(this, options));
        	}
        	else if ($.isFunction(instance[options])) {
        		instance[options](Array.prototype.slice.call(args, 1));
        	}
        	else {
				$.error('Method ' + method + ' does not exist on jQuery.deadlineControl');
			}
        });
    };
    //DEFAULTS public reference
	$.fn.deadlineControl.defaults = defaults;

})(jQuery);
