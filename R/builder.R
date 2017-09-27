###Script with js function to build tooltips and labels.


#' Build tooltip html function
#' @param type a tooltip type: 'basic' (i.e the variable value) or 'table'(i.e. a table with the variables names and value)
#' @export
tooltip_builder=function(type)
{
  if (type=='basic')
  {
    '(
	function() {
		var tooltip_html = ""
		for (var variable in D3partitionR.variable.tooltip) {
			if (d.data[D3partitionR.variable.tooltip[variable]] !== undefined) {
				var f = d3.format(".2f");
				var current_data = d.data[D3partitionR.variable.tooltip[variable]]
				if (isNaN(current_data)) {
					tooltip_html = tooltip_html + (current_data + "</br>")
				} else {
					tooltip_html = tooltip_html + (f(current_data) + "</br>")
				}

			}

		}
		return (tooltip_html)

	})'

  }
  else if (type=='table')
  {
    '(
	function() {
		var tooltip_html = "<table>"
		for (var variable in D3partitionR.variable.tooltip) {
      console.log(D3partitionR.variable.tooltip)
			if (d.data[D3partitionR.variable.tooltip[variable]] !== undefined)
				{
					var f = d3.format(".2f");
					var current_data = d.data[D3partitionR.variable.tooltip[variable]]
					if (!isNaN(current_data)) {
						current_data = f(current_data)
					}
          if (variable==0 & isNaN(current_data))
            tooltip_html = (tooltip_html + "<tr><th>" + "&ensp;" + current_data + " </th></tr>")
          else
            tooltip_html = (tooltip_html + "<tr><th> " + D3partitionR.variable.tooltip[variable] + "</th>" +
						"<th>" + "&ensp;" + current_data + " </th></tr>")
				}
			}
			tooltip_html = tooltip_html + "</table>"
			return (tooltip_html)

		})'

  }

}
