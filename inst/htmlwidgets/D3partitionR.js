HTMLWidgets.widget({

  name: 'D3partitionR',

  type: 'output',

  factory: function(el, width, height) {
    
    
    function absolutePercentString(max,current,print)
  {
      if (print)
       {return("<tr><th>From the beginning</th><td>"+ Math.round(current/max*1000)/10 +"% </td>");}
      else
      return("");
  }
  
    function relativePercentString(max,current,print)
  {
      if (print)
      {return("<tr><th>From previous step</th><td>"+ Math.round(current/max*1000)/10 +"% </td>");}
      else
      return("");
  }



    return {

      renderValue: function(input_x) {

//removing previous element
d3.select(el).select(".D3partitionR div svg").remove();
d3.select("div .my_tooltip").remove();

//defining color palette
  var color_input = input_x.legend.color

  var color_seq = d3.scale.linear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);
  var color_cat = d3.scale.category20c();



var max_value=input_x.root.cumulative_value;

//creating tooltip
var div = d3.select(el).append("div")
    .attr("class", "my_tooltip")
    .style("opacity", 0);


  var margin = {top: 20, right: 0, bottom: 0, left: 0};
    width = 700,
    height = 400 - margin.top - margin.bottom,
    formatNumber = d3.format(",d"),
    margin=20;

//defining width, height, ...
  if (input_x.width)
  {
    width=input_x.width;
  }
    if (input_x.height)
  {
    height=input_x.height;
  }
  var x = d3.scale.linear()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([0, height]);

  if (input_x.units)
  {
    var units=input_x.units
  }
  else
  {
    var units='number'
  }

  if (!color_input)
  {
    var color_input={};
  }

  

//function to manage node color 
function colorizeNode(d)
{
  console.log(d)
  if (d.name in color_input)
        {
          d.color=color_input[d.name];
          return color_input[d.name]
        }
        else
        {
          if (input_x.legend.type=="sequential")
          {
            if (d.parent)
            {
            d.color=d3.rgb(d.parent.color).darker(0.5)
            return d.color
            }
            else
            {
              d.color=color_seq(d.depth);
              return d.color;
            }
          }
          else
          {
            d.color=color_cat(d.name);
            return d.color;
          }
        }
}

//function to add legend
function drawLegend(color_input,layout_type,legend_style) {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 75, h: 30, s: 3, r: 3
  };
  if (layout_type=='circular')
  {
    var legendLeft=Math.min(height,width) + 2*margin;
  }
  else if (layout_type=='rect')
  {
    var legendLeft=width + 2*margin;
  }

  var legend = d3.select(el).append("svg")
      .attr('class','partitionLegend')
      .attr("width", li.w+li.h)
      .attr("height", d3.keys(color_input).length * (li.h + li.s))
      .style("left", legendLeft + "px")
      .style("top", height/3 + "px");


  var g = legend.selectAll("g")
      .data(d3.entries(color_input))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.h)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("class","legendText")
      .attr("x", li.h)
      .attr("y", li.h/2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "right")
      .text(function(d) { return d.key; });
   d3.select(el).select('.legendText').attr("style",legend_style);
}

//function to add a title
  function addTitle(title){
    console.log(title)
    if (title.text)
{      
  var title_svg=d3.select(el).append("text")
        .attr('class','partitionTitle')
        .text(title.text);
        
 d3.select(el).select('.partitionTitle').attr("style",title.style);
  title_svg.style("left", (width /2) + "px")
        .style("top", (margin/2) + "px")
        .attr("text-anchor", "middle")
        .style("font-size", function(){
          if (title.fontSize=="auto")
          {
            return "24px"
          }
          else
           return title.fontSize
        });
  }
  }
  



if (input_x.type=='circleTreeMap')
{


diameter = Math.min(height,width) - 10;
var layout_type='circular';



var pack = d3.layout.pack()
    .padding(2)
    .size([diameter - margin, diameter - margin])
    .value(function(d) { return d.value; })

var svg_circle = d3.select(el).append("div").append("svg")
    .attr("width", diameter)
    .attr("height", diameter + margin)
    .style('text-align','center')
    .attr("class", "CircleTreeMapR")
    .append("g")
    .attr("transform", "translate(" + (diameter) / 2 + "," +( 2*margin + diameter )/ 2 + ")");


function draw_circle(root) {


  var focus = root,
      nodes = pack.nodes(root),
      view;


  var circle = svg_circle.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("class", function(d) { return d.parent ?  "node"  : "node node--root"; })
      .attr("id", function(d,i) { return "Circle_"+i; })
      .style("fill",function(d) {
        return colorizeNode(d)
        
      })
      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });
      
  var hidden_arc=svg_circle.selectAll(".hiddenArc")
      .data(nodes)
      .enter().append("circle")
      .append("path")
			.attr("class", "hiddenArc")
			.attr("id", function(d, i) { return "circleArc_"+i; })
			.attr("d", function(d,i) { return "M "+ -d.r +" 0 A "+ d.r +" "+ d.r +" 0 0 1 "+ d.r +" 0"; })
			.style("fill", "none");

  var text = svg_circle.selectAll(".label")
      .data(nodes)
      .enter().append("text")
      .attr("class", "label")
      .style("fontSize","40px")
      .style("display", function(d) { return  d.parent === root ? "inline" :"none" ; })
      .append("textPath")
	    .attr("xlink:href",function(d,i){return "#circleArc_"+i;})
	    .style("text-anchor","middle") //place the text halfway on the arc
	     .attr("startOffset", "50%")
      .text(function(d) { return d.name; })
      ;

  var node = svg_circle.selectAll("circle,text");

  var node_part=svg_circle.selectAll("circle");
    node_part.on("mousemove", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
                div .html("<table style='width:100%'><tr><th>Name:</th><td>"+ d.name + "</td>"+
                          "<tr><th>"+ units +"</th><td>"+ d.value +"</td>"+
                          absolutePercentString(max_value,d.value,input_x.tooltipOptions.showAbsolutePercent)+
                          relativePercentString(d.parent.value,d.value,input_x.tooltipOptions.showRelativePercent)
                          +"</table>")
                    .style("left", (d3.event.pageX - 20) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

  d3.select(el)
      .on("click", function() { zoom(root); });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    

      var focus0 = focus; focus = d;
      console.log(focus)
      var v = [focus.x, focus.y, focus.r * 2 + margin],
		k = (diameter) / v[2]; 


   d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });
  
  d3.selectAll(".hiddenArc")
      .attr("d", function(d,i) 
      { return "M "+ (-d.r*k) +" 0 A "+ (d.r*k) +" "+ (d.r*k) +" 45 0 1 "       + (d.r*k) +" 0"; });
      
    d3.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .style("display", function(d) { return d.parent === focus ? "inline" :"none" ; })
      
    
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }
}
draw_circle(input_x.root);
d3.select(self.frameElement).style("height", diameter + "px");
}
else if (input_x.type=='treeMap')
{

  x=x.domain([0, width]);
  y=y.domain([0, height]);
  var transitioning;
  var layout_type='rect';

var treemap = d3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d._children; })
    .sort(function(a, b) { return a.value - b.value; })
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

