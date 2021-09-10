'use strict';
var Report = {};

Report.History = function(report_block){
    //
}

Report.Statement = function(report_block){
    $(report_block).on('click', '.trading-report-link', function(){
        $(this).toggleClass('active');
        $(this).closest('tr').next('.trading-report-submenu').find('.in').slideToggle();
    });
};

Report.Summary = function(report_block){
    var $report_block = $(report_block);
    if($(report_block).find('.bar-chart').length > 0) {
        var value = [];
        var barChartHeight = $report_block.find('.bar-chart').parents('.line').height();
        var barValueHeight = $report_block.find('.bar-value').height();
        var maxValue = $report_block.find('.bar-legend .line:first').find('.val').html();
        var most_assets = $report_block.find('.bar-chart').find('.column');
        most_assets.map(function (id, asset) {
            var i = parseInt($(this).attr('id').replace(/\D+/g,""));
            value[i] = $report_block.find('#bar-value-' + i).find('.val').html();
            $report_block.find('#bar-line-' + i).find('.bar-value').html(value[i]);
            var barHeight = (barChartHeight - barValueHeight) / parseInt(maxValue) * parseInt(value[i]);
            $report_block.find('#bar-line-' + i).find('.bar-line').height(barHeight);
        });
        $report_block.find('div[id*=bar-value-]').mouseenter(function(){
            $(this).addClass('active');
            var elemId = parseInt($(this).attr('id').replace(/\D+/g,""));
            $report_block.find('#bar-line-' + elemId).addClass('active');
        })
            .mouseleave(function(){
                var elemId = parseInt($(this).attr('id').replace(/\D+/g,""));
                $(this).removeClass('active');
                $report_block.find('#bar-line-' + elemId).removeClass('active');
            });

        $report_block.find('div[id*=bar-line-]').mouseenter(function(){
            $(this).addClass('active');
            var elemId = parseInt($(this).attr('id').replace(/\D+/g,""));
            $report_block.find('#bar-value-' + elemId).addClass('active');
        })
            .mouseleave(function(){
                var elemId = parseInt($(this).attr('id').replace(/\D+/g,""));
                $(this).removeClass('active');
                $report_block.find('#bar-value-' + elemId).removeClass('active');
            });
    }
};



/******** Init events for reports pages ********/
(function() {
    var $filterContainer = $('.reports-filter');

    $filterContainer.on('change', '[name=period]', function(e) {
        var date_to = '',
            date_from = '',
            period = parseInt($(this).val());
        if(period > 0) {
            var timestamp = +(new Date())/1000;
            var dateFormat = 'D.M.Y';
            date_to = App.formater.dateTime(timestamp, 'D.M.Y');
            switch (period) {
                case 1: date_from = App.formater.dateTime(timestamp - 60 * 60 * 24, 'D.M.Y');
                    break;
                case 2: date_from = App.formater.dateTime(timestamp - 60 * 60 * 24 * 7, 'D.M.Y');
                    break;
                case 3: date_from = App.formater.dateTime(timestamp , '01.M.Y');
                    break;
                case 4: date_from = App.formater.dateTime(timestamp , '01.01.Y');
                    break;
            }
            $filterContainer.find(".datepicker-custom").parent('.icon-date-range').removeClass('empty');
        } else {
            $filterContainer.find(".datepicker-custom").parent('.icon-date-range').addClass('empty');
        }
        $filterContainer.find('input[name=date_from]').val(date_from);
        $filterContainer.find('input[name=date_to]').val(date_to);
    });
    $(".datepicker-custom").datepicker({
        maxDate: new Date(),
        onSelect: function() {
            $filterContainer.find('[name=date_from], [name=date_to]').change();
        }
      });
    $filterContainer.on('change', '[name=date_from], [name=date_to]', function(e) {
        if ($(this).val()) {
            $(this).parent('.icon-date-range').removeClass('empty');
        } else {
            $(this).parent('.icon-date-range').addClass('empty');
        }
    });
    $filterContainer.on('focus', '[name=date_from], [name=date_to]', function(e) {
        if (!$(this).val()) {
            $(this).parent('.icon-date-range').removeClass('empty');
        } else {
            $(this).parent('.icon-date-range').removeClass('empty');
        }
    });
    $filterContainer.on('blur', '[name=date_from], [name=date_to]', function(e) {
        if (!$(this).val()) {
            $(this).parent('.icon-date-range').addClass('empty');
        } else {
            $(this).parent('.icon-date-range').removeClass('empty');
        }
    });
})();