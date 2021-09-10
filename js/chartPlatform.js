/**
 * Created by andrey.avseenko on 27.11.2017.
 */
'use strict';
var ChartPlatform = {};
ChartPlatform.ChartPie = function(element, options){
    this.options = options || {};

    if (typeof this.options.textOption !== 'undefined') {
        this.textOption = this.options.textOption;
    }else{
        this.textOption = false;
    }

    this.element = d3.select(element);
    if(this.element.empty()){
        return;
    }
    this.width = parseInt(this.element.style('width'));
    this.height = parseInt(this.element.style('height'));
    this.percent = 100;
    this.value = 0;
    if(parseInt(this.element.attr("data-value"))){
        this.value = parseInt(this.element.attr("data-value"));
    }
    this.draw();
    return this;

};

ChartPlatform.ChartPie.prototype.draw = function(){
    this.percent = this.value;
    this.dataset = {
        lower: this.calcPercent(0),
        upper: this.calcPercent(this.value)
    };

    this.radius = Math.min(this.width, this.height) / 2;

    ChartPlatform.ChartPie.format = d3.format(".0%");
    this.pie = d3.pie().sort(null);

    this.arc = d3.arc()
        .innerRadius(this.radius - (this.radius/4))
        .outerRadius(this.radius);

    this.svg = this.element.append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("class", "chart-pie")
        .append("g")
        .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    this.path = this.svg.selectAll("path")
        .data(this.pie(this.dataset.lower))
        .enter().append("path")
        .attr("class", function (d, i) {
            if (i == 0) {
                return "progress"
            } else {
                return "background"
            }
        })
        .attr("fill", function(d,i){
            if(i == 0){
                return "#407fe3";
            }else{
                return "#2c343a";
            }
        })
        .attr("d", this.arc)
        .each(function (d) {
            this._current = d;
        });

    if(this.textOption) {
        this.text = this.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em");
    }

    if (typeof(this.value) === "string" && this.textOption) {
        this.text.text(this.value);
    } else {
        this.animateDraw();
    }
};
ChartPlatform.ChartPie.prototype.redraw = function(value) {
    if (this.element.empty()) {
        return;
    }
    if (this.value === parseInt(value)) {
        return;
    }

    this.value = parseInt(value);

    this.dataset = {
        upper: this.calcPercent(value)
    };

    this.animateDraw();
};

ChartPlatform.ChartPie.prototype.animateDraw = function(){
    var textOption = this.textOption;
    var value = this.value;
    var arc =  d3.arc()
        .innerRadius(this.radius - (this.radius/4))
        .outerRadius(this.radius);
    var text = this.text;

    this.path = this.path.data(this.pie(this.dataset.upper));
    this.path.transition().duration(2000).attrTween("d", function (a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        var i2 = d3.interpolate(value, value);
        return function (t) {
            if(textOption){
                text.text( ChartPlatform.ChartPie.format(i2(t) / 100) );
            }
            return arc(i(t));
        };
    });
};

ChartPlatform.ChartPie.prototype.calcPercent = function(percent){
    return [percent, 100-percent];
};

ChartPlatform.Popularity = function(element){
    this.element = d3.select(element);
    if(this.element.empty()){
        return;
    }

    this.maxWidth = 155;
    this.maxHeight = 16;
    this.width = parseInt(this.element.style('width'));
    this.height = parseInt(this.element.style('height'));

    this.width = (this.width > this.maxWidth || this.width === 0 || isNaN(this.width))
        ? this.maxWidth : this.width;
    this.height = (this.height > this.maxHeight || this.height === 0 || isNaN(this.height))
        ? this.maxHeight : this.height;

    this.valueLeft = 1;

    if(parseInt($(element).data("left"))){
        this.valueLeft = parseInt($(element).data("left"));
    }

    this.draw();
    return this;
};

ChartPlatform.Popularity.prototype.draw = function(){
    this.svg = this.element
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    this.paddingOneElement = 7;
    this.widthElement = 5;
    this.count = Math.floor(this.width / this.paddingOneElement);

    for (var i = 0; i < this.count; i++) {
        this.class = 'popularity-red';
        this.defaultFill = '#5c2427';
        this.percentValue = this.count*this.valueLeft/100;
        if(this.percentValue < i)
        {
            this.class = 'popularity-green';
            this.defaultFill = '#113e31';
        }
        this.svg.append('rect')
            .attr("x", this.paddingOneElement*i)
            .attr("width", this.widthElement)
            .attr("height",this.height)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("class", this.class)
            .attr("fill",this.defaultFill);
    }
};

ChartPlatform.PopularityInstance = function (element) {
    this.element = d3.select(element);
    if(this.element.empty()){
        return;
    }
    this.maxWidth = 150;
    this.maxHeight = 124;
    this.width = parseInt(this.element.style('width'));
    this.height = parseInt(this.element.style('height'));

    this.width = (this.width > this.maxWidth || this.width === 0 || isNaN(this.width))
        ? this.maxWidth : this.width;
    this.height = (this.height > this.maxHeight || this.height === 0 || isNaN(this.height))
        ? this.maxHeight : this.height;

    this.draw();
};

