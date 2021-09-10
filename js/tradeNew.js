 var TradeNew = function (options) {

    var self = this;

    var def_options = {
        assetInfoContainerSelector : '#asset-block-info',
        tradeContainerSelector : '.right-block',
        tradePopoverRelativeSelector : '.action-submenu',
        multiAssetsDropdown : '.JS-multi-asset-dropdown',
        multiAssetsSubmenu : '.JS-asset-multi-submenu',

        actionChangeAmount : 'change_amount',
        actionChangeRateSl : 'change_rate_sl',
        actionChangeRateTp : 'change_rate_tp',
        actionChangeRatePlaceOrder : 'rate_change_place_order',
        actionSelectDirection : 'select_dir',
        actionHide          : 'hide',
        actionAdd           : 'add',
        actionClose         : 'close',
        actionShowHideSlTp  : 'sl_tp_check',
        actionOneclickUpdate: 'onclick_update',
        tabId          : 0,
        sltpType: 0
    };
    //todo Ð¿Ð¼Ð¾Ð¶Ð½Ð¾ Ð¿ÐµÑ€ÐµÐ¸Ð¼ÐµÐ½Ð¾Ð²Ð°Ñ‚ÑŒ Ð¿Ð¾Ð´ Ð±Ð¾Ð»ÐµÐµ Ð¾Ð±ÑˆÐ¸Ñ€Ð½Ð¾Ðµ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ð½Ð¸Ðµ Ñ„Ð»Ð°Ð³Ð¾Ð²/Ñ‚Ð°Ð¹Ð¼ÐµÑ€Ð¾Ð²/Ð¼ÐµÑ‚Ð¾Ðº
    self.timeouts = {};
    self.options = $.extend(def_options, options);
    self.selectedDirection = 0;
    self.tradeContainerClass = $(self.options.tradeContainerSelector).attr('class');

    /* Bind events */
    self.initEvents = function() {
        App.asset.onSwitch(function(response){
            var $tradeContainerSelector = $(self.options.tradeContainerSelector);
            $tradeContainerSelector.replaceWith(response.data.html_trade);
            self.emitImarginReq();
            //render asset popularity
            new ChartPlatform.Popularity("#popularity_chart");
        });

        // close trade action popuper when clicking on non action element
        $(document).on('click', self.options.tradeContainerSelector, function(e) {
            if (e.target.className === self.tradeContainerClass) {
                self.hidePopover();
            }
        });

        $(document).on('keyup', self.options.tradeContainerSelector + ' [name=money_invest]', function() {
            // manually update amount
            var $tradeContainer = $(self.options.assetInfoContainerSelector);
            clearTimeout(document.timeoutAmount);
            document.timeoutAmount = setTimeout(function(){
                self.updateAmount($tradeContainer, 0, 0, App.formater.clearNumber($tradeContainer.find('[name="money_invest"]').data('previous')));
                $tradeContainer.find('[name="money_invest"]').data('previous', $tradeContainer.find('[name="money_invest"]').val())
            }, 700);
        });

        $(document).on('keydown', self.options.tradeContainerSelector + ' [name=stop_lose]', function(e) {

            self.isValidInputSlTp($(this), e);

        }).on('keyup', self.options.tradeContainerSelector + ' [name=stop_lose]', function(e) {
            // manually update sl
            self.emitSlTpPnl($(self.options.assetInfoContainerSelector));


        }).on('change', self.options.tradeContainerSelector + ' [name=stop_lose]', function(e) {

            var $tradeContainer = $(self.options.assetInfoContainerSelector),
                currentPosition = $(this)[0].selectionStart;
            self.updateRateByField($tradeContainer, 0, 'stop_lose');
            App.formater.cursorDisplacement($(this), currentPosition, e);
        });

        $(document).on('keydown', self.options.tradeContainerSelector + ' [name=take_profit]', function(e){

            self.isValidInputSlTp($(this), e);

        }).on('keyup', self.options.tradeContainerSelector + ' [name=take_profit]', function(e) {

            // manually update tp
            self.emitSlTpPnl($(self.options.assetInfoContainerSelector));

        }).on('change', self.options.tradeContainerSelector + ' [name=take_profit]', function(e) {

            let $tradeContainer = $(self.options.assetInfoContainerSelector),
                currentPosition = $(this)[0].selectionStart;
            self.updateRateByField($tradeContainer, 0, 'take_profit');
            App.formater.cursorDisplacement($(this), currentPosition, e);

        });

        $(document).on('keyup', self.options.tradeContainerSelector + ' [name=strike]', function () {
            self.emitSlTpPnl($(self.options.assetInfoContainerSelector));
        });

        $(document).on('change', self.options.tradeContainerSelector + ' [name=place_order]', function () {
            self.emitSlTpPnl($(self.options.assetInfoContainerSelector));
        });

        $(document).on('change', self.options.tradeContainerSelector + ' [name=placeorder_type]', function(e) {
            var $assetInfoContainer = $(this).closest(self.options.assetInfoContainerSelector);
            var assetId = App.asset.getCurrentAssetDetails('id');
            var orderType = $assetInfoContainer.find('[name=placeorder_type] option:selected').val();
            var defEntryOrderRate = self.getDefRateOpenOrder(assetId, orderType);

            $assetInfoContainer.find('[name=strike]').val(defEntryOrderRate);
            var roundPrecision   = App.asset.getCurrentAssetDetails('round_precision')
            var tpRate = self.getDefaultSlTpRate(assetId, true, defEntryOrderRate);
            var slRate = self.getDefaultSlTpRate(assetId, false, defEntryOrderRate);

            $assetInfoContainer.find('[name=stop_lose]').val(App.formater.numberFormatRate(slRate, roundPrecision));
            $assetInfoContainer.find('[name=take_profit]').val(App.formater.numberFormatRate(tpRate, roundPrecision));
            self.emitSlTpPnl($assetInfoContainer);
        });

        $(document).on('click', self.options.tradeContainerSelector + ' [data-action]', function(e) {
            var $assetInfoContainer = $(this).closest(self.options.assetInfoContainerSelector);
            var $this = $(this);

            switch ($this.data('action')) {

                case self.options.actionOneclickUpdate : {
                    if ( ! App.trader.isGuest) {
                        if ( ! self.timeouts.hasOwnProperty('oneclick_start') || ! self.timeouts.oneclick_start) {
                            var oneClickTrading = $assetInfoContainer.find('[name=one_click_trading]').is(':checked');
                            self.timeouts.oneclick_start = true;
                            $.post('/ajax/trade/oneclick_update', {oneclick_trading : +oneClickTrading}, function(response) {
                                self.timeouts.oneclick_start = false;
                            }, 'json');
                        } else {
                            e.preventDefault();
                        }
                    } else {
                        e.preventDefault();
                        App.trader.loginForm.show();
                    }
                    break;
                }

                case self.options.actionChangeAmount : {

                    var step = App.formater.clearNumber(App.asset.getCurrentAssetDetails('step_amount'));
                    var step_direction = App.formater.clearNumber($this.data('direction'));

                    self.updateAmount($assetInfoContainer, step, step_direction);

                    break;
                }
                case self.options.actionChangeRateSl : {

                    var stepDirection = $this.data('step_direction') == 1 ? 1 : -1;

                    self.updateRateByField($assetInfoContainer, stepDirection, 'stop_lose');
                    self.emitSlTpPnl($assetInfoContainer);

                    break;
                }
                case self.options.actionChangeRateTp : {

                    var stepDirection = $this.data('step_direction') == 1 ? 1 : -1;

                    self.updateRateByField($assetInfoContainer, stepDirection, 'take_profit');
                    self.emitSlTpPnl($assetInfoContainer);
                    break;
                }
                case self.options.actionChangeRatePlaceOrder : {

                    var stepDirection = $this.data('step_direction') == 1 ? 1 : -1;

                    self.updateRateByField($assetInfoContainer, stepDirection, 'strike');
                    self.emitSlTpPnl($assetInfoContainer);
                    break;
                }
                case self.options.actionSelectDirection : {
                    if (!App.trader.isGuest) {

                        var oneClickTrading = $assetInfoContainer.find('[name=one_click_trading]').is(':checked');
                        var direction = +$this.data('direction');
                        var prevDirection = +self.selectedDirection;
                        self.selectedDirection = direction;

                        if (oneClickTrading) {
                            self.makeInstance($assetInfoContainer, oneClickTrading);
                            // todo hide popover
                        } else {
                            // action click by button SELL/BUY
                            var $popover = self.getPopover().stop(true, true);

                            $assetInfoContainer.find('[data-action="'+self.options.actionSelectDirection+'"]').removeClass('active');

                            if (self.selectedDirection !== prevDirection) {
                                $.post('/ajax/trade/change_dir', {
                                    direction: self.selectedDirection,
                                    asset_id: $assetInfoContainer.data('asset_id')
                                });

                                $popover.appendTo($this.parent());

                                $this.addClass('active');

                                $popover.fadeIn().stop(true, true);

                                self.selectedDirection = direction;

                                self.setDefaultSlTp($assetInfoContainer);

                                self.emitSlTpPnl($assetInfoContainer);

                                /***************/
                                $(document).bind('click' + self.options.tradeContainerSelector, function (e) {
                                    let $target = $(e.target);

                                    //Ð˜ÑÐºÐ»ÑŽÑ‡Ð°ÐµÐ¼ ÐºÐ½Ð¾Ð¿ÐºÐ¸ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð¸Ñ€Ð¾Ð²ÐºÐ¸ Amount Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð½Ðµ Ð²Ñ‹Ð·Ð²Ð°Ð»ÑÑ Ð¼ÐµÑ‚Ð¾Ð´ self.hidePopover,
                                    //Ð¿Ð¾Ñ‚Ð¾Ð¼Ñƒ Ñ‡Ñ‚Ð¾ Ð¾Ð½"ÑÐ±Ñ€Ð°ÑÑ‹Ð²Ð°ÐµÑ‚" Ð²Ñ‹Ð±Ñ€Ð°Ð½Ð½Ð¾Ðµ Ð½Ð°Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ Ð¸ ÑÑ‚Ð¾ Ð½Ðµ Ð¿Ð¾Ð·Ð²Ð¾Ð»ÑÐµÑ‚ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚ÑŒ ÑÑ‚Ð°Ð²ÐºÑƒ
                                    let amountOptionButton = $target.is('.amount-multiply-bottom') || $target.is('.amount-multiply-top');

                                    if ( ! $target.closest(self.options.tradeContainerSelector).length && ! amountOptionButton) {
                                        self.hidePopover();
                                        $(document).unbind('click' + self.options.tradeContainerSelector);
                                    }
                                });
                            } else {
                                self.hidePopover();
                            }
                        }
                    } else {
                        App.trader.loginForm.show();
                    }

                    break;
                }

                case self.options.actionClose : {
                    self.hidePopover();
                    break;
                }

                case self.options.actionShowHideSlTp : {
                    // action click by checkbox sl/tp
                    if ($this.is(':checked')) {

                        self.setDefaultSlTp($assetInfoContainer);
                        self.emitSlTpPnl($assetInfoContainer);

                        $this.closest('.item')
                            .addClass('lighter')
                            .siblings('.bet-submenu')
                            .slideDown();
                    } else {
                        $this.closest('.item')
                            .removeClass('lighter')
                            .siblings('.bet-submenu')
                            .slideUp();

                        App.socketCfd.unsubscribe('calc_pnl_sl_tp', undefined, true);
                    }
                    break;
                }

                case self.options.actionAdd : {
                    self.makeInstance($assetInfoContainer);

                    break;
                }
            }
        });

        $(document).on('click', self.options.multiAssetsDropdown, function() {
            $(this).find(self.options.multiAssetsSubmenu).fadeIn();
            $(this).on('click','.main-info-close', function(e){
                $(this).parents(self.options.multiAssetsSubmenu).fadeOut();
                e.preventDefault();
            });
        });


        return self;
    };

     self.isValidInputSlTp = function(that, e) {

         switch(e.keyCode) {

             case 8:
                 // delete
                 return true;
             case 46:
                 // backspace
                 return true;
             case 190:
                 // .
                 return true;
             case 37:
                 // Key left.
                 return true;
             case 38:
                 // Key up.
                 return true;
             case 39:
                 // Key right.
                 return true;
             case 40:
                 // Key down.
                 return true;
         }

         let $tradeContainer = $(self.options.assetInfoContainerSelector);
         let assetId     = $tradeContainer.data('asset_id');
         let precision   = App.asset.getAssetDetails(assetId, 'round_precision');

         let keyCode = (e.which) ? e.which : e.keyCode;

         let result = false;
         if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)) {

             if (keyCode >= 96 && keyCode <= 105) {

                 // Numpad keys
                 keyCode -= 48;
             }

             result = true;
         }

         if ( ! result) {

             e.preventDefault();

             return false;
         }

         let currentPosition = that[0].selectionStart;

         if (that.val().length - currentPosition > precision) {

             return true;
         }

         let currentSymbol = String.fromCharCode(keyCode);

         if (that.val().indexOf('.') === -1) {

             return true;
         }

         let lastDigits = that.val().split('.').pop() + currentSymbol;

         if (lastDigits.length > precision) {

             e.preventDefault();

             return false;
         }

         return true;
     };

     self.setDefaultSlTp = function($assetInfoContainer) {

         let $tradeContainer = $(self.options.tradeContainerSelector);

         let assetId = $assetInfoContainer.data('asset_id');
         let roundPrecision   = App.asset.getAssetDetails(assetId, 'round_precision');

         let orderType = $assetInfoContainer.find('[name=placeorder_type] option:selected').val();
         let defEntryOrderRate = self.getDefRateOpenOrder(assetId, orderType);
         $assetInfoContainer.find('[name=strike]').val(defEntryOrderRate);

         if (+($assetInfoContainer.find('[name=place_order]:checked').val()) > 0) {
             /*calc def ST/TP values*/
             var tpRate = self.getDefaultSlTpRate(assetId, true, defEntryOrderRate);
             var slRate = self.getDefaultSlTpRate(assetId, false, defEntryOrderRate);
         } else {
             /*calc def ST/TP values*/
             var tpRate = self.getDefaultSlTpRate(assetId, true);
             var slRate = self.getDefaultSlTpRate(assetId, false);
         }

         if (self.options.sltpType == 0) {
             $tradeContainer.find('[name=stop_lose]').val(App.formater.numberFormatRate(slRate, roundPrecision));
             $tradeContainer.find('[name=take_profit]').val(App.formater.numberFormatRate(tpRate, roundPrecision));
         } else if (self.options.sltpType == 1) {
             $tradeContainer.find('[name=stop_lose]').val(App.formater.numberFormatRate(slRate, roundPrecision));
             $tradeContainer.find('[name=take_profit]').val('');
         } else if (self.options.sltpType == 2) {
             $tradeContainer.find('[name=stop_lose]').val('');
             $tradeContainer.find('[name=take_profit]').val(App.formater.numberFormatRate(tpRate, roundPrecision));
         }
     };

     self.getPopover = function() {
        var $container = $(self.options.tradeContainerSelector).find('.action-submenu');

        if ($container.length === 0) {
            $container = $(App.htmlTemplate.newPositionTemplate);
        }
        return $container;
    };


    self.hidePopover = function() {
        var $popover = self.getPopover();

        $popover.fadeOut();

        let popoverVisible = self.selectedDirection !== 0;

        if (popoverVisible && self.isSLTPChecked()) {
            App.socketCfd.unsubscribe('calc_pnl_sl_tp', undefined, true);
        }

        self.selectedDirection = 0;

        $popover.siblings('[data-action=' + self.options.actionSelectDirection + ']').removeClass('active');
    };

    self.updateRateByField = function($tradeContainer, stepDirection, inputName) {

        var $rateInput  = $tradeContainer.find('[name="'+inputName+'"]');
        var assetId     = $tradeContainer.data('asset_id');
        var step        = App.asset.getAssetDetails(assetId, 'step_rate') * +stepDirection;
        var precision   = App.asset.getAssetDetails(assetId, 'round_precision');

        if(isNaN(step)){
            step = 0;
        }

        var rateNew     = App.formater.clearNumber($rateInput.val()) + step;

        $rateInput.val(App.formater.numberFormatRate(rateNew, precision));

    };

    self.updateAmount = function($tradeContainer, step, direction, previousValue) {
        step = step || 0;
        direction = +direction !== 0
            ? +direction
            : 1;

        var $amountInput= $tradeContainer.find('[name="money_invest"]');

        var minVal      = App.formater.clearNumber(App.asset.getCurrentAssetDetails('min_amount'));
        var maxVal      = App.formater.clearNumber(App.asset.getCurrentAssetDetails('max_amount'));
        var amount      = App.formater.clearNumber($amountInput.val()) + step * direction;
        var previousValue = previousValue ?? App.formater.clearNumber($amountInput.val())

        if (amount < 0) {
            amount = 0;
        }
        if (amount < minVal) {
            // condition for not manually edition
            if (+step !== 0) {
                amount = minVal;
            }
        } else if(amount > maxVal) {
            amount = maxVal;
        }

        var $assetContainer = $(self.options.assetInfoContainerSelector);

        if (! App.trader.isGuest && previousValue != amount) {
            $.post('/ajax/trade/change_amount', {
                amount : amount,
                asset_id : $tradeContainer.data('asset_id')
            });
        }
        $amountInput.val(App.formater.numberFormatAssetAmountPlatform(amount));

        self.emitImarginReq();
        if($assetContainer.find('[data-action=sl_tp_check]').is(':checked')){
            self.emitSlTpPnl($assetContainer);
        }

        // @todo: can`t set '' as separator - temp solution until es2016 standarts can be used
        App.pushState.setState('amount', App.formater.clearNumber(App.formater.numberFormatAssetAmountPlatform(amount)));
    };

    self.makeInstance = function($assetInfoContainer, oneClickTrade) {
        var $amountInput = $assetInfoContainer.find('[name=money_invest]');
        var assetId = $assetInfoContainer.data('asset_id');

        var lastPoints = App.asset.getAssetRates(assetId, true);

        var postData = {
            money_invest    : App.formater.clearNumber($amountInput.val()),
            user_timestamp  : App.socketCfd.serverTimestamp(),
            asset_id        : assetId,
            trade_type      : self.selectedDirection,
            timediff        : new Date().getTimezoneOffset(),
            chart_type      : App.tradeParam.viewType,
            ask             : lastPoints.sell_value,
            bid             : lastPoints.buy_value,
            ls_mc           : lastPoints.microtime,
            tab_id          : App.tabsBlock.getCurrentTabId(),
            correct_amount_id  : AmountCorrection.popup.data('correctionId'),
            correct_amount_key : AmountCorrection.popup.data('correctionKey')
        };

        AmountCorrection.hide();

        if(typeof oneClickTrade === 'undefined' || ! oneClickTrade) {
            if ($assetInfoContainer.find('[data-action=sl_tp_check]').is(':checked')) {
                postData.stop_lose = $assetInfoContainer.find('[name=stop_lose]').val();
                postData.take_profit = $assetInfoContainer.find('[name=take_profit]').val();
            }

            if (+($assetInfoContainer.find('[name=place_order]:checked').val()) > 0) {
                postData.place_order = 1;
                postData.placeorder_type = $assetInfoContainer.find('[name=placeorder_type] option:selected').val();
                postData.ask = App.formater.clearNumber($assetInfoContainer.find('[name=strike]').val());
                postData.bid = postData.trade_type == App.tradeParam.DIRECTION_SELL
                    ? lastPoints.sell_value
                    : lastPoints.buy_value ;
            }
        }

        var $popover =  self.getPopover();
        App.htmlTemplate.addLoader($popover);
        $.post('/ajax/trade/add', postData, function(response) {
            if (response.success) {
                $assetInfoContainer.find(self.options.tradePopoverRelativeSelector)
                    .fadeOut()
                    .siblings('[data-action="select_dir"]')
                    .removeClass('active');
                if (+postData.place_order > 0) {
                    App.notification.success(response.data.message)
                }
                self.selectedDirection = 0;
            } else {
                let errorData = response['error_data'];

                if (errorData['amount_correction_id']) {

                    AmountCorrection.show(errorData);

                    return;
                }

                App.notification.error(response.error);
            }
        }, 'json').fail(function(XHR, status) {
            App.notification.error('A server error');
        }).done(function () {
            App.htmlTemplate.removeLoader($popover);
        });
    };

    self.emitImarginReq = function() {
        var $assetInfoContainer = $(self.options.assetInfoContainerSelector);
        if (App.tradeParam.viewType == App.tradeParam.VIEW_TYPE_MULTI) {
            // App.socketCfd.send('unsubscribe', {method : 'imargin_req_multi'});
            // var sendData = {};
            // var i = 0;
            // $assetInfoContainer.each(function (index, element) {
            //     sendData[i++] = {
            //         'asset_id'  : $(element).data('asset_id'),
            //         'amount'    : $(element).find('[name=money_invest]').val(),
            //         'direction' : (self.selectedDirection == App.tradeParam.DIRECTION_BUY)
            //                         ? App.tradeParam.DIRECTION_BUY
            //                         : App.tradeParam.DIRECTION_SELL
            //     };
            // });
            // App.socketCfd.send('imargin_req_multi', sendData);
        } else {
            if(parseInt($assetInfoContainer.data('asset_id')) > 0){
                App.socketCfd.subscribe('imargin_calculation', function (data) {
                    if (typeof data.value !== 'undefined')
                    {
                        var val = App.formater.numberFormatAmountSign(data.value);

                        $(self.options.tradeContainerSelector)
                            .find('.JS-imargin')
                            .text(val)
                            .removeClass('hidden');
                    }
                },{
                    asset_id    : parseInt($assetInfoContainer.data('asset_id')),
                    amount      : App.formater.clearNumber($assetInfoContainer.find('[name=money_invest]').val()),
                    direction   : (self.selectedDirection == App.tradeParam.DIRECTION_BUY)
                        ? App.tradeParam.DIRECTION_BUY
                        : App.tradeParam.DIRECTION_SELL
                }, 'main_imargin_calculation');
            }
        }
    };
    /**
     * @todo trader_trends..
     * @param $assetInfoContainer
     */
    self.emitTrends = function($assetInfoContainer) {
        var data = {};
        var asset_id = App.formater.clearNumber($assetInfoContainer.data('asset_id'));
        data[asset_id] = asset_id;
        // App.socketCfd.send('unsubscribe', {method : 'trader_trends'});
        // App.socketCfd.send('trader_trends', data);
    };

    self.emitSlTpPnl = function($assetInfoContainer) {
        if ( ! self.isSLTPChecked()) {
            return;
        }

        let data = {
            asset_id    : App.formater.clearNumber($assetInfoContainer.data('asset_id')),
            amount      : App.formater.clearNumber($assetInfoContainer.find('[name=money_invest]').val()),
            sl          : App.formater.clearNumber($assetInfoContainer.find('[name=stop_lose]').val()),
            tp          : App.formater.clearNumber($assetInfoContainer.find('[name=take_profit]').val()),
            direction   : (self.selectedDirection == App.tradeParam.DIRECTION_BUY)
                ? App.tradeParam.DIRECTION_BUY
                : App.tradeParam.DIRECTION_SELL
        };

        if (self.isOrderSelected()) {
            data.rate = App.formater.clearNumber($assetInfoContainer.find('[name=strike]').val());
        }

        App.socketCfd.subscribe('calc_pnl_sl_tp', function (data) {
            if (typeof data.asset_id !== 'undefined') {
                var $assetInfoContainer = $(self.options.assetInfoContainerSelector);
                if ($assetInfoContainer.length) {
                    if (typeof data.sl_amount !== 'undefined') {
                        var sl = App.formater.numberFormatAmountSign(data.sl_amount);

                        $assetInfoContainer.find('[data-anchore=estimated_loss]').text(sl);
                    }

                    if (typeof data.tp_amount !== 'undefined') {
                        var tp = App.formater.numberFormatAmountSign(data.tp_amount);

                        $assetInfoContainer.find('[data-anchore=estimated_profit]').text(tp);
                    }
                }
            }
        }, data);
    };


    self.initListeners = function() {
        $(self.options.assetInfoContainerSelector).each(function(index, element) {
            var $assetInfoContainer = $(element);
            var assetId = $assetInfoContainer.data('asset_id');
            App.asset.setCurrentAssetFeed(parseInt(assetId),'trade_new');
        });
        App.socketCfd.subscribe('assets_feed', function (points) {
            var assetIds = $(self.options.assetInfoContainerSelector).each(function(index, element) {
                var $assetInfoContainer = $(element);
                var $tradeContainer = $assetInfoContainer.find(self.options.tradeContainerSelector);
                var assetId = $assetInfoContainer.data('asset_id');
                var precision = $assetInfoContainer.data('precision');
                if (typeof points[+assetId] !== 'undefined')
                {
                    var point   = points[+assetId];
                    var sellRate= App.formater.numberFormatRate(point.sell_value, point.precision);
                    var buyRate = App.formater.numberFormatRate(point.buy_value, point.precision);


                    $tradeContainer.find('.JS-sell_arrow, .JS-buy_arrow').html(App.htmlTemplate.getUpDownRateArrow(point.raise));
                    $tradeContainer.find('.JS-sell_rate').text(sellRate);
                    $tradeContainer.find('.JS-buy_rate').text(buyRate);

                    if (App.tradeParam.viewType == App.tradeParam.VIEW_TYPE_CHART) {
                        $assetInfoContainer.find('.JS-rate_time')
                            .text(App.formater.dateTime(point.updated_at, 'H:I:S'));
                    }

                    if (self.selectedDirection == App.tradeParam.DIRECTION_SELL) {
                        var marketRate = point.sell_value;
                    } else {
                        var marketRate = point.buy_value;
                    }
                    marketRate = App.formater.numberFormatRate(marketRate, precision);
                    $tradeContainer.find('[data-anchore=market_rate]').text(marketRate);
                }
            });
        }, App.asset.getCurrentAssetFeed(), 'trade_new');
        //
        // App.socketCfd.subscribe('traders_trends_cfd', function (data) {
        //     var delimeter = 25;
        //
        //     for (var id in data){
        //         var up = data[id][1],
        //             down = data[id][-1];
        //         if (up == 0 && down == 0) {
        //             return;
        //         } else {
        //             var calc = (down + up + delimeter * 2);
        //             var downResult = Math.round(((down + delimeter) / calc) * 100);
        //             var upResult = 100 - downResult;
        //         }
        //
        //         var $popularity = $('#popularity_chart');
        //         $popularity.data('left', downResult);
        //         $popularity.data('right', upResult);
        //         $popularity.siblings('.upper').text(upResult+'%');
        //         $popularity.siblings('.lower').text(downResult+'%');
        //         $popularity.html('');
        //
        //         new ChartPlatform.Popularity("#popularity_chart");
        //
        //         // todo: need add for multi
        //
        //     }
        // });
        // App.socketCfd.subscribe('sltp_pnls', function (data) {
        //     if (typeof data.ai !== 'undefined') {
        //         var $assetInfoContainer = $(self.options.assetInfoContainerSelector + '[data-asset_id=' + data.ai + ']');
        //         if ($assetInfoContainer.length) {
        //             if (typeof data.sl !== 'undefined') {
        //                 var sl = App.formater.numberFormatAmountSign(data.sl);
        //
        //                 $assetInfoContainer.find('[data-anchore=estimated_loss]')
        //                     .text(sl);
        //             }
        //
        //             if (typeof data.sl !== 'undefined') {
        //                 var tp = App.formater.numberFormatAmountSign(data.tp);
        //
        //                 $assetInfoContainer.find('[data-anchore=estimated_profit]')
        //                     .text(tp);
        //             }
        //         }
        //     }
        // });
    };

    self.getDefaultSlTpRate = function(assetId, isTpRate, marketRate) {
        isTpRate = isTpRate || false;
        marketRate = App.formater.clearNumber(marketRate);

        var lastPoints = App.asset.getAssetRates(assetId, true);

        if (self.selectedDirection == App.tradeParam.DIRECTION_BUY && isTpRate) {
            //Tp rate for BUY tradeaction
            marketRate = marketRate || lastPoints.buy_value;
            var rate = +marketRate + (+marketRate * App.sysParameter.DEFAULT_SL_TP_RATE_PERCENT);

        } else if (self.selectedDirection == App.tradeParam.DIRECTION_BUY && ! isTpRate) {
            //Sl rate for BUY tradeaction
            marketRate = marketRate || lastPoints.sell_value;
            var rate = +marketRate - (+marketRate * App.sysParameter.DEFAULT_SL_TP_RATE_PERCENT);

        } else if (self.selectedDirection != App.tradeParam.DIRECTION_BUY && isTpRate) {
            //Tp rate for SELL tradeaction
            marketRate = marketRate || lastPoints.sell_value;
            var rate = +marketRate - (+marketRate * App.sysParameter.DEFAULT_SL_TP_RATE_PERCENT);

        } else {
            //Sl rate for SELL tradeaction
            marketRate = marketRate || lastPoints.buy_value;
            var rate = +marketRate + (+marketRate * App.sysParameter.DEFAULT_SL_TP_RATE_PERCENT);
        }

        return rate;
    }

    self.getDefRateOpenOrder = function(assetId, orderType) {
        var lastPoints = App.asset.getAssetRates(assetId, true);
        var marketRate = self.selectedDirection == App.tradeParam.DIRECTION_SELL
                    ? lastPoints.sell_value
                    : lastPoints.buy_value;
        var rate;

        if (self.selectedDirection == App.tradeParam.DIRECTION_SELL) {
            if (orderType == App.tradeParam.ENTRY_ORDER_LIMIT) {
                rate = +marketRate + marketRate * App.sysParameter.DEFAULT_PLACE_ORDER_RATE_PERCENT;
            } else {
                rate = +marketRate - marketRate * App.sysParameter.DEFAULT_PLACE_ORDER_RATE_PERCENT;
            }
        } else {
            if (orderType == App.tradeParam.ENTRY_ORDER_LIMIT) {
                rate = +marketRate - marketRate * App.sysParameter.DEFAULT_PLACE_ORDER_RATE_PERCENT;
            } else {
                rate = +marketRate + marketRate * App.sysParameter.DEFAULT_PLACE_ORDER_RATE_PERCENT;
            }
        }

        var roundPrecision = App.asset.getAssetDetails(assetId, 'round_precision');
        rate = App.formater.numberFormatRate(rate, roundPrecision);


        return rate;
    };

    self.isSLTPChecked = function () {
        return $(self.options.tradeContainerSelector).find(`[data-action="${self.options.actionShowHideSlTp}"]`).is(':checked');
    }

    self.isOrderSelected = function () {
        return $(self.options.tradeContainerSelector).find('[name=place_order]:checked').val() === '1';
    }

    /*******************/

    self.init = function() {
        self.initEvents();
        self.initListeners();
        self.emitImarginReq();

        return self;
    };

    self.init(options);
};
