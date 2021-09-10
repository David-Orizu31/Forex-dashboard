'use strict';

/******** Application pushstage navigator ********/
var PushStateManager = function() {

    var self = this;

    self.setState = function (key, value) {
        self.currentState[key] = value;
        history.pushState(self.currentState, null, self.composeUrl());

        return self;
    };

    self.clear = function () {
        self.currentState = {};
        history.pushState(self.currentState, null, self.composeUrl());

        return self;
    };

    self.parseCurrentQueryString = function() {
        var params = {},
            queryString = window.location.search,
            i=0;
        if (queryString.indexOf('?') !== -1) {
            queryString = queryString.substr(1);
        }
        var parts = queryString.split('&');
        var param = [];
        for(i in parts) {
            param = parts[i].split('=');
            params[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || '');
        }

        return params;
    };

    self.composeUrl = function () {
        var urlObj = new URL(window.location.href);
        // ,params = new URLSearchParams(self.currentState); not support by some browsers

        return urlObj.pathname
            + '?'
            + $.param(self.currentState); //params.toString();
    };

    self.goTo = function(params) {
        var currentParams = $.extend(self.parseCurrentQueryString(), params);

        var urlObj = new URL(window.location.href);
        // ,params = new URLSearchParams(self.currentState); not support by some browsers

        window.location.href = urlObj.pathname
            + '?'
            + $.param(currentParams); //params.toString();
    };

    self.currentState = history.state || self.parseCurrentQueryString();

    return self;
};
/******** end pushstage ********/

/******** Application formater ********/
var Formater = function(options) {

    var self = this;

    self.precision              = 2;
    self.precisionAssetAmount   = 2;
    self.precisionRates         = 5;
    self.simplyPrecision         = 0;

    /* overwrite default params */
    self.init = function(options) {

        options = options || {};

        var initOptions = [
            'precision', 'precisionAssetAmount', 'precisionRates', 'simplyPrecision'
        ];

        for (var optionName in options) {
            if (initOptions.indexOf(optionName) !== -1) {
                this[optionName] = options[optionName];
            }
        }
    };


    /**** base format methods ****/
    self.numberFormatAmount = function(amount, precision, thousandsSep) {
        if (typeof precision === 'undefined') {
            precision = self.precision;
        }
        if (typeof thousandsSep === 'undefined') {
            thousandsSep = ',';
        }

        return self.numberFormat(self.clearNumber(amount), precision, thousandsSep);
    };


    self.numberFormatAmountSign = function(amount, precision, thousandsSep) {

        return (App.trader.currencySignPosition == 'left')
            ? App.trader.currencySign + self.numberFormatAmount(amount, precision, thousandsSep)
            : self.numberFormatAmount(amount, precision, thousandsSep) + App.trader.currencySign;
    };


    self.numberFormatRate = function(rate, precision, thousandsSep) {

        precision = precision || self.precisionRates;
        thousandsSep = thousandsSep || ',';

        return self.numberFormat(rate, precision, thousandsSep);
    };


    self.numberFormatAssetAmountPlatform = function(amount, precision, thousandsSep) {

        precision = precision || self.precisionAssetAmount;
        thousandsSep = thousandsSep || ',';

        if (+amount - Math.floor(amount) === 0) {
            // hide mantissa if there is zero
            precision = 0;
        }

        return self.numberFormat(amount, +precision, thousandsSep);
    };

    self.round = function(value, precision) {
        precision = precision || 0;

        return Number(Math.round(value.toFixed(+precision) + 'e' + precision) + 'e-' + precision);
    };

    self.numberFormat = function(value, precision, thousandsSep) {

        value = self.round(+value, precision).toFixed(+precision);
        precision = precision || 0;
        thousandsSep = thousandsSep || '';

        var split = value.split('.');
        split[0] = split[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);

        return split.join('.');

    };

    self.clearNumber = function(amount, precision) {
        if (typeof amount === 'string') {
            amount = amount.replace(/,/g, '').replace(/[^\d.-]*/g, '').match(/-?\d+\.?\d*/);

            amount = amount
                ? amount[0]
                : 0;
        }

        amount = isNaN(+amount)
            ? 0
            : +amount;

        return (typeof precision === 'undefined')
            ? amount
            : self.round(amount, precision);
    };

    //format date by php convensions
    self.dateTime = function(timestamp, format) {
        format = format || 'd/m/Y H:i:s';
        var result = format;
        var date = new Date(timestamp * 1000);
        var monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var callBacks = {
            'y' : function (date) {return (date.getUTCFullYear()).toString().substr(-2);},
            'Y' : function (date) {return '20' + callBacks.y(date);},
            'm' : function (date) {return  1 + date.getUTCMonth();},//getUTCMonth() starts from 0
            'M' : function (date) {return ('0' +  ( 1 + date.getUTCMonth())).substr(-2)}, //getUTCMonth() starts from 0
            'd' : function (date) {return date.getUTCDate();},
            'D' : function (date) {return ('0' + date.getUTCDate()).substr(-2)},
            'i' : function (date) {return date.getUTCMinutes();},
            'I' : function (date) {return ('0' + date.getUTCMinutes()).substr(-2)},
            'h' : function (date) {return date.getUTCHours();},
            'H' : function (date) {return ('0' + date.getUTCHours()).substr(-2)},
            's' : function (date) {return date.getUTCSeconds();},
            'S' : function (date) {return ('0' + date.getUTCSeconds()).substr(-2);},
            'N' : function (date) {return monthes[date.getUTCMonth()];} // this cb should be last
        };
        for (var element in callBacks) {
            if (format.indexOf(element) !== -1) {
                var value = callBacks[element](date);
                result = result.replace(element, value);
            }
        }

        return result;
    };

    self.cursorDisplacement = function(element, currentPosition, event) {
        let delimiterPosition = (element.val() + '').indexOf('.');

        if (currentPosition > delimiterPosition)
        {
            if (event.keyCode == 46) {
                element[0].selectionEnd = currentPosition + 1;
            } else if (event.keyCode == 8
                || (event.keyCode >= 48 && event.keyCode <= 57)
                || (event.keyCode >= 96 && event.keyCode <= 105))
            {
                element[0].selectionEnd = currentPosition;
            }
        }
    };

    self.init(options);

    return self;
};
/******** end formater ********/


/******** notification ********/
var Notification = function(options) {

    var self = this;

    self.delaySuccesMessage = 10;
    self.delayErrorMessage  = 10;
    self.userNotificationLog = [];

    self.init = function(options) {
        options = options || {};

        if (typeof options.delaySuccesMessage !== 'undefined') {
            this.delaySuccesMessage = options.delaySuccesMessage;
        }
        if (typeof options.delayErrorMessage !== 'undefined') {
            this.delayErrorMessage = options.delayErrorMessage;
        }

        this.throwFlash(options);
    };

    self.success = function(text, delay, cb) {

        var $container = $('.item-success').last();
        var $notification = $container.clone();

        $notification.find('p').html(text);
        $notification.appendTo('.notifications').show();

        if (delay !== false) {
            delay = delay || self.delaySuccesMessage;

            setTimeout(function () {
                $notification.remove();
            }, 1000 * delay);
        }
        if (typeof cb === 'function') {
            cb($notification);
        }
    };

    self.error = function(text, delay, cb) {
        var $container = $('.item-error').last();
        var $notification = $container.clone();

        $notification.find('p').html(text);
        $notification.appendTo('.notifications').show();

        if (delay !== false) {
            delay = delay || self.delayErrorMessage;

            setTimeout(function () {
                $notification.remove();
            }, 1000 * delay);
        }
        if (typeof cb === 'function') {
            cb($notification);
        }
    };

    self.custom = function(html, delay, cb, group) {
        var $notification = $(html);

        if (typeof cb === 'function') {
            cb($notification);
        }

        if (group) {
            App.notificationGroup.addNotification($notification)

            return;
        }

        $('#msg-cnt').append($notification);

        if (delay !== false && +delay > 0) {
            setTimeout(function () {
                $notification.remove();
            }, 1000 * delay);
        }
    };

    self.throwFlash = function(options) {
        if (typeof options.success !== 'undefined') {
            this.success(options.success);
        }
        if (typeof options.error !== 'undefined') {
            this.error(options.error);
        }
    };

    App.socketCfd.subscribe('trader_notifications', function (data) {
        var ids = [];
        var needToHideMarginAlerts = false;

        $(data).each(function(id, notification) {
            if (self.userNotificationLog.indexOf(notification.id) === -1) {
                if (notification.type === 3) {
                    needToHideMarginAlerts = true;
                }
                ids.push(notification.id);
                self.userNotificationLog.push(notification.id);
            }
        });
        var markReadFn = function ($popup) {
            $popup.find('.close').click(function () {
                var id = $(this).closest('[data-id]').data('id');
                $.post('/ajax/notification/set_executed', {id : id});
            });

            $popup.find('.JS-switch_asset').click(function () {
                var assetId = $(this).data('asset_id');
                var id = $(this).closest('[data-id]').data('id');
                $(this).closest('.item').remove();
                App.asset.switchAsset({asset_id: assetId}, {"mode":"from_price_alert"});
                $.post('/ajax/notification/set_executed', {id : id});
            });
        };

        if (ids.length > 0) {
            $.get('/ajax/notification/get', {id : ids}, function(response) {
                if (response.success) {
                    if (needToHideMarginAlerts) {
                        $('.notifications .JS-margin-alert').hide();
                    }
                    for (var i in response.data) {
                        var notification = response.data[i];
                        self.custom(notification.html, notification.showtime, notification.mark_as_read ? markReadFn : null, notification.group);
                    }
                }
            }, 'json');
        }
    });

    self.init(options);

    return self;
};

var NotificationGroup = function () {
    this.$wrapper   = $('#msg-group-wrapper');
    this.$container = $('#msg-group-cnt');
    this.$counter   = this.$wrapper.find('.message-group-counter');

    this.notifications = {};

    $('.message-group-opener').on('click', () => this.open())

    $('.message-group-closer').on('click', () => this.close())

    $('.message-group-cleaner').on('click', () => this.clear())

    this.addNotification = function ($notification) {
        let id = $notification.data('id');

        $notification.find('.close').click(() => this.removeNotification($notification));

        this.notifications[id] = $notification;

        this.$container.prepend($notification);

        this._render();
    }

    this.removeNotification = function ($notification) {
        delete this.notifications[$notification.data('id')];

        setTimeout(() => $notification.remove(), 500);

        this._render();
    }

    this.close = function () {
        this.$wrapper.removeClass('message-group-opened').addClass('message-group-closed');

        this._render();
    }

    this.open = function () {
        this.$wrapper.removeClass('message-group-closed').addClass('message-group-opened');

        this._render();
    }

    this.clear = function () {
        Object.values(this.notifications).forEach($notification => $notification.find('.close').click())

        this.notifications = {};

        this._render();
    }

    this._render = function () {
        let messagesCount = Object.keys(this.notifications).length;

        this.$counter.text(messagesCount - 1);

        if (messagesCount > 1) {
            this.$wrapper.removeClass('message-group-unformed');
        } else {
            this.$wrapper.addClass('message-group-unformed');
        }
    }
}
/******** end notification ********/

/******** Html templates ********/
var HtmlTemplate = function(options) {

    var self = this;

    self.recentPositionTemplate = '';
    self.recentOrderTemplate    = '';
    self.newPositionTemplate    = '';
    self.priceAlertTemplate     = '';
    self.spinnerTemplate        = '';
    self.orderTypeStop          = 'Stop';
    self.orderTypeLimit         = 'Limit';


    self.init = function(options) {

        options = options || {};

        $.get('/ajax/template/get_all', options, function(response) {
            if (response.success) {

                var initTemplates = [
                    'recentPositionTemplate',
                    'recentOrderTemplate',
                    'newPositionTemplate',
                    'priceAlertTemplate',
                    'spinnerTemplate',
                    'orderTypeStop',
                    'orderTypeLimit',
                ];

                for (var optionName in response.data) {
                    if (initTemplates.indexOf(optionName) !== -1) {
                        self[optionName] = response.data[optionName];
                    }
                }
            } else {
                console.warn('Error get response template');
            }
        }, 'json');
    };


    self.getUpDownRateArrow = function(direction) {
        direction = direction || 1;
        if (+direction > 0) {
            return '<i class="material-icons up">arrow_upward</i>';
        } else {
            return '<i class="material-icons down">arrow_downward</i>';
        }
    };


    self.addOverlay = function($targetContainer, events) {
        if ($targetContainer instanceof jQuery) {
            var $htmlOverlay = $('<div class="loader-bg"></div>').addClass('JS-overlay');
            $targetContainer.append($htmlOverlay);

            if (typeof events !== 'undefined') {
                for (var event in events) {
                    if (typeof events[event] === 'function') {
                        $htmlOverlay.on(event, events[event]);
                    }
                }
            }
        }

        return $htmlOverlay;
    };


    self.removeOverlay = function($targetContainer) {

        if ($targetContainer instanceof jQuery) {
            $targetContainer.children('.JS-overlay').remove();
        }

        return self;
    };


    self.addLoader = function($targetContainer) {
        if ($targetContainer instanceof jQuery) {
            var html = '<div class="loader-bg loader-bg-mid">' +
                    '<div class="loader">' +
                        '<div class="loader-circle"></div>' +
                        '<div class="loader-line-mask">' +
                            '<div class="loader-line"></div>' +
                        '</div>' +
                        '<img src="'+App.mediaManager.to('/img/loader.svg')+'" alt="loader">' +
                    '</div>' +
                '</div>';
            var $htmlLoader = $(html).addClass('JS-loader');
            $targetContainer.append($htmlLoader);
        }

        return $htmlLoader;
    };


    self.removeLoader = function($targetContainer) {

        if ($targetContainer instanceof jQuery) {
            $targetContainer.children('.JS-loader').remove();
        }

        return self;
    };

    self.isFrozenAssetOverlayShown = function () {

        return $('#JS-frozen_overlay').css('display') === 'flex';
    };

    self.addFrozenAssetOverlay = function($targetContainer) {

        $('#JS-frozen_overlay').css('display', 'flex');

        return self;
    };


    self.removeFrozenAssetOverlay = function($targetContainer) {

        $('#JS-frozen_overlay').css('display', 'none');

        return self;
    };

    self.entryOrderType = function(orderType) {
        var result = null;
        if (orderType == App.tradeParam.ENTRY_ORDER_LIMIT) {
            result = self.orderTypeLimit;
        } else if (orderType == App.tradeParam.ENTRY_ORDER_STOP) {
            result = self.orderTypeStop;
        }

        return result;

    };

    self.init(options);

    return self;
};
/********* end template ********/


