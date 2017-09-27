function draw_treemap(root, chart, chart_height, chart_width, param_labels, color) {

	var treemap = d3.treemap()
		.tile(d3.treemapSquarify.ratio(1.6))
		.size([chart_width, chart_height])
		.paddingOuter(5)
		.paddingTop(15)
		.paddingInner(1)
		.round(true);

	treemap(root);

	var cell = chart
		.selectAll(".node")
		.data(root.descendants())
		.enter().append("g")
		.attr("class", "node")
		.each(function(d) {
			d.node = this;
		})

	rect = cell.append("rect")
		.attr("id", function(d) {
			return "rect-" + d.id;
		})
		.attr("width", function(d) {
			return d.x1 - d.x0;
		})
		.attr("height", function(d) {
			return d.y1 - d.y0;
		})
		.style("fill", function(d) {
			return color(d);
		})
		.attr('class', 'd3_partition_node');

	if (param_labels.show === true) {
		labels = cell.append('text')
			.attr('class', 'd3_partition_label')
			.attr('x', function(d) {
				return (d.x0)
			})
			.attr('y', function(d) {
				return (d.y0)
			})
			.text(function(d) {
				return d.data[param_labels.variable]
			})

		if (param_labels.style!==undefined)
		{
		  labels.attr('style',param_labels.style)
		}

		labels.filter(function(d) {
				return d.data.value < root.data.value * param_labels.cut_off
			})
			.attr('visibility', 'hidden')
	}

	var focus = root,
		view;
	zoomTo_rect([root.x0, root.y0, root.x1 - root.x0]);

	function zoom_rect(d) {
		current_node_value = d.data.value

		///Change the previous zoomed element to the current one
		var focus0 = focus;
		focus = d;
		ratio_width_height_focus = (focus.y1 - focus.y0) / (focus.x1 - focus.x0)
		ratio_width_height_chart = chart_width / chart_height

		var transition = d3.transition()
			.duration(d3.event.altKey ? 7500 : 750)
			.tween("zoom", function(d) {
				var i = d3.interpolateZoom(view, [focus.x0 - 5, focus.y0 - 5,
					(focus.x1 - focus.x0) * Math.max(1, ratio_width_height_chart * ratio_width_height_focus)
				]);
				return function(t) {
					zoomTo_rect(i(t));
				};
			});

		if (param_labels.show === true) {

			labels.attr('visibility', 'visible')

			labels.filter(function(d) {
					return d.data.value < current_node_value * param_labels.cut_off
				})
				.attr('visibility', 'hidden')

		}

	}

	function zoomTo_rect(v) {
		///k=zoom coeff
		var k = (chart_width / v[2]);
		view = v;
		rect.attr("transform", function(d) {
				return "translate(" + (d.x0 - v[0]) * k + "," + (d.y0 - v[1]) * k + ")";
			})
			.attr("width", function(d) {
				return (d.x1 - d.x0) * k;
			})
			.attr("height", function(d) {
				return (d.y1 - d.y0) * k;
			});

		if (param_labels.show === true) {
			labels.attr('x', function(d) {
					return (((d.x0*0.8 + d.x1*0.2) - v[0]) * k)
				})
				.attr('y', function(d) {
					return ((d.y0 + 10 - v[1]) * k)
				})

			labels.filter(function(d) {
					return d.children === undefined
				})
				.attr('y', function(d) {
					return (((d.y0 + d.y1) / 2 - v[1]) * k)
				})
		}

	}

	function zoom_rect_stop_prop(d) {
		if (focus !== d) zoom_rect(d), d3.event.stopPropagation();
	}

	return zoom_rect_stop_prop

}
