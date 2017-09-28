function draw_icicle(root, chart, chart_height, chart_width, param_labels, color) {
	var partition = d3.partition();

	var x = d3.scaleLinear()
		.range([0, chart_width]);

	var y = d3.scaleLinear()
		.range([0, chart_height]);

	partition = partition.size([chart_width, chart_height]).round(true);
	root = root.sort(function(a, b) {
		return b.value - a.value;
	});

	nodes = chart.selectAll("g")
		.data(partition(root).descendants())
		.enter().append("g")

	//adding rect

	rect = nodes.append('rect')
		.attr("x", function(d) {
			return d.x0;
		})
		.attr("y", function(d) {
			return d.y0;
		})
		.attr("width", function(d) {
			return d.x1 - d.x0;
		})
		.attr("height", function(d) {
			return d.y1 - d.y0;
		})
		.attr("fill", function(d) {
			return color(d);
		})
		.attr('class', 'd3_partition_node')

	if (param_labels.show === true) {
		var labels = nodes.append('text')
			.attr("class", "d3_partition_label")
			.attr('x', function(d) {
				return (d.x0 + d.x1) / 2
			})
			.attr('y', function(d) {
				return (d.y0 + d.y1) / 2
			})
			.text(function(d) {
				return d.data[param_labels.variable];
			})
			.attr("text-anchor", "middle")

		labels.filter(function(d) {
				return d.data.value < root.data.value * param_labels.cut_off
			})
			.attr('visibility', 'hidden')

	if (param_labels.style!==undefined)
		{
		  labels.attr('style',param_labels.style)
		}
	}

	function click_icicle(d) {
		var clicked_node_size = d.data.value

		x.domain([d.x0, d.x1]);
		y.domain([d.y0, chart_height]).range([d.depth ? 20 : 0, chart_height]);

		chart.selectAll('rect').transition()
			.duration(750)
			.attr("x", function(d) {
				return x(d.x0);
			})
			.attr("y", function(d) {
				return y(d.y0);
			})
			.attr("width", function(d) {
				return x(d.x1) - x(d.x0);
			})
			.attr("height", function(d) {
				return y(d.y1) - y(d.y0);
			});

    var label_zoom=chart.selectAll('text');
		if (param_labels.show === true) {

			label_zoom.transition()
				.duration(750)
				.attr('x', function(d) {
					return x((d.x0 + d.x1) / 2)
				})
				.attr('y', function(d) {
					return y((d.y0 + d.y1) / 2)
				})

			label_zoom.filter(function(d) {
					return d.data.value > clicked_node_size * param_labels.cut_off;
				})
				.attr('visibility', 'visible')

			label_zoom.filter(function(d) {
					return d.data.value < clicked_node_size * param_labels.cut_off
				})
				.attr('visibility', 'hidden')
		}
	}

	return click_icicle

}