var Asset = function(options) {

    var self = this;

    self.assetsDetails  = {};
    self.assetsRates    = {};
    self.currentAssetId = null;
    self.currentAssetsFeed = {};
    self.assetBlock = '#asset-block-info';
    self.assetSwitchCallbacks = [];

    self.init = function(options) {

        options = options || {};

        var initOptions = [
            'assetsDetails', 'assetsRates', 'currentAssetId', 'assetBlock'
        ];

        for (var optionName in options) {
            if (initOptions.indexOf(optionName) !== -1) {
                this[optionName] = options[optionName];
            }
        }


        /**** Subscribe websocket last points ****/
        App.socketCfd.subscribe('assets_feed', function(data) {
            for (var assetId in data) {
                self.assetsRates[assetId] = data[assetId];
            }
        },[], 'log');
    };

    self.onSwitch = function(cb) {
        self.assetSwitchCallbacks.push(cb);
    };

    self.switchAsset = function(requestData, params, cb) {

        params = (typeof params === 'object') ? params : {};

        let needReloadPage = false;
        let $assetInfoContainer = $(self.assetBlock);
        if ($assetInfoContainer.data('game_type_id') != App.tabsBlock.getCurrentTabGameTypeId()) {

            needReloadPage = true;
        }

        if (App.tabsBlock.options.mainPage && ! App.tabsBlock.changed && ! needReloadPage) {

            if (typeof params.mode !== "undefined") {
                requestData['mode'] = params.mode;
            }

            $.get('/ajax/asset/get_info', requestData, function (response) {

                if (response.success) {

                    let $htmlAsset = $(response.data.html);
                    let asset = response.data.asset;
                    let isRequestedSimply = response.data.is_simply;
                    let isCurrentSimply = App.tabsBlock.getCurrentTabGameTypeId();

                    if(isRequestedSimply != isCurrentSimply){

                        let href = '/?asset_id=' + requestData.asset_id;

                        if (typeof params.mode !== "undefined") {
                            href = href + '&' + 'mode' + '=' + params.mode;
                        }

                        document.location.href = href;
                    } else {

                        $assetInfoContainer.find('.left-block').replaceWith($htmlAsset);
                        $assetInfoContainer.data('asset_id', asset.id);
                        $assetInfoContainer.attr('data-asset_id', asset.id);

                        //set chart;
                        App.asset.setCurrentAsset(asset.id);
                        App.mainChart.setSymbol(asset.name);
                        App.asset.checkCurrentAssetFrozen();
                        App.asset.watchingForActiveTime();
                        App.pushState.clear().setState('asset_id', asset.id);

                        if (typeof params.mode !== "undefined") {
                            App.pushState.setState('mode', params.mode);
                        }

                        if (typeof cb === 'function') {
                            cb($assetInfoContainer);
                        }

                        $.each(self.assetSwitchCallbacks, function( index, cb ) {
                            cb(response);
                        });
                    }

                } else {

                    App.notification.error(response.error)
                }
            }, 'json')

        } else {

            let href = '/?asset_id=' + requestData.asset_id;

            if (typeof params.mode !== "undefined") {
                href = href + '&' + 'mode' + '=' + params.mode;
            }

            document.location.href = href;
        }
    };

    self.getAssetDetails = function(assetId, param) {
        if (typeof assetId !== 'undefined' && typeof self.assetsDetails[assetId] !== 'undefined') {
            if (typeof param !== 'undefined') {
                return (typeof self.assetsDetails[assetId][param] !== 'undefined')
                        ? self.assetsDetails[assetId][param]
                        : null;
            } else {
                return self.assetsDetails[assetId];
            }
        } else {
            return null;
        }
    };

    self.getAssetMinSltpPercentage = function(assetId) {
        var asset = App.asset.getAssetDetails(assetId),
            assetRates = App.asset.assetsRates[assetId],
            result = 0;

        if (asset.imargin != 0) {
            var min_rate_deviation = App.sysParameter.MIN_DISTANCE_ASSET * assetRates.rate + Number(assetRates.spread);

            result = Math.ceil(min_rate_deviation / assetRates.rate / asset.imargin * 100 / 5) * 5;
        }

        return result;
    };

    self.getCurrentAssetDetails = function(param) {

        return self.getAssetDetails(self.currentAssetId, param);

    };


    self.setCurrentAsset = function(id) {

        if (!isNaN(id)) {
            self.currentAssetId = id;
        }

        return self;
    };


    self.checkCurrentAssetFrozen = function () {
        var assetId = self.getCurrentAssetDetails('id');
        var point = self.getAssetRates(assetId);
        if (point) {
            self.toggleFrozenOverlay(point.is_frozen > 0)
        }
    };


    self.toggleFrozenOverlay = function (show) {
        let isShown = App.htmlTemplate.isFrozenAssetOverlayShown();

        // no need to change visibility for overlay
        if (show === isShown) {
            return;
        }

        if (show) {
            App.htmlTemplate.addFrozenAssetOverlay();
        } else {
            App.htmlTemplate.removeFrozenAssetOverlay();
        }

        setTimeout(topPartWidth, 1000);
    };


    self.watchingForActiveTime = function () {
        App.socketCfd.subscribe('assets_activity', map => {
            if (map.hasOwnProperty(self.currentAssetId)) {
                // if asset became deactivated, we wil show overlay
                self.toggleFrozenOverlay( ! map[self.currentAssetId]);
            }
        }, [+self.currentAssetId])
    };


    self.getAssetRates = function(assetId, setIfEmpty) {

        if (typeof assetId !== 'undefined') {
            assetId = +assetId;
            setIfEmpty = setIfEmpty || false;
            return (typeof self.assetsRates[assetId] !== 'undefined')
                ? self.assetsRates[assetId]
                : (!setIfEmpty
                    ? {}
                    : {buy_value : 0, sell_value : 0, microtime : 0, raise : 1, spread : 0})
        }
        return self.assetsRates;
    };

    self.setCurrentAssetFeed = function(assetId, tagId){
        if(typeof self.currentAssetsFeed == 'undefined') {
            self.currentAssetsFeed = {};
        }
        if(typeof self.currentAssetsFeed[tagId] != 'undefined'){
            if(Object.keys(
                    self.currentAssetsFeed[tagId]).map(function(itm) {
                        return self.currentAssetsFeed[tagId][itm];
                    }
                ).indexOf(assetId) !== 1
            ){
                self.currentAssetsFeed[tagId][assetId] = parseInt(assetId);
            }
        }else{
            if(typeof self.currentAssetsFeed[tagId] == 'undefined'){
                self.currentAssetsFeed[tagId] = {};
            }
            self.currentAssetsFeed[tagId][assetId] = parseInt(assetId);
        }
    };

    self.unsetCurrentAssetFeed = function(tagId, assetId){
        if(typeof self.currentAssetsFeed[tagId] != 'undefined'){
            if(typeof assetId != 'undefined'
                && typeof self.currentAssetsFeed[tagId][assetId] != 'undefined'){
                delete self.currentAssetsFeed[tagId][assetId];
                return true;
            }else{
                delete self.currentAssetsFeed[tagId];
                return true;
            }
        } else {
            return false;
        }
    };

    self.getCurrentAssetFeed = function(){
        var fullAssets = [];

        for (var assetsTag in self.currentAssetsFeed){
            fullAssets = fullAssets.concat(Object.keys(
                self.currentAssetsFeed[assetsTag]).map(function(itm) {
                    return parseInt(self.currentAssetsFeed[assetsTag][itm]);
                }
            ));
        }
        return fullAssets;
    };

    self.init(options);
};


/* trade param object */
var TradeParam = function (options) {

    var self = this;

    self.viewType = '';

    self.VIEW_TYPE_CHART = 'chart';
    self.VIEW_TYPE_MULTI = 'multi';

    // self.OPTION_TYPE_CFD    = 6; //@deprecated

    self.DIRECTION_SELL     = -1;
    self.DIRECTION_BUY      = 1;

    self.ENTRY_ORDER_LIMIT  = 1;
    self.ENTRY_ORDER_STOP   = 2;

    self.init = function(options) {
        options = options || {};

        if (typeof options.viewType !== 'undefined') {
            self.viewType = options.viewType;
        }
    };


    self.init(options);


    return self;
};
/********* end trade param *************/


/******** media manager ********/
var MediaManager = function (options) {

    var self = this;

    self.mediaSource = '/';
    self.mediaSourceCommon = '/';


    self.init = function(options) {
        options = options || {};

        if (typeof options.mediaSource !== 'undefined') {
            self.mediaSource = options.mediaSource;
        }
        if (typeof options.mediaSourceCommon !== 'undefined') {
            self.mediaSourceCommon = options.mediaSourceCommon;
        }
    };


    self.to = function(path, isCommonSource) {
        var isCommonSource = isCommonSource || false;
        var result = '#';

        if (typeof path !== 'undefined') {
            result = (_isRelativePath(path))
                ? (isCommonSource
                    ? self.mediaSourceCommon + '/' + $.trim(path, '/')
                    : self.mediaSource + '/' + $.trim(path, '/'))
                : path;
        }

        return result;
    };


    self.getAssetIcon = function(trade) {

        if (typeof App.asset.assetsDetails[trade.asset_id] !== 'undefined')
        {
            return App.asset.assetsDetails[trade.asset_id].icon_url;
        }

        return '';
    };


    function _isRelativePath(path) {
        var result = false;

        if (typeof path !== 'undefined') {
            if (path.indexOf('http://') === -1
                && path.indexOf('https://') === -1
                && path.indexOf('//') === -1) {
                result = true;
            }
        }

        return result;
    }

    self.init(options);

    return self;
};
/******** end media manager ********/


/* sys parameters*/
var SysParameter = function(options) {

    var self = this;

    self.DEFAULT_SL_TP_RATE_PERCENT         = 0.01;
    self.DEFAULT_PLACE_ORDER_RATE_PERCENT   = 0.005;
    self.DEFAULT_PRICE_ALERT_DISTANCE       = 0.001;
    self.SLTP_STEP_AMOUNT                   = 5;
    self.MIN_DISTANCE_ASSET                 = 0.001;
    self.USE_RATE_FOR_CHART                 = 2;

    self.init = function(options) {

        options = options || {};

        var initOptions = [
            'DEFAULT_SL_TP_RATE_PERCENT',
            'DEFAULT_PRICE_ALERT_DISTANCE',
            'MIN_DISTANCE_ASSET',
            'DEFAULT_PLACE_ORDER_RATE_PERCENT',
            'SLTP_STEP_AMOUNT',
            'USE_RATE_FOR_CHART'
        ];

        for (var optionName in options) {
            if (initOptions.indexOf(optionName) !== -1) {
                this[optionName] = options[optionName];
            }
        }
    };

    self.init(options);

    return self;
};
/*end sys parameters*/


/* trader object */
var Trader = function (options) {

    var self = this;

    self.isGuest = false;
    self.isDemo = false;
    self.hash = null;
    self.currencySign = '$';
    self.currencySignPosition = 'left';
    self.balances = {};
    self.loginForm = {};


    self.init = function(options) {
        if (typeof options.isGuest !== 'undefined') {
            self.isGuest = !!options.isGuest;
        }
        if (typeof options.isDemo !== 'undefined') {
            self.isDemo = !!options.isDemo;
        }
        if (typeof options.hash !== 'undefined') {
            self.hash = options.hash;
        }
        if(typeof options.currencySign !== 'undefined'){
            self.currencySign = options.currencySign;
        }

        options = options || {};

        var initOptions = [
            'isGuest', 'isDemo', 'hash', 'currencySign', 'currencySignPosition'
        ];

        for (var optionName in options) {
            if (initOptions.indexOf(optionName) !== -1) {
                this[optionName] = options[optionName];
            }
        }

        self.initEvents();
        self.initListeners();

        if (self.isGuest) {
            self.loginForm = new LoginForm();
        }
    };


    self.initListeners = function() {
        if (!self.isGuest) {
            App.socketCfd.subscribe('balances', function(data) {

                var $footer = $('footer');
                var isFirstTick = $.isEmptyObject(self.balances);

                if (isFirstTick || self.balances.pnl_cfd != data.pnl_cfd) {
                    $footer.find('#JS-pnl_cfd').text(App.formater.numberFormatAmountSign(data.pnl_cfd));
                }
                if (isFirstTick || self.balances.balance != data.balance) {
                    $('#JS-balance').text(App.formater.numberFormatAmount(data.balance));
                }
                if (isFirstTick || self.balances.acc_val != data.acc_val) {
                    $footer.find('#JS-equity').text(App.formater.numberFormatAmountSign(data.acc_val));
                }
                if (isFirstTick || self.balances.avl_balance != data.avl_balance) {
                    $footer.find('#JS-avl_balance').text(App.formater.numberFormatAmountSign(data.avl_balance));
                }
                if (isFirstTick || self.balances.imargin != data.imargin) {
                    $footer.find('#JS-imargin').text(App.formater.numberFormatAmountSign(data.imargin));
                }
                if (isFirstTick || self.balances.mmargin != data.mmargin) {
                    $footer.find('#JS-mmargin').text(App.formater.numberFormatAmountSign(data.mmargin));
                }
                if (isFirstTick || self.balances.mar_level != data.mar_level) {
                    $footer.find('#JS-margin_level').text(data.mar_level.toFixed(2) + '%');
                }
                if (isFirstTick || self.balances.mar_util != data.mar_util) {
                    $footer.find('#JS-margin_usage').text(data.mar_util.toFixed(2) + '%');
                    $footer.find('#JS-margin_usage_progress').css('width', data.mar_util.toFixed(2) + '%');
                }
                if (isFirstTick || self.balances.credit_balance != data.credit_balance) {
                    if(typeof data.credit_balance == 'undefined'){
                        data.credit_balance = 0;
                    }
                    $footer.find('#JS-credit_balance').text(App.formater.numberFormatAmountSign(data.credit_balance));

                }

                if (isFirstTick || self.balances.wd_request != data.wd_request) {
                    if(typeof data.wd_request == 'undefined'){
                        data.wd_request = 0;
                    }
                    if (data.wd_request > 0) {
                        $footer.find('#JS-wd_request-block').show();
                        $footer.find('#JS-wd_request').text(App.formater.numberFormatAmountSign(data.wd_request * (-1)));
                    } else {
                        $footer.find('#JS-wd_request').text(App.formater.numberFormatAmountSign(0));
                        $footer.find('#JS-wd_request-block').hide();
                    }
                }

                self.balances = data;

            });
        }

        return self;
    };


    self.initEvents = function() {

        if (!self.isGuest) {
            $('.JS-check_deposit').click(function(e) {
                e.preventDefault();
                var location = $(this).prop('href'),
                    target = $(this).prop('target'),
                    win = target === '_blank'
                        ? window.open()
                        : window;

                    $.getJSON('/ajax/trader/deposit_ability', function(result){
                        if (result.success === 1) {
                        win.location = location;
                        } else {
                        if (target === '_blank') {
                            win.close();
                        }
                            App.notification.error(result.description);
                        }
                    });
            });
        }

        return self;
    };


    var LoginForm = function() {

        var selfForm = this;
        selfForm.submenuSelector = '#JS-login-submenu';
        selfForm.formContainerSelector = '.log-in-btns';


        selfForm.show = function() {
            if(!$(selfForm.formContainerSelector).hasClass('active')) {
                $(selfForm.submenuSelector).fadeIn();
                $(selfForm.formContainerSelector).addClass('active');
                App.htmlTemplate.addOverlay($('body'), {click: selfForm.hide});
            }
        };


        selfForm.hide = function() {
            $(selfForm.submenuSelector).fadeOut();
            $(selfForm.formContainerSelector).removeClass('active');
            App.htmlTemplate.removeOverlay($('body'));
        };


        selfForm.init = function() {

            $(selfForm.formContainerSelector).on('click', '[data-action]', function(e) {
                e.preventDefault();
                switch ($(this).data('action')) {
                    case 'close': {
                        selfForm.hide();
                        break;
                    }
                   case 'show': {
                        selfForm.show();
                        break;
                    }
                }
            });

            $(selfForm.formContainerSelector+' form').on('submit', function(e) {
                e.preventDefault();
                var sendData = $(this).serialize();
                var $this = $(this);
                App.htmlTemplate.addLoader($this);
                $.post('/ajax/trader/auth', sendData, function(response) {
                    if (response.success) {
                        window.location.href = response.data.redirect_link;
                    } else {
                        for (var i in response.errors) {
                            var error = response.errors[i],
                                block = $this.find('[data-field='+i+']');

                            if (error.redirect_url)
                            {
                                window.location.href = error.redirect_url;
                                break;
                            }
                            block.find('.text-error').text(error.data);
                            block.find('.text-error').removeClass('hidden');
                            block.find('.icon-error').removeClass('hidden');

                            block.addClass('has-error');

                            block.one('click', function(){
                                $(this).removeClass('has-error');
                                $(this).find('.text-error').text('');
                                $(this).find('.text-error').addClass('hidden');
                                $(this).find('.icon-error').addClass('hidden');
                            });
                        }
                    }
                    App.htmlTemplate.removeLoader($this);
                }, 'json');
            });
        };

        selfForm.init();

        return selfForm;
    };

    self.init(options);

    return self;
};
/********* end trader *************/


