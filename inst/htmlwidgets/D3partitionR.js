HTMLWidgets.widget({

	name: 'D3partitionR',

	type: 'output',

	factory: function(el, width, height) {

		///Rendering

		return {

			renderValue: function(D3partitionR) {

				//Removing any old chart
				d3.select(el).select(".d3partitionR_chart").remove();
				d3.selectAll('.d3_partitionR_tooltip').remove();
				el_id = el.getAttribute('id');

				//color palette of the chart
				color_pal = set_color_scale(D3partitionR.color_scale)


				var svg_grid = d3.select(el).append("svg")
					.attr('class', 'd3partitionR_chart')
					.attr("width", width)
					.attr("height", height);

				//Management of the general layout of the widget
				var title_height = 50;
				var breadcrumb_height = 50;
				var legend_width = D3partitionR.legend.width;
				var x_global = 0;
				var y_chart = 0;
				var y_breadcrumb = 0;
				var label_display_threshold = 0.05

				//Increasing the x and y to have enough rooms for legend, title and breadcrumb
				if (D3partitionR.legend.visible) {
						x_global += legend_width;
					}
				if (D3partitionR.title !== undefined) {
					//adding space for the title
					y_chart += title_height;
					y_breadcrumb += title_height;

				}
				if (D3partitionR.trail.visible) {

					y_chart += breadcrumb_height;
				}

				var chart_width = width - x_global,
					chart_height = height - y_chart;

				var chart = svg_grid.append('g')
					.attr("width", width - x_global)
					.attr("height", height - y_chart)
					.attr("transform", "translate(" + 0 + "," + (y_chart) + ")");


				D3partitionR.data=add_value_variable(D3partitionR.variable.value,D3partitionR.data);
        console.log(D3partitionR.data)

				var root = d3.hierarchy(D3partitionR.data);
				var partition = d3.partition();
				var formatNumber = d3.format(",d");

				///adding partial function to improve readbility and maintanability
				var addLegend = addLegend_tot.bind(undefined, svg_grid, D3partitionR, color_pal, width - legend_width * 4/5, y_chart + (height - y_chart) * 1/20, legend_width, height);

				var color = color_tot.bind(undefined, D3partitionR, color_pal);

				var addTrail = addTrail_tot.bind(undefined, el);

				var param_labels = {
					show: D3partitionR.labels.visible,
					cut_off: D3partitionR.labels.cut_off,
					variable: D3partitionR.variable.label,
					style: D3partitionR.labels.style
				};

				var click_zoom;

				var obj_out = {
                    clicked_node: "none",
                    leaves: "none",
                    nodes: "none",
                    ancestors: "none",
                    children_path: "none"
                };


				////////////////////
				/////SUNBURST//////
				///////////////////
				if (D3partitionR.chart_type == 'sunburst') {

					click_zoom = draw_sunburst(root, chart, chart_height, chart_width, param_labels, color);

				}
				////////////////////
				/////icicle//////
				///////////////////
				else if (D3partitionR.chart_type == 'icicle') {

					click_zoom = draw_icicle(root, chart, chart_height, chart_width, param_labels, color);

				}

				////////////////////
				/////partition_chart//////
				///////////////////
				else if (D3partitionR.chart_type == 'partition_chart') {

					click_zoom= draw_partition_chart(root, chart, chart_height, chart_width, param_labels, color);

				}
				///////////////////////////////////
				//
				//Circle Tree map
				/////////////////////////////////////
				else if (D3partitionR.chart_type == 'circle_treemap') {
					click_zoom = draw_circle_treemap(root, chart, chart_height, chart_width, param_labels, color);
				}
				///////////////////////////////////
				//
				//Tree map
				/////////////////////////////////////
				else if (D3partitionR.chart_type == 'treemap') {

					click_zoom = draw_treemap(root, chart, chart_height, chart_width, param_labels, color);

				}

				////END of plot drawing
				//ading title and legend

				if (D3partitionR.title !== undefined) {
					add_title(D3partitionR.title, svg_grid, title_height, width)
				}
				if (D3partitionR.legend.visible) {
					addLegend(root)
				}
				if (D3partitionR.trail.visible) {

					

					trail = svg_grid.append("g")
						.attr("transform", "translate(" + 0 + "," + (y_chart - breadcrumb_height) + ")")
						.attr("id", el_id + "Trail")
						.attr('class', 'trail')

					d3.select("#" + el_id + "Trail").append('rect')
						.attr('class', 'breadcrumb_box')
						.attr('width', '100%')
						.attr('height', breadcrumb_height)
						.attr('fill', 'white')
						.attr("opacity", 0.8)

					addTrail(root);

				}

				d3.select(el).selectAll('.d3_partitionR_tooltip').remove()

				var tooltip=d3.select(el).append('div')
				             .attr('class','hidden d3_partitionR_tooltip')
				             .attr('id','tooltip_'+el_id);





        var tether;

				chart.selectAll(".d3_partition_node")
				  	.style("stroke", 'black')
					  .style("stroke-width", 2)
					.on("click", function(d) {

						tooltip_pos=click_zoom(d);
						if (D3partitionR.trail.visible)
							addTrail(d);
						if (D3partitionR.legend.visible & D3partitionR.legend.zoom_subset)
							addLegend(d);
						if (D3partitionR.legend.shiny_input!==undefined)
						{
						  if (D3partitionR.shiny_input.enabled_inputs.clicked_node)
						  {
						    obj_out.clicked_node=d.data;
						  }
						  if (D3partitionR.shiny_input.enabled_inputs.leaves)
						  {
						    obj_out.enabled_inputs.leaves=getAllLeaves(d);
						  }
						  if (D3partitionR.shiny_input.enabled_inputs.nodes)
						  {
						    obj_out.enabled_inputs.nodes=getAllNodes(d);
						  }
						  if (D3partitionR.shiny_input.enabled_inputs.ancestors)
						  {
						    obj_out.enabled_inputs.ancestors=getAncestors(d);
						  }
						  if (D3partitionR.shiny_input.enabled_inputs.children_path)
						  {
						    obj_out.enabled_inputs.children_path=getAncestors(d);
						  }
						  Shiny.onInputChange(D3partitionR.shiny_input.input_id, obj_out);


						}

					})
					.on('mousemove', function (d) {
					  d3.select(this).classed('hovered_node_'+el_id, true)
					  .style("stroke", 'white')
					  .style("stroke-width", 2);
					  d3.select( '#tooltip_'+el_id).classed('hidden', false)
					        .html(eval(D3partitionR.tooltip.builder))
					        .attr('style',D3partitionR.tooltip.style);

					  tether= new Tether({
                element: '#tooltip_'+el_id,
                target: '.hovered_node_'+el_id,
                attachment: 'middle center',
                targetAttachment: 'top center',
            });

					}

					  )
        .on('mouseout', function () {
          d3.select(this).classed('hovered_node_'+el_id, false).style("stroke", 'black');
          setTimeout(function(){
    d3.select( '#tooltip_'+el_id).classed('hidden', true);
}, 1000);


        });





			},

			resize: function(width, height) {

				// TODO: code to re-render the widget with a new size

			}

		};
	}
});