ChartPlatform.PopularityInstance.prototype.draw = function(){
    this.svg = this.element
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    this.widthElement = 20;
    this.widthElementWithPadding = 30;
    this.count = Math.floor(this.width / this.widthElementWithPadding);
    for (var i = 0; i < this.count; i++) {
        this.svg.append('rect')
            .attr("x", this.widthElementWithPadding*i)
            .attr("width", this.widthElement)
            .attr("height",this.height);
    }
};

ChartPlatform.Bars = function(element){
    this.element = d3.select(element);
    if(this.element.empty()){
        return;
    }
    this.barPadding = 5;
    this.chartBar = this.element.select('#bar_chart');

    this.barsValues = this.element.selectAll("#bar_legend .line");

    this.data = {};
    this.draw();


};

ChartPlatform.Bars.prototype.draw = function() {
    this.svg = this.chartBar
        .append('svg')
        .attr("width", '100%')
        .attr("height", '100%');

    this.width = this.svg.node().getBoundingClientRect().width;
    this.height = this.svg.node().getBoundingClientRect().height;

    this.marginWidth = this.width / 4;
    this.margin = {top: 10, right: this.marginWidth, bottom: 10, left: this.marginWidth};
    var width = this.width - this.margin.left - this.margin.right;
    var height = this.height - this.margin.top - this.margin.bottom;
    var text_padding = 5;

    this.barWidth = (this.width / (this.barsValues.size() * 2)) - this.barPadding;

    var data = [];
    this.barsValues.selectAll(function () {
        data.push({
            id: parseInt(d3.select(this).attr("data-id")),
            value: parseInt(d3.select(this).attr("data-value")),
            text: parseInt(d3.select(this).attr("data-value"))
        });
    });
    if (data.length == 1) {
        data[0].value = 85;
        text_padding = text_padding - height / 100 * 15;
    }
    this.barsValues
        .on("mouseover", handleMouseOverText)
        .on("mouseout", handleMouseOutText);

    var xcale = d3.scaleBand()
        .domain(d3.range(5))
        .rangeRound([0, width])
        .paddingInner(0.1);

    var bars = this.svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "column")
        .attr("id", function(d,i){
            return "bar-id-"+d.id;
        })
        .attr('x', function(d, i) {
            return xcale(i);
        })
        .attr("y", height)
        .attr("width", xcale.bandwidth())
        .attr("height", 0)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    bars.transition()
        .duration(1000)
        .delay(100)
        .attr("y", function (d) {
            return height - ((height / 100) * d.value);  //Height minus data value
        })
        .attr("height", function (d) {
            return (height / 100) * d.value;
        });
    var svg = this.svg;

    function handleMouseOver(d,i) {
        d3.select(this).attr("class", "column active");
        d3.select('#bar-value-'+d.id).attr("class", "line active");

        var text = svg.append("text")
            .attr("id", "text-"+d.id)
            .attr("class", "bar-value")
            .attr("y", height - ((height / 100) * d.value) - 5)
            .attr("x", d3.select(this).attr('x'));
        text.text(d.text + "%");
    };

    function handleMouseOut(d,i){
        d3.select(this).attr("class", "column");
        d3.select('#bar-value-'+d.id).attr("class", "line");
        d3.select("#text-"+d.id).remove();
    };

    function handleMouseOverText(d,i){
        var select_bar = d3.select('#bar-id-'+d3.select(this).attr('data-id'));
        d3.select(this).attr("class", "line active");
        select_bar.attr("class","column active");

        var text = svg.append("text")
            .attr("id", "text-"+d3.select(this).attr('data-id'))
            .attr("class", "bar-value")
            .attr("y", height - ((height / 100) * d3.select(this).attr('data-value')) - text_padding)
            .attr("x", select_bar.attr('x'));
        text.text(d3.select(this).attr('data-value') + "%");
    }
    function handleMouseOutText(d,i){
        d3.select(this).attr("class", "line");
        d3.select('#bar-id-'+d3.select(this).attr('data-id')).attr("class","column");
        d3.select("#text-"+d3.select(this).attr('data-id')).remove();
    }
};

ChartPlatform.MarkettrendsChart = function(element, options){
    this.element = d3.select(element[0]);
    if(this.element.empty()){
        return;
    }
    this.id = 'linear-gradient-'+options.id;
    this.height = parseFloat(this.element.node().offsetHeight);

    this.currentPeriod = options.currentPeriod;
    //gradient
    this.colorRange = ['#3cc73f', '#1d1d1c'];
    this.color = d3.scaleLinear().range(this.colorRange).domain([1,2]);

    this.classStrokeBuy = 'market-trends-buy';
    this.classStrokeSell = 'market-trends-sell';

    //const settings for chart
    this.stepsLine = 31;
    this.halfCircleSteps = Math.round(this.stepsLine/2);

    this.minBar = 91;
    this.maxBar = 269;

    this.step = (this.maxBar - this.minBar) / this.stepsLine;

    this.textSell = 'Sell';
    this.textBuy  = 'Buy';

    if(options.text.length > 0) {
        this.textBuy = options.text.buy;
        this.textSell= options.text.sell;
    }

    this.opacitySell = '100%';
    this.opacityBuy = '100%';

    this.opacity = '25%';
    if(options.value != -1){
        this.strokeClass = this.classStrokeBuy;
        this.opacitySell = this.opacity;
    }else{
        this.strokeClass = this.classStrokeSell;
        this.opacityBuy = this.opacity;
    }

    this.draw();
};