/* Cfd socket object */
var SocketCfd = function(options) {

    var self = this;

    self.isTriedAfterExpiry = false;
    self.secondsForExpiry   = 30;

    self.showConsoleError   = true;
    self.connection         = false;
    self.timestamp          = false;
    self.poolEvents         = {};
    self.poolEmits          = {};
    self.connectionStatus   = false;
    self.authStatus         = false;
    self.isGuest            = false;
    self.config             = {};

    self.config = $.extend(self.config, options);

    self.init = function(options) {
        if (typeof options.data !== 'undefined') {
            self.config.options.data = options.data;
        }
        if (typeof options.hash !== 'undefined') {
            self.config.options.hash = options.hash;
        }
        if (typeof options.t !== 'undefined') {
            self.config.options.t = options.t;
        }
        if (typeof options.timestamp !== 'undefined') {
            self.config.options.timestamp = options.timestamp;
        }

        if (typeof options.isGuest !== 'undefined') {
            self.config.options.isGuest = options.isGuest;
        }

        self.connect(self.config.url);

        self.subscribe('server_time', function(data) {
            self.timestamp = data;
            var time = App.formater.dateTime(self.timestamp, 'H:i:S');
            $('#JS-time_gmt').text(time);
            if (App.tradeRecent.last_emit != false
                && self.timestamp - App.tradeRecent.last_emit > 5
                && Object.keys(App.tradeRecent.openPositions).length > 0
            ) {
                App.tradeRecent.hideOpenPosition();
            }
        });

    };

    self.serverTimestamp = function() {
        return self.timestamp;
    };



    self.connect = function(url) {
        this.connection = new WebSocket(url);
        self.connectionStatus = false;
        self.authStatus       = false;
        this.connection.onopen = self.onOpen;
        this.connection.onclose = self.onClose;
        this.connection.onmessage = self.onMessage;
        this.connection.onerror = self.onError;

        return this.connection;
    };

    self.onOpen = function(){
        self.connectionStatus = true;

        let authorized = self.auth(self.config.options);

        if (authorized && App.trader.isGuest) {

            self.sendSubscribeMethods();
        }
    };

    self.onClose = function(e) {
        //todo remove
        let log = typeof e !== 'undefined'
            ? {
                'ON_Close' : e.code,
                'error' : e.reason,
            } : {
                'ON_Close' : 'empty error'
            };

        $.post('/ajax/trader/log', log);

        //clears flags..
        for(var events in self.poolEvents) {
            if(self.poolEvents[events].isSubscribed) {
                self.poolEvents[events].isSubscribed = false;
            }
        }
        setTimeout(function(){
            $.post('/ajax/trader/socket_data', {}, function(response) {
                if(response.success){
                    self.init(response.data);
                }
            }, 'json');
        }, 3000);
    };

    self.onMessage = function(event){
        var parseData = JSON.parse(event.data);
        if(typeof parseData != "undefined"){
            if(typeof self.poolEvents[parseData.event] != "undefined") {
                if(typeof self.poolEvents[parseData.event]['callback'] == 'function') {
                    self.poolEvents[parseData.event]['callback'](parseData.response);
                } else {
                    for(var callback in self.poolEvents[parseData.event]['callback']){
                        self.poolEvents[parseData.event]['callback'][callback](parseData.response);
                    }
                }
            }
        }
    };

    self.onError = function(e){
        //todo remove
        let log = (typeof e !== 'undefined')
            ? {
                'ON_Error' : e.code,
                'error' : e.data,
            } : {
                'ON_Error' : 'No_error'
            };

        $.post('/ajax/trader/log', log);

        if (self.connection.readyState === self.connection.OPEN) {
            // self.connection.close();
        }
    };

    self.subscribe = function(method, callback, data, tagId, sendWithoutData){
        self.unsubscribe(method, tagId);

        var send = false;
        if( 'undefined' == typeof( self.poolEvents[method] ) ){
            self.poolEvents[method] = {};
            self.poolEvents[method]['callback'] = {};
        }
        if(typeof sendWithoutData == 'undefined'){
            sendWithoutData = false;
        }

        self.poolEvents[method]['sendWithoutData'] = sendWithoutData;

        if('undefined' == typeof(self.poolEvents[method]['data'])){
            self.poolEvents[method]['data'] = {};
        }

        if('undefined' != typeof(data)) {
            self.poolEvents[method]['data'] = data;
            if( ! self.isEmpty(data)){
                send = true;
            }else if(sendWithoutData == true){
                send = true;
            }
        }

        if(callback) {
            if(typeof tagId != 'undefined'){
                self.poolEvents[method]['callback'][tagId] = callback;
            }else{
                self.poolEvents[method]['callback'] =  callback;
            }
        }

        if(self.connectionStatus && send) {
            self.poolEvents[method]['isSubscribed'] = true;

            if(sendWithoutData){
                this.connection.send(JSON.stringify({
                    'event':'subscribe',
                    'params':{
                        'method_name':method,
                    },
                }));
            }else{
                this.connection.send(JSON.stringify({
                    'event':'subscribe',
                    'params':{
                        'method_name':method,
                        'data':data
                    },
                }));
            }
        } else {
            self.poolEvents[method]['isSubscribed'] = false;
        };
    };

    self.isExpired = function (timestamp) {
        let nowInSeconds = Math.floor(Date.now() / 1000);

        return nowInSeconds - timestamp > self.secondsForExpiry;
    };

    self.auth = function(options){
        if (self.isExpired(options.timestamp) && ! self.isTriedAfterExpiry) {

            self.isTriedAfterExpiry = true;

            self.connection.close();

            return false;
        }

        var authData = {
            'event':'auth',
            'params': {
                'data':options.data,
                't'   :options.t,
                'hash':options.hash,
                'timestamp':options.timestamp,
                'platform':options.platform,
            },
        };

        if(self.connectionStatus && ! options.isGuest){
            this.connection.send(JSON.stringify(authData));
        }

        self.subscribe('auth', function (authData){
            self.authStatus = authData.status;
            if(self.authStatus) {
                self.sendSubscribeMethods();
            }
        });

        return true;
    };

    self.sendSubscribeMethods = function(){
        for(var events in self.poolEvents) {
            if(!self.poolEvents[events].isSubscribed) {
                self.subscribe(events,self.poolEvents[events].callback,self.poolEvents[events].data,self.poolEvents[events].tagId,self.poolEvents[events].sendWithoutData);
            }
        }
    };

    self.send = function(method, data){
        if(typeof data != 'undefined' && typeof data == 'object'){
            this.connection.send(JSON.stringify({
                'event':'subscribe',
                'params':{
                    'method_name':method,
                    'data':data
                },
            }));
        }
    };

    self.unsubscribeAssets = function (method, tagId){
        if(typeof tagId != 'undefined'){
            if(self.poolEvents.hasOwnProperty(method)
                && self.poolEvents.hasOwnProperty('callback')){
                delete self.poolEvents[method]['callback'][tagId];
            }

            if(App.asset.unsetCurrentAssetFeed(tagId)){
                this.connection.send(JSON.stringify({
                    'event':'subscribe',
                    'params':{
                        'method_name':method,
                        'data':App.asset.getCurrentAssetFeed()
                    },
                }));
            }
        }
    };

    self.unsubscribe = function(method, tagId, closeSubscribe) {
        if (typeof tagId !== 'undefined') {
            if (self.poolEvents.hasOwnProperty(method) && self.poolEvents.hasOwnProperty('callback')) {
                delete self.poolEvents[method]['callback'][tagId];
            }
        } else {
            delete self.poolEvents[method];
        }

        if (closeSubscribe) {
            self.closeSubscribe(method);
        }
    };

    self.closeSubscribe = function(method) {
        this.connection.send(JSON.stringify({
            "event" : "unsubscribe",
            "params" : {
                "method_name" : method
            }
        }));
    };

    self.isEmpty = function(e){
        if(typeof e == "object"){
            if (e == null) return true;
            if (e.length > 0)    return false;
            if (e.length === 0)  return true;
            for (var key in e) {
                if (hasOwnProperty.call(e, key)) return false;
            }
            return true;
        }
        switch (e) {
            case "":
            case 0:
            case "0":
            case null:
            case false:
            case typeof e == "undefined":
                return true;
            default:
                return false;
        }
    };

    self.init(options);

    return self;
};
/******** end socket **/

/******** Favorite assets widget ********/
var favoriteAssets = function (options) {

    var self = this;

    var defOptions = {
        clickContainerSelector  : '.main-section',
        pluginContainerSelector : '#assets-slider',
        assetsConteinerSelector : '.assets_favorites_container-JS',

        actionDelete            : 'fav_delete',
        actionAdd               : 'fav_add',
        actionActive            : 'fav_active'
    };

    self.options = $.extend(defOptions, options);

    /* Init jQuery plugin slider */
    self.initSlider = function() {
        $(self.options.pluginContainerSelector).slick({
            slidesToShow : 9,
            slidesToScroll : 3,
            infinite : false,
            responsive: [
                {
                    breakpoint : 1600,
                    settings : {
                        slidesToShow : 6,
                        slidesToScroll : 3
                    }
                }, {
                    breakpoint : 1365,
                    settings : {
                        slidesToShow : 4,
                        slidesToScroll : 2
                    }
                }
            ],
            prevArrow:'<button type="button" class="slick-prev"><i class="material-icons">keyboard_arrow_left</i></button>',
            nextArrow:'<button type="button" class="slick-next"><i class="material-icons">keyboard_arrow_right</i></button>'
        });

        return self;
    };
    /****************/

    /* Bind events add/delete items */
    self.initEvents = function() {

        $(self.options.clickContainerSelector).on('click', '[data-action]', function(e) {

            var $this = $(this);
            var $sliderElement = $(self.options.pluginContainerSelector);

            var action = $this.attr('data-action');
            var assetId = $this.closest('[data-asset_id]').data('asset_id');

            switch (action) {
                case self.options.actionDelete : {

                    var postData = {'asset_id' : assetId};

                    $.post('/ajax/favorite/delete', postData, function(response) {
                        if (response.success) {

                            var $element = $sliderElement.find('[data-asset_id='+postData.asset_id+']');
                            var index = $sliderElement.find('[data-asset_id]').index($element);

                            $sliderElement.slick('slickRemove', index);

                            $(self.options.clickContainerSelector)
                                .find('[data-action='+self.options.actionDelete+']')
                                .closest('[data-asset_id='+postData.asset_id+']')
                                .find('[data-action='+self.options.actionDelete+']')
                                .attr('data-action', self.options.actionAdd)
                                .parent()
                                .removeClass('active');
                            App.asset.unsetCurrentAssetFeed(parseInt(postData.asset_id), 'favorite_assets');
                        } else {
                            App.notification.error(response.error);
                        }
                    }, 'json');
                    e.stopPropagation();    // for prevent switch asset
                    break;
                }

                case self.options.actionAdd : {
                    if (App.trader.isGuest) {
                        App.trader.loginForm.show();
                        break;
                    }
                    var postData = {'asset_id' : assetId};

                    $.post('/ajax/favorite/add', postData, function(response) {
                        if (response.success) {
                            var $html = $(response.data.html);
                            $sliderElement.slick('slickAdd', $html);
                            $(self.options.clickContainerSelector)
                                .find('[data-action='+self.options.actionAdd+']')
                                .closest('[data-asset_id='+postData.asset_id+']')
                                .find('[data-action='+self.options.actionAdd+']')
                                .attr('data-action', self.options.actionDelete)
                                .parent()
                                .addClass('active');
                            App.notification.success(response.data.message, 2);
                            App.asset.setCurrentAssetFeed(parseInt(postData.asset_id), 'favorite_assets');
                        } else {
                            App.notification.error(response.error);
                        }
                    }, 'json');
                    break;
                }
                case self.options.actionActive : {
                    $(self.options.pluginContainerSelector).find('[data-action="'+self.options.actionActive+'"]').removeClass('active');
                    var assetId = parseInt($this.data('asset_id'));
                    $this.addClass('active');
                    App.asset.switchAsset({asset_id: assetId});
                    App.socketCfd.subscribe('assets_feed', function(){},[assetId], 'current_asset_click_favorite');
                    break;
                }
                default : {
                    break;
                }
            }
        });

        return self;
    };
    /*******************/

    self.initListeners = function() {
        var $container = $(self.options.pluginContainerSelector);
        $container.find(self.options.assetsConteinerSelector).each(function(index, asset){
            App.asset.setCurrentAssetFeed($(asset).data('asset_id'), 'favorite_assets');
        });
        App.socketCfd.subscribe('assets_feed', function (data) {
            for (var i in data) {
                var $asset = $container.find('[data-asset_id='+data[i].asset_id+']');
                if ($asset.length) {
                    $asset.find('.asset-price')
                        .html(App.htmlTemplate.getUpDownRateArrow(data[i].raise)+ data[i].percent_change.toFixed(2) + '%');
                }
            }
        }, App.asset.getCurrentAssetFeed(),'favorite_assets');
        return self;
    };

    self.init = function() {
        self.initSlider()
            .initEvents()
            .initListeners();

        return self;
    }
};
/******** end favorite assets widget ********/



/* asset price alerts */

var assetPriceAlert = function (options) {
    var self = this;

    self.ALERT_SELL_RATE_TYPE   = -1;
    self.ALERT_BUY_RATE_TYPE    = 1;
    self.ALERT_MIDDLE_RATE_TYPE = 2;

    self.userAlertsLog = [];
    self.timeouts = {};

    var defOptions = {
        clickContainerSelector  : '#asset-block-info',  //for listen click to add/update/delete alert
        assetCounterSelector    : '#price-alert-link .counter', //for update total counter by asset in trade block
        totalCounterSelector    : '.navigation [data-menuitem="pricealert"] .counter',  //for update total counter
        popoverSelector         : '#price-alert-submenu',   // for popover container
        tableSelector           : '#table-alert',   // for popover container

        actionShowHide          : 'alert_show_hide',
        actionClose             : 'alert_close',
        actionAddEdit           : 'alert_add_edit',
        actionChangeRate        : 'alert_rate_change',
        actionDelete            : 'alert_delete'
    };

    self.options = $.extend(defOptions, options);

    /* Bind events */
    self.initEvents = function() {
        $(document).on('click', self.options.clickContainerSelector + ' [data-action]', function() {
            var $this = $(this);
            var $popover = self.getPopover();
            var $assetInfoContainer = $(this).closest('[data-asset_id]');

            switch ($(this).data('action')) {
                case self.options.actionShowHide: {
                    if (App.trader.isGuest) {
                        App.trader.loginForm.show();
                        break;
                    }
                    var currentClick = $popover.closest('[data-asset_id]').find($this).length != 0;
                    var isVisible = $popover.is(':visible');
                    if ( ! isVisible || ! currentClick) {
                        if (isVisible) {
                            self.hidePopover(true); //stay visible but uninit other actions
                        }
                        $popover.appendTo($this.parent());
                        $this.addClass('active');
                        $this.closest('tr').addClass('active');

                        $popover.fadeIn();

                        var assetId         = $assetInfoContainer.data('asset_id');
                        var roundPrecision  = App.asset.getAssetDetails(assetId, 'round_precision');
                        var assetRate       = App.asset.getAssetRates(assetId, true);
                        var bidAsc          = $popover.find('[name="bid_ask"]').val();
                        var alertRate       = $assetInfoContainer.data('alert_rate') || self.getDefaultAlertRate(assetRate, bidAsc);

                        alertRate = App.formater.numberFormatRate(alertRate, roundPrecision);
                        $popover.find('[name="rate"]').val(alertRate);
                        $popover.data('asset_id', assetId);

                        $(document).bind('click.alert_popover', function (e) {
                            var $popover = self.getPopover();
                            var $target = $(e.target);
                            if ( ! $target.closest($popover).length && $target.data('action') != self.options.actionShowHide) {
                                self.hidePopover();
                            }
                        });

                        self.updateRates(assetId);
                        App.socketCfd.subscribe('assets_feed', function(data) {
                            var assetId = $assetInfoContainer.data('asset_id');
                            if (assetId in data) {
                                self.updateRates(assetId);
                            }
                        },{},'price_alerts');

                        /********** end ************/

                    } else {
                        self.hidePopover();
                    }

                    break;
                }
                case self.options.actionChangeRate : {

                    var $rateInput  = $popover.find('[name="rate"]');
                    var assetId     = $assetInfoContainer.data('asset_id');
                    var step        = App.asset.getAssetDetails(assetId, 'step_rate') * Number($(this).data('direction'));
                    var precision   = App.asset.getAssetDetails(assetId, 'round_precision');
                    var rateNew     = App.formater.clearNumber($rateInput.val()) + step;

                    $rateInput.val(App.formater.numberFormatRate(rateNew, precision));
                    break;
                }
                case self.options.actionClose : {

                    self.hidePopover();
                    break;
                }
                case self.options.actionDelete : {
                    var id = $assetInfoContainer.attr('data-id');
                    var postData = {"id" : id};

                    $.post('/ajax/pricealert/delete', postData, function(response) {
                        if (response.success) {
                            $(self.options.totalCounterSelector).text(response.data.count_total);
                            $assetInfoContainer.fadeOut(500, function($assetInfoContainer) {
                                 $assetInfoContainer.remove();
                            } ($assetInfoContainer));
                            App.notification.success(response.data.message);
                            $(self.options.totalCounterSelector).text(response.data.count_total);
                        } else {
                            App.notification.error(response.error);
                        }
                    }, 'json');
                    break;
                }
                case self.options.actionAddEdit : {

                    var id = $assetInfoContainer.attr('data-id');
                    var postData = {};
                        postData.rate = $assetInfoContainer.find('[name=rate]').val();
                        postData.bid_ask = $assetInfoContainer.find('[name=bid_ask] option:selected').val();

                    if (id === undefined || ! id) {
                        postData.asset_id = $assetInfoContainer.data('asset_id');

                        $.post('/ajax/pricealert/add', postData, function(response) {
                            if (response.success) {
                                self.hidePopover();
                                $(self.options.assetCounterSelector)
                                    .removeClass('hidden')
                                    .text(response.data.count_by_asset);
                                $(self.options.totalCounterSelector)
                                    .removeClass('hidden')
                                    .text(response.data.count_total);
                                App.notification.success(response.message);
                            } else {
                                App.notification.error(response.error);
                            }
                        }, 'json');
                    } else {
                        postData.id = id;

                        $.post('/ajax/pricealert/update', postData, function(response) {
                            if (response.success) {
                                self.hidePopover();
                                $assetInfoContainer.after(response.data.html);
                                $assetInfoContainer.remove();
                                App.notification.success(response.data.message);
                            } else {
                                App.notification.error(response.error);
                            }
                        }, 'json');
                    }
                    break;
                }
            }
        });

        $(document).on('change', self.options.popoverSelector + ' [name="bid_ask"]', function() {
            var type = +$(this).val(),
                assetId = $(this).closest('#price-alert-submenu').data('asset_id'),
                roundPrecision = App.asset.getAssetDetails(assetId, 'round_precision'),
                assetRate = App.asset.getAssetRates(assetId, true),
                alertRate = self.getDefaultAlertRate(assetRate, type);

            alertRate = App.formater.numberFormatRate(alertRate, roundPrecision);
            $(self.options.popoverSelector + ' [name="rate"]').val(alertRate);
        });

        return self;
    };

    self.initListeners = function() {
        if($(self.options.tableSelector).length > 0){
            $(self.options.clickContainerSelector+' tbody tr').each(function(){
                App.asset.setCurrentAssetFeed(parseInt($(this).data('asset_id')),'price_alerts_page')
            });
            App.socketCfd.subscribe('assets_feed', function(data) {
                $(self.options.clickContainerSelector+' tbody tr').each(function(){
                    var assetId = $(this).data('asset_id');
                    var dir = $(this).data('bid_ask');
                    if (assetId in data) {
                        var precision = App.asset.getAssetDetails(assetId, 'precision');
                        var point = App.asset.getAssetRates(assetId, true);
                        var rate = point.rate;
                        if (dir == App.tradeParam.DIRECTION_BUY) {
                            rate = point.buy_value;
                        } else if (dir == App.tradeParam.DIRECTION_SELL) {
                            rate = point.sell_value;
                        }
                        rate = App.formater.numberFormatRate(rate, precision);
                        $(this).find('.JS-curr_rate').text(rate);
                    }
                });
            }, App.asset.getCurrentAssetFeed(),'price_alerts_curr_rate_page');

            App.socketCfd.subscribe('price_alert_feed',function (data) {
                $(self.options.clickContainerSelector+' tbody tr').each(function(){
                    for(var key in data){
                        if(parseInt($(this).attr('data-id')) == key){
                            $(this).find('.JS-curr_distance').text(data[key].distance +'%');
                        }
                    }
                });
            },{},'price_alerts_feed',true);

        } else {
            App.socketCfd.unsubscribe('assets_feed','price_alerts_curr_rate_page')
        }

    };

    self.getPopover = function() {
        var $container = $(self.options.popoverSelector);

        if ($container.length === 0) {
            $container = $(App.htmlTemplate.priceAlertTemplate);
        }

        return $container;
    };

    self.getDefaultAlertRate = function(assetData, type) {
        var rate,
            distance = +App.sysParameter.DEFAULT_PRICE_ALERT_DISTANCE;

        if (type == self.ALERT_BUY_RATE_TYPE) {
            rate = +assetData.buy_value;
            rate = rate * (1 - distance);
        } else if (type == self.ALERT_SELL_RATE_TYPE) {
            rate = +assetData.sell_value;
            rate = rate * (1 + distance);
        } else {
            rate = +assetData.sell_value + assetData.spread / 2;
            rate = rate * (1 - distance);
        }

        return rate;
    };

    self.updateRates = function(assetId) {
        assetId = assetId || false;
        if (assetId) {
            var $popover = self.getPopover();
            var precision = App.asset.getAssetDetails(assetId, 'precision');
            var point = App.asset.getAssetRates(assetId, true);

            var sellRate = App.formater.numberFormatRate(point.sell_value, precision);
            $popover.find('.JS-sell_rate').text(sellRate);
            var buyRate = App.formater.numberFormatRate(point.buy_value, precision);
            $popover.find('.JS-buy_rate').text(buyRate);
        }
    };

    self.hidePopover = function(visibility) {

        var visibility = visibility || false;

        $(document).unbind('click.alert_popover');

        var $popover = self.getPopover();
        $popover.parent()
            .find('[data-action=' + self.options.actionShowHide + ']')
            .removeClass('active');

        $popover.parent().closest('tr').removeClass('active');

        if ( ! visibility) {
            $popover.fadeOut();
        }

        return self;
    };
    /*******************/

    self.init = function() {
        self.initEvents();
        self.initListeners();

        return self;
    }
};


