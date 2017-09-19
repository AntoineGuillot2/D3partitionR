
//add title to an svg grid
function add_title(title, svg_grid, title_height, width) {

			svg_grid.append("rect")
				.attr("width", "102%")
				.attr("height", title_height)
				.style("fill", "white")

			svg_grid.append('g').append("text")
				.attr('class', 'partitionTitle')
				.text(title.text)
				.attr("text-anchor", "middle")
				.attr("transform", "translate(" + width / 2 + "," + title_height * 2 / 3 + ")")

			if (title.style !== null) {
				svg_grid.select('.partitionTitle').attr("style", title.style);
			}
		}

//Get the name and the value of all parents
function getParentPathAndValue(obj, accu) {
			accu.push({
				name: obj.data.name,
				value: obj.data.value,
				color: obj.color
			})
			if (obj.parent) {
				return (getParentPathAndValue(obj.parent, accu))
			} else {

				//Base case, we need to reverse to get the list from the root to the node
				return accu.reverse()
			}
		}

/////////////////////////////
// Breadcrumb generation ////
//
var b = {
			w: 30,
			h: 30,
			s: 3,
			t: 10
};

function breadcrumbPoints(i,b_tp) {

			var points = [];
			points.push("0,0");
			points.push(b_tp.w + ",0");
			points.push(b_tp.w + b_tp.t + "," + (b_tp.h / 2));
			points.push(b_tp.w + "," + b_tp.h);
			points.push("0," + b_tp.h);
			if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
				points.push(b_tp.t + "," + (b_tp.h / 2));
			}
			return points.join(" ");

}

//Draw the trail
function addTrail_tot( el,obj) {


				el_id = el.getAttribute('id');

				d3.select("#" + el_id + "Trail")
					.selectAll("g").remove();

				var accu_init = [];
				currentPath = getParentPathAndValue(obj, accu_init);

				var trail = d3.select("#" + el_id + "Trail")
					.selectAll("g")
					.data(currentPath)

				var entering = trail.enter()
					.append("svg:g");

				var x_index=[0];
				var current_index=0;

				text=d3.select("#" + el_id + "Trail").append('g')
            .selectAll('.dummyText_d3partitionR')
            .data(currentPath)
            .enter()
            .append("text")
				    .text(function(d) {
				      return d.name;
				    	})
					.attr("x",
					function(d,i)
					{
					  return((b.w + b.t) / 2);
					})
					.each(function(d,i)
					{
					  text_length=this.getBoundingClientRect().width;
					  var n_increment=Math.floor(text_length/b.w)+1;
					  current_index=x_index[i]+n_increment;
					  x_index.push(current_index);
					  this.remove;
					}
					)

				text.remove()

				entering.append("svg:polygon")
					.attr("points", function(d,i){

					  var b_tp={
			              w: (x_index[i+1]-x_index[i])*b.w,
			              h: b.h,
			              s: b.s,
			              t: b.t
					  };
					  return breadcrumbPoints(i,b_tp)

					})
					.style("fill", function(d) {
						return d.color
					})
					.attr("transform", function(d, i) {
						return "translate(" + (x_index[i] * b.w + i * b.s) + ", 0)";
					})

			text=entering.append("svg:text")
				  .text(function(d) {
						return d.name;
					})
					.attr("x",
					function(d,i)
					{
					  return(((x_index[i+1]-x_index[i])*b.w+ b.t) / 2)
					})
					.attr("y", b.h / 2)
					.attr("dy", "0.35em")
					.attr("text-anchor", "middle")
					.attr("transform", function(d, i) {
						return "translate(" + (x_index[i] * b.w + i * b.s) + ", 0)";
					})


		}

//create a color scale
function set_color_scale(color_scale) {
			color_rgb = [];

			for (var i in color_scale.palette) {
				color_rgb.push(d3.rgb(color_scale.palette[i]));
			}
			if (color_scale.type == 'continuous') {
				return d3.scaleLinear()
					.domain([color_scale.min, color_scale.max])
					.interpolate(d3.interpolateRgb)
					.range(color_rgb);

			} else {

				var keys = [];
				for (var k in color_scale.palette) keys.push(k);
				return d3.scaleOrdinal()
					.domain(keys)
					.range(color_rgb);

			}

		}

		//Return the color of a given node
		function color_tot(D3partitionR, color_pal, d) {
				if (D3partitionR.color_scale.type == "continuous") {
					d.color = color_pal(d.data[D3partitionR.variable.color]);
					return d.color;
				} else {
					d.color = color_pal(d.data[D3partitionR.variable.color]);
					return d.color;
				}


		}

		//Function to draw and redraw a legend
		function addLegend_tot(svg, D3partitionR, color_scale, x_pos, y_pos, legend_width, legend_height, current_node) {

			if (d3.select('.legendbox').empty()) {
				svg.append("rect")
					.attr('class', 'legendbox')
					.attr("width", "100%")
					.attr("height", legend_height)
					.attr("fill", "white")
					.attr("transform", "translate(" + (x_pos - legend_width * 1 / 4) + "," + 0 + ")")
					.attr("opacity", 0.8);
			}

			if (d3.select('.legend').empty()) {
				svg.append("g")
					.attr("class", "legend")
					.attr("transform", "translate(" + x_pos + "," + (y_pos) + ")");
			} else {
				d3.select('.legend').selectAll('*').remove();
			}

			children_names = []
			for (var i in current_node.children) {
			  if (current_node.children[i].data[D3partitionR.variable.color]!==undefined)
				children_names.push(current_node.children[i].data[D3partitionR.variable.color])
			}

			if (D3partitionR.color_scale.type == 'discrete') {
				var legend = d3.legendColor()
					.shapePadding(10)
					.title(
						function() {
							if (D3partitionR.variable.color != 'auto')
								return D3partitionR.variable.color
							else
								return 'Name'
						})
					.cellFilter(function(d) {
					  if (D3partitionR.legend.zoom_subset==false)
					  {
					    return true
					  }
					  else
					  {
					    var res = false;
						  for (var current_child in children_names) {
  							if (children_names[current_child] == d.label) {
  								res = true;
  							}

						  }
						  return res
					  }

					})
					.scale(color_scale)
					.labelWrap(legend_width/2);
			} else if (D3partitionR.color_scale.type == 'continuous') {
				var legend = d3.legendColor()
					.shapeHeight(30)
					.shapeWidth(10)
					.cells(5)
					.title(
						function() {
							if (D3partitionR.variable.color != 'auto')
								return D3partitionR.variable.color
							else
								return 'Depth'
						})
					.scale(color_scale);
			}

			svg.select(".legend")
				.call(legend);

		}

function add_value_variable(old_variable,nested_data)
{
  if (nested_data.children===undefined)
  {
    nested_data.value=nested_data[old_variable]
    return nested_data
  }
  else
  {
    for (child in nested_data.children)
    {
      nested_data.children[child]=add_value_variable(old_variable,nested_data.children[child])
    }
    nested_data.value=nested_data[old_variable]
    return nested_data
  }
}