var svg = d3.select(el).append("svg")
    .attr("width", width + margin + margin)
    .attr("height", height + margin + margin)
    .style("margin-left", -margin+ "px")
    .style("margin.right", -margin + "px")
    .append("g")
    .attr("class", "treeMap")
    .attr("transform", "translate(" + (margin) + "," + 2*margin + ")")
    .style("shape-rendering", "crispEdges");

var grandparent = svg.append("g")
    .attr("class", "grandparent");

grandparent.append("rect")
    .attr("y", -margin)
    .attr("width", width)
    .attr("height", margin);

grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin)
    .attr("dy", ".75em");


  initialize(input_x.root);
  accumulate(input_x.root);
  layout(input_x.root);
  display(input_x.root);


  function initialize(root) {

    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    return (d._children = d.children)
        ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
        : d.value;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d._children) {
      treemap.nodes({_children: d._children});
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .attr("class","label")
        .text(name(d));

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
      .enter().append("g");

    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("mousemove", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
                div .html("<table style='width:100%'><tr><th>Name:</th><td>"+ d.name + "</td>"+
                          "<tr><th>Numbers:</th><td>"+ d.value +"</td>"+
                          absolutePercentString(max_value,d.value,input_x.tooltipOptions.showAbsolutePercent)+
                          relativePercentString(d.parent.value,d.value,input_x.tooltipOptions.showRelativePercent)+"</table>")
                    .style("left", (d3.event.pageX - 20) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", transition);

    g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
        .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    g.append("rect")
        .attr("class", "parent")
        .style("fill",function(d) {return colorizeNode(d)})
        .call(rect)
      .append("title");




    g.append("text")
        .attr("dy", ".75em")
        .attr("class","label")
        .text(function(d) { return d.name; })
        .call(text);

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
  }

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  function name(d) {
    return d.parent
        ? name(d.parent) + "." + d.name
        : d.name;
  }

}
else if (input_x.type=='partitionChart')
{
  var layout_type='rect';

   var x = d3.scale.linear().range([0, width]),
    y = d3.scale.linear().range([0, height]);

var vis = d3.select(el).append("div")
    .attr("class", "partitionChart")
    .style("width", (width + margin) + "px")
    .style("height", (height + margin) + "px")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height);

var partition = d3.layout.partition()
    .value(function(d) { return d.value; });

draw_partition(input_x.root);
function draw_partition(root) {
  var g = vis.selectAll("g")
      .data(partition.nodes(root))
    .enter().append("svg:g")
      .attr("transform", function(d) { return "translate(" +x(d.y) + "," + (y(d.x)) + ")"; })
      .on("click", click)
      ;

  var kx = width / root.dx,
      ky = height / 1;

  g.append("svg:rect")
      .attr("width", root.dy * kx)
      .attr("height", function(d) { return d.dx * ky; })
      .attr("class", function(d) { return d.children ? "parent" : "child"; })
        .style("fill",function(d) {return colorizeNode(d)
      })
      .on("mousemove", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
                div .html("<table style='width:100%'><tr><th>Name:</th><td>"+ d.name + "</td>"+
                          "<tr><th>Numbers:</th><td>"+ d.value +"</td>"+
                          absolutePercentString(max_value,d.value,input_x.tooltipOptions.showAbsolutePercent)+
                          relativePercentString(d.parent.value,d.value,input_x.tooltipOptions.showRelativePercent)+"</table>")
                    .style("left", (d3.event.pageX - 20) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            })
      .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

  g.append("svg:text")
      .attr("transform", transform)
      .attr("dy", ".35em")
      .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
      .attr("class","label")
      .text(function(d) { return d.name; })

  d3.select(window)
      .on("click", function() { click(root); })

  function click(d) {
    if (!d.children) return;

    kx = (d.y ? width - 40 : width) / (1 - d.y);
    ky = height / d.dx;
    x.domain([d.y, 1]).range([d.y ? 40 : 0, width]);
    y.domain([d.x, d.x + d.dx]);

    var t = g.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .attr("transform", function(d) { return "translate(" + (x(d.y)) + "," + y(d.x) + ")"; });

    rect_node=t.select("rect")
        .attr("width", d.dy * kx)
        .attr("height", function(d) { return d.dx * ky; });



    t.select("text")
        .attr("transform", transform)
        .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });

    d3.event.stopPropagation();
  }

  function transform(d) {
    return "translate(8," + d.dx * ky / 2 + ")";
  }

}}
else if (input_x.type=='sunburst')
{

  var layout_type='circular';
  var radius = (Math.min(width, height) / 2) - margin;
  var formatNumber = d3.format(",d");
  var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);
  var y = d3.scale.sqrt()
    .range([0, radius]);
  var color = d3.scale.category20c();
  var partition = d3.layout.partition()
    .value(function(d) { return d.value; });
  var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
  var svg = d3.select(el).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class",'sunburst')
    .append("g")
    .attr("transform", "translate(" + (radius + margin ) + "," + (radius + 2*margin) + ")");

  draw_sunburst(input_x.root)