var TradeRecent = function (options) {

    var self = this;

    self.openPositions      = {};
    self.openPositionsPrev  = {};
    self.isRenderPositions  = false;
    self.time_sleep         = false;
    self.last_emit          = false;
    self.date_format        = 'd N H:I:S';

    self.init = function(options) {

        var def_options = {
            recentContainerSelector : '#block-active-position',
            tradePopoverRelativeSelector : '.action-submenu',

            actionRowOpenClose       : 'row_open_close',
            actionSlTpShowHide       : 'sl_tp_check',
            actionSlTpShowHideSimply : 'sl_tp_check_simply',
            actionSlTpChangeRate     : 'sl_tp_change_rate',
            actionSlTpChangeAmount   : 'sl_tp_change_amount',
            actionSlTpSave           : 'sl_tp_save',
            actionStrikeShowHide     : 'strike_check',
            actionStrikeChangeRate   : 'strike_change_rate',
            actionStrikeSave         : 'strike_save',
            actionTradeClose         : 'trade_close',
            // Ð±ÑƒÐ´ÑƒÑ‚ Ð´Ð¸Ð½Ð°Ð¼Ð¸Ñ‡ÐµÑÐºÐ¸Ðµ Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ñ‹. Ð’Ñ‹Ð³Ñ€ÑƒÐ¶Ð°Ñ‚ÑŒÑÑ Ð² Ð¾Ð¿Ñ†Ð¸Ð¸.. Tabs table.
            tradesFilterAll          : 0,
            tradesTypeOpened         : 1,
            tradesTypeOrder          : 2,
            tradesTypeAll            : 0,
        };

        self.options = $.extend(def_options, options);

        if ( ! App.trader.isGuest) {
            /* listen trades for logged users only */
            App.socketCfd.subscribe('trades', function (data) {
                self.last_emit = App.socketCfd.timestamp;
                if (typeof data !== 'undefined' && data !== null) {
                    self.openPositions = data;
                } else {
                    self.openPositions = {};
                }

                self.renderPosition();
            },{
                type:self.options.tradesFilterAll,
                filter:self.options.tradesFilterAll,
            },'trades');
        }

        self.initEvents();
    };

    self.renderPosition = function () {

        //render chartPositions on chart.
        App.mainChart.renderPositionsLines(self.openPositions);
        // render position if set flag only
        if ((self.isRenderPositions || $.isEmptyObject(self.openPositionsPrev) || self.time_sleep > 10)) {
            self.time_sleep = 0; // Ñ„Ð¸ÐºÑÐ° Ð´Ð»Ñ Ð¿ÐµÑ€ÐµÑ€ÐµÐ½Ð´ÐµÑ€Ð¸Ð½Ð³Ð° Ð² Ñ„Ð¾Ð½Ðµ ÐºÐ°Ð¶Ð´Ñ‹Ðµ 10 ÑÐµÐº
            var $tmpElement;
            var $openPositionsContainer = $(self.options.recentContainerSelector + ' .tab-content-1');
            var $openOrdersContainer    = $(self.options.recentContainerSelector + ' .tab-content-2');
            var $openContainer          = $(self.options.recentContainerSelector);
            var $allRow                 = $openContainer.find('.active-position-link');
            var cntPositions= 0;
            var cntOrders   = 0;

            //remove missing trades and orders
            $openPositionsContainer
                .find('tbody')
                .each(function(index, row) {
                    var $row = $(row);
                    var tradeId = $row.data('trade_id');

                    if (+tradeId != 0 && typeof self.openPositions[tradeId] === 'undefined') {
                        $row.fadeIn(500).remove();
                    }
            });

            //remove orders which became trades
            $openOrdersContainer
                .find('tbody')
                .each(function(index, row) {
                    var $row = $(row);
                    var tradeId = $row.data('trade_id');

                    if (+tradeId != 0 && (typeof self.openPositions[tradeId] === 'undefined'
                        || self.openPositions[tradeId].place_order == 0)
                    ) {
                        $row.fadeIn(500).remove();
                    }
            });


            for (var tradeId in self.openPositions) {
                var trade = self.openPositions[tradeId];

                if (trade.place_order > 0) {
                    var $row = $openOrdersContainer.find('tbody[data-trade_id=' + tradeId + ']');
                } else {
                    var $row = $openPositionsContainer.find('tbody[data-trade_id=' + tradeId + ']');
                }

                if (trade.start_close > 0) {
                    if ($row.length) {

                        $row.remove()
                    }
                    continue;
                }

                if (trade.place_order > 0) {
                    cntOrders++;
                } else {
                    cntPositions++;
                }

                if($row.length == 0) {
                    //trade not exist, creating new element
                    if (trade.place_order > 0) {
                        $row = $(App.htmlTemplate.recentOrderTemplate);
                        $row.prependTo($openOrdersContainer.find('table'));
                        var textOrder = App.htmlTemplate.entryOrderType(trade.place_order_type_i);
                        $row.find('.JS-order_type').text(textOrder);
                    } else {
                        $row = $(App.htmlTemplate.recentPositionTemplate);
                        if (trade.is_simply) {
                            $row.find('.JS-default_instance').remove();
                        } else {
                            $row.find('.JS-simply_instance').remove();
                        }
                        $row.prependTo($openPositionsContainer.find('table'));
                        $row.find('.JS-trade_id').text('#' + trade.instance_id);

                        if (trade.standard_commission > 0) {
                            trade.standard_commission = '-' + trade.standard_commission;
                        }

                        $tmpElement = $row.find('.JS-standard_com')
                            .text(App.formater.numberFormatAmountSign(trade.standard_commission))
                            .parent();
                        self._upDownClass($tmpElement, trade.standard_commission);
                    }

                    $row.attr('data-trade_id', tradeId);
                    var dateFormated = App.formater.dateTime(trade.created_at_timestamp, self.date_format);
                    $row.find('.JS-created_at').text(dateFormated);
                    $row.find('.JS-img_1')
                        .attr('src', App.mediaManager.getAssetIcon(trade))
                        .attr('alt', trade.asset_name);

                    $row.find('[data-action="row_open_close"]').attr('data-asset_id', trade.asset_id);

                    var direction_label = '';
                    if (typeof trade.raise != 'undefined') {
                        direction_label = trade.raise;
                    } else {
                        if (trade.direction == -1) {
                            direction_label = $row.find('.JS-direction').data('sell');
                        } else {
                            direction_label = $row.find('.JS-direction').data('buy');
                        }
                    }
                    $row.find('.JS-direction').text(direction_label);
                    $row.find('.JS-asset_name').text(trade.asset_name);
                    $row.find('.JS-money_invest').text(App.formater.numberFormatAssetAmountPlatform(trade.amount));

                    if ($row.find('.JS-money_invest_partial').length) {

                        var minVal = App.formater.clearNumber(App.asset.getAssetDetails(trade.asset_id, 'min_amount'));
                        //check tab simply
                        let tab = $('[data-tab_id=' + trade.tab_id + ']');
                        if ((trade.amount >= (minVal + minVal)) && (tab.length && ! tab.data('game_type_id'))) {

                            $row.find('.JS-money_invest_partial')
                                .val(App.formater.numberFormatAssetAmountPlatform(trade.amount))
                                .attr('data-max-amount', trade.amount);
                        } else {

                            $row.find('.JS-money_invest_block').remove();
                        }
                    }

                    $row.find('.JS-imargin_trader').text(App.formater.numberFormatAmountSign(trade.imargin_trader, App.formater.simplyPrecision, ','));
                }

                if (self._readyToUpdate(tradeId, 'strike_open')) {
                    $row.find('.JS-strike').text(App.formater.numberFormatRate(trade.strike_open, trade.precision));
                }

                if (self._readyToUpdate(tradeId, 'start_close') && trade.start_close > 0) {
                    $row.addClass('closed');
                    //Remove last close position/order
                    if ($allRow.length == 1) {
                        setTimeout(function () {
                            self.openPositions = {};
                            self.renderPosition ()
                        }, 5000);
                    }
                }

                if (trade.place_order > 0) {
                    if (self._readyToUpdate(tradeId, 'pls')) {
                        $row.find('.JS-distance').text(trade.pls.toFixed(2) + '%');
                    }
                } else {

                    if (self._readyToUpdate(tradeId, 'pnl_usd')) {
                        $tmpElement = $row.find('.JS-pnl_ticker')
                            .text(App.formater.numberFormatAmount(trade.pnl_usd) + ' ' + trade.ticker);
                        self._upDownClass($tmpElement, trade.pnl_usd);
                    }

                    if (self._readyToUpdate(tradeId, 'pnl_trader')) {
                        $tmpElement = $row.find('.JS-pnl')
                            .text(App.formater.numberFormatAmountSign(trade.pnl_trader))
                            .parent();
                        self._upDownClass($tmpElement, trade.pnl_trader);
                    }

                    if (self._readyToUpdate(tradeId, 'rollover')) {
                        $tmpElement = $row.find('.JS-rollover')
                            .text(App.formater.numberFormatAmountSign(trade.rollover))
                            .parent();
                        self._upDownClass($tmpElement, trade.rollover);
                    }
                }

                if (self._readyToUpdate(tradeId, 'stop_lose')) {
                    var $sl_rate_block = $row.find('.JS-sl_rate');
                    $sl_rate_block
                        .text(
                            (+trade.stop_lose != 0)
                                ? App.formater.numberFormatRate(trade.stop_lose, trade.precision)
                                : ''
                        );
                    if (+trade.stop_lose != 0) {
                        $sl_rate_block
                            .parent()
                            .find('input[data-action="sl_tp_check"]')
                            .attr('checked', true);
                    }

                }
                if (self._readyToUpdate(tradeId, 'take_profit')) {
                    var $tp_rate_block = $row.find('.JS-tp_rate');
                    $tp_rate_block
                        .text(
                            (+trade.take_profit != 0)
                                ? App.formater.numberFormatRate(trade.take_profit, trade.precision)
                                : ''
                        );
                    if (+trade.take_profit != 0) {
                        $tp_rate_block
                            .parent()
                            .find('input[data-action="sl_tp_check"]')
                            .attr('checked', true);
                    }
                }
                if (self._readyToUpdate(tradeId, 'stop_lose_amount')) {
                    $row.find('.JS-sl_amount').text(
                        (+trade.stop_lose_amount != 0)
                        ? App.formater.numberFormatAmountSign(trade.stop_lose_amount, App.formater.simplyPrecision, ',')
                            : ''
                    );

                    $row.find('.JS-sl_amount')
                        .parent()
                        .find('input[data-action="sl_tp_check_simply"]')
                        .attr('checked', true)
                }
                if (self._readyToUpdate(tradeId, 'take_profit_amount')) {
                    $row.find('.JS-tp_amount').text(
                        (+trade.take_profit_amount != 0)
                        ? App.formater.numberFormatAmountSign(trade.take_profit_amount, App.formater.simplyPrecision, ',')
                            : ''
                    );
                    $row.find('.JS-tp_amount')
                        .parent()
                        .find('input[data-action="sl_tp_check_simply"]')
                        .attr('checked', true)
                }

                if (self._readyToUpdate(tradeId, 'strike_market')) {
                    /* render market strike */
                    var $strike = $row.find('.JS-market_strike')
                        .text(App.formater.numberFormatRate(trade.strike_market, trade.precision));
                    $row.find('.JS-arrow').html(App.htmlTemplate.getUpDownRateArrow(trade.up_down_asset));
                    /*********end***********/
                }

                if (self._readyToUpdate(tradeId, 'direction')) {

                    let trade_direction_class = 'up';
                        if (trade.direction == -1) {
                            trade_direction_class = 'down';
                        }
                        $row.find('.JS-instance_direction').addClass(trade_direction_class);
                }

                self.openPositionsPrev[tradeId] = trade;
            }

            $(self.options.recentContainerSelector + ' .JS-cnt_open_trades').text(cntPositions);
            $(self.options.recentContainerSelector + ' .JS-cnt_open_orders').text(cntOrders);

            /* show empty row if no any trades/orders */
            if (cntPositions > 0) {
                $openPositionsContainer.find('[data-trade_id="0"]').hide(0);
            } else {
                $openPositionsContainer.find('[data-trade_id="0"]').show(0);
            }
            if (cntOrders > 0) {
                $openOrdersContainer.find('[data-trade_id="0"]').hide(0);
            } else {
                $openOrdersContainer.find('[data-trade_id="0"]').show(0);
            }
            /*********end***********/
        } else {
            self.time_sleep++;
        }

        /****** render open trades counter ******/
        var $counter = $('#link-active-position .counter');
        var countPosition = Object.keys(self.openPositions).length;

        if (countPosition > 0) {
            if ( ! $counter.is(':visible')) {
                $counter.show();
            }
            $counter.text(countPosition);
        } else {
            $counter.hide();
        }
        /****** end ******/
    };

    self.initEvents = function() {

        var $openPositionsContainer = $(self.options.recentContainerSelector);

        $openPositionsContainer.on('keyup', 'input[name="stop_lose_amount"], input[name="take_profit_amount"]', function () {
            $(this).val(App.formater.numberFormatAmountSign(
                $(this).val(),
                App.formater.simplyPrecision,
                ','
            ));
        });

        var checkShowHideMoneyInvestPartialButtons = function ($amountInput, minVal, maxVal) {

            let currentAmount = App.formater.clearNumber($amountInput.val());

            let plusButton = $amountInput.closest('.JS-money_invest_block').find('.JS-plus');
            if (currentAmount < maxVal) {

                plusButton.removeClass('disable-btn');

            } else {

                plusButton.addClass('disable-btn');
            }

            let minusButton = $amountInput.closest('.JS-money_invest_block').find('.JS-minus');
            if (currentAmount > minVal) {

                minusButton.removeClass('disable-btn');
            } else {

                minusButton.addClass('disable-btn');
            }
        };

        $openPositionsContainer.on('keyup', '.JS-money_invest_partial', function() {

            var $amountInput = $(this);

            setTimeout(function(){

                var maxVal = App.formater.clearNumber($amountInput.data('max-amount'));

                var openTradeBlock = $amountInput.closest('.active-position-link');
                var step = App.formater.clearNumber(App.asset.getAssetDetails(openTradeBlock.data('asset_id'), 'step_amount'));

                var minVal = App.formater.clearNumber(App.asset.getAssetDetails(openTradeBlock.data('asset_id'), 'min_amount'));
                var amount = App.formater.clearNumber($amountInput.val());

                if (amount <= minVal) {

                    if (+step !== 0) {

                        amount = minVal;
                    }
                } else if (amount >= maxVal) {

                    amount = maxVal;
                } else {

                    if ((maxVal - amount) < minVal) {

                        amount = maxVal - minVal;
                    }
                }

                $amountInput.val(App.formater.numberFormatAssetAmountPlatform(amount));

                checkShowHideMoneyInvestPartialButtons($amountInput, minVal, maxVal);

            }, 700);
        });

        $openPositionsContainer.on('click', '[data-action]', function(e) {

            var $this = $(this);

            switch ($this.data('action')) {
                case self.options.actionRowOpenClose : {

                    //if click on input money_invest_partial just break;
                    if (e.target.classList.contains('JS-money_invest_partial')) {

                        break;
                    }

                    // partial close, change amount plus minus
                    if (e.target.classList.contains('JS-change_amount_partial_close')) {

                        var step = App.formater.clearNumber(App.asset.getAssetDetails($this.data('asset_id'), 'step_amount'));

                        var direction = -1;
                        if (e.target.classList.contains('JS-plus')) {

                            direction = 1;
                        }

                        var minVal = App.formater.clearNumber(App.asset.getAssetDetails($this.data('asset_id'), 'min_amount'));

                        var $amountInput = $this.find('[name="money_invest_partial"]');

                        var maxVal      = App.formater.clearNumber($amountInput.data('max-amount'));

                        var amount      = App.formater.clearNumber($amountInput.val()) + step * direction;

                        if (amount < 0) {

                            amount = 0;
                        }

                        if (amount < minVal) {

                            if (+step !== 0) {

                                amount = minVal;
                            }
                        } else if(amount > maxVal) {

                            amount = maxVal;
                        } else {

                            if ((maxVal - amount) < minVal) {

                                amount = maxVal - minVal;
                                if (direction === 1) {

                                    amount = maxVal;
                                }
                            }
                        }

                        $amountInput.val(App.formater.numberFormatAssetAmountPlatform(amount));

                        checkShowHideMoneyInvestPartialButtons($amountInput, minVal, maxVal);

                        break;
                    }

                    if (e.target.classList.contains('JS-asset-detail')) {
                        var $row = $this.closest('[data-trade_id]'),
                            tradeId = $row.data('trade_id');
                        if ($row.hasClass('closed')
                            && self.openPositions[tradeId]['start_close'] > 0
                        ) {
                            break;
                        }

                        if ($this.hasClass('active')) {

                            if ($this.find('.JS-money_invest_block').length) {

                                $this.find('.JS-money_invest_block').hide();
                                $this.find('.JS-money_invest').show();
                            }
                        } else {

                            if ($this.find('.JS-money_invest_block').length) {

                                $this.find('.JS-money_invest').hide();

                                let amount = $this.find('.JS-money_invest_partial').data('max-amount');
                                $this.find('.JS-money_invest_partial').val(App.formater.numberFormatAssetAmountPlatform(amount));

                                $this.find('.JS-minus').removeClass('disable-btn');
                                $this.find('.JS-plus').addClass('disable-btn');

                                $this.find('.JS-money_invest_block').show();
                            }
                        }

                        $this.toggleClass('active')
                            .next('.active-position-submenu')
                            .find('.in')
                            .slideToggle();
                    } else {
                        var assetId = $(this).attr('data-asset_id');
                        console.log('get current id: '+assetId);
                        App.asset.unsetCurrentAssetFeed('trade_new');
                        App.asset.setCurrentAssetFeed(parseInt(assetId),'trade_new');
                        App.asset.switchAsset({asset_id: assetId, get_disable_assets: true}, {}, function() {
                        });
                    }

                    if (e.target.classList.contains('JS-close-button')) {
                        let popup = $(this).parent().find('.JS-popup-close-position'),
                            confirm = $(popup).find('.JS-confirm-close'),
                            cancel = $(popup).find('.JS-cancel-close');

                        $(popup).addClass('active');
                        $(cancel, confirm).on('click', function () {
                            $(popup).removeClass('active');
                        });
                    }

                    break;
                }
                case self.options.actionSlTpShowHide : {
                    if ( ! $this.is(':checked') && $this.hasClass('position-checkbox'))  {
                        var $row = $this.closest('[data-trade_id]');
                        var tradeId = $row.data('trade_id');
                        var $input = $this.closest('.line')
                            .find('input[type=text]');
                        var check_for_send = $this.closest('.line')
                            .find('.JS-tp_rate, .JS-sl_rate')
                            .text();
                        var sendData = {
                            instance_id : tradeId
                        };

                        if (+check_for_send != 0) {
                            sendData[$input.attr('name')] = 0;
                            App.htmlTemplate.addLoader($row);
                            $.post('/ajax/trade/update_sl_tp', sendData, function(response) {
                                if (response.success) {
                                    App.notification.success(response.data.message, 2);
                                } else {
                                    App.notification.error(response.error);
                                }
                                App.htmlTemplate.removeLoader($row);
                            }, 'json');
                        }

                        $this
                            .removeClass('active')
                            .attr('checked', false)
                            .parents('.for-flex')
                            .siblings('.switcher-submenu')
                            .slideUp();

                    } else if (! $this.hasClass('active')) {
                        $this
                            .addClass('active')
                            .parents('.for-flex')
                            .siblings('.switcher-submenu')
                            .slideDown();
                        var $row = $this.closest('[data-trade_id]');
                        var tradeId = $row.data('trade_id');
                        var trade = self.openPositions[tradeId];
                        var $input = $this.closest('.line').find('input[type=text]');
                        var isTPparam = $input.attr('name') == 'take_profit';
                        let rate = 0;
                        if (typeof trade[$input.attr('name')] !== 'undefined' && +trade[$input.attr('name')] > 0) {
                            rate = +trade[$input.attr('name')];
                        } else {
                            let buyRate = trade.place_order > 0
                                            ? trade.strike_open
                                            : trade.buyR;
                            let sellRate = trade.place_order > 0
                                            ? trade.strike_open
                                            : trade.sellR;
                            //get default rate
                            let rate_profit = trade.direction == App.tradeParam.DIRECTION_BUY
                                    ? buyRate
                                    : sellRate,
                                rate_loss = trade.direction == App.tradeParam.DIRECTION_BUY
                                    ? sellRate
                                    : buyRate;

                            rate = self._getDefaultRateSlTp(isTPparam ? rate_profit : rate_loss, trade.direction, isTPparam)
                        }

                        rate = App.formater.numberFormatRate(rate.toFixed(trade.precision_m), trade.precision);
                        $input.val(rate);
                    } else {
                        $this
                            .removeClass('active')
                            .parents('.for-flex')
                            .siblings('.switcher-submenu')
                            .slideUp();
                    }
                    break;
                }
                case self.options.actionSlTpShowHideSimply : {
                    var $row = $this.closest('[data-trade_id]'),
                        tradeId = $row.data('trade_id'),
                        trade = self.openPositions[tradeId],
                        $input = $this.closest('.line').find('input[type=text]'),
                        sendData = {
                            instance_id : tradeId
                        },
                        amount;

                    if ( ! $this.is(':checked')  && $this.hasClass('position-checkbox')) {
                        var check_for_send = $this.closest('.line')
                            .find('.JS-tp_amount, .JS-sl_amount')
                            .text();

                        if (+check_for_send != 0) {
                            sendData[$input.attr('name')] = 0;
                            App.htmlTemplate.addLoader($row);
                            $.post('/ajax/trade/update_sl_tp', sendData, function(response) {
                                if (response.success) {
                                    App.notification.success(response.data.message, 2);
                                } else {
                                    App.notification.error(response.error);
                                }
                                App.htmlTemplate.removeLoader($row);
                            }, 'json');
                        }
                        $this.parents('.for-flex')
                            .removeClass('active')
                            .siblings('.switcher-submenu')
                            .slideUp();
                    } else if ( ! $this.hasClass('active')) {
                        $this
                            .addClass('active')
                            .parents('.for-flex')
                            .siblings('.switcher-submenu')
                            .slideDown();

                        if (typeof trade[$input.attr('name')] !== 'undefined' && +trade[$input.attr('name')] != 0) {
                            amount = +trade[$input.attr('name')];
                        } else {
                            amount = trade.imargin_trader * App.asset.getAssetMinSltpPercentage(trade.asset_id) / 100;
                            if ($input.attr('name') === 'stop_lose_amount') {
                                amount = amount * -1;
                            }
                        }

                        $input.val(App.formater.numberFormatAmountSign(amount, App.formater.simplyPrecision, ','));
                    } else {
                        $this
                            .removeClass('active')
                            .parents('.for-flex')
                            .siblings('.switcher-submenu')
                            .slideUp();
                    }

                    break;
                }
                case self.options.actionSlTpChangeRate : {
                    var $row = $this.closest('[data-trade_id]');
                    var tradeId = $row.data('trade_id');
                    if (typeof self.openPositions[tradeId] !== 'undefined') {
                        var trade = self.openPositions[tradeId];
                        var direction = $this.data('direction') > 0 ? 1 : -1;
                        var $input = $this.closest('.range-input').find('input[type=text]');
                        var val = App.formater.clearNumber($input.val());
                        val = val + (App.asset.getAssetDetails(trade.asset_id, 'step_rate')) * direction;
                        $input.val(App.formater.numberFormatRate(val, trade.precision));
                    }

                    break;
                }
                case self.options.actionSlTpChangeAmount : {
                    var $row = $this.closest('[data-trade_id]');
                    var tradeId = $row.data('trade_id');
                    if (typeof self.openPositions[tradeId] !== 'undefined') {
                        var trade = self.openPositions[tradeId];
                        var direction = $this.data('direction') > 0 ? 1 : -1;
                        var $input = $this.closest('.range-input').find('input[type=text]');
                        var val = App.formater.clearNumber($input.val());
                        val = val + App.sysParameter.SLTP_STEP_AMOUNT * direction;
                        $input.val(App.formater.numberFormatAmountSign(val, App.formater.simplyPrecision, ','));
                    }

                    break;
                }
                case self.options.actionSlTpSave : {
                    var $row = $this.closest('[data-trade_id]');
                    var tradeId = $row.data('trade_id');
                    var $input = $this.closest('.range-input')
                                      .find('input[type=text]'),
                        sl_tp_val = App.formater.clearNumber($input.val());
                    var sendData = {
                        instance_id : tradeId
                    };
                    sendData[$input.attr('name')] = sl_tp_val;
                    App.htmlTemplate.addLoader($row);
                    $.post('/ajax/trade/update_sl_tp', sendData, function(response) {
                        if (response.success) {
                            App.notification.success(response.data.message, 2);
                            $this
                                .removeClass('active')
                                .closest('.switcher-submenu')
                                .slideUp();
                            if (sl_tp_val == 0) {
                                $this.closest('.line')
                                    .find('input[data-action='+self.options.actionSlTpShowHide+']')
                                    .click();
                            }
                        } else {
                            App.notification.error(response.error);
                        }
                        App.htmlTemplate.removeLoader($row);
                    }, 'json');
                    break;
                }
                case self.options.actionStrikeShowHide : {
                    if ($this.is(':checked')) {
                        $this.parents('.for-flex')
                            .siblings('.switcher-submenu')
                            .slideDown();
                        var $row = $this.closest('[data-trade_id]');
                        var tradeId = $row.data('trade_id');
                        var trade = self.openPositions[tradeId];
                        var $input = $this.closest('.line').find('input[type=text]');


                        rate = App.formater.numberFormatRate(trade.strike_open.toFixed(trade.precision_m), trade.precision);
                        $input.val(rate);
                    } else {
                        $this.parents('.for-flex')
                            .siblings('.switcher-submenu')
                            .slideUp();
                    }

                    break;
                }
                case self.options.actionStrikeChangeRate : {
                    var $row = $this.closest('[data-trade_id]');
                    var tradeId = $row.data('trade_id');
                    if (typeof self.openPositions[tradeId] !== 'undefined') {
                        var trade = self.openPositions[tradeId];
                        var direction = $this.data('direction') > 0 ? 1 : -1;
                        var $input = $this.closest('.range-input').find('input[type=text]');
                        var val = App.formater.clearNumber($input.val());
                        val = val + App.asset.getAssetDetails(trade.asset_id, 'step_rate') * direction;
                        $input.val(App.formater.numberFormatRate(val, trade.precision));
                    }

                    break;
                }
                case self.options.actionStrikeSave : {
                    var $row = $this.closest('[data-trade_id]');
                    App.htmlTemplate.addLoader($row);
                    var tradeId = $row.data('trade_id');
                    var $input = $this.closest('.range-input')
                        .find('input[type=text]');
                    var sendData = {
                        instance_id : tradeId
                    };
                    sendData[$input.attr('name')] = App.formater.clearNumber($input.val());

                    $.post('/ajax/trade/update_order', sendData, function(response) {
                        if (response.success) {
                            App.notification.success(response.data.message, 2);
                            $this.closest('.line')
                                .find('[data-action='+self.options.actionStrikeShowHide+']')
                                .click();
                        } else {
                            App.notification.error(response.error);
                        }
                        App.htmlTemplate.removeLoader($row);
                    }, 'json');
                    break;
                }
                case self.options.actionTradeClose : {
                    var $row = $this.closest('[data-trade_id]');
                    var tradeId = $row.data('trade_id');
                    var trade = (typeof self.openPositions[tradeId] !== 'undefined')
                        ? self.openPositions[tradeId]
                        : null;

                    var sendData = {
                        instance_id : tradeId,
                        strike      :  trade.strike_market,
                        user_timestamp : App.socketCfd.timestamp
                    };

                    var $moneyInvestPartial = $row.find('.JS-money_invest_partial');
                    if ($moneyInvestPartial.length && App.formater.clearNumber($moneyInvestPartial.val()) < trade.amount) {

                        sendData.money_invest_partial = App.formater.clearNumber($moneyInvestPartial.val());
                    }

                    $.post('/ajax/trade/close', sendData, function(response) {
                        if (response.success) {
                            App.notification.success(response.data.message);
                            if ( ! $this.is($('.JS-confirm-close'))) {
                                $this.closest('[data-trade_id]')
                                    .find('.JS-asset-detail')
                                    .click();
                            }
                        } else {
                            App.notification.error(response.error);
                        }
                    }, 'json');
                    break;
                }
            }
        });
    };


    self._upDownClass = function($element, value) {
        var cssClassDown = 'down';
        var cssClassUp = 'up';
        if (value > 0) {
            $element.addClass(cssClassUp).removeClass(cssClassDown);
        } else if (value < 0) {
            $element.addClass(cssClassDown).removeClass(cssClassUp);
        } else if (value === 0) {
            $element.removeClass(cssClassUp).removeClass(cssClassDown);
        }
    };
    self._readyToUpdate = function(tradeId, fieldName) {

        var trade = (typeof tradeId !== 'undefined' && typeof self.openPositions[tradeId] !== 'undefined')
                    ? self.openPositions[tradeId]
                    : false;
        var tradePrev = (typeof tradeId !== 'undefined' && typeof self.openPositionsPrev[tradeId] !== 'undefined')
                    ? self.openPositionsPrev[tradeId]
                    : false;

        if ( ! tradePrev
            || (trade.place_order != tradePrev.place_order)
            || (typeof fieldName !== 'undefined' && trade[fieldName] != tradePrev[fieldName])
        ) {
            return true;
        } else {
            return false;
        }
    };

    self._getDefaultRateSlTp = function(rate, direction, isTPparam) {

        var defaultValue = 0;

        if (isTPparam == 0 && direction == -1) {
            defaultValue = (+rate) + (+rate * App.sysParameter.DEFAULT_SL_TP_RATE_PERCENT);
        }

        if (isTPparam == 1 && direction == -1) {
            defaultValue = rate - rate * App.sysParameter.DEFAULT_SL_TP_RATE_PERCENT;
        }

        if (isTPparam == 0 && direction == 1) {
            defaultValue = rate - rate * App.sysParameter.DEFAULT_SL_TP_RATE_PERCENT;
        }

        if (isTPparam == 1 && direction == 1) {
            defaultValue = (+rate) + (+rate * App.sysParameter.DEFAULT_SL_TP_RATE_PERCENT);
        }

        return defaultValue;
    };

    self.hideOpenPosition = function () {
        var $openContainer = $(self.options.recentContainerSelector);
        var $allRow        = $openContainer.find('.active-position-link');
        $allRow.addClass('closed');
        self.openPositions = {};
        setTimeout(function () {
            self.renderPosition ()
        }, 1500);
    };

    self.init(options);

    return self;
};