ChartPlatform.MarkettrendsChart.prototype.draw = function(){
    //created svg.
    this.svg = this.element.append('svg')
        .attr('height', this.height);

    this.width = parseFloat(this.element.node().offsetWidth);

    this.margin = 15;
    this.radius = Math.min(this.width) / 3 - this.margin;
    this.innerRadius = this.radius - (this.height / 4);
    this.outerRadius = 0;

    this.center = {x:this.width / 2, y:this.height};

    this.svg.attr('width',this.width);
    this.g = this.svg.append('g')
        .attr('transform',"translate(" + this.center.x + "," + this.center.y + ")");
    this.linearGradient = this.svg.append('defs')
        .append('linearGradient')
        .attr('id',this.id)
        .attr('gradientTransform','rotate(90)');

    this.gradientColor = this.linearGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', this.color(1))
        .attr('class',this.strokeClass);

    this.linearGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', this.color(2))
        .attr('class','');

    this.arc = d3.arc()
        .innerRadius(this.innerRadius)
        .outerRadius(this.outerRadius)
        .startAngle(-0.5*Math.PI)
        .endAngle(0.5*Math.PI);

    this.g.append('path')
        .style('fill','url(#'+this.id+')')
        .attr('d',this.arc);

    let f = 0;
    this.lineSell = this.svg.append('g');
    this.lineBuy = this.svg.append('g');
    for(let i = 0; i <= this.stepsLine; i++ ) {
        let param = this.step*i;
        f = (this.minBar + param) * Math.PI/180;
        let opacity = this.opacityBuy;
        if(i+1 > this.halfCircleSteps){
            opacity = this.opacitySell;
            this.lineSell
                .attr("class", this.classStrokeSell)
                .style("opacity", opacity);
            this.lineSell.append('line')
                .attr('x1', this.center.x + (this.innerRadius+4) * Math.sin(f))
                .attr('y1', this.center.y + (this.innerRadius+4) * Math.cos(f))
                .transition()
                .ease(d3.easeBounce)
                .duration(1000)
                .attr('x2', this.center.x + (this.innerRadius+25) * Math.sin(f))
                .attr('y2', this.center.y + (this.innerRadius+25) * Math.cos(f))
                .style("stroke-width", "3")
                .style("stroke-linecap", "round");
        }else{
            this.lineBuy
                .attr("class", this.classStrokeBuy)
                .style("opacity", opacity);
            this.lineBuy.append('line')
                .attr('x1', this.center.x + (this.innerRadius+4) * Math.sin(f))
                .attr('y1', this.center.y + (this.innerRadius+4) * Math.cos(f))
                .transition()
                .ease(d3.easeBounce)
                .duration(1000)
                .attr('x2', this.center.x + (this.innerRadius+25) * Math.sin(f))
                .attr('y2', this.center.y + (this.innerRadius+25) * Math.cos(f))
                .style("stroke-width", "3")
                .style("stroke-linecap", "round");
        }
    }

    this.textSvgSell = this.svg.append('text')
        .attr('x', 30)
        .attr('y', this.center.y - (this.height - 25))
        .attr('class', this.classStrokeSell)
        .style('opacity', this.opacitySell)
        .text(this.textSell);

    this.textSvgBuy = this.svg.append('text')
        .attr('x', this.width - 50)
        .attr('y', this.center.y - (this.height - 25))
        .attr('class', this.classStrokeBuy)
        .style('opacity', this.opacityBuy)
        .text(this.textBuy);
};


ChartPlatform.MarkettrendsChart.prototype.redraw = function(value){
    this.opacitySell = '100%';
    this.opacityBuy = '100%';
    this.opacity = '25%';
    let classStyle = this.classStrokeSell;
    if(value == 1){
        classStyle = this.classStrokeBuy;
        this.opacitySell = this.opacity;
    }else{
        classStyle = this.classStrokeSell;
        this.opacityBuy = this.opacity;
    }
    this.gradientColor
        .attr('class',classStyle);

    this.lineBuy
        .transition()
        .ease(d3.easeBounce)
        .duration(1000)
        .style("opacity", this.opacityBuy);

    this.lineSell
        .transition()
        .ease(d3.easeBounce)
        .duration(1000)
        .style("opacity", this.opacitySell);

    this.textSvgBuy
        .transition()
        .ease(d3.easeBounce)
        .duration(1000)
        .style("opacity", this.opacityBuy);

    this.textSvgSell
        .transition()
        .ease(d3.easeBounce)
        .duration(1000)
        .style("opacity", this.opacitySell);
};
ChartPlatform.MarkettrendsChart.prototype.destruction = function(){
    this.svg.remove();
};



