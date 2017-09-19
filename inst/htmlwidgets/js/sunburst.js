function draw_sunburst(root, chart, chart_height, chart_width, param_labels, color) {

	var partition = d3.partition();

	var radius = (Math.min(chart_width, chart_height) / 2) - 10;

	var x = d3.scaleLinear()
		.range([0, 2 * Math.PI]);

	var y = d3.scaleSqrt()
		.range([0, radius]);

	var arc = d3.arc()
		.startAngle(function(d) {
			return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
		})
		.endAngle(function(d) {
			return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
		})
		.innerRadius(function(d) {
			return Math.max(0, y(d.y0));
		})
		.outerRadius(function(d) {
			return Math.max(0, y(d.y1));
		});

	nodes = partition(root).descendants();

	sunburst_chart=chart.append('g').attr("transform", "translate(" + ((chart_width) / 2) + "," + ((chart_height) / 2) + ")")

	arc_path = sunburst_chart
		.selectAll(".arcPath")
		.data(nodes)
		.enter().append("path")
		.attr("d", arc);

	arc_path.style("fill", function(d) {
			return color(d);
		})
		.attr("id", function(d, i) {
			return "arcPath_" + i;
		})
		.attr('class', 'd3_partition_node')

	if (param_labels.show === true) {
		var labels = sunburst_chart.selectAll(".d3_partition_label")
			.data(nodes)
			.enter().append("text")
			.attr("x", 5) //Move the text from the start angle of the arc
			.attr("dy", 18)
			.append("textPath")
			.attr("xlink:href", function(d, i) {
				return "#arcPath_" + i;
			})
			.text(function(d) {
				return d.data[param_labels.variable];
			});

		if (param_labels.style!==undefined)
		{
		  labels.attr('style',param_labels.style)
		}

		labels.filter(function(d) {
				return d.data.value < root.data.value * param_labels.cut_off;
			})
			.attr('visibility', 'hidden');

	}

	function click_sunburst(d) {
		current_root = d;

		sunburst_chart.transition()
			.duration(750)
			.tween("scale", function() {
				var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
					yd = d3.interpolate(y.domain(), [d.y0, 1]),
					yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
				return function(t) {
					x.domain(xd(t));
					y.domain(yd(t)).range(yr(t));
				};
			})
			.selectAll("path")
			.attrTween("d", function(d) {
				return function() {
					return arc(d);
				};
			});

		if (param_labels.show === true) {

			labels.attr('visibility', 'hidden');

			labels.filter(function(d) {
					var ancestors = d.ancestors();
					var res = false;
					for (var ancestor in ancestors) {
						if (ancestors[ancestor] == current_root) {
							res = true;
						}
					}
					return (d.data.value > current_root.data.value * param_labels.cut_off && res);
				})
				.attr('visibility', 'visible');
		}

	}

	return (click_sunburst)

}