var TabsBlock = function (options) {

    var self = this;
    var def_options = {
        containerSelector: '#block-new-position',
        actionOpen: '#link-add-position',
        toggleBlock: '#asset-block-info',
        closeButton: '.btn-close',
        tabsList: '.styled-select',
        tabsItem: '.tabs-list',
        pjaxTag: '#pjax-block-assets',
        searchField: '#searchField',
        symbols: '.js-add-slide',
        blockActivePosition:'#block-active-position',
        mainPage: false
    };

    self.tabGames = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 1,
    };
    self.click = false;
    self.changed = false;
    self.options = $.extend(def_options, options);

    self.initEvents = function() {
        $(document).on('click', self.options.actionOpen, function(e){
            e.preventDefault();
            if(!$(self.options.containerSelector).hasClass('active')){
                self.click = true;
                $(self.options.containerSelector).fadeIn().addClass('active');
                $(this).addClass('active');
                assetsScrollHeight();
                topPartWidth();
                if($(self.options.toggleBlock).length > 0){
                    $(self.options.toggleBlock).addClass('toggled');
                };
                $(self.options.containerSelector+' table tbody tr').each(function(index, asset){
                    if(typeof $(asset).data('id') != 'undefined'){
                        App.asset.setCurrentAssetFeed($(asset).data('id'), 'assets');
                    }
                });
                self.updateRates();
                App.socketCfd.subscribe('assets_feed', function(data) {
                    self.updateRates(Object.keys(data));
                }, App.asset.getCurrentAssetFeed(), 'assets');
            } else {
                App.socketCfd.unsubscribeAssets('assets_feed', 'assets');
            }
        });

        $(document).on('click', function(e){
            if(!self.click && $(e.target).closest(self.options.containerSelector).length == 0) {
                $(self.options.containerSelector).hide();
                $(self.options.containerSelector).removeClass('active');

                // if (
                //     $(self.options.toggleBlock).length > 0
                //     && !$(self.options.blockActivePosition).hasClass('active')
                //     && ! $('.JS-active-menu-block').hasClass('active')
                //     && ! $('.' + App.parameters.cssClassWidgetContainer).hasClass('active')
                // ) {
                //     console.log('toggled1');
                //     $(self.options.toggleBlock).removeClass('toggled');

                // };
                App.socketCfd.unsubscribeAssets('assets_feed', 'assets');
                $(self.options.actionOpen).removeClass('active');
                topPartWidth();
            }
            self.click = false;
        });

        $(self.options.pjaxTag).on('click',self.options.closeButton, function(e){
            // e.preventDefault();
            $(self.options.containerSelector).fadeOut(function(){$(this).removeClass('active');});
            // if($(self.options.toggleBlock).length > 0){
            //     console.log('toggled2');
            //     $(self.options.toggleBlock).removeClass('toggled');
            // };
            App.socketCfd.unsubscribeAssets('assets_feed', 'assets');
            $(self.options.actionOpen).removeClass('active');
            self.click = false;
        });

        $(self.options.pjaxTag).on('click', function(e){
            var $_that = $(e.target);

            if ($_that.hasClass(self.options.tabsList.replace('.', ''))) {
                // e.preventDefault();
                self.$tabsList = $(self.options.tabsList + ' ul');
                self.$tab = $_that.find('ul');
                self.$tabsList.fadeOut();
                $(self.options.tabsList).removeClass('active');
                if (self.$tab.is(':visible')) {
                    self.$tab.fadeOut();
                    self.$tab.parents(self.options.tabsList).removeClass('active');
                } else {
                    self.$tab.fadeIn();
                    self.$tab.parents(self.options.tabsList).addClass('active');
                }
            } else {
                $(self.options.tabsList+' ul:visible').fadeOut();
            }

        });

        $(document).on('click',self.options.tabsItem, function(e){
            e.preventDefault();
            var oldTab = $('.JS-current_tab').data('tab_id');
            self.pjaxLink = $(this).attr('href');
            App.htmlTemplate.addLoader($(self.options.containerSelector));
            var request = $.ajax({
                url: self.pjaxLink,
                method: "GET",
                dataType: "html",
                async: false
            });

            request.done(function( html ) {
                $(self.options.pjaxTag).html( html );
                $(self.options.containerSelector).addClass('active');
                $(self.options.containerSelector).css('display','block');

                var newTab = $(self.options.containerSelector).find('.JS-current_tab').data('tab_id');

                self.click = true;
                self.changed = self.changed || self.tabGames[oldTab] !== self.tabGames[newTab];

                //change symbol..
                App.socketCfd.unsubscribeAssets('assets_feed', 'assets');
                $(self.options.containerSelector+' table tbody tr').each(function(index, asset){
                    if(typeof $(asset).data('id') != 'undefined'){
                        App.asset.setCurrentAssetFeed($(asset).data('id'), 'assets');
                    }
                });
                App.socketCfd.subscribe('assets_feed', function(data) {
                    self.updateRates(Object.keys(data));
                }, App.asset.getCurrentAssetFeed(), 'assets');

                // content is changed, need to reinit events
                self.searchField();
                self.changeSymbol();
                $(window).trigger('resize');
                App.htmlTemplate.removeLoader($(self.options.containerSelector));
            });
            request.fail(function( jqXHR, textStatus ) {
                App.notification.error(textStatus);
                App.htmlTemplate.removeLoader($(self.options.containerSelector));
                //@todo display error request for platform.....
            });
        });
    };

    self.searchField = function(){
        $(self.options.containerSelector).on('keyup', self.options.searchField, function(e){
            // e.preventDefault();
            var name, currTicker, description;
            self.searchInput = $(self.options.searchField);
            self.filter = $(self.searchInput).val().toUpperCase();
            self.tr = $(self.options.symbols);
            for(var i = 0; i < self.tr.length; i++) {
                    name = $(self.tr[i]).attr('data-name').toUpperCase();
                    currTicker = $(self.tr[i]).attr('data-curr-ticker').toUpperCase();
                    description = $(self.tr[i]).attr('data-curr-description').toUpperCase();
                if(name.indexOf(self.filter) > -1 || currTicker.indexOf(self.filter) > -1 || description.indexOf(self.filter) > -1){
                    $(self.tr[i]).css('display','');
                } else {
                    $(self.tr[i]).css('display','none');

                    if ($(self.tr[i]).parents('tbody').hasClass('active')) {
                        toggleAssetDetails(self.tr[i]);
                    }
                }
            }
        });
    };

    self.searchSymbolId = function(symbolName){
        for(var key in App.asset.assetsDetails) {
            if(App.asset.assetsDetails[key]['chart_name'].toUpperCase() == symbolName.toUpperCase()) {
                return App.asset.assetsDetails[key]['id'];
            }
        }
    };

    self.clearSearch = function(){
        $(self.options.searchField).keyup();
    };

    self.changeSymbol = function(){
        $(self.options.containerSelector).on('click',self.options.symbols, function(e){
            if (e.target.classList.contains('JS-asset-detail')) {
                toggleAssetDetails(this);
            } else {
                var assetId = $(this).attr('data-id');
                console.log('get current id: '+assetId);
                //callback for stay asset in toggeled position
                App.asset.unsetCurrentAssetFeed('trade_new');
                App.asset.setCurrentAssetFeed(parseInt(assetId),'trade_new');
                App.asset.switchAsset({asset_id: assetId}, {}, function() {
                    //TS-10363
                    // if ($(self.options.actionOpen).hasClass('active')) {
                    //     $newAssetBlock.addClass('toggled');
                    // }
                });
                //TS-10363
                // $(self.options.closeButton).click();
            }
        });
    };

    self.getCurrentTabId = function() { //todo tmp solution, maybe
        return $('.JS-current_tab').data('tab_id');
    };

    self.getCurrentTabGameTypeId = function() {
        return $('.JS-current_tab').data('game_type_id');
    };

    let toggleAssetDetails = function (item) {
        $(item).next('.new-position-submenu').find('.in').slideToggle().parents('tbody').toggleClass('active');
    }

    self.initEvents();
    self.searchField();
    self.changeSymbol();

    self.updateRates = function(affectedAssetIds) {
        //update rates by affected assets only
        affectedAssetIds = affectedAssetIds || false;
        $(self.options.containerSelector).find('tr').each(function() {
            var $this = $(this);
            var assetId = $this.attr('data-id');
            if (affectedAssetIds === false || Object.values(affectedAssetIds).indexOf(assetId) !== -1) {
                var rates = App.asset.getAssetRates(assetId, true);
                var format = App.formater.numberFormatRate;
                $this.find('.JS-sell_rate').text(format(rates.sell_value, rates.precision, ','));
                $this.find('.JS-buy_rate').text(format(rates.buy_value, rates.precision, ','));
                $this.find('.JS-sell_arrow').html(App.htmlTemplate.getUpDownRateArrow(rates.raise));
            }
        });
    }
};

