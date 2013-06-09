;(function( $ ) {
    var methods = {

        init: function(options) {
            return this.each(function() {
                var that = this, $this = $(this);
  			
				if ($this.hasClass('dropdownControlInited')) {
					return;
				}
				
				$this.addClass('dropdownControlInited');
				
                var settings = {
                    self: $this,
					
					listElement: 'li a', // Элемент списка
					listContainer: '.dropdownListContainer', // Контейнер для списка
					
					listActiveClass: 'bl-active',
					
                    searchContent: '.search-name', // по какому селектору идет поиск
                    searchInput: '.libBlockSearchSimple',

					searchNotFound: 'Ничего не найдено',
					
					searchInputShift: 74, // На сколько ширина поля поиска меньше ширины попапа
					
					saveSelect: true,
					
					width: 220,
					height: 255,
					
					showNotSelectedItem: false,
					listItem: null, // функция, формирующая элемент списка
					listNotSelectedItem: null, // функция, формирующая общий не выбранный элемент списка
				};
				
                $.extend(settings, options);

				if (settings.data === undefined) {
					return;
				}
				
				settings.initId = parseInt(settings.initId !== undefined ? settings.initId : ($this.attr('data-initId') ? $this.attr('data-initId') : 0)).toString(); // Инициализуемый id
				
				var dropdownList = '<ul class="libList">';
				if (settings.showNotSelectedItem && $.isFunction(settings.listNotSelectedItem)) {
					dropdownList += settings.listNotSelectedItem.call($this);	
				}
				$.each(settings.data, function() {
					if (parseInt(this.id) && $.isFunction(settings.listItem)) {
						dropdownList += settings.listItem.call($this, this);	
					}
				});
				dropdownList += $.template({
					name: 'dropdownControl',
					id: 'templateUmbrellaListItem',
					params: {
						name: settings.searchNotFound
					}
				});
				dropdownList += '</ul>';
				
				var dropdownBody = $.template({
					name: 'dropdownControl',
					id: 'templateDropdownBody',
					params: {
						width: parseFloat(settings.width).toString() + 'px',
						searchWidth: (parseFloat(settings.width) - parseFloat(settings.searchInputShift)).toString() + 'px',
						height: parseFloat(settings.height).toString() + 'px',
					}
				});
				
				$this.popupControl({
					body: dropdownBody,
					onClose: function() {
						methods.closePopup.call($this);
					},
					onCloseComplete: function() {
						if (settings.onCloseComplete !== undefined && $.isFunction(settings.onCloseComplete)) {
							settings.onCloseComplete.call($this);
						}
					},
				});

				settings.$popup = $this.popupControl('getBody');
				
				settings.$popupBody = settings.$popup.find(settings.listContainer);
				settings.$popupBody.html(dropdownList)
					.height(settings.height - settings.$popup.find(settings.searchInput).outerHeight())
					.scrollControl();
				
				// выбор текущего
				settings.$popupBody.find(settings.listElement + '[data-id="'+settings.initId+'"]').addClass(settings.listActiveClass);
				
				$this.data('settingsdropdownControl', settings);
				
				methods.initSearch.call($this);
				methods.setEvents.call($this);
            })
        },
        initSearch: function() {
            var $this = $(this),
                settings = $this.data('settingsdropdownControl');
			
			settings.$popup.find(settings.searchInput).on('keyup', function(e) {
				var found = 0,
					$umbrella = settings.$popupBody.find(settings.listElement + '.barlistitemUmbrella');
				
				$.each(settings.$popupBody.find(settings.listElement), function(index, val) {
					var $row = $(val);
					if ($row.hasClass('barlistitemUmbrella')) {
						return;
					}
					if ($row.find(settings.searchContent).text().toLowerCase().indexOf($(e.target).val().toLowerCase()) == -1) { 
						$row.hide();
					} else { 
						$row.show();
						found++;
					}
				});
				if (found == 0) {
					$umbrella.show().parent().css('margin-top', settings.height / 2 - settings.$popup.find(settings.searchInput).outerHeight());
				} else {
					$umbrella.hide().parent().css('margin-top', 0);
				}
				
				settings.$popupBody.scrollControl('update');
				settings.$popupBody.find(settings.listElement).removeClass(settings.listActiveClass);
			});
        },
		setEvents: function() {
            var $this = $(this),
                settings = $this.data('settingsdropdownControl');
			
			settings.$popupBody.on('click', settings.listElement, function(event) {
				
				event.preventDefault();
				
				if ($(this).hasClass('barlistitemUmbrella')) {
					return;
				}
				
				var id = $(this).attr('data-id');
				if (settings.onSelect !== undefined && $.isFunction(settings.onSelect)) {
					settings.onSelect.call($this, id);
				}
				methods.saveSelect.call($this, id);
				$this.popupControl('close');
			});
		},
		closePopup: function() {
            var $this = $(this),
                settings = $this.data('settingsdropdownControl');
			$this.removeClass('dropdownControlInited');
		},
		saveSelect: function(id) {
            var $this = $(this),
                settings = $this.data('settingsdropdownControl');
			
			if (settings.saveSelect) {
				settings.initId = id;
				$this.data('settingsdropdownControl', settings);
			}
		}
    };
	
    $.fn.dropdownControl = function(method) {
        if (methods[method]) {
            return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.');
        }
    };
	
})(jQuery);

