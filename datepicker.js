Date.prototype.getWeekDay = function() { 
    return (this.getDay() + 6) % 7;
};
    
$.widget("ui.datePickerControl", {
    // These options will be used as defaults
    defaults: {
        datepicker: function () {
            return this.options.$popup.find('.libBlockDatepickerNode');
        }
    },
    options: {
        saveDate : false,
      zIndex: 1001,
	    monthsNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
	    monthsNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
	    weekNamesDays: ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'],
	    weekDaysNamesShort: ['пон', 'вто', 'сре', 'чет', 'пят', 'суб', 'вос'],
	    nextDayButtonSelector: '.but-next-small',
	    prevDayButtonSelector: '.but-prev-small',
	    todayButtonSelector: '.balCldrTodayButton',
	    templateDateContainer: null,
        setOnInit: false, // вызывать при инициализации
        popupBodyAdditionalClass: '', // Дополнительный клас для попапа
    },
    _onChangeMonth: function () {
        var $el = this.options.element,
            curMonth = this.options.curMonth,
            nextMonth = this.options.nextMonth;

        $el
            .find('.libBlockDateSwitcherButton')
            .removeClass('libBlockDateSwitcherButton-active')
            .filter('.libBlockDatepickerMonth' + curMonth + ', .libBlockDatepickerMonth' + nextMonth)
            .addClass('libBlockDateSwitcherButton-active');
    },
    _onChangeYear: function () {
        var $el = this.options.element,
            curYear = this.options.curYear;

        $el.find('.libBlockYearSwitcherButtonCurrent').text(curYear);
    },
    setDate: function (date) {
        var that = this;
        that.options.date = date;
        var formattedDate = that.options.date.getMonth() +1 +'/' + that.options.date.getDate() + '/' + that.options.date.getFullYear();
        that.options.$datepicker.datepicker("setDate", formattedDate); 
    },
    getDate: function () {
        var that = this;
        return that.options.date;
    },
    changeDate: function (step, type) {
        var $datepicker = this.options.$datepicker;
        type = type || 'M'

        $.datepicker._adjustDate($datepicker, step, type);

        if (type === 'M') {
            this.options.curMonth += step;
            this.options.nextMonth += step;

            if (this.options.curMonth > 12) {
                this.options.curMonth -= 12;
            }

            if (this.options.nextMonth  > 12) {
                this.options.nextMonth  -= 12;
            }

            if (this.options.curMonth < 1) {
                this.options.curMonth += 12;
            }

            if (this.options.nextMonth < 1) {
                this.options.nextMonth  += 12;
            }

            this._onChangeMonth();
        } else {
            if (type === 'Y') {
                this.options.curYear += step;
            }

            this._onChangeYear();
        }

        // убираем полоску между соседними активными месяцами
        var $el = this.options.element,
            activeMonths = $el.find('.libBlockDateSwitcherButton-active'),
            $month1 = $(activeMonths[0]),
            $month2 = $(activeMonths[1]),
            monthsDiff = $month2.data('month') - $month1.data('month');

        $el.find('.libBlockDateSwitcherButtonRight').removeAttr('style');
        $el.find('.libBlockDateSwitcherButtonLeft').removeAttr('style');
        $el.find('.libBlockDateSwitcherButton').removeAttr('style');

        if (monthsDiff == 1 ) {
            $month1.find('.libBlockDateSwitcherButtonRight').css('backgroundPosition', '-4px -464px');
            $month2.find('.libBlockDateSwitcherButtonLeft').css('backgroundPosition', '-4px -380px');
            $month2.css('borderLeft', 'none');
        }
    },
	setNextDay: function() {
		var tomorrow = this.getDate();
		tomorrow.setDate(tomorrow.getDate() + 1);

		this.setDate(tomorrow);
	},
	setPrevDay: function() {
		var yesterday = this.getDate();
		yesterday.setDate(yesterday.getDate() - 1);

		this.setDate(yesterday);
	},
	setToday: function() {
		this.setDate(new Date());
	},
    _onSelect: function (date) {
        var that = this;
        if (typeof that.options.onSelect === "function") {
            this.options.onSelect(date);
        }

    },
    _create: function () {        
        $.extend(this.options, this.defaults);

        this.element.addClass('libBlockDatepickerTriggerBlock');
        this.options.$trigger = $(this.element);
        
        var that = this,
            date = new Date();

	    this.options.$trigger.disableSelection();
        
        // Задаём дату
        if (this.options.date === undefined || this.options.date === null || !this.options.date) {
            if (this.element.attr('data-timestamp') !== undefined && this.element.attr('data-timestamp'))
            {
                this.options.date = new Date(parseInt(this.element.attr('data-timestamp')) * 1000);
            } else {
                this.options.date = new Date();
            }
        }
        
        var $openedPopups = $('.datePickerControlOnenedPopup');
        if ($openedPopups.length > 0) {
            $openedPopups.each(function() {
                $(this).popupControl('close');
            });
        }
        that.options.$trigger.addClass('datePickerControlOnenedPopup');
        
        that.options.$trigger.popupControl({
            body: $.template({name: 'datePickerControl', id: 'templateCalendar'}),
            // onOpenComplete: function($popup) { },
            needVerticalPositionizeAfterOpen: true,
            popupBodyAdditionalClass: that.options.popupBodyAdditionalClass,
            onClose: function() {
                that.destroy();
            }
        });
        
        that.options.$popup = that.options.$trigger.popupControl('getBody');
        
        var $el = that.options.$popup.find('.libBlockDatepicker');
        
        that.options.$datepicker = that.options.$popup.find('.libBlockDatepickerNode');
        that.options.$popup = that.element.popupControl('getBody');
        that.options.element = $el;               
        
        that.options.$popup
            // close popup
            .on('click.dateCalendar', '.libBlockDatepickerCloseButton', function() {
                that.options.$trigger.popupControl('close');
            })
            .on('click.dateCalendar', '.libBlockDatepickerToday', function () {
                var $datepicker = that.options.$datepicker,
                    date = new Date();
                $datepicker.datepicker('setDate');
                that._onSelect(date);
            })
            // year selection
            .on('click.dateCalendar', '.libBlockYearSwitcherButton', function () {
                $el.find('.libBlockYearSwitcherDropdown').toggle();
            })
            // month selection
            .on('click.dateCalendar', '.libBlockDateSwitcherButton', function () {
                var $this = $(this),
                    month = $this.data('month'),
                    step = month - that.options.curMonth;
                that.changeDate(step, 'M');
                
                that.options.$trigger.popupControl('verticalPositionize');
            })
            // save data
            .on('click.dateCalendar', '.libBlockDatepickerSave', function () {
                var date = that.options.$datepicker.datepicker("getDate");
                
                that.options.date = date;
                
                if (typeof that.options.onSave === "function") {
                    that.options.onSave.call(that, date);
                    
                    // Сохраняем дату, если нужно
                    if (that.options.saveDate)
                    {
                        var formattedDate = that.options.date.getMonth() +1 +'/' + that.options.date.getDate() + '/' + that.options.date.getFullYear();
                        that.options.$datepicker.datepicker("setDate", formattedDate); 
                        that.changeDate(0, 'M');
                    }
                }
                if (that.options.$popup) {
                    that.options.$popup.find('.libBlockDatepickerCloseButton').trigger('click');
                }
            })
            .on('click.dateCalendar', '.ui-state-default', function (event) {
                $('.libBlockDatepickerSave').trigger('click');
            })
            // prev month
            .on('click.dateCalendar', '.libBlockDatepickerPrev', function (event) {
                event.preventDefault();
                that.changeDate(-1, 'M');
                
                that.options.$trigger.popupControl('verticalPositionize');
            })
            // next month
            .on('click.dateCalendar', '.libBlockDatepickerNext', function (event) {
                event.preventDefault();
                that.changeDate(1, 'M');
                
                that.options.$trigger.popupControl('verticalPositionize');
            })
            .on('click.dateCalendar', '.libBlockYearSwitcherDropdown a', function (event) {

                var $this = $(this),
                    year = $this.data('year'),
                    step = year - that.options.curYear;

                that.changeDate(step, 'Y');
                $el.find('.libBlockYearSwitcherDropdown a').removeClass('libBlockYearSwitcherDropdownItem-active');
                $this.addClass('libBlockYearSwitcherDropdownItem-active');
                $el.find('.libBlockYearSwitcherDropdown').hide();
            });                
                   
        that._initDatepicker(function () {

            var formattedDate = that.options.date.getMonth() +1 +'/' + that.options.date.getDate() + '/' + that.options.date.getFullYear();
            
            that.options.curMonth = that.options.date.getMonth() + 1;
            that.options.nextMonth = (that.options.curMonth < 12) ? that.options.curMonth + 1 : 1;
            that.options.curYear = that.options.date.getFullYear();
            that.options.$datepicker.datepicker("setDate", formattedDate);
            
            $el.find('.libBlockYearSwitcherDropdownItem' + that.options.curYear).addClass('libBlockYearSwitcherDropdownItem-active');
            that.changeDate(0, 'M');
        });  

    },
    _initDatepicker: function (onInit) {
        var that = this,
            $datepicker = this.options.$datepicker;
        
        $datepicker.datepicker({
            showOtherMonths:    true,
            selectOtherMonths:  false,
            numberOfMonths:     2,
            defaultDate: that.options.date || new Date(),
            onSelect: function (dateString) {
                var date = new Date(parseInt(dateString.substr(6, 4)), parseInt(dateString.substr(0, 2)) - 1, parseInt(dateString.substr(3, 2)));
                that._onSelect.call(that, date);
                that.options.$popup.find('.libBlockDatepickerSave').trigger('click');
            }
        });

        if (that.option.setOnInit) {
            that._onSelect.call(that, that.options.date);
        }

        if (typeof onInit === "function") {
            onInit.call(that);
        }
    },
    destroy: function () {
        // Use the destroy method to reverse everything your plugin has applied
        $.Widget.prototype.destroy.call(this);
        this.options.element.off('.dateCalendar');
        $('body').off('.dateCalendar');
    }
});