var MainChart = function(options) {

    var self = this;
    var def_options = {
        containerSelector: 'main_chart',
        apiUrl:'//localhost:7777',
        apiStorageUrl:'//localhost:7777',
        socketUrl:'ws://localhost:8888/ws',
        data: {
            hash:''
        },
        currentSymbol:'BTCUSD',
        init : false,
        defaultInterval:'1',
        enableFeatures: {},
        disableFeatures: {},
        client_id: 'platform.local',
        trader_id: 0,
        custom_css: '',
        colorsSettings: {},
        libraryPath: "charting_library/",
        currentAssetItems : [],
        sellColor:'#FF0000',
        buyColor:'#008000',
        enableRenderPosition: 0,
        clickContainerSelector: '.main-section',
        actionTradesRenderUpdate: 'display_open_trades_click',
        displayOpenTrades : 0,
        language : "en",
        positionSellText: 'Sell',
        positionBuyText: 'Buy',
        positionPNL:'P&L',
        currencySign:'$'
    };

    self.options = $.extend(def_options, options);
    self.getMappedInterval = function(interval) {
        var mappingIntervalWidget = {
            "1M": "1",
            "5M": "5",
            "15M": "15",
            "30M": "30",
            "1H": "60",
            "4H": "240",
            "1D": "D"
        };

        return mappingIntervalWidget[interval];
    };

    self.tradingViewInitOptions = {
        fullscreen:                 false,
        symbol:                     self.options.currentSymbol,
        interval:                   self.options.defaultInterval,
        container_id:               self.options.containerSelector,
        //	BEWARE: no trailing slash is expected in feed URL
        datafeed:                   new Datafeeds.UDFCompatibleDatafeed(self.options.apiUrl, self.options.data.hash, self.options.data.tradingViewClient),
        library_path:               self.options.libraryPath,
        locale:                     self.options.language,
        //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
        drawings_access:            { type: 'black', tools: [ { name: "Regression Trend" } ] },
        overrides:                  JSON.parse(self.options.colorsSettings),
        disabled_features:          self.options.disableFeatures,
        enabled_features:           self.options.enableFeatures,
        charts_storage_url:         self.options.apiStorageUrl,
        charts_storage_api_version: "chart",
        client_id:                  self.options.client_id,
        user_id:                    self.options.trader_id,
        custom_css_url:             self.options.custom_css,
        debug:                      true,
        theme:                      "light"
    };

    self.setCurrentSymbol = function(symbolName) {
        self.options.currentSymbol = symbolName;
        if(typeof self.widget != 'undefined')
        {
            self.widget.setSymbol(self.options.currentSymbol, 1);
        }
    };
    self.getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    self.initChart = function(options) {

        if (self.options.plugins.TradingCentral.token) {

            self.widget = window.tvWidget = TradingCentral.plugins.initialize(self.tradingViewInitOptions,
                {
                    tokenProvider: () => {
                        return self.options.plugins.TradingCentral.token;
                    },
                    options: {
                        AnalystViews: {}
                    },
                });
        } else {

            self.widget = window.tvWidget = new TradingView.widget(self.tradingViewInitOptions)
        }

        self.widget.onChartReady(function(){
            self.widget.chart().onSymbolChanged().subscribe(this, function(obj){
                if (obj.id != App.asset.currentAssetId) {
                    App.asset.switchAsset({asset_id: obj.id});
                }
            });
        });
    };

    self.displayRenderChecker = function () {
        $(document).on('click', self.options.clickContainerSelector + ' [data-action]', function(e) {
            var $this = $(this);
            switch ($this.data('action')) {
                case self.options.actionTradesRenderUpdate : {
                    if ( ! App.trader.isGuest) {
                        var displayTrades = $this.is(':checked');
                        $.post('/ajax/tradingview/display_trades', {displaytrades_trading: +displayTrades}, function (response) {
                        }, 'json');
                        if(displayTrades == false) {
                            for(let id in self.options.currentAssetItems){
                                self.options.currentAssetItems[id].position.remove();
                            }
                            self.options.currentAssetItems = {};
                        }
                        self.options.displayOpenTrades = displayTrades;
                        self.options.enableRenderPosition = displayTrades;
                    } else {
                        e.preventDefault();
                        App.trader.loginForm.show();
                    }
                    break;
                }
            }
        });
    };

    if (self.options.init) {
        self.initChart(self.options);
        if(parseInt(self.options.enableRenderPosition)) {
            self.displayRenderChecker();
        }
    }

    self.setSymbol = function(symbolName){
        self.widget.chart().setSymbol(symbolName.toUpperCase());
            // It's now safe to call any other methods of the widget
    };

    self.setResolution = function(resolution){
        self.widget.chart().setResolution(resolution);
    };

    self.renderPositionsLines = function (trades) {
        if(self.options.enableRenderPosition && self.options.displayOpenTrades && self.widget){
            self.widget.onChartReady(function(){
                let itemsForRender = {};
                let currentAssetName = self.widget.chart().symbol();
                let currentAssetNameProvider = App.asset.getAssetDetails(App.asset.currentAssetId).name;

                if(currentAssetName != currentAssetNameProvider) {
                    currentAssetName = currentAssetNameProvider;
                }

                for(let id in trades) {
                    if (trades[id]['asset_name'] == currentAssetName && trades[id]['place_order'] == 0) {
                        if (itemsForRender.hasOwnProperty(currentAssetName)) {
                            if ( ! itemsForRender[currentAssetName].hasOwnProperty(id)) {
                                itemsForRender[currentAssetName][id] = {
                                    amount: trades[id]['amount'],
                                    strike: trades[id]['strike_open'],
                                    direction: trades[id]['direction'],
                                    pnl: trades[id]['pnl_trader'],
                                }
                            }
                        } else {
                            itemsForRender[currentAssetName] = {};
                            itemsForRender[currentAssetName][id] = {
                                amount: trades[id]['amount'],
                                strike: trades[id]['strike_open'],
                                direction: trades[id]['direction'],
                                pnl: trades[id]['pnl_trader'],
                            };
                        }
                    }
                }

                if(itemsForRender.hasOwnProperty(currentAssetName)){
                    for(let id in itemsForRender[currentAssetName]){
                        if( ! self.options.currentAssetItems.hasOwnProperty(id)){
                            let color = self.options.buyColor;
                            let positionText = self.options.positionBuyText;
                            if(itemsForRender[currentAssetName][id]['direction'] == -1) {
                                color = self.options.sellColor;
                                positionText = self.options.positionSellText;
                            }

                            self.options.currentAssetItems[id] = {
                                render:true,
                                position: self.widget.chart().createPositionLine()
                                    .setText(positionText+" #"+id+" "+self.options.positionPNL+": "+self.options.currencySign+itemsForRender[currentAssetName][id]['pnl'])
                                    .setQuantity(App.formater.numberFormatAmount(itemsForRender[currentAssetName][id]['amount']))
                                    .setQuantityFont('bold 11pt Verdana')
                                    .setBodyFont('bold 11pt Verdana')
                                    .setPrice(itemsForRender[currentAssetName][id]['strike'])
                                    .setExtendLeft(1)
                                    .setLineStyle(2)
                                    .setLineLength(20)
                                    .setLineColor(color)
                                    .setBodyBorderColor(color)
                                    .setBodyTextColor(color)
                                    .setQuantityBorderColor(color)
                                    .setQuantityBackgroundColor(color),
                            };
                        } else if(self.options.currentAssetItems.hasOwnProperty(id)) {
                            let positionText = self.options.positionBuyText;
                            if(itemsForRender[currentAssetName][id]['direction'] == -1) {
                                positionText = self.options.positionSellText;
                            }
                            self.options.currentAssetItems[id].position.setText(positionText+" #"+id+" "+self.options.positionPNL+": "+self.options.currencySign+itemsForRender[currentAssetName][id]['pnl']);
                        }
                    }
                    var deletePositions = self.diffArrays(Object.keys(itemsForRender[currentAssetName]),Object.keys(self.options.currentAssetItems));
                    if(deletePositions.length > 0) {
                        for(let id in deletePositions){
                            if(self.options.currentAssetItems.hasOwnProperty(deletePositions[id])){
                                self.options.currentAssetItems[deletePositions[id]].position.remove();
                                delete self.options.currentAssetItems[deletePositions[id]];
                            }
                        }
                    }
                } else {
                    if(Object.keys(self.options.currentAssetItems).length != 0){
                        for(let id in self.options.currentAssetItems){
                            self.options.currentAssetItems[id].position.remove();
                            delete self.options.currentAssetItems[id];
                        }
                    }
                }
            });
        }
    };

    self.diffArrays = function (arrayOne, arrayTwo) {
        var a = [], diff = [];
        for (var i = 0; i < arrayOne.length; i++) {
            a[arrayOne[i]] = true;
        }
        for (var i = 0; i < arrayTwo.length; i++) {
            if (a[arrayTwo[i]]) {
                delete a[arrayTwo[i]];
            } else {
                a[arrayTwo[i]] = true;
            }
        }
        for (var k in a) {
            diff.push(k);
        }
        return diff;
    };
};

var ActivePositionBlock = function(options) {

    var self = this;
    var def_options = {
        containerSelector: '#block-active-position',
        actionOpen:'#link-active-position',
        toggleBlock:'#asset-block-info',
        closeButton:'.btn-close',
        blockNewPosition:'#block-new-position'
    };

    self.click = false;
    self.options = $.extend(def_options, options);

    self.initEvents = function() {
        $(document).on('click', self.options.actionOpen, function(e){
            if (!App.trader.isGuest) {
                e.preventDefault();
                if(!$(self.options.containerSelector).hasClass('active')){
                    self.click = true;
                    App.tradeRecent.isRenderPositions = true;
                    $(self.options.containerSelector).fadeIn().addClass('active');
                    $(this).addClass('active');
                    topPartWidth();
                    assetsScrollHeight();
                    if($(self.options.toggleBlock).length > 0){
                        $(self.options.toggleBlock).addClass('toggled');
                    };
                } else {
                    App.tradeRecent.isRenderPositions = false;
                }
            } else {
                App.trader.loginForm.show();
            }
        });

        $(document).on('click', function(e){
            if(!self.click && $(e.target).closest(self.options.containerSelector).length == 0) {
                $(self.options.containerSelector).removeClass('active');
                $(self.options.containerSelector).hide();
                // if(
                //     $(self.options.toggleBlock).length > 0
                //     && !$(self.options.blockNewPosition).hasClass('active')
                //     && ! $('.JS-active-menu-block').hasClass('active')
                //     && ! $('.' + App.parameters.cssClassWidgetContainer).hasClass('active')
                // ) {
                //     console.log('toggled4');
                //     $(self.options.toggleBlock).removeClass('toggled');
                // };
                $(self.options.actionOpen).removeClass('active');
                topPartWidth();
            }
            self.click = false;
        });

        $(self.options.containerSelector).on('click',self.options.closeButton, function(e){
            // e.preventDefault();
            $(self.options.containerSelector).fadeOut(function(){$(this).removeClass('active');});
            // if($(self.options.toggleBlock).length > 0){
            //     console.log('toggled5');
            //     $(self.options.toggleBlock).removeClass('toggled');
            // };
            $(self.options.actionOpen).removeClass('active');
            self.click = false;
        });
    };

    self.initEvents();
};

var Bonus = function(options){
    var self = this;
    var defOptions = {
        bonusTag : '#bonus-chart',
        text     : true,
        active   : false,
    };
    self.charts = {};

    self.options = $.extend(defOptions, options);

    self.init = function(){
        if(self.options.active){
            self.charts = new ChartPlatform.ChartPie("#bonus-chart", { textOption:true });
            App.socketCfd.subscribe('bonus_info_feed',function(data){
                self.charts.redraw(data.percent);
            },{},'bonus', true);
        }
    };

    self.init();
};

