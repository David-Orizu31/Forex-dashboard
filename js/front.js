function assetsScrollHeight() {
	var activePositionH = $('.block-active-position').outerHeight(),
        newPosition = $('.block-new-position'),
        blockHeadH = $('.block-head').outerHeight(),
        activePositionTabs = $('.block-active-position .tabs'),
        tabsLabelHeight = activePositionTabs.find('label').outerHeight(),
        newPositionHead = $('.new-position-head').outerHeight();

    activePositionTabs.find('.scroll-wrapper').height(activePositionH - blockHeadH - tabsLabelHeight);
    newPosition.find('.scroll-wrapper').height(newPosition.outerHeight() - newPositionHead);
}

function topPartWidth() {
    var unavailableAsset = $('.top-part .unavailable-asset'),
        topPartWidth = $('#asset-block-info').width(),
        blockNewPosition = $('#block-new-position'),
        blockActivePosition = $('#block-active-position'),
        heatMapsBlock = $('#heat-maps-block'),
        marketTrendsBlock = $('.market-trends-block'),
        leftBlockWidth = $('#asset-block-info .left-block').outerWidth();
    if (blockNewPosition.is(':visible') && blockNewPosition.hasClass('active')) {
        unavailableAsset.width(topPartWidth - leftBlockWidth - 416);
    }
    else if (blockActivePosition.is(':visible') && blockActivePosition.hasClass('active')) {
        unavailableAsset.width(topPartWidth - leftBlockWidth - 416);
    }
    else if (heatMapsBlock.is(':visible') && heatMapsBlock.hasClass('active')) {
        unavailableAsset.width(topPartWidth - leftBlockWidth - 416);
    }
    else if (marketTrendsBlock.is(':visible') && marketTrendsBlock.hasClass('active')) {
        unavailableAsset.width(topPartWidth - leftBlockWidth - 416);
    }
    else {
        unavailableAsset.css("width", "100%");
    }
}

function socialSwitcher() {
	var switcherInput = $('.switcher .checkbox-switcher input'),
		switcherLabel = $('.switcher .label');

	switcherInput.change(function() {
		switcherLabel.toggleClass('active')
	});
}

/**
 * @deprecated
 */
function toggleFrame() {

	$('#socialtrading-link').click(function () {
		if (!App.trader.isGuest) {
			if ($(this).data('available')) {
				window.location = $(this).data('href')
			} else {
				App.notification.error($(this).data('reason'), 3)
			}
		} else {
			App.trader.loginForm.show();
		}
	})
}

function settingBtnActive() {
	var $saveBtn = $('.block-title .btn-large');
	var $formState = $('.JS-settings').serialize();

	$('.JS-settings').change(function () {
		var $currentState = $('.JS-settings').serialize();
        if ($currentState == $formState) {
            $saveBtn.addClass('btn-disabled');
        } else {
            $saveBtn.removeClass('btn-disabled');
        }
    });
}


function asideSlider() {
	if ($('#aside-slider').hasClass('slick-slider')) {
		$('#aside-slider').slick('unslick');
	}
	var asideContainerHeight = $('#aside-slider').outerHeight();
	var itemsOuterHeight = itemsLength = slidesToScrollValue = slidesToShowValue  = 0;

	var resizeTimer;
	$('#aside-slider li').each(function() {
	  itemsOuterHeight += $(this).outerHeight();
	  itemsLength += $(this).length;
	  middle = Math.ceil(itemsOuterHeight/itemsLength);
	  slidesToShowValue = Math.floor(asideContainerHeight/middle);
	  slidesToScrollValue = itemsLength - slidesToShowValue;
	});
	var settings = {
		slidesToShow : slidesToShowValue,
		vertical: true,
		adaptiveHeight: true,
		slidesToScroll : slidesToScrollValue,
		infinite : false,
		verticalSwiping: true,
		prevArrow:'<button type="button" class="slick-prev"><i class="material-icons">keyboard_arrow_up</i></button>',
		nextArrow:'<button type="button" class="slick-next"><i class="material-icons">keyboard_arrow_down</i></button>'
	};

	if (itemsOuterHeight > asideContainerHeight && slidesToScrollValue >= 1) {
		$('#aside-slider').slick(settings);
	}
}

function getLanguage() {
	let lang = Cookies.get('lastLanguage');

	if (lang) {
		lang = lang.substr(-2);
	}

	return lang || 'en';
}


var asideSliderSetTimeout;

// Initready{(
$(window).resize(function(){
	topPartWidth();
	assetsScrollHeight();
	clearTimeout(asideSliderSetTimeout);
    asideSliderSetTimeout = setTimeout(asideSlider, 100);
});


$(document).ready(function(){
    socialSwitcher();
	toggleFrame();
    asideSlider();
    settingBtnActive();
});
