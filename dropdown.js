;(function( $ ) {
    var methods = {

        init: function(options) {
            return this.each(function() {
                var that = this, $this = $(this);
				
				if ($this.hasClass('selectControlInited')) {
					return;
				}
				
				$this.addClass('selectControlInited');
				
                var settings = {
                    self: $this,
					setTextOnInit: true, // задать текст на селекте при вызове контроле
                    setValueOnInit: true, // задать значение при иинциализации
                    appendDropIcon: true, // добавить стрелочку после текста
                    addControlClasses: true, // добавить классы к контейнеру селекта
                    controlClasses: 'selectControl', // сами добавляемые классы
                    onSelect: null, // коллбек функция, передается выбранный $option, id, value, text, optionText
                    dropDownClass: '.selectControlBarListDrop', // класс дропдауна
                    additionalDropDownSelector: '', // дополнительный класс дропдауна
                    data: {
                        '1': {id: '1', value: '1-й', text: 'Первый', optionText: 'Первый', onClick: function($option, id, value, text, optionText) { alert(value); }, closeOnClick: false},
                        '2': {id: '2', value: '2-й', text: 'Второй', optionText: 'Второй', closeOnClick: true},
                        '3': {id: '3', value: '3-й', text: 'Третий', optionText: 'Третий', closeOnClick: false, setActiveOnClick: false},
                    }, // массив или объект значений
                    listItem: function(item) {
                        return $.template({
                            name: 'selectControl',
                            id: 'templateListItem',
                            params: {
                                id: item.id,
                                text: $.isFunction(item.optionText) ? item.optionText(item.id) : item.optionText,
                            }
                        });
                    }, // функция, формирующая элемент списка
                    listItemSelector: 'a.barlistitem', // селектор к элементу списка
                    listItemActiveClass: 'ddb-active', // активный класс
                    setOptionOnInit: true, // при инициализации выделяль какой-то элемент
				};
				
                $.extend(settings, options);

				if (settings.data === undefined || _(settings.data).size() == 0) {
					return;
				}
				
                // начальное значение
				settings.initId = (settings.initId !== undefined ? settings.initId : ($this.attr('data-initId') ? $this.attr('data-initId') : 0)).toString(); // Инициализуемый id
                if (settings.data[settings.initId] === undefined && settings.setOptionOnInit) {
                    settings.initId = _(_(settings.data).toArray()).first().id;
                }
                
                if (settings.data[settings.initId] === undefined) {
                    settings.value = settings.value !== undefined ? settings.value : false;
                    settings.optionText = settings.optionText !== undefined ? settings.optionText : false;
                    settings.text = settings.text !== undefined ? settings.text : false;
                } else {
                    settings.value = $.isFunction(settings.data[settings.initId].value) ? settings.data[settings.initId].value(settings.initId) : settings.data[settings.initId].value;
                    settings.optionText = $.isFunction(settings.data[settings.initId].optionText) ? settings.data[settings.initId].optionText(settings.initId) : settings.data[settings.initId].optionText;
                    settings.text = $.isFunction(settings.data[settings.initId].text) ? settings.data[settings.initId].text(settings.initId) : settings.data[settings.initId].text;
                }

                settings.id = settings.initId;
                
                settings.$button = $this.find('.dropDownSelectBut');
                
                if (settings.addControlClasses) {
                    $this.addClass(settings.controlClasses);
                }
                if (settings.width !== undefined) {
                    $this.width(settings.width);
                }
                if (settings.setTextOnInit) {
                    settings.$button.prepend('<span class="selectControlButtonText">'+settings.text+'</span>');
                }
                if (settings.appendDropIcon) {
                    settings.$button.append(' <i class="icon-3-2-43-down-dark"></i>');
                }
                
				settings.$body = $($.template({
					name: 'selectControl',
					id: 'templateDropBody'
                })).appendTo($this);
                
                settings.$list = settings.$body.find('.barlistdrop');
                settings.$dropdown = settings.$body.find(settings.dropDownClass).hide();
                
				$.each(settings.data, function() {
					if (this.id !== undefined && $.isFunction(settings.listItem)) {
						settings.$list.append(settings.listItem.call($this, this));	
					}
				});

                // задаём выделенный
                settings.$list.find(settings.listItemSelector + '[data-id="'+settings.id+'"]').addClass(settings.listItemActiveClass);
                
				$this.data('settingsSelectControl', settings);
				
                settings.$button.on('click', function() {
                    if ($this.hasClass('selectControlVisible')) {
                        methods.close.call($this);
                    } else {
                        methods.open.call($this);
                    }
                });
              
                methods.setEvents.call($this);
            })
        },
        close: function(onClose) {
            var $this = $(this),
                settings = $this.data('settingsSelectControl');
            
            settings.$list.css('opacity', 0);
            
            setTimeout(function() {
                if (onClose !== undefined && $.isFunction(onClose)) {
                    onClose.call($this);
                }
                settings.$dropdown.hide();
                $this.removeClass('selectControlVisible');
            } , 150);
            
            $(window).off('.selectControl');
        },
        open: function() {
            var $this = $(this),
                settings = $this.data('settingsSelectControl');
            $this.addClass('selectControlVisible');
            settings.$dropdown.show();
            settings.$list.css('opacity', 1);
            setTimeout(function() {
                
                // Задаём закрытие
                $(window).on('mousedown.selectControl', function(event) { 
                    var $target = $(event.target);
                    var $dropdown = $target.parents(settings.dropDownClass);
                    if (settings.additionalDropDownSelector && $target.parents(settings.additionalDropDownSelector).length > 0) {
                        return;
                    }
                    if ($dropdown.length == 0) { // Кликнули не в дропдаун
                        methods.close.call($this);
                    }
                });
                
            }, 150);
        },
		setEvents: function() {
            var $this = $(this),
                settings = $this.data('settingsSelectControl');
			
			settings.$list.on('click', settings.listItemSelector, function() {                
				var id = $(this).attr('data-id').toString(),
                    value = $.isFunction(settings.data[id].value) ? settings.data[id].value(id) : settings.data[id].value,
                    optionText = $.isFunction(settings.data[id].optionText) ? settings.data[id].optionText(id) : settings.data[id].optionText,
                    text = $.isFunction(settings.data[id].text) ? settings.data[id].text(id) : settings.data[id].text,
                    $option = $(this),
                    closeOnClick = settings.data[id].closeOnClick !== undefined ? settings.data[id].closeOnClick : true;
                    setActiveOnClick = settings.data[id].setActiveOnClick !== undefined ? settings.data[id].setActiveOnClick : true;
                
				if (settings.onSelect !== undefined && $.isFunction(settings.onSelect)) {
					settings.onSelect.call($this, $option, id, value, text, optionText);
				}
                
                if (settings.data[id].onClick !== undefined) {
                    settings.data[id].onClick.call($this, $option, id, value, text, optionText);
                }

                if (setActiveOnClick) {
                    
                    if (closeOnClick) {
                        methods.close.call($this, function() {
                            settings.$list.find(settings.listItemSelector+'.'+settings.listItemActiveClass).removeClass(settings.listItemActiveClass);
                            $option.addClass(settings.listItemActiveClass);
                            settings.$button.find('.selectControlButtonText').html(text);
                        });
                    } else {
                        settings.$list.find(settings.listItemSelector+'.'+settings.listItemActiveClass).removeClass(settings.listItemActiveClass);
                        $option.addClass(settings.listItemActiveClass);
                        settings.$button.find('.selectControlButtonText').html(text);
                    }

                    settings.value = value;
                    settings.text = text;
                    settings.optionText = optionText;
                    settings.id = id;
                    
                    $this.data('settingsSelectControl', settings);
                }
                
				// methods.saveSelect.call($this, id);
			});
		},
        setId: function(id) {
            var $this = $(this),
                settings = $this.data('settingsSelectControl');
            
            settings.id = id;
            
            settings.$list.find(settings.listItemSelector+'.'+settings.listItemActiveClass).removeClass(settings.listItemActiveClass);
            settings.$list.find(settings.listItemSelector + '[data-id="'+settings.id+'"]').addClass(settings.listItemActiveClass);
            
            $this.data('settingsSelectControl', settings);
        },
        set: function(id, value, text) {
            var $this = $(this),
                settings = $this.data('settingsSelectControl');
        
            settings.id = id;
            settings.value = value;
            settings.text = text;
            
            settings.$list.find(settings.listItemSelector+'.'+settings.listItemActiveClass).removeClass(settings.listItemActiveClass);
            settings.$list.find(settings.listItemSelector + '[data-id="'+settings.id+'"]').addClass(settings.listItemActiveClass);
            
            settings.$button.find('.selectControlButtonText').html(text);
            
            $this.data('settingsSelectControl', settings);
        },
    };
	
    $.fn.selectControl = function(method) {
        if (methods[method]) {
            return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.');
        }
    };
	
})(jQuery);

