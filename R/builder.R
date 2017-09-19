###Script with js function to build tooltips and labels.


#' Build tooltip html function
#' @param type a tooltip type: 'basic' (i.e the variable value) or 'table'(i.e. a table with the variables names and value)
#' @export
tooltip_builder=function(type)
{
  if (type=='basic')
  {
    '(
function()
    {
var tooltip_html=""
for (var variable in D3partitionR.variable.tooltip)
                     {
if (d.data[D3partitionR.variable.tooltip[variable]]!==undefined)
tooltip_html=tooltip_html+(d.data[D3partitionR.variable.tooltip[variable]]+"</br>")
                     }
return(tooltip_html)

})'

  }
  else if (type=='table')
  {
    '(
function()
    {
var tooltip_html="<table>"
for (var variable in D3partitionR.variable.tooltip)
                     {
if (d.data[D3partitionR.variable.tooltip[variable]]!==undefined)
tooltip_html=(tooltip_html+"<tr><th> "+D3partitionR.variable.tooltip[variable]+"</th>"+
"<th>"+"&ensp;"+d.data[D3partitionR.variable.tooltip[variable]]+" </th></tr>")
                     }
tooltip_html=tooltip_html+"</table>"
return(tooltip_html)

})'

  }

}