/*
* Example for creating widget
* new AbstractWidget(
* // This first block is require and contain names (classes or id) of elements
       {
           containerSelector: '.heat-maps-block',// div with widget
           idIcon: 'link-heat-maps',// id of icon for widget
           markerWidget: 'hm',// marker for widget
       },
       * //Second block contain additional function and rewrite methods
       {
           showWidget: showWidget
           // With key 'specialBehaviorWidget' you could set name of method (which isset in object TradingProAbstractWidget)
           // and this method will be launch when widget start initialization
           specialBehaviorWidget: 'initExternalWidget'
       }
   )
* */
let TradingProAbstractWidget = function (options, newDefinition) {

    let self = this;

    let def_options = {
        containerSelector: '.heat-maps-block',
        idIcon: 'link-heat-maps',
        iconSelector: '#' + options.idIcon,
        markerWidget: '',

        themeValue: 'default',
        availableWidget: 0,
        toggleBlockSelector: '#asset-block-info',
        blockNewPositionSelector: '#block-new-position',
        blockActivePositionSelector: '#block-active-position',
        activeClass: 'active',
        layoutBlock: "<div id='t4p-widget-container' data-widget='" + options.markerWidget + "' data-options='" + options.availableLanguage + "'></div>",
        availableLanguage: {},
        currentLanguage: ''
    };

    self.options = $.extend(def_options, options);

    $(self.options.iconSelector).on('click', function (e) {
        e.preventDefault();
        self.onClickIcon(this)
    });

    self.onClickIcon = function(idIconWidget) {

        let iconWidgetObject = $(idIconWidget);

        if ( ! self.isAvailable()) {

            return false;
        }

        if ( ! self.isMainPage()) {
            self.redirectMainPage({[App.parameters.keyStorageActiveWidget]: idIconWidget.id});

            return;
        }

        if ( ! self.isInit(self.options.markerWidget)) {

            self.init();

            //tracking all click which clicked out widget's area for closing widget
            $(document).on('click', function(e){
                self.handleCloseWidget(e);
            });
        }

        self.display(iconWidgetObject);
    };

    self.isAvailable = function() {

        if (App.trader.isGuest) {

            App.trader.loginForm.show();

            return false;
        }

        if (self.options.availableWidget !== 1) {

            App.notification.error(self.options.reason, 3);

            return false;
        }

        return true;
    };

    self.isMainPage = function() {

        if (App.tabsBlock.options.mainPage && ! App.tabsBlock.changed) {
            return true;
        }

        return false;
    };

    //If client was on not main page and click to icon of widget , he was redirected to main page and we have to show that widget which icon was clicked
    self.isActiveWidgetOnPage = function(idIcon) {
        let url_parameters = App.pushState.parseCurrentQueryString();
        let idIconWidget = url_parameters[App.parameters.keyStorageActiveWidget];

        if (idIconWidget === idIcon) {
            return true;
        }

        return false;
    };

    self.redirectMainPage = function(data) {
        document.location.href = '/?' + $.param(data);
    };


    self.isInit = function(markerId) {

        if ($("div[data-widget='" + markerId + "']").length > 0) {

            return true;
        }

        return false;
    };

    self.init = function() {

        self.prepareLayout(self);
        self.initTrading4ProWidget();
    };

    self.prepareLayout = function(self) {

        $(self.options.containerSelector).empty();
        $(self.options.containerSelector).addClass(App.parameters.cssClassWidgetContainer);
        $(self.options.containerSelector).append(self.options.layoutBlock);
    };

    self.initTrading4ProWidget = function () {

        let container = document.getElementById('t4p-widget-container');

        if (container === null) {
            return false;
        }

        //TODO: remove this after adding `setLanguage()` func for all widgets
        let widgetId = $(container).get(0).dataset.widget;

        container.addEventListener('widget', function(event) {
            let widget = event.detail;

            //Remove this timeout when will be fixed this issue in extrnel widget
            setTimeout(
                function() {
                    if (self.options.currentLanguage) {
                        let selectLanguage =  $('.t4p-terms ul li:contains('+self.options.currentLanguage.toUpperCase()+')')
                        if (selectLanguage.length > 0) {
                            selectLanguage.click()
                        } else {
                            //Set by default
                            $('.t4p-terms li:contains("EN")').click()
                        }
                    }
                    widget.setTheme(self.options.themeValue);
                },
                100
            );

            //Launch special behavior or handler which set in init widget.
            if (typeof (self.specialBehaviorWidget) !== "undefined" &&
                self.specialBehaviorWidget in self) {

                self[self.specialBehaviorWidget](widget, self);
            }

            //TODO: remove this after adding `setLanguage()` func for all widgets
            if (widgetId !== 'hm') {
                //Remove this timeout when will be fixed this issue in extrnel widget
                setTimeout(widget.setLanguage(getLanguage()), 100);
            }

            widget.addEventHandler('symbol', self.setSymbol);

            widget.addEventHandler('timeframe', function (timeframe) {

                App.mainChart.setResolution(App.mainChart.getMappedInterval(timeframe));
            });
        });

        let el = document.createElement('script');
        el.type = 'text/javascript';
        el.src = 'https://ts.t4papi.com/chart/js/loader.min.js?t=' + Date.now();

        document.head.appendChild(el);
    };

    //Special behavior for initing of widget for some case. This method you could set for using in config when init widget
    self.initExternalWidget = function(widget, tradingAbstractWidget) {
        let tvChart2 = App.mainChart.widget.chart();

        //This object included from external library (ts.t4papi.com/chart/js/tr-tv-apply.min.js)
        T4PTradingViewConnect(
            widget,
            tvChart2,
            tradingAbstractWidget.setSymbol,
            tradingAbstractWidget.setTimeFrame
        );
    };

    self.handleCloseWidget = function(e) {
        /** disactived widget if click out of widget */
        if ( ! self.click
            && $(e.target).closest(self.options.containerSelector).length === 0
            && $(e.target).closest('div.t4p-terms').length === 0) {

            if ( ! self.issetActiveWidget()) {
                $(self.options.toggleBlockSelector).removeClass('toggled');
            }

            self.setNonActiveState();
        }

        self.click = false;
    };

    self.setNonActiveState = function() {

        $(self.options.iconSelector).removeClass(self.options.activeClass);
        $(self.options.containerSelector).removeClass(self.options.activeClass).fadeOut();
    };

    self.isActiveWidget = function() {

        return  $(self.options.containerSelector).hasClass(self.options.activeClass);
    };

    self.issetActiveWidget = function() {

        if (
            $(self.options.toggleBlockSelector).length > 0
            && ! $(self.options.blockNewPositionSelector).hasClass(self.options.activeClass)
            && ! $(self.options.blockActivePositionSelector).hasClass(self.options.activeClass)
            && $(self.options.containerSelector).hasClass(self.options.activeClass)
        ) {

            return false;
        }

        return true;
    };

    self.display = function(iconWidgetObject) {

        if ( ! self.isActiveWidget()) {

            self.displayOn(iconWidgetObject, self);
        } else {

            self.displayOff(iconWidgetObject, self);
        }
    };

    self.displayOn = function(iconWidgetObject) {

        iconWidgetObject.addClass(self.options.activeClass);
        $('.' + App.parameters.cssClassWidgetContainer).removeClass(self.options.activeClass);
        $(self.options.containerSelector)
            .addClass(self.options.activeClass)
            .fadeIn();

        if ($(self.options.toggleBlockSelector).length > 0){
            $(self.options.toggleBlockSelector).addClass('toggled');
        }
        self.click = true;
    };

    self.displayOff = function(iconWidgetObject) {

        iconWidgetObject.removeClass(self.options.activeClass);
        $(self.options.containerSelector)
            .removeClass(self.options.activeClass)
            .fadeOut();
        self.click = false;
    };

    self.setSymbol = function (symbol) {

        App.asset.unsetCurrentAssetFeed('trade_new');
        App.asset.switchAsset({symbol: symbol}, {}, function () {

            let assetId = App.asset.getCurrentAssetDetails('id');
            App.asset.setCurrentAssetFeed(parseInt(assetId), 'trade_new');
            App.socketCfd.subscribe('assets_feed',function (data) {}, App.asset.getCurrentAssetFeed(), 'assets');
        });
    };

    self.setTimeFrame = function (timeframe, minutes) {

        let tvChart2 = App.mainChart.widget.chart();
        tvChart2.setResolution(App.mainChart.getMappedInterval(timeframe));
    };

    //redefinition main methods
    if (typeof newDefinition !== 'undefined' && Object.keys(newDefinition).length > 0) {

        self = $.extend(self, newDefinition);
    }

    // Check have set active widget. Probably client was on not main page and click to widget's icon and he redirected to main page. If this true - we hate to show widget
    if (self.isActiveWidgetOnPage(self.options.idIcon)) {
        self.onClickIcon(self.options.iconSelector)
    }
};

/**
 * @param {Object} heatMapsOptions - Contains setting for widget
 * */
let HeatMaps = function (heatMapsOptions) {

    if (heatMapsOptions.enableHeatMapVolatility) {

        return new TradingProAbstractWidget(heatMapsOptions);
    }

    //Method for handler click for our own widget
    let clickInOurWidget = function (options) {
        $(options.containerSelector).on('click', function (e) {
            const target = e.target;

            if ($(target).closest('.grid-item').hasClass(options.activeClass)) {

                $('.grid-item').removeClass(options.activeClass);
                $(options.containerSelector).removeClass(options.activeClass);
                topPartWidth();
            } else {

                $('.grid-item').removeClass(options.activeClass);
                $(options.containerSelector).addClass(options.activeClass);
                $(target).addClass(options.activeClass);
                topPartWidth();
            }
        });
    };

    /** select assets for chart for our own widget */
    let changeSymbolHeatMaps = function (options) {
        $(options.containerSelector).on('click', '.grid-item', function (e) {
            if (e.target.classList.contains('grid-item')) {

                let assetId = $(this).attr('data-id');
                //callback for stay asset in toggeled position
                App.asset.unsetCurrentAssetFeed('trade_new');

                App.asset.switchAsset({asset_id: assetId}, {}, function () {

                    App.asset.setCurrentAssetFeed(parseInt(assetId),'trade_new');
                    App.socketCfd.subscribe('assets_feed', function(data) {}, App.asset.getCurrentAssetFeed(), 'assets');
                });
            }
        });
    };

    let displayOn = function (tradingProAbstractWidget, self) {
        self.click = true;
        if (self.widgetActive !== true) {

            clickInOurWidget(self.options);
            changeSymbolHeatMaps(self.options);
            self.widgetActive = true;
        }
        $('.' + App.parameters.cssClassWidgetContainer).removeClass(self.options.activeClass);
        tradingProAbstractWidget.addClass(self.options.activeClass);
        $(self.options.containerSelector)
            .addClass(self.options.activeClass)
            .fadeIn()
            .addClass(App.parameters.cssClassWidgetContainer);
        if ($(self.options.toggleBlockSelector).length > 0){
            $(self.options.toggleBlockSelector).addClass('toggled');
        }

        topPartWidth();

        App.socketCfd.subscribe('assets_heat_map', function (dataHeatMaps) {
            const $grid = $(self.options.containerSelector).find('#heat-maps-grid');

            if ( ! dataHeatMaps.length) {
                $grid.addClass('heat-maps-grid-hidden');

                $grid.next().addClass('heat-maps-empty-shown');

                return;
            }

            $grid.removeClass('heat-maps-grid-hidden').addClass('rotate')

            $grid.next().removeClass('heat-maps-empty-shown');

            setTimeout(() => $grid.removeClass('rotate'), 2400);

            $grid.find('.grid-item').each((index, el) => {
                const $el = $(el);

                if ( ! dataHeatMaps[index]) {

                    $el.addClass('grid-item-hidden');

                    return;
                }

                const asset = dataHeatMaps[index];

                $el.css('transition-delay', `${index}00ms`)
                    .attr({'data-id': asset.asset_id, 'title': asset.asset_name})
                    .removeClass('red green grid-item-hidden')
                    .addClass(asset.percent < 0 ? 'red' : 'green');

                $el.children().eq(0).text(asset.asset_name);
                $el.children().eq(1).text(`${asset.percent}%`);
            });

        }, [], 'heat_map_assets', true);
    };

    let displayOff = function (iconWidgetObject, self) {
        iconWidgetObject.removeClass(self.options.activeClass);
        $(self.options.containerSelector)
            .removeClass(self.options.activeClass)
            .fadeOut();
        // console.log('toggled7');
        // $(self.options.toggleBlockSelector).removeClass('toggled');
        App.socketCfd.closeSubscribe('assets_heat_map');
        topPartWidth();
    };

    let prepareLayout = function (self) {
        $(self.options.containerSelector)
            .addClass(App.parameters.cssClassWidgetContainer)
            .attr('data-widget', self.options.markerWidget);
    };

    return new TradingProAbstractWidget(
        heatMapsOptions,
        {
            prepareLayout: prepareLayout,
            displayOff: displayOff,
            displayOn: displayOn
        }
    )
};

let MarketTrends = function (options) {
    let self = this;

    let def_options = {
        containerSelector: '.market-trends-block',
        reason: '',
        searchField: '#searchMarketsTrends',
        actionOpen: '#link-market-trends',
        toggleBlock: '#asset-block-info',
        detailsAction: '.JS-markettrend-details',
        detailsBlock: '.market-trends-item',
        detailsTabs: '.JS-markettrend-tabs',
        detailsTabsAction: '.JS-markettrend-tabs-action',
        detailsTabsContent: '.market-trends-tabs-content',
        chartContainer: '.JS-chart-trends',
        symbolsList: '.market-trends-item',
        marketTrendsBody: '.market-trends-body',
        smaMain: '.JS-main-sma',
        sorting: '.JS-sorting',
        isActiveInternal: 0,
        optionsChart : {
            text:{
                buy:'Buy',
                sell:'Sell'
            },
            value:1,
            id:0,
        },
        weightConfig:{},
        sortingWeight: {
            '7':1,
            '5':2,
            '3':3,
            '1':4,
            '-1':5,
            '-3':6,
            '-5':7,
            '-7':8
        },
        sellDirection:-1,
        buyDirection:1,
    };

    self.chart = {};
    self.click = false;
    self.options = $.extend(def_options, options);

    if(!self.options.isActiveInternal)
    {
        return new TradingProAbstractWidget(options);
    }

    self.initEvents = function(){
        $(document).on('click', self.options.actionOpen, function(e){

            self.click = true;
            if (!App.trader.isGuest) {
                e.preventDefault();
                if(self.options.reason.length > 0){
                    App.notification.error(self.options.reason, 3);
                    return false;
                }

                App.globalEvents.addMethod('market_trends_feed', 'market_trends');

                if ( ! $(self.options.containerSelector).hasClass('active')) {
                    App.socketCfd.subscribe('market_trends_feed', function (data) {
                        App.marketTrends.updateData(data);
                    }, '', 'market_trends', true);

                    $(self.options.containerSelector).fadeIn().addClass('active');
                    $(this).addClass('active');
                    topPartWidth();
                    assetsScrollHeight();
                    if($(self.options.toggleBlock).length > 0){
                        $(self.options.toggleBlock).addClass('toggled');
                    }
                } else {
                    $(self.options.containerSelector).removeClass('active');
                    $(self.options.containerSelector).hide();
                    $(self.options.actionOpen).removeClass('active');
                    topPartWidth();
                    $(self.options.toggleBlock).removeClass('toggled');
                }
            } else {
                App.trader.loginForm.show();
            }
        });

        $(self.options.containerSelector).on('click',self.options.symbolsList,function(e){
            e.preventDefault();
            if(!$(e.target).parent().hasClass('JS-markettrend-details')){
                let assetId = $(this).attr('id');
                if(typeof assetId != 'undefined' && App.asset.currentAssetId != assetId){

                    App.asset.switchAsset({asset_id: assetId}, {}, function () {

                        App.asset.setCurrentAssetFeed(parseInt(assetId), 'trade_new');
                        App.socketCfd.subscribe('assets_feed', function (data) {
                        }, App.asset.getCurrentAssetFeed(), 'assets');
                    });
                }
            }
        });

        $(document).on('click', function(e){
            if(!self.click && $(e.target).closest(self.options.containerSelector).length == 0) {
                $(self.options.containerSelector).removeClass('active');
                $(self.options.containerSelector).hide();
                $(self.options.actionOpen).removeClass('active');
                topPartWidth();
            }
            self.click = false;
        });

        $(self.options.containerSelector).on('click',self.options.detailsAction, function(e){
            e.preventDefault();
            let detailsBlock = $(this).parents(self.options.detailsBlock);
            let assetId = detailsBlock.attr('id');
            detailsBlock.toggleClass('active');

            let container = detailsBlock
                .find(self.options.chartContainer);
            let keyChart = detailsBlock.find(self.options.detailsTabsAction +'.active').attr('id');
            if($(container).empty())
            {
                detailsBlock
                    .find(self.options.detailsTabsContent)
                    .children()
                    .each(function(i,elem){
                        if ($(elem).hasClass('active')) {
                           self.options.optionsChart.value = $(elem).attr('data-value');
                        }
                });
                if(assetId){
                    self.options.optionsChart.id = assetId;
                    self.options.optionsChart.currentPeriod = keyChart;
                    self.chart[assetId] = new ChartPlatform.MarkettrendsChart(container, self.options.optionsChart);
                }
            }

            if( ! detailsBlock.hasClass('active')){
                if(typeof self.chart[assetId] != 'undefined'){
                    self.chart[assetId].destruction();
                }
            }
        });

        $(self.options.containerSelector).on('click',self.options.detailsTabsAction, function(e){
            e.preventDefault();
            if($(this).hasClass('active')) {
                return false;
            }
            $(this).parent(self.options.detailsTabs).find(self.options.detailsTabsAction).each(function(i,elem){
                if ($(elem).hasClass('active')) {
                    $(elem).removeClass('active');
                    let currentItemId = '.'+$(elem).attr('id');
                    let currentItem = $(this).parents(self.options.detailsBlock).find(currentItemId);
                    if($(currentItem).hasClass('active')){
                        $(currentItem).removeClass('active');
                        $(currentItem).addClass('hidden');
                    }
                }
            });

            let currentId = $(this).attr('id');

            let currentItemId = '.'+currentId;
            let currentItem = $(this).parents(self.options.detailsBlock).find(currentItemId);
            let assetId = $(this).parents(self.options.detailsBlock).attr('id');

            if(typeof self.chart[assetId] != 'undefined'){
                self.chart[assetId].currentPeriod = currentId;
                self.chart[assetId].redraw($(currentItem).attr('data-value'));
            }

            $(this).addClass('active');
            if($(currentItem).hasClass('hidden')){
                $(currentItem).removeClass('hidden');
                $(currentItem).addClass('active');
            }
        });
    };

    self.searchField = function(){
        $(self.options.containerSelector).on('keyup', self.options.searchField, function(e){
            e.preventDefault();
            let name;
            self.searchInput = $(self.options.searchField);
            self.filter = $(self.searchInput).val().toUpperCase();
            self.symbolList = $(self.options.symbolsList);
            for(var i = 0; i < self.symbolList.length; i++) {
                name = $(self.symbolList[i]).attr('data-name').toUpperCase();
                if(name.indexOf(self.filter) > -1){
                    $(self.symbolList[i]).css('display','');
                } else {
                    $(self.symbolList[i]).css('display','none');
                }
            }
        });
    };

    self.sorting = function(){
        $(self.options.sorting).click(function(){
            let selfClick = false;
            let order = $(this).hasClass('asc');
            let sorted = $(self.options.symbolsList).sort(function (a, b) {
                let keyA = $(a).attr("data-sort");
                let keyB = $(b).attr("data-sort");
                return order ? (parseInt(self.options.sortingWeight[keyB]) - parseInt(self.options.sortingWeight[keyA]))
                    : (parseInt(self.options.sortingWeight[keyA]) - parseInt(self.options.sortingWeight[keyB]));
            });
            $(self.options.marketTrendsBody).html(sorted);
            if(!order && !selfClick){
                $(this).addClass('asc');
                selfClick = true;
            }else{
                $(this).removeClass('asc');
            }
        });
    };

    self.updateData = function(items){
        if(typeof items != 'undefined'){
            for(let  i = 0; i < items.length; i++) {
                if(items[i].hasOwnProperty('asset_id')){
                    $(self.options.detailsBlock).each(function(index,block){
                        if($(block).attr('id') == items[i].asset_id){
                            //add
                            $(block).attr('data-sort', items[i].value);
                            let classDirection = '';
                            if(items[i].value > self.options.buyDirection){
                                classDirection = 'up';
                            }else if(items[i].value < self.options.sellDirection){
                                classDirection = 'down'
                            }
                            let strength = $(block).find('.strength');
                            $(strength).removeClass('up down');
                            $(strength).addClass(classDirection);
                            $(strength).text(self.options.weightConfig[items[i].value]);

                            for (let key in items[i].period_list) {
                                let period = $(block).find('.JS-'+key);
                                let period_data = items[i].period_list[key];

                                if(typeof self.chart[items[i].asset_id] != 'undefined'){
                                    if(self.chart[items[i].asset_id].currentPeriod == key) {
                                        self.chart[items[i].asset_id].redraw(period_data.value);
                                    }
                                }

                                let classDirection = '';
                                let arrowDirection = '';
                                if(period_data.value == self.options.buyDirection){
                                    classDirection = 'up';
                                    arrowDirection = 'arrow_upward';
                                }else{
                                    classDirection = 'down';
                                    arrowDirection = 'arrow_downward';
                                }
                                $(period).children().removeClass('up down');
                                $(period).children().addClass(classDirection);
                                $(period).children().text(arrowDirection);

                                let period_details = $(block).find('.'+key);
                                period_details.attr('data-value', period_data.value);

                                let smaMain = $(period_details).find(self.options.smaMain);
                                $(smaMain).removeClass('up down');
                                $(smaMain).addClass(classDirection);
                                $(smaMain).find('i').removeClass('up down');
                                $(smaMain).find('i').addClass(classDirection);
                                $(smaMain).find('i').text(arrowDirection);

                                for(let sma in period_data.sma){
                                    let sma_item = $(period_details).find('.JS-sma-'+sma);
                                    let classDirection = '';
                                    let arrowDirection = '';
                                    if(period_data.sma[sma] == self.options.buyDirection){
                                        classDirection = 'up';
                                        arrowDirection = 'arrow_upward';
                                    }else{
                                        classDirection = 'down';
                                        arrowDirection = 'arrow_downward';
                                    }
                                    $(sma_item).removeClass('up down');
                                    $(sma_item).addClass(classDirection);
                                    $(sma_item).find('i').removeClass('up down');
                                    $(sma_item).find('i').addClass(classDirection);
                                    $(sma_item).find('i').text(arrowDirection);
                                }
                            }
                        }
                    });
                }
            }
        }
    };


    self.initEvents();
    self.searchField();
    self.sorting();
};