function draw_sunburst( root) {


  svg.selectAll("path")
      .data(partition.nodes(root))
      .enter().append("path")
      .attr("class","sunburstArc")
      .attr("d", arc)
        .style("fill",function(d) {return colorizeNode(d)})
      .on("mousemove", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
                div .html("<table style='width:100%'><tr><th>Name:</th><td>"+ d.name + "</td>"+
                          "<tr><th>Numbers:</th><td>"+ d.value +"</td>"+
                          absolutePercentString(max_value,d.value,input_x.tooltipOptions.showAbsolutePercent)+
                          relativePercentString(d.parent.value,d.value,input_x.tooltipOptions.showRelativePercent)+"</table>")
                    .style("left", (d3.event.pageX - 20) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
      .on("click", click);
};

function click(d) {
  svg.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
    .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
}

d3.select(self.frameElement).style("height", height + "px");
}
else if (input_x.type=='collapsibleIndentedTree')
{

var layout_type='rect';
var barHeight = 20,
 barWidth = width * .8;

var i = 0,
    duration = 400,
    root;

var tree = d3.layout.tree()
    .nodeSize([0, 20]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select(el).append("svg")
    .attr("width", width + 2*margin)
    .append("g")
    .attr("transform", "translate(" + margin+ "," + margin + ")");

function drawIndentedTree(flare) {
  flare.x0 = 0;
  flare.y0 = 0;
  update(root = flare);
};

function update(source) {
  // Compute the flattened node list. TODO use d3.layout.hierarchy.
  var nodes = tree.nodes(root);

  d3.select("svg").transition()
      .duration(duration)
      .attr("height", height);

  d3.select(self.frameElement).transition()
      .duration(duration)
      .style("height", height + "px");

  // Compute the "layout".
  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.
  


  if (input_x.specificOptions && input_x.specificOptions.bar)
    {
      nodeEnter.append("rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", function(d) {return(d.cumulative_value / max_value * width * 0.8);})
        .style("fill", color)
        .style("z-index",1)
        .on("click", click);
    
      nodeEnter.append("rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", function(d) {return( width * 0.8);})
        .style("fill", color)
        .style("opacity",0.2)
        .on("click", click);
      
    }
  else
  {
    nodeEnter.append("rect")
      .attr("y", -barHeight / 2)
      .attr("height", barHeight)
      .attr("width", function(d) {return(width * 0.8);})
      .style("fill", color)
      .style("z-index",1)
      .on("click", click);
  }
  

  nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .attr("class","label")
      .text(function(d) { return d.name+ ": "+ d.cumulative_value; });

  // Transition nodes to their new position.
  nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);

  node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")
    .style("fill",function(d) {return colorizeNode(d)});

  // Transition exiting nodes to the parent's new position.
  node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .style("opacity", 1e-6)
      .remove();

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

drawIndentedTree(input_x.root)
}

drawLegend(color_input,layout_type,input_x.legend.style);
addTitle(input_x.title);
console.log(d3.select(el).select('.label'))
d3.select(el).selectAll('.label').attr("style",input_x.labelStyle);

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
