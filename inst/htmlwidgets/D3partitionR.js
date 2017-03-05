HTMLWidgets.widget({

    name: 'D3partitionR',

    type: 'output',

    factory: function(el, width, height) {


        // Generate a string that describes the points of a breadcrumb polygon.
        function breadcrumbPoints(d, i) {
            var points = [];
            points.push("0,0");
            points.push(b.w + ",0");
            points.push(b.w + b.t + "," + (b.h / 2));
            points.push(b.w + "," + b.h);
            points.push("0," + b.h);
            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                points.push(b.t + "," + (b.h / 2));
            }
            return points.join(" ");
        }
        //breadcrum parameters
        var b = {
            w: 55,
            h: 30,
            s: 3,
            t: 10
        };


        //compute the proportion of x left from the beginning
        function absolutePercentString(max, current, print) {
            if (print) {
                return ("<tr><th>From the beginning</th><td>" + Math.round(current / max * 1000) / 10 + "% </td>");
            } else
                return ("");
        }
        //compute the proprtion of x left from previous step
        function relativePercentString(max, current, print) {
            if (print) {
                return ("<tr><th>From previous step</th><td>" + Math.round(current / max * 1000) / 10 + "% </td>");
            } else
                return ("");
        }
        //recursive function which compute the depth of a tree
        function getDepth(obj) {
            var depth = 0;
            //restrict to node with children
            if (obj.children) {
                obj.children.forEach(function(d) {
                    //getting depth of all the children
                    var tmpDepth = getDepth(d)
                    //only keeping the max depth
                    if (tmpDepth > depth) {
                        depth = tmpDepth
                    }
                })
            }
            return 1 + depth
        }

        //Getting all the path of a given tree i?e? all the succession of nodes
        function getChildPath(obj, accu, start, zoomLayout) {
            var res = [];
            var accu_tp = accu.concat([obj.name]);
            var visibleChildren = false;
            //restricting to node with children
            if (obj.children) {
              //distinction betwenn root, ongoing nodes and starting node
                if (!start) {
                    obj.children.forEach(function(d) {
                        if (zoomLayout | d.is_visible) {
                            res = res.concat(getChildPath(d, accu_tp, false, zoomLayout))
                            visibleChildren = true
                        }
                    })
                } else if (obj.is_root) {
                    obj.children.forEach(function(d) {
                        if (zoomLayout || d.is_visible) {
                            res = res.concat(getChildPath(d, accu_tp, true, zoomLayout))
                            visibleChildren = true

                        }
                    })
                } else {
                    obj.children.forEach(function(d) {
                        if (zoomLayout || d.is_visible) {
                            res = res.concat([getChildPath(d, accu_tp, false, zoomLayout)])
                            visibleChildren = true
                        }
                    })
                }
            }
            // taking into account _children (useful for the treemap layout)
            else if (obj._children) {
                if (!start) {
                    obj._children.forEach(function(d) {
                        if (zoomLayout || d.is_visible) {
                            res = res.concat(getChildPath(d, accu_tp, false, zoomLayout))
                            visibleChildren = true
                        }
                    })
                } else if (obj.is_root) {
                    obj._children.forEach(function(d) {
                        if (zoomLayout || d.is_visible) {
                            res = res.concat(getChildPath(d, accu_tp, true, zoomLayout))
                            visibleChildren = true

                        }
                    })
                } else {
                    obj._children.forEach(function(d) {
                        if (zoomLayout || d.is_visible) {
                            res = res.concat([getChildPath(d, accu_tp, false, zoomLayout)])
                            visibleChildren = true
                        }

                    })
                }
            } 
            //base case
            else 
            {
                res = accu_tp;
                visibleChildren = true;
            }
            //case when no visible children
            if (!visibleChildren) {
                res = res.concat([accu_tp]);
            }

            return res
        }

        //going up in the tree to get the path to the root
        function getParentPath(obj, accu) {
            var accu_tp = accu.concat(obj.name);
            if (obj.parent) {
                return (getParentPath(obj.parent, accu_tp))
            } else {
                return (accu_tp)
            }
        }
        //Function used for the trail
        //Return the list of {name,value,color} from this node to the root
        function getParentPathAndValue(obj, accu) {
            accu.push({
                name: obj.name,
                value: obj.value,
                color: obj.color
            })
            if (obj.parent) {
                return (getParentPathAndValue(obj.parent, accu))
            } else
            {
              
            //Base case, we need to reverse to get the list from the root to the node
                return accu.reverse()
            }
        }
        //Function to get all leaf of a given tree
        //Used in the shiny output; mays be useful when the real information is located in the nodes
        function getAllLeaf(obj, zoomLayout) {
            res = []
            var visibleChildren = false;
            if (obj.children) {
                obj.children.forEach(function(d) {
                    if (zoomLayout | d.is_visible) {
                        res = res.concat(getAllLeaf(d, zoomLayout))
                        visibleChildren = true;
                    }
                })
            } else if (obj._children) {
                obj._children.forEach(function(d) {
                    if (zoomLayout | d.is_visible) {
                        res = res.concat(getAllLeaf(d, zoomLayout))
                        visibleChildren = true;
                    }
                })
            } else {
                res = obj.name;
                visibleChildren = true;
            }
            if (!visibleChildren) {
                res = obj.name;
            }
            return (res)
        }
        //Returning all nodes of the current tree
        function getAllNodes(obj, zoomLayout) {
            res = []
            if (obj.children) {
                res = res.concat(obj.name);
                obj.children.forEach(function(d) {
                    if (zoomLayout | d.is_visible)
                        res = res.concat(getAllNodes(d, zoomLayout));
                })
            } else if (obj._children) {
                res = res.concat(obj.name);
                obj._children.forEach(function(d) {
                    if (zoomLayout | d.is_visible)
                        res = res.concat(getAllNodes(d, zoomLayout));
                })
            } else {
                res = obj.name;
            }
            return (res)
        }
        



        return {

            renderValue: function(input_x) {
              

                //Initialisatio of the output
                var obj_out = {
                    clickedStep: "none",
                    currentPath: "none",
                    visiblePaths: "none",
                    visibleLeaf: "none",
                    visibleNode: "none"
                };
                
                $(el).parent()[0].style.height = height
                $(el).parent()[0].style.width = width+"px"
                console.log($(el).parent()[0].style.width)
                console.log($(el).parent()[0])
                //Initilalize the trail where the current sequence will be displayed
                function InitializeTrail(svg_grid) {

                    if (input_x.trail) {
                      margin_top = margin;
                      if (input_x.title.no_draw == null) {

                            margin_top = margin_top + 60
                        }
                        
                        //Append a white rectangle to avoid problm when zooming 
                        svg_grid.append("g").append("rect")
                            .attr("width", "102%")
                            .attr("height", 82)
                            .style("fill", "white")
                            .attr("transform", "translate(" + 0 + "," + (margin_top - margin - 2) + ")")

                        //remove previous trail
                        d3.select(el).selectAll(".D3partitionR .trail").remove();
                        el_id = el.getAttribute('id')
                        //add trail to the svg svg_grid
                        svg_grid.append("g")
                            .attr("transform", "translate(" + margin + "," + margin_top + ")")
                            .attr("id", el_id + "Trail")
                            .attr('class', 'trail')



                    }
                }
                //Computing margin chart depending on the user input
                function marginChart() {
                    margin_top_chart = 0;
                    margin_right = 20;
                    if (input_x.title.no_draw == null) {
                        margin_top_chart = margin_top_chart + 60
                    }
                    if (input_x.trail) {
                        margin_top_chart = margin_top_chart + 80
                    }
                    if (!input_x.legend.no_show) {
                        margin_right = margin_right + 120
                    }
                    return {
                        top: margin_top_chart,
                        right: margin_right,
                        left: margin,
                        bottom: margin
                    }
                }
                
                //Draw the trail
                function DrawTrail(obj) {
                    if (input_x.trail) {
                        el_id = el.getAttribute('id')
                        d3.select("#" + el_id + "Trail")
                            .selectAll("g").remove();

                        var accu_init = [];
                        currentPath = getParentPathAndValue(obj, accu_init);

                        var trail = d3.select("#" + el_id + "Trail")
                            .selectAll("g")
                            .data(currentPath)


                        var entering = trail.enter()
                            .append("svg:g")


                        step_padding = b.w;
                        entering.append("svg:polygon")
                            .attr("points", breadcrumbPoints)
                            .style("fill", function(d) {
                                return d.color
                            })
                            .style('opacity', 0.6)
                            .style("stroke", 'black')
                            .style("stroke-opacity", 1)
                            .style("stroke-width", 2)
                            .attr("class", "trailStep")
                            .attr("node_name", function(d) {
                                return (d.name)
                            })
                            .attr("value", function(d) {
                                return (d.value)
                            })

                        entering.append("svg:text")
                            .attr("x", (b.w + b.t) / 2)
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function(d) {
                                return d.name;
                            });


                        trail.attr("transform", function(d, i) {
                            0
                            return "translate(" + i * (step_padding + b.t) + ", 0)";
                        });
                        $(".trailStep").tooltip({

                            type: "popover",
                            html: true,
                            title: function() {
                                return "<table style='width:100%'><tr><th>Name:</th><td>" + this.getAttribute("node_name") + "</td>" +
                                    "<tr><th>" + "Value: " + "</th><td>" + this.getAttribute("value") + "</td>" + "</table>"
                            }
                        })

                    }

                }




                function shinyReturnOutput(obj, zoomLayout, root_in) {
                  
                  //Returning the first output before any action happens
                    if (input_x.Input.enabled) {
                        if (input_x.Input.clickedStep)
                            obj_out.clickedStep = obj.name;
                        if (input_x.Input.currentPath)
                            obj_out.currentPath = getParentPath(obj, []);
                        if (input_x.Input.visiblePaths) {
                            if (root_in)
                                obj_out.visiblePaths = getChildPath(root_in, [], true, zoomLayout);
                            else
                                obj_out.visiblePaths = getChildPath(obj, [], true, zoomLayout);
                        }
                        if (input_x.Input.visibleLeaf) {
                            if (root_in)
                                obj_out.visibleLeaf = getAllLeaf(root_in, zoomLayout);
                            else
                                obj_out.visibleLeaf = getAllLeaf(obj, zoomLayout);

                        }
                        if (input_x.Input.visibleNode) {
                            if (root_in)
                                obj_out.visibleNode = getAllNodes(root_in, zoomLayout);
                            else
                                obj_out.visibleNode = getAllNodes(obj, zoomLayout);
                        }
                        Shiny.onInputChange(input_x.Input.Id, obj_out);
                    }
                }

                //function to manage node color 
                function colorizeNode(d) {
                    if (d.name in color_input) {
                        d.color = color_input[d.name];
                        return color_input[d.name]
                    } else {
                        if (input_x.legend.type == "sequential") {
                            if (d.parent) {
                                d.color = d3.rgb(d.parent.color).darker(0.5)
                                return d.color
                            } else {
                                d.color = color_seq(d.depth);
                                return d.color;
                            }
                        } else {
                            d.color = color_cat(d.name);
                            return d.color;
                        }
                    }
                }




                //function to add legend
                function drawLegend(color_input, layout_type, legend_style, svg_grid) {
                    if (!input_x.legend.no_show) {
                            // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                        var li = {
                            w: 150,
                            h: 30,
                            s: 3,
                            r: 3
                        };
                        if (layout_type == 'circular') {
                            var legendLeft = Math.min(height_chart, width_chart) + 30;
                        } else if (layout_type == 'rect') {
                            var legendLeft = width_chart + 30;
                        }
                        
                        //appending white rect to the svg grid to avoid problem when zooming
                        svg_grid.append("rect")
                            .attr("width", 180)
                            .attr("height", "100%")
                            .style("fill", "white")
                            .attr("transform", "translate(" + legendLeft + "," + 0 + ")")

                        var legend = svg_grid.append("g")
                            .attr('class', 'partitionLegend')
                            .attr("transform", "translate(" + legendLeft + "," + height / 3 + ")");



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
                            .style("fill", function(d) {
                                return d.value;
                            });

                        g.append("svg:text")
                            .attr("class", "legendText")
                            .attr("x", li.h)
                            .attr("y", li.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "right")
                            .text(function(d) {
                                return d.key;
                            });
                        if (legend_style != null && legend_style != undefined) {
                            d3.select(el).select('.partitionLegend').attr("style", legend_style);
                        }

                    }
                }

                //function to add a title
                function addTitle(title, svg_grid) {
                    if (title.text) {
                        svg_grid.append("rect")
                            .attr("width", "102%")
                            .attr("height", 60)
                            .style("fill", "white")
                        var title_svg = svg_grid.append("g").append("text")
                            .attr('class', 'partitionTitle')
                            .text(title.text)
                            .attr("transform", "translate(" + width / 2 + "," + 2 * margin + ")");;

                        svg_grid.select('.partitionTitle').attr("style", title.style);
                        title_svg.attr("text-anchor", "middle")
                            .style("font-size", function() {
                                if (title.fontSize == "auto") {
                                    return "24px"
                                } else
                                    return title.fontSize
                            });


                    }
                }



                //removing previous element
                d3.select(el).selectAll(".D3partitionR div").remove();
                d3.select(el).selectAll(".D3partitionR .partitionLegend").remove();


                //defining color palette
                var color_input = input_x.legend.color

                var color_seq = d3.scale.linear()
                    .domain([-1, 5])
                    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
                    .interpolate(d3.interpolateHcl);
                var color_cat = d3.scale.category20c();

                function layout_type_fun(type) {
                    if (type in ['circleTreeMap', 'sunburst'])
                        return 'circular'
                    else
                        return 'rect'

                }

                var max_value = input_x.root.cumulative_value;

                //setting up chart dimmension according to user input




                width = 700,
                    height = 700,
                    formatNumber = d3.format(",d");


                //defining width, height, ...
                if (input_x.width != null && input_x.width != undefined) {
                    width = input_x.width;
                }
                if (input_x.height != null && input_x.height != undefined) {
                    height = input_x.height;
                }
                //modifying the chart dimension according to the user input


                margin = 20;
                var margin_chart = marginChart();
                width_chart = width - margin_chart.left - margin_chart.right
                height_chart = height - margin_chart.top - margin_chart.bottom


                var x = d3.scale.linear()
                    .range([0, width_chart]);

                var y = d3.scale.linear()
                    .range([0, height_chart]);

                if (input_x.units) {
                    var units = input_x.units
                } else {
                    var units = 'number'
                }

                if (!color_input) {
                    var color_input = {};
                }

                //Creating th esvg grid on which everithing will be drawn
                svg_grid = d3.select(el)
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width)






                //Creating chart area



                partitionChartArea = svg_grid
                    .append("g")
                    .attr("class", "partitionChartArea")
                    .attr("transform", "translate(" + margin_chart.left + "," + margin_chart.top + ")");


                if (input_x.type == 'circleTreeMap') {


                    diameter = Math.min(height_chart, width_chart) - 10;
                    var layout_type = 'circular';



                    var pack = d3.layout.pack()
                        .padding(0)
                        .size([diameter - margin, diameter - margin])
                        .value(function(d) {
                          console.log(d.name);
                            return d.cumulative_value;
                        })

                    var svg_circle = partitionChartArea
                        .append("g")
                        .attr("class", "CircleTreeMapR")
                        .attr("transform", "translate(" + (diameter) / 2 + "," + (2 * margin + diameter) / 2 + ")");


                    function draw_circle(root) {

                        shinyReturnOutput(root, true)
                        DrawTrail(root)

                        var focus = root,
                            nodes = pack.nodes(root),
                            view;
                            



                        var circle = svg_circle.selectAll("circle")
                            .data(nodes)
                            .enter().append("circle")
                            .attr("class", function(d) {
                                return d.parent ? "node" : "node node--root";
                            })
                            .attr("id", function(d, i) {
                                return "Circle_" + i;
                            })
                            .attr("node_name", function(d) {
                                return d.name
                            })
                            .attr("value", function(d) {
                                return d.cumulative_value
                            })
                            .attr("parent_value", function(d) {
                                if (d.parent) {
                                    return d.parent.cumulative_value
                                } else
                                    return d.cumulative_value
                            })
                            .style("fill", function(d) {
                                return colorizeNode(d)

                            })
                            .on("click", function(d) {
                                if (focus !== d) zoom_circle(d), d3.event.stopPropagation();
                                shinyReturnOutput(d, true)
                                var accu_init = [];
                                DrawTrail(d);

                            });

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

                        var text = svg_circle.selectAll(".CircleTreeMapR .label")
                            .data(nodes)
                            .enter().append("text")
                            .attr("class", "label")
                            .style("fontSize", "40px")
                            .style("display", function(d) {
                                return d.parent === root ? "inline" : "none";
                            })
                            .append("textPath")
                            .attr("xlink:href", function(d, i) {
                                return "#circleArc_" + i;
                            })
                            .style("text-anchor", "middle") //place the text halfway on the arc
                            .attr("startOffset", "50%")
                            .text(function(d) {
                                return d.name;
                            });

                        var node = svg_circle.selectAll("circle,text");

                        var node_part = svg_circle.selectAll("circle");


                        d3.select(el)
                            .on("click", function() {
                                zoom_circle(root);
                                shinyReturnOutput(root, true)
                                DrawTrail(root);
                            });

                        zoom_circleTo([root.x, root.y, root.r * 2 + margin]);

                        function zoom_circle(d) {
                            if (d.parent || d.is_root) {

                                var focus0 = focus;
                                focus = d;
                                var v = [focus.x, focus.y, focus.r * 2 + margin],
                                    k = (diameter) / v[2];


                                d3.transition()
                                    .duration(d3.event.altKey ? 7500 : 750)
                                    .tween("zoom", function(d) {
                                        var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                                        return function(t) {
                                            zoom_circleTo(i(t));
                                        };
                                    });

                                d3.selectAll(".hiddenArc")
                                    .attr("d", function(d, i) {
                                        return "M " + (-d.r * k) + " 0 A " + (d.r * k) + " " + (d.r * k) + " 45 0 1 " + (d.r * k) + " 0";
                                    });



                                d3.select(el).selectAll(".CircleTreeMapR .label")
                                    .style("fill-opacity", function(d) {
                                        if (d && d.parent) {
                                            return d.parent === focus ? 1 : 0;
                                        } else {
                                            return 0
                                        }
                                    })
                                    .style("display", function(d) {
                                        if (d && d.parent)
                                            return d.parent === focus ? "inline" : "none";
                                        else
                                            return "none"
                                    })




                            }
                        }

                        function zoom_circleTo(v) {
                            var k = diameter / v[2];
                            view = v;
                            node.attr("transform", function(d) {
                                return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
                            });
                            circle.attr("r", function(d) {
                                return d.r * k;
                            });
                        }
                    }
                    draw_circle(input_x.root);
                    d3.select(self.frameElement).style("height", diameter + "px");
                    $(".node").tooltip({

                        type: "popover",
                        html: true,
                        title: function() {
                            return "<table style='width:100%'><tr><th>Name:</th><td>" + this.getAttribute("node_name") + "</td>" +
                                "<tr><th>" + "Value: " + "</th><td>" + this.getAttribute("value") +
                                absolutePercentString(max_value, this.getAttribute("value"), input_x.tooltipOptions.showAbsolutePercent) +
                                relativePercentString(this.getAttribute("parent_value"), this.getAttribute("value"), input_x.tooltipOptions.showRelativePercent) + "</table>"
                        }

                    })




                } else if (input_x.type == 'collapsibleIndentedTree') {

                    var layout_type = 'rect';
                    var barHeight = 20,
                        barWidth = width_chart * .8;
                    var i = 0,
                        duration = 400,
                        root;

                    var tree = d3.layout.tree()
                        .nodeSize([0, 20]);

                    var diagonal = d3.svg.diagonal()
                        .projection(function(d) {
                            return [d.y, d.x];
                        });

                    var svg = partitionChartArea
                        .append("g")
                        .attr("transform", "translate(" + margin + "," + margin + ")");

                    function drawIndentedTree(flare) {

                        flare.x0 = 0;
                        flare.y0 = 0;
                        updateIdentedTree(root = flare);
                        shinyReturnOutput(root, false, root);

                    };

                    function updateIdentedTree(source) {
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
                            .data(nodes, function(d) {
                                return d.id || (d.id = ++i);
                            });

                        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .attr("transform", function(d) {
                                d.is_visible = true;
                                return "translate(" + source.y0 + "," + source.x0 + ")";
                            })
                            .style("opacity", 1e-6);

                        // Enter any new nodes at the parent's previous position.



                        if (input_x.specificOptions && input_x.specificOptions.bar) {
                            nodeEnter.append("rect")
                                .attr("y", -barHeight / 2)
                                .attr("height", barHeight)
                                .attr("width", function(d) {
                                    return (d.cumulative_value / max_value * width_chart * 0.8);
                                })
                                .style("fill", color)
                                .style("z-index", 1)
                                .on("click", click);

                            nodeEnter.append("rect")
                                .attr("y", -barHeight / 2)
                                .attr("height", barHeight)
                                .attr("width", function(d) {
                                    return (width_chart * 0.8);
                                })
                                .style("fill", color)
                                .style("opacity", 0.2)
                                .on("click", click);

                        } else {
                            nodeEnter.append("rect")
                                .attr("y", -barHeight / 2)
                                .attr("height", barHeight)
                                .attr("width", function(d) {
                                    return (width_chart * 0.8);
                                })
                                .style("fill", color)
                                .style("z-index", 1)
                                .on("click", click);
                        }


                        nodeEnter.append("text")
                            .attr("dy", 3.5)
                            .attr("dx", 5.5)
                            .attr("class", "label")
                            .text(function(d) {
                                return d.name + ": " + d.cumulative_value;
                            });

                        // Transition nodes to their new position.
                        nodeEnter.transition()
                            .duration(duration)
                            .attr("transform", function(d) {
                                return "translate(" + d.y + "," + d.x + ")";
                            })
                            .style("opacity", 1);

                        node.transition()
                            .duration(duration)
                            .attr("transform", function(d) {
                                return "translate(" + d.y + "," + d.x + ")";
                            })
                            .style("opacity", 1)
                            .select("rect")
                            .style("fill", function(d) {
                                return colorizeNode(d);
                            });

                        // Transition exiting nodes to the parent's new position.
                        node.exit().transition()
                            .duration(duration)
                            .attr("transform", function(d) {
                                d.is_visible = false;
                                return "translate(" + source.y + "," + source.x + ")";
                            })
                            .style("opacity", 1e-6)
                            .remove();

                        // Update the links…
                        var link = svg.selectAll("path.link")
                            .data(tree.links(nodes), function(d) {
                                return d.target.id;
                            });

                        // Enter any new links at the parent's previous position.
                        link.enter().insert("path", "g")
                            .attr("class", "link")
                            .attr("d", function(d) {
                                var o = {
                                    x: source.x0,
                                    y: source.y0
                                };
                                return diagonal({
                                    source: o,
                                    target: o
                                });
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
                                var o = {
                                    x: source.x,
                                    y: source.y
                                };
                                return diagonal({
                                    source: o,
                                    target: o
                                });
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
                        updateIdentedTree(d);
                        shinyReturnOutput(d, false, root);
                    }

                    drawIndentedTree(input_x.root)
                } else if (input_x.type == 'treeMap') {

                    x = x.domain([0, width_chart]);
                    y = y.domain([0, height_chart]);
                    var transitioning;
                    var layout_type = 'rect';

                    var treemap = d3.layout.treemap()
                        .children(function(d, depth) {
                            return depth ? null : d._children;
                        })
                        .sort(function(a, b) {
                            return a.value - b.value;
                        })
                        .ratio(height_chart / width_chart * 0.5 * (1 + Math.sqrt(5)))
                        .round(false);

                    var svg = partitionChartArea
                        .append("g")
                        .attr("class", "treeMap")
                        .attr("transform", "translate(" + (margin) + "," + 2 * margin + ")")
                        .style("shape-rendering", "crispEdges");

                    var grandparent = svg.append("g")
                        .attr("class", "grandparent");

                    grandparent.append("rect")
                        .attr("y", -margin)
                        .attr("width", width_chart)
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
                        shinyReturnOutput(root, false, root)
                        DrawTrail(root)
                        root.x = root.y = 0;
                        root.dx = width_chart;
                        root.dy = height_chart;
                        root.depth = 0;
                    }

                    // Aggregate the values for internal nodes. This is normally done by the
                    // treemap layout, but not here because of our custom implementation.
                    // We also take a snapshot of the original children (_children) to avoid
                    // the children being overwritten when when layout is computed.
                    function accumulate(d) {
                        return (d._children = d.children) ?
                            d.value = d.children.reduce(function(p, v) {
                                return p + accumulate(v);
                            }, 0) :
                            d.value;
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
                            treemap.nodes({
                                _children: d._children
                            });
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
                            .attr("class", "label")
                            .text(name(d));

                        var g1 = svg.insert("g", ".grandparent")
                            .datum(d)
                            .attr("class", "depth");

                        var g = g1.selectAll("g")
                            .data(d._children)
                            .enter().append("g");

                        g.filter(function(d) {
                                return d._children;
                            })
                            .classed("children", true)
                            .attr("node_name", function(d) {
                                return d.name
                            })
                            .attr("value", function(d) {
                                return d.cumulative_value
                            })
                            .attr("parent_value", function(d) {
                                if (d.parent) {
                                    return d.parent.cumulative_value
                                } else
                                    return d.cumulative_value
                            })
                            .on("click", transition);

                        g.selectAll(".child")
                            .data(function(d) {
                                return d._children || [d];
                            })
                            .enter().append("rect")
                            .attr("class", "child")
                            .attr("node_name", function(d) {
                                return d.name
                            })
                            .attr("value", function(d) {
                                return d.value
                            })
                            .attr("parent_value", function(d) {
                                if (d.parent) {
                                    return d.parent.value
                                } else
                                    return d.value
                            })
                            .call(rect);



                        $(".children").tooltip({

                            type: "popover",
                            html: true,
                            title: function() {
                                return "<table style='width:100%'><tr><th>Name:</th><td>" + this.getAttribute("node_name") + "</td>" +
                                    "<tr><th>" + "Value: " + "</th><td>" + this.getAttribute("value") +
                                    absolutePercentString(max_value, this.getAttribute("value"), input_x.tooltipOptions.showAbsolutePercent) +
                                    relativePercentString(this.getAttribute("parent_value"), this.getAttribute("value"), input_x.tooltipOptions.showRelativePercent) + "</table>"
                            }

                        })

                        g.append("rect")
                            .attr("class", "parent")
                            .style("fill", function(d) {
                                return colorizeNode(d)
                            })
                            .call(rect)
                            .append("title");




                        g.append("text")
                            .attr("dy", ".75em")
                            .attr("class", "label")
                            .text(function(d) {
                                return d.name;
                            })
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
                            svg.selectAll(".depth").sort(function(a, b) {
                                return a.depth - b.depth;
                            });

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
                            shinyReturnOutput(d, false, root)
                            DrawTrail(d)
                        }

                        return g;
                    }

                    function text(text) {
                        text.attr("x", function(d) {
                                return x(d.x) + 6;
                            })
                            .attr("y", function(d) {
                                return y(d.y) + 6;
                            });
                    }

                    function rect(rect) {
                        rect.attr("x", function(d) {
                                return x(d.x);
                            })
                            .attr("y", function(d) {
                                return y(d.y);
                            })
                            .attr("width", function(d) {
                                return x(d.x + d.dx) - x(d.x);
                            })
                            .attr("height", function(d) {
                                return y(d.y + d.dy) - y(d.y);
                            });
                    }

                    function name(d) {
                        return d.parent ?
                            name(d.parent) + "." + d.name :
                            d.name;
                    }

                } else if (input_x.type == 'partitionChart') {
                    var layout_type = 'rect';

                    var x = d3.scale.linear().range([0, width_chart]),
                        y = d3.scale.linear().range([0, height_chart]);

                    var vis = partitionChartArea
                        .append("g")
                        .attr("class", "partitionChart")
                        .attr("width", width_chart)
                        .attr("height", height_chart);

                    var partition = d3.layout.partition()
                        .value(function(d) {
                            return d.value;
                        });

                    draw_partition(input_x.root);

                    function draw_partition(root) {
                        shinyReturnOutput(root, true)
                        DrawTrail(root)
                        var g = vis.selectAll("g")
                            .data(partition.nodes(root))
                            .enter().append("svg:g")
                            .attr("transform", function(d) {
                                return "translate(" + x(d.y) + "," + (y(d.x)) + ")";
                            })
                            .attr("node_name", function(d) {
                                return d.name
                            })
                            .attr("value", function(d) {
                                return d.cumulative_value
                            })
                            .attr("parent_value", function(d) {
                                if (d.parent) {
                                    return d.parent.cumulative_value
                                } else
                                    return d.cumulative_value
                            })
                            .attr("class", "node")
                            .on("click", click);

                        var kx = width_chart / root.dx,
                            ky = height_chart / 1;

                        g.append("svg:rect")
                            .attr("width", root.dy * kx)
                            .attr("height", function(d) {
                                return d.dx * ky;
                            })
                            .attr("class", function(d) {
                                return d.children ? "parent" : "child";
                            })
                            .style("fill", function(d) {
                                return colorizeNode(d)
                            })

                        g.append("svg:text")
                            .attr("transform", transform)
                            .attr("dy", ".35em")
                            .style("opacity", function(d) {
                                return d.dx * ky > 12 ? 1 : 0;
                            })
                            .attr("class", "label")
                            .text(function(d) {
                                return d.name;
                            })

                        d3.select(window)
                            .on("click", function() {
                                click(root)
                            })
                        $(".node").tooltip({

                            type: "popover",
                            html: true,
                            title: function() {
                                return "<table style='width:100%'><tr><th>Name:</th><td>" + this.getAttribute("node_name") + "</td>" +
                                    "<tr><th>" + "Value: " + "</th><td>" + this.getAttribute("value") +
                                    absolutePercentString(max_value, this.getAttribute("value"), input_x.tooltipOptions.showAbsolutePercent) +
                                    relativePercentString(this.getAttribute("parent_value"), this.getAttribute("value"), input_x.tooltipOptions.showRelativePercent) + "</table>"
                            }

                        })

                        function click(d) {

                            if (!d.children) return;
                            shinyReturnOutput(d, true)
                            DrawTrail(d)

                            kx = (d.y ? width_chart - 40 : width_chart) / (1 - d.y);
                            ky = height_chart / d.dx;
                            x.domain([d.y, 1]).range([d.y ? 40 : 0, width_chart]);
                            y.domain([d.x, d.x + d.dx]);

                            var t = g.transition()
                                .duration(d3.event.altKey ? 7500 : 750)
                                .attr("transform", function(d) {
                                    return "translate(" + (x(d.y)) + "," + y(d.x) + ")";
                                });

                            rect_node = t.select("rect")
                                .attr("width", d.dy * kx)
                                .attr("height", function(d) {
                                    return d.dx * ky;
                                });



                            t.select("text")
                                .attr("transform", transform)
                                .style("opacity", function(d) {
                                    return d.dx * ky > 12 ? 1 : 0;
                                });

                            d3.event.stopPropagation();
                        }

                        function transform(d) {
                            return "translate(8," + d.dx * ky / 2 + ")";
                        }

                    }
                } else if (input_x.type == 'sunburst') {

                    var layout_type = 'circular';
                    var radius = (Math.min(width_chart, height_chart) / 2) - margin;
                    var formatNumber = d3.format(",d");
                    var x = d3.scale.linear()
                        .range([0, 2 * Math.PI]);
                    var y = d3.scale.sqrt()
                        .range([0, radius]);
                    var color = d3.scale.category20c();
                    var partition = d3.layout.partition()
                        .value(function(d) {
                            return d.value;
                        });
                    var arc = d3.svg.arc()
                        .startAngle(function(d) {
                            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                        })
                        .endAngle(function(d) {
                            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
                        })
                        .innerRadius(function(d) {
                            return Math.max(0, y(d.y));
                        })
                        .outerRadius(function(d) {
                            return Math.max(0, y(d.y + d.dy));
                        });
                    var svg = partitionChartArea
                        .append("g")
                        .attr("class", 'sunburst')
                        .attr("transform", "translate(" + (radius + margin) + "," + (radius + 2 * margin) + ")");

                    draw_sunburst(input_x.root)

                    function draw_sunburst(root) {
                        shinyReturnOutput(root, true)
                        DrawTrail(root)

                        svg.selectAll("path")
                            .data(partition.nodes(root))
                            .enter().append("path")
                            .attr("class", "sunburstArc")
                            .attr("d", arc)
                            .attr("node_name", function(d) {
                                return d.name
                            })
                            .attr("value", function(d) {
                                return d.cumulative_value
                            })
                            .attr("parent_value", function(d) {
                                if (d.parent) {
                                    return d.parent.cumulative_value
                                } else
                                    return d.cumulative_value
                            })
                            .style("fill", function(d) {
                                return colorizeNode(d)
                            })
                            .on("click", click);

                        $(".sunburstArc").tooltip({

                            type: "popover",
                            html: true,
                            title: function() {
                                return "<table style='width:100%'><tr><th>Name:</th><td>" + this.getAttribute("node_name") + "</td>" +
                                    "<tr><th>" + "Value: " + "</th><td>" + this.getAttribute("value") +
                                    absolutePercentString(max_value, this.getAttribute("value"), input_x.tooltipOptions.showAbsolutePercent) +
                                    relativePercentString(this.getAttribute("parent_value"), this.getAttribute("value"), input_x.tooltipOptions.showRelativePercent) + "</table>"
                            }

                        })
                    };

                    function click(d) {
                        shinyReturnOutput(d, true)
                        DrawTrail(d)
                        svg.transition()
                            .duration(750)
                            .tween("scale", function() {
                                var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                                    yd = d3.interpolate(y.domain(), [d.y, 1]),
                                    yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
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
                    }

                    d3.select(self.frameElement).style("height", height_chart + "px");
                } else if (input_x.type == 'collapsibleTree') {
                    var maxDepth = getDepth(input_x.root)
                    var layout_type = 'rect';
                    var i = 0,
                        duration = 750,
                        root;

                    var tree = d3.layout.tree()
                        .size([height_chart, width_chart]);

                    var diagonal = d3.svg.diagonal()
                        .projection(function(d) {
                            return [d.y, d.x];
                        });

                    var svg = partitionChartArea
                        .append("g")
                        .attr("class", "collapsibleTree")
                        .attr("transform", "translate(" + 2 * margin + "," + margin + ")");


                    drawCollapsibleTree(input_x.root)

                    function drawCollapsibleTree(flare) {


                        root = flare;
                        root.x0 = height_chart / 2;
                        root.y0 = 0;

                        function collapse(d) {
                            if (d.children) {
                                d._children = d.children;
                                d._children.forEach(collapse);
                                d.children = null;
                            }
                        }

                        root.children.forEach(collapse);
                        update(root);
                        shinyReturnOutput(root, false, root);
                        DrawTrail(root)
                    };


                    function update(source) {

                        // Compute the new tree layout.
                        var nodes = tree.nodes(root).reverse(),
                            links = tree.links(nodes),
                            node_padding = width_chart / maxDepth;


                        // Normalize for fixed-depth.
                        nodes.forEach(function(d) {

                            d.y = d.depth * node_padding;

                        });

                        // Update the nodes…
                        var node = svg.selectAll("g.node")
                            .data(nodes, function(d) {
                                return d.id || (d.id = ++i);
                            });

                        // Enter any new nodes at the parent's previous position.
                        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .attr("transform", function(d) {
                                d.is_visible = true;
                                return "translate(" + source.y0 + "," + source.x0 + ")";
                            })
                            .attr("node_name", function(d) {
                                return d.name
                            })
                            .attr("value", function(d) {
                                return d.cumulative_value
                            })
                            .attr("parent_value", function(d) {
                                if (d.parent) {
                                    return d.parent.cumulative_value
                                } else
                                    return d.cumulative_value
                            })
                            .on("click", click);

                        nodeEnter.append("circle")
                            .attr("r", 1e-6)
                            .style("fill", function(d) {
                                return colorizeNode(d)
                            });

                        $(".node").tooltip({

                            type: "popover",
                            html: true,
                            title: function() {
                                return "<table style='width:100%'><tr><th>Name:</th><td>" + this.getAttribute("node_name") + "</td>" +
                                    "<tr><th>" + "Value: " + "</th><td>" + this.getAttribute("value") +
                                    absolutePercentString(max_value, this.getAttribute("value"), input_x.tooltipOptions.showAbsolutePercent) +
                                    relativePercentString(this.getAttribute("parent_value"), this.getAttribute("value"), input_x.tooltipOptions.showRelativePercent) + "</table>"
                            }
                        })


                        nodeEnter.append("text")
                            .attr("x", function(d) {
                                return d.children || d._children ? -10 : 10;
                            })
                            .attr("dy", ".35em")
                            .attr("text-anchor", function(d) {
                                return d.children || d._children ? "end" : "start";
                            })
                            .text(function(d) {
                                return d.name;
                            })
                            .attr("class", "label")
                            .style("fill-opacity", 1e-6);

                        // Transition nodes to their new position.
                        var nodeUpdate = node.transition()
                            .duration(duration)
                            .attr("transform", function(d) {
                                return "translate(" + d.y + "," + d.x + ")";
                            });

                        nodeUpdate.select("circle")
                            .attr("r", function(d) {
                                return (35 * Math.log(1 + 2 * d.cumulative_value / max_value))
                            })
                            .style("fill", function(d) {
                                return colorizeNode(d)
                            })




                        nodeUpdate.select("text")
                            .style("fill-opacity", 1);


                        // Transition exiting nodes to the parent's new position.
                        var nodeExit = node.exit().transition()
                            .duration(duration)
                            .attr("transform", function(d) {
                                d.is_visible = false;
                                return "translate(" + source.y + "," + source.x + ")";
                            })
                            .remove();

                        nodeExit.select("circle")
                            .attr("r", 1e-6);

                        nodeExit.select("text")
                            .style("fill-opacity", 1e-6);

                        // Update the links…
                        var link = svg.selectAll("path.link")
                            .data(links, function(d) {
                                return d.target.id;
                            });

                        // Enter any new links at the parent's previous position.
                        link.enter().insert("path", "g")
                            .attr("class", "link")
                            .attr("d", function(d) {
                                var o = {
                                    x: source.x0,
                                    y: source.y0
                                };
                                return diagonal({
                                    source: o,
                                    target: o
                                });
                            });

                        // Transition links to their new position.
                        link.transition()
                            .duration(duration)
                            .attr("d", diagonal);

                        // Transition exiting nodes to the parent's new position.
                        link.exit().transition()
                            .duration(duration)
                            .attr("d", function(d) {
                                var o = {
                                    x: source.x,
                                    y: source.y
                                };
                                return diagonal({
                                    source: o,
                                    target: o
                                });
                            })
                            .remove();

                        // Stash the old positions for transition.
                        nodes.forEach(function(d) {
                            d.x0 = d.x;
                            d.y0 = d.y;
                        });

                        d3.select(el).selectAll('.label').attr("style", input_x.labelStyle);

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
                        shinyReturnOutput(d, false, root)
                        DrawTrail(d)
                    }
                }



                if (input_x.labelStyle)
                    d3.select(el).selectAll('.label').attr("style", input_x.labelStyle);
                InitializeTrail(svg_grid);
                DrawTrail(input_x.root)
                addTitle(input_x.title, svg_grid);
                drawLegend(color_input, layout_type_fun(input_x.type), input_x.legend.style, svg_grid);

            },

            resize: function(width, height) {

                // TODO: code to re-render the widget with a new size

            }

        };
    }
});