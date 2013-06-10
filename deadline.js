;
(function ($) {
	var DAY = 86400000,
		idList = {
			CUSTOM_DATE: 	'customDate',
			NOT_SET: 		'notSet',
			YESTERDAY: 		'yesterday',
			TODAY: 			'today',
			TOMORROW: 		'tomorrow',
			IN_TWO_DAYS: 	'in2Days',
			IN_FOUR_DAYS: 	'in4Days',
			IN_ONE_WEEK: 	'in1Week',
		},
		defaults = {
			className: 'deadlineControl',
			date: null,
			onSelect: null,
			width: 150,
			idList: idList,
			data: {}
		};

	defaults.data[idList.NOT_SET] = 		{text: 'Не утановлен',	optionText: 'Не утановлен'};
	defaults.data[idList.YESTERDAY] = 		{text: 'Вчера',			optionText: 'Вчера', 		dif: '-1'};
	defaults.data[idList.TODAY] = 			{text: 'Сегодня', 		optionText: 'Сегодня', 		dif: '0'};
	defaults.data[idList.TOMORROW] = 		{text: 'Завтра', 		optionText: 'Завтра', 		dif: '1'};
	defaults.data[idList.IN_TWO_DAYS] = 	{text: 'Через 2 дня', 	optionText: 'Через 2 дня', 	dif: '2'};
	defaults.data[idList.IN_FOUR_DAYS] = 	{text: 'Через 4 дня', 	optionText: 'Через 4 дня', 	dif: '4'};
	defaults.data[idList.IN_ONE_WEEK] = 	{text: 'Через неделю', 	optionText: 'Через неделю', dif: '7'};
	
	$.each(defaults.data, function(id, val) {
		val.id = val.value = id;
	});

	var DeadlineControl = function(element, options) {
		this.el = element;
		this.$el = $(element);
		this.opts = options;
		this.dateMap = {};

		this._init();
	};

	$.extend(DeadlineControl.prototype, {
		_init: function() {
			var that = this,
				initialTimestamp = this.$el.data('timestamp');

			if (initialTimestamp) {
				this.opts.date = new Date(initialTimestamp);
			}

			this.opts.data[idList.CUSTOM_DATE] = {
				id: 'customDate',
				text: 'Произвольная дата',
				optionText: 'Произвольная дата',
	        	closeOnClick: false,
	        	setActiveOnClick: false,
	        	onClick: function($option, id, value, text, optionText) {
	        		$option.datePickerControl({
						saveDate: true,
						onSave: function() {
							that._chooseDate.apply(that, arguments);
							that.opts.onSelect.apply(that, arguments);
						}
					});
	        	}
	       	};
	       	this._createDateMap();
			this.$el.selectControl({
				width: this.opts.width,
				setTextOnInit: false,
				data: this.opts.data,
				onSelect: function($option, id, value, text, optionText) {
					if ($.isFunction(that.opts.onSelect)) {
						if (id !== idList.CUSTOM_DATE) {
							that.opts.onSelect.call(this, value);
						}
					}
				}
			});
			if (this.opts.date instanceof Date) {
				//normalize incoming date
				this.opts.date.setHours(0,0,0,0);
				this._chooseDate(this.opts.date);
			}
		},
		_createDateMap: function() {
			var that = this;
			if (this.opts.data) {
				$.each(this.opts.data, function(id, val) {
					if (val.dif) {
						that.dateMap[val.dif] = val;
					}
				});
			}
		},
		_chooseDate: function(date) {
			var mappedDate = this._mapDate(date),
				isMapped = !!mappedDate,
				optionId = isMapped ? mappedDate.id : idList.CUSTOM_DATE;

			this.$el.selectControl('set',
								optionId,
								isMapped ? mappedDate.value : date.valueOf(),
								isMapped ? mappedDate.text : DeadlineControl.formatDate(date));
			//TODO: chaining is broken in selectControl methods
			this.$el.selectControl('close');
			this.selectedDate = date;
			return this;
		},
		_mapDate: function(date) {
			return this.dateMap[(date.setHours(0,0,0,0) - (new Date()).setHours(0,0,0,0)) / DAY];
		},
		setByDate: function(date) {
			if (data instanceof Date) {
				return this._chooseDate(date);
			}
			return date;
		},
		setByTimestamp: function(timestamp) {
			if (timestamp) {
				this._chooseDate(new Date(timestamp));
			}
			return timestamp;
		},
		setById: function(id) {
			if (id in this.opts.data) {
				var obj = this.opts.data[id];
				this.$el.selectControl('set', id, obj.value, obj.text);
				return this;
			}
			return id;
		},
		setToday: function() {
			return this.setById(idList.TODAY);
		},
		nextDay: function() {
			return this.setById(idList.TOMORROW);
		},
		prevDay: function() {
			return this.setById(idList.YESTERDAY);
		},
		getDate: function () {
			return this.selectedDate;
		}
	});

	$.extend(DeadlineControl, {
		dateSeparator: '.',
		idList: idList,
		formatDate: function(date, separator) {
			var format = function(val) {
				if (val = val + '') {
					val.length < 2 && (val = '0' + val);
				}
				return val;
			};
			var formatedStr;

			separator = separator || DeadlineControl.dateSeparator;
			if (date instanceof Date) {
				formatedStr = format(date.getDate()) + 
								separator + 
								format(date.getMonth() + 1) + 
								separator + 
								date.getFullYear();
			}
			return formatedStr || date;
		}
	});

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
        		
        	if (!instance && !isMethod) {
	            $this.data('deadlineControl', new DeadlineControl(this, options));
        	}
        	else if (instance && $.isFunction(instance[options])) {
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
