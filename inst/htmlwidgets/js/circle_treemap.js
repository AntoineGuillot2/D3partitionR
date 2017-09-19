function draw_circle_treemap(root, chart, chart_height, chart_width, param_labels, color) {

	var diameter = (Math.min(chart_width, chart_height)) / 2 - 10;
	var pack = d3.pack()
		.size([diameter, diameter])
		.padding(2);

	root = root.sort(function(a, b) {
		return b.value - a.value;
	});

	//Focus is the current zoomed root
	var focus = root,
		nodes = pack(root).descendants(),
		view;

	var svg_circle = chart.append("g")
		.attr("transform", "translate(" + (chart_width / 2) + "," + (chart_height / 2) + ")")

	var circle = svg_circle
		.selectAll("circle")
		.data(nodes)
		.enter().append("circle")
		.attr("class", function(d) {
			return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
		})
		.style("fill", function(d) {
			return color(d)
		})
		.attr('class', 'd3_partition_node')

	if (param_labels.show === true) {
		//adding hidden arc to place the labels correctly
		//Inspired from Nadieh Bremer
		var hidden_arc = svg_circle.selectAll(".hiddenArc")
			.data(nodes)
			.enter().append("circle")
			.append("path")
			.attr("class", "hiddenArc")
			.attr("id", function(d, i) {
				return "circleArc_" + i;
			})
			.attr("d", function(d, i) {
				return "M " + -d.r + " 0 A " + d.r + " " + d.r + " 0 0 1 " + d.r + " 0";
			})
			.style("fill", "none");

		var labels = svg_circle.selectAll(".d3_partition_label")
			.data(nodes)
			.enter().append("text")
			.attr("class", "d3_partition_label")
			.style("fontSize", "40px")
			.style("visible", function(d) {
				return d.data.value < root.data.value * param_labels.cut_off
			})
			.append("textPath")
			.attr("xlink:href", function(d, i) {
				return "#circleArc_" + i;
			})
			.style("text-anchor", "middle") //place the text halfway on the arc
			.attr("startOffset", "50%")
			.text(function(d) {
				return d.data[param_labels.variable];
			});

	if (param_labels.style!==undefined)
		{
		  labels.attr('style',param_labels.style)
		}

	}

	var node = chart.selectAll("circle,text");

	zoomTo([root.x, root.y, root.r],root.data.value);

	function zoom(d) {
		var focus0 = focus;
		focus = d;
		var clicked_node_size=focus.data.value;
		console.log(clicked_node_size)

		var transition = d3.transition()
			.duration(d3.event.altKey ? 7500 : 750)
			.tween("zoom", function(d) {
				var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r]);

				return function(t) {
					zoomTo(i(t),clicked_node_size);
				};
			});

	}

	function zoomTo(v,clicked_node_size) {
		var k = diameter / v[2];
		view = v;
		node.attr("transform", function(d) {
			return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
		});
		circle.attr("r", function(d) {
			return d.r * k;
		});

		d3.selectAll(".hiddenArc")
			.attr("d", function(d, i) {
				return "M " + (-d.r * k) + " 0 A " + (d.r * k) + " " + (d.r * k) + " 45 0 1 " + (d.r * k) + " 0";
			});

		svg_circle.selectAll(".d3_partition_label").filter(function(d) {
  			return d.data.value > clicked_node_size * param_labels.cut_off;
  		})
  		.attr('visibility', 'visible')

  	svg_circle.selectAll(".d3_partition_label").filter(function(d) {
  			return d.data.value < clicked_node_size * param_labels.cut_off
  		})
  		.attr('visibility', 'hidden')

	}

	function zoom_stop_prop(d) {
		if (focus !== d) zoom(d), d3.event.stopPropagation();
	}

	return zoom_stop_prop

}