let GlobalEvents = function (options) {
    let self = this;

    let def_options = {
        defaultMenuBlocks: '.JS-active-menu-block',
        toggleBlock: '#asset-block-info',
    };
    self.unsubscribeMethods = [];
    self.options = $.extend(def_options, options);

    self.initEvents = function(){
        $(document).on('click', function(e){
            let removeToggle = false;

            if ($(self.options.toggleBlock).length > 0) {
                $(self.options.defaultMenuBlocks).each(function(i,elem) {
                    if ($(this).hasClass('active')) {
                        removeToggle = true;
                    }
                });

                if (!removeToggle) {
                    $(self.options.toggleBlock).removeClass('toggled');

                    for (let value of self.unsubscribeMethods) {
                        let [method, tagID] = value.split('.');

                        App.socketCfd.unsubscribe(method, tagID, true);
                    }

                    self.unsubscribeMethods = [];
                }
            }
        });
    };

    self.addMethod = function (method, tagID) {
        let value = method + (tagID !== undefined ? '.' + tagID : '');

        if (self.unsubscribeMethods.includes(value)) {
            return;
        }

        self.unsubscribeMethods.push(value);
    };

    self.initEvents();
};

let AmountCorrection = {
    popup: $('.amount-multiply-popup'),

    show(amountCorrectionData) {
        let values = Object.assign({}, amountCorrectionData['amount_values'], {step: amountCorrectionData['amount_step']});

        this.popup.data('correctionId', amountCorrectionData['amount_correction_id']);

        for (let key in values) {

            this._setValue(key, +values[key]);
        }

        this.popup.show();
    },

    hide() {
        this.popup.data('correctionId', 0).data('correctionKey', '').hide();
    },

    chooseAmount(btn, correctionKey) {
        let selectedAmount = btn.innerText;

        this.popup.data('correctionKey', correctionKey);

        if (+this.popup.data('simply')) {

            $('.simply-wrap [name="imargin_trader"]').val(selectedAmount).trigger('keyup');

            $('.simply-wrap .JS-make_instance').trigger('click');
        } else {

            $('.right-block [name="money_invest"]').val(selectedAmount).trigger('keyup');

            //if one click trading we will trigger select dir action
            //else invest button
            if ($('#asset-block-info').find('[name=one_click_trading]').is(':checked')) {

                $('.right-block [data-action="select_dir"]').trigger('click');
            } else {
                $('.right-block [data-action="add"]').trigger('click');
            }
        }
    },

    _setValue(key, value) {
        this.popup.find(`.amount-multiply-${key}`).text(value);
    },
};

let PlatformOnboarding = function (options) {
    this.options = {
        i18n: {},
        closed: false,
        deferred: false,

        ...options
    }

    this.$popup = $('#driver-custom');

    this.start = function () {
        this.hidePopup();

        setTimeout(() => this.driver.start(0), 500);
    }

    this.close = function () {
        this.hidePopup();

        $.post('/ajax/notification/close_onboarding')

    }

    this.showNextTime = function () {
        this.hidePopup();

        $.post('/ajax/notification/close_session_onboarding')
    }

    this.showPopup = function () {
        this.$popup.show();
    }

    this.hidePopup = function () {
        this.$popup.hide();
    }

    this.complete = function () {
        $.post('/ajax/notification/complete_onboarding')
    }

    this.needToShowPopup = function () {
        return ! this.options.closed && ! this.options.deferred;
    }

    this._init = function () {
        if (App.trader.isGuest) {
            return;
        }

        let i18n = this.options.i18n;

        this.driver = new Driver({
            stageBackground: 'transparent',
            className: 'popover-main-window',        // className to wrap driver.js popover
            animate: true,                           // Whether to animate or not
            opacity: 0,                              // Background opacity (0 means only popovers and without overlay)
            padding: 0,                              // Distance of element from around the edges
            allowClose: true,                        // Whether the click on overlay should close or not
            overlayClickNext: false,                 // Whether the click on overlay should move next
            doneBtnText: i18n.done,                  // Text on the final button
            closeBtnText: '',                        // Text on the close button for this step
            nextBtnText: i18n.next,                  // Next button text for this step
            prevBtnText: i18n.back,                  // Previous button text for this step
            showButtons: true,                       // Do not show control buttons in footer
            keyboardControl: true,                   // Allow controlling through keyboard (escape to close, arrow keys to move)
        });

        this.driver.defineSteps([
            {
                element: '#li-add-position',
                popover: {
                    title: i18n.asset_choice_title,
                    description: `${i18n.asset_choice_description} ${this._stepItem(1)}`,
                    position: 'right',
                    offset: 25,
                }
            },
            {
                element: '#li-active-position',
                popover: {
                    title: i18n.active_positions_title,
                    description: `${i18n.active_positions_description} ${this._stepItem(2)}`,
                    position: 'right',
                    offset: 25,
                }
            },
            {
                element: 'footer',
                popover: {
                    title: i18n.main_indicators_title,
                    description: `${i18n.main_indicators_description} ${this._stepItem(3)}`,
                    position: 'top',
                    offset: 300,
                }
            },
            {
                element: '.top-part .right-block .right-block-wrap',
                popover: {
                    title: i18n.position_opening_title,
                    description: `${i18n.position_opening_description} ${this._stepItem(4)}`,
                    position: 'bottom',
                    offset: 100,
                }
            },
            {
                element: '.JS-check_deposit',
                popover: {
                    title: i18n.deposit_title,
                    description: `${i18n.deposit_description} ${this._stepItem(5)}`,
                    position: 'left',
                }
            },
            {
                element: '.asset-wrap',
                popover: {
                    title: i18n.balance_title,
                    description: `${i18n.balance_description} ${this._stepItem(6)}`,
                    position: 'bottom',
                    offset: 25,
                },
                onNext: () => {
                    this.complete();
                }
            },
        ]);

        if (this.needToShowPopup()) {
            this.showPopup();
        }

        this._bindEvents();
    }

    this._stepItem = function (step) {
        return `<div class="center">${step} / 6</div>`;
    }

    this._bindEvents = function () {
        this.$popup.find('.decline').on('click', () => this.close());

        this.$popup.find('.next').on('click', () => this.showNextTime());

        this.$popup.find('.start').on('click', () => this.start());

        $('#onboarding-link').on('click', () => this.start());
    }

    this._init();
}


var App = {};

App.init = function(applicationOptions, cb) {

    var self = this;
    self.parameters = {
        cssClassWidgetContainer: 'js-trading-4pro-widget',
        keyStorageActiveWidget: 'activeWidgetId'
    };

    var socketCfd           = applicationOptions.socketCfd || {};
    var formaterOptions     = applicationOptions.formater || {};
    var tradeOptions        = applicationOptions.tradeParam || {};
    var traderOptions       = applicationOptions.trader || {};
    var tradeResent         = applicationOptions.tradeResent || {};
    var mediaManagerOptions = applicationOptions.mediaManager || {};
    var tabsOptions         = applicationOptions.tabs || {};
    var mainChartOptions    = applicationOptions.mainChart || {};
    var sysParameters       = applicationOptions.sysParameter || {};
    var activePosition      = applicationOptions.activePosition || {};
    var notificationOptions = applicationOptions.notification || {};
    var assetOptions        = applicationOptions.asset || {};
    var bonusOptions        = applicationOptions.bonus || {};
    var marketTrendsOptions = applicationOptions.marketTrends || {};
    var tradingRoomOptions  = applicationOptions.tradingRoom || {};
    var heatMapsOptions     = applicationOptions.heatMaps || {};
    var onboardingOptions   = applicationOptions.platformOnboarding || {};

    self.socketCfd          = new SocketCfd(socketCfd); //top level dependency

    self.asset              = new Asset(assetOptions);
    self.htmlTemplate       = new HtmlTemplate();
    self.sysParameter       = new SysParameter(sysParameters);
    self.pushState          = new PushStateManager();
    self.trader             = new Trader(traderOptions); // Important, must be init before socket
    self.mediaManager       = new MediaManager(mediaManagerOptions);
    self.formater           = new Formater(formaterOptions);
    self.notification       = new Notification(notificationOptions);
    self.tradeRecent        = new TradeRecent(tradeResent);
    self.tradeParam         = new TradeParam(tradeOptions);
    self.tabsBlock          = new TabsBlock(tabsOptions);
    self.mainChart          = new MainChart(mainChartOptions);
    self.activePosition     = new ActivePositionBlock(activePosition);
    self.bonus              = new Bonus(bonusOptions);
    self.marketTrends       = new MarketTrends(marketTrendsOptions);
    self.tradingRoom        = new TradingProAbstractWidget(
        tradingRoomOptions,
        {specialBehaviorWidget: 'initExternalWidget'}
    );
    self.heatMaps           = new HeatMaps(heatMapsOptions);
    self.globalEvents       = new GlobalEvents();
    self.notificationGroup  = new NotificationGroup();
    self.platformOnboarding = new PlatformOnboarding(onboardingOptions);

    if (cb) {
        cb();
    }

    return self;
};
$( document ).ajaxError(function( event, jqxhr, settings, thrownError ) {
    // App.notification.error(jqxhr.statusText);
});





/************************** Ð¿ÐµÑ€ÐµÐ´ÐµÐ»Ð°Ñ‚ÑŒ *****************************************/
//tips
var tooltip_open_flag;
$(function () {
    tooltip_open_flag = false;
    var targets = '.t-info',
        tooltip = false;

    $(document).on('mouseenter', targets, function () {
        if (tooltip_open_flag) {
            return;
        }
        var target = $(this),
            attrMode = target.hasClass('attr-t-info'),
            tip = target.children('.body-t-info').html(),
            body = (self == top) ? document.body : parent.document.body,
            tooltip = $('<div id="tooltip" class="tooltip"></div>'),
            windowWidth = $(body).width(),
            windowHeight = $(body).height(),
            targetWidth = target.outerWidth(),
            targetOffset = target.offset(),
            targetHeight = target.outerHeight();

        target.css({
            'z-index': 100
        });
        tooltip.html(tip).css({'opacity': 0});
        $(body).find('#tooltip').remove();
        tooltip.appendTo(body);

        tooltip_open_flag = true;

        var initTooltip = function () {

            var posLeft = targetOffset.left + targetWidth / 2 - 20,
                posTop  = targetOffset.top - tooltip.outerHeight() - 20,
                posBottom = windowHeight - posTop - tooltip.outerHeight() - 20;

            if (posLeft + tooltip.outerWidth() > windowWidth)
            {
                posLeft = targetOffset.left - tooltip.outerWidth() + targetWidth / 2 + 15;
                tooltip.addClass('right');
            }
            else
            {
                tooltip.removeClass('right');
            }

            if (posTop < 0)
            {
                posTop  = targetOffset.top + targetHeight + 5;
                posBottom = windowHeight - posTop - tooltip.outerHeight() - 15;
                tooltip.addClass('top');
            }
            else
            {
                tooltip.removeClass('top');
            }

            posBottom += 10;
            tooltip.css({left: posLeft, bottom: posBottom})
                .animate({opacity: 1}, 300);
        }

        initTooltip();
        $(window).resize(initTooltip);

        var removeTooltip = function () {
            tooltip.animate({ opacity: 0 }, 300, function() {
                $(this).remove();
                tooltip_open_flag = false;
                target.css({
                    'z-index': ''
                });
            });

        };

        target.on('mouseleave', removeTooltip);
        tooltip.on('click', removeTooltip);
    });
});



/******** Default events handlers ********/

    /******** Dropdown chart type select ********/
        (function (targetSelector) {
            $(targetSelector).click(function (e) {
                e.preventDefault();
                $('#current-lang, #person-submenu').removeClass('active');
                var $this = $(this);
                if(!$this.hasClass('active')) {
                    $this.addClass('active');

                    $(document).bind('click.current-view_type', function (e) {
                        if ($(e.target).closest(targetSelector + '+ ul').length == 0) {
                            $this.removeClass('active');
                            $(document).unbind('click.current-view_type');
                        }
                    });
                    e.stopPropagation();
                } else {
                    $this.removeClass('active');
                }
            });
        })('#grid-menu');
    /******** end ********/

    /******** Dropdown language select ********/
        (function (targetSelector) {
            $(targetSelector).click(function (e) {
                e.preventDefault();
                $('#grid-menu, #person-submenu, #person-info').removeClass('active');
                var $this = $(this);
                if(!$this.hasClass('active')) {
                    $this.addClass('active');

                    $(document).bind('click.current-lang', function (e) {
                        if ($(e.target).closest('#current-lang + ul li').length == 0) {
                            $this.removeClass('active');
                            $(document).unbind('click.current-lang');
                        } else {
                            App.pushState.goTo({
                                'lang' : $(e.target).data('key')
                            });

                        }
                    });
                    e.stopPropagation();
                } else {
                    $this.removeClass('active');
                }
            });
        })('#current-lang');
    /******** end ********/

    /******** Dropdown top menu select ********/
        (function (targetSelector, targetSelectorSubmenu) {
            $(targetSelector).click(function (e) {
                e.preventDefault();
                $('#current-lang, #grid-menu').removeClass('active');
                var $this = $(this);
                if(!$this.hasClass('active')) {
                    $this.addClass('active');

                    $(document).bind('click.current-top-menu', function (e) {
                        if ($(e.target).closest(targetSelectorSubmenu).length == 0) {
                            $this.removeClass('active');
                            $(document).unbind('click.current-top-menu');
                        }
                    });
                    e.stopPropagation();
                } else {
                    $this.removeClass('active');
                }
            });
        })('#person-info', '#person-submenu');
    /******** end ********/
    /******** Dropdown top menu onboarding ********/
        (function (targetSelector) {
            $(targetSelector).click(function (e) {
                e.preventDefault();
                $('#current-lang, #grid-menu, #person-info').removeClass('active');
            });
        })('#onboarding-link');
    /******** end ********/
/*******************************************************************/
