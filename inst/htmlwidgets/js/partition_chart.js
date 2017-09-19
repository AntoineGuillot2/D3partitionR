function draw_partition_chart(root, chart, chart_height, chart_width,param_labels,color)
{
  var partition = d3.partition();

  var x = d3.scaleLinear()
  	.range([0, chart_width]);

  var y = d3.scaleLinear()
  	.range([0, chart_height]);

  partition = partition.size([chart_height, chart_width]);
  root = root.sort(function(a, b) {
  	return b.value - a.value;
  });

  nodes = chart.selectAll("g")
  	.data(partition(root).descendants())
  	.enter().append('g')

  ///Adding rectangle

  rect = nodes.append("rect")
  	.attr("x", function(d) {
  		return d.y0;
  	})
  	.attr("y", function(d) {
  		return d.x0;
  	})
  	.attr("width", function(d) {
  		return d.y1 - d.y0;
  	})
  	.attr("height", function(d) {
  		return d.x1 - d.x0;
  	})
  	.attr("fill", function(d) {
  		return color(d);
  	})
  	.attr('class','d3_partition_node')


  //Adding labels

if (param_labels.show===true)
{
  labels = nodes.append('text')
  	.attr('class', "d3_partition_label")
  	.attr('x', function(d) {
  		return (d.y0)
  	})
  	.attr('y', function(d) {
  		return (d.x0 + d.x1) / 2
  	})
  	.text(function(d) {
  		return d.data[param_labels.variable]
  	})

  labels.filter(function(d) {
  		return d.data.value < root.data.value * param_labels.cut_off
  	})
  	.attr('visibility', 'hidden')

  	if (param_labels.style!==undefined)
		{
		  labels.attr('style',param_labels.style)
		}
}


  function click_partition(d) {
  	var clicked_node_size = d.data.value
  	y.domain([d.x0, d.x1]);
  	x.domain([d.y0, chart_width]).range([d.depth ? 20 : 0, chart_width]);

  	rect.transition()
  		.duration(750)
  		.attr("x", function(d) {
  			return x(d.y0);
  		})
  		.attr("y", function(d) {
  			return y(d.x0);
  		})
  		.attr("width", function(d) {
  			return x(d.y1) - x(d.y0);
  		})
  		.attr("height", function(d) {
  			return y(d.x1) - y(d.x0);
  		});

  	if (param_labels.show===true)
  	{
  	  labels.transition()
  		.duration(750)
  		.attr('x', function(d) {
  			return x(d.y0)
  		})
  		.attr('y', function(d) {
  			return y((d.x0 + d.x1) / 2)
  		})

  	labels.filter(function(d) {
  			return d.data.value > clicked_node_size * param_labels.cut_off;
  		})
  		.attr('visibility', 'visible')

  	labels.filter(function(d) {
  			return d.data.value < clicked_node_size * param_labels.cut_off
  		})
  		.attr('visibility', 'hidden')
  	}


  }






  return(click_partition)
}
