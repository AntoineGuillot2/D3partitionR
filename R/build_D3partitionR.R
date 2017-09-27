####Creation of D3partitionR object###
####D3partitionR object are S3 classes###

#' Creates a D3partitionR object
#'
#' @return A blank D3partitionR object (S3 class)
#' @export
D3partitionR<-function()
{
  list(chart_type='blank',compiled=F)%>%
    `attr<-`('class','D3partitionR')
}

#' Append data to a D3partitionR object
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param data a data.frame object
#' @param steps The vector of steps to be used
#' @param color a variable to use as color (default: name)
#' @param label a variable to use as label (default: name)
#' @param tooltip a variable to use as tooltip (default: name)
#' @param count The variable to be used as the count variable, typically, the number of occurences.
#' @param aggregate_fun A named list of function which will be used to aggregates to variables used in color, label or tooltips. This only applies to variable in the provided dataset.
#' @return The D3partitionR object with the appended data
#' @export
add_data<-function(D3partitionR_object,data,steps,count='value',color='name',label='name',tooltip='name',aggregate_fun=NULL)
{
  data=data%>%as.data.frame()%>%as.data.table()
  if (!is.data.frame(data))
  {
    stop('The data need to be a data.frame')
  }
  if (!is.vector(steps))
  {
    stop('Steps need to be a vector of the different step.')
  }
  if (!is.list(label))
  {
    label=as.list(label)
  }
  if (!is.list(tooltip))
  {
    tooltip=as.list(tooltip)
  }

  ###Inteligently adding required variables
  other_variables=c(color,unlist(label),unlist(tooltip))
  other_variables=unique(other_variables[which(other_variables%in%colnames(data))])
  other_variables=other_variables[which(other_variables!=count & !other_variables%in%steps)]
  if (length(other_variables)==0) {other_variables<-NULL}

  ##If the[ first step is not the same for all obs, creation of a root
  if (length(unique(data[[steps[1]]]))>1)
  {
    data[['root_d3']]='Root'
    steps=c('root_d3',steps)
  }


  D3partitionR_object$data<-list(data=data,steps=steps,count=count,color=color,label=label,tooltip=tooltip,other=other_variables,aggregate_fun=aggregate_fun)
  return(D3partitionR_object)
}

#' Add informations (for instance new names, colors, ....) to the nodes of a D3_partitionR object
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param nodes_data a names list where the name of each element is the name of a node. The data will be appended to the node in the nested list
#' @return The D3partitionR object with the appended nodes data
#' @export
add_nodes_data<-function(D3partitionR_object,nodes_data)
{
  if (!is.list(nodes_data) | is.null(names(nodes_data)))
  {
    stop('Nodes data ned to be a named list')
  }
  D3partitionR_object$nodes_data<-nodes_data
  return(D3partitionR_object)
}


#' Add a title to a D3partitionR object
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param text Title text
#' @param style A valid CSS string which will be applied to the title)
#' @return A D3partitionR object
#' @export
add_title<-function(D3partitionR_object,text,style=NULL)
{
  if (!is.character(text))
  {
    stop('Invalid text.The text needs to be a string.')
  }
  D3partitionR_object$title<-list(text=text,style=style)
  return(D3partitionR_object)
}

#' Add a custom discrete color scale
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param color_palette A vector (or a named vector with levels of the variable color)
#' @return A D3partitionR object
#' @export
set_discrete_color_scale<-function(D3partitionR_object,color_palette)
{
  D3partitionR_object$color<-list(type='discrete',color_palette=color_palette)
  return(D3partitionR_object)
}

#' Add a custom discrete color scale
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param color_palette a vector of two colors, the first one is use on the bottom of the scale, the other on the top.
#' @return A D3partitionR object
#' @export
set_continuous_color_scale<-function(D3partitionR_object,color_palette)
{
  ##Local binding for global variable
  visible=NULL

  if (!is.logical(visible))
  {
    stop('visible should be a boolean')
  }
  D3partitionR_object$color<-list(type='continuous',color_palette=color_palette)
  return(D3partitionR_object)
}

#' Enable/disable the trail of steps
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param visible boolean, should the trail be diplayed ? Default: TRUE
#' @return A D3partitionR object
#' @export
set_trail<-function(D3partitionR_object,visible=T)
{
  if (!is.logical(visible))
  {
    stop('visible should be a boolean')
  }
  D3partitionR_object$trail<-list(visible=T)
  return(D3partitionR_object)
}


#' Set the labels parameters
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param visible boolean, should the labels be diplayed ? Default: TRUE
#' @param cut_off a numeric variable between 0 and 100. Nodes which represent less than cut_off percents of the current root will have their labels hidden.
#' @param style a valid CSS string to be applied to the labels. Default: NULL
#' @return A D3partitionR object
#' @export
set_labels_parameters<-function(D3partitionR_object,visible=T,cut_off=3,style=NULL)
{
  if (!is.logical(visible))
  {
    stop('visible should be a boolean')
  }
  if (!is.numeric(cut_off))
  {
    stop('The cut_off should be a numeric between 0 and 100')
  }
  if (cut_off>100)
  {
    stop('The cut_off should be a numeric between 0 and 100')
  }
  if (!is.character(style) & !is.null(style))
  {
    stop('style should be a valid CSS string')
  }
  D3partitionR_object$labels<-list(visible=visible,cut_off=cut_off/100,style=style)
  return(D3partitionR_object)
}

#' Set the tooltips parameter
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param visible boolean, should the trail be diplayed ? Default: TRUE
#' @param style a valid CSS string to be applied to the tooltip. Default: NULL
#' @param builder Tooltip builder to use for the tooltip. Can either one of the predefined tooltip ('table','basic') or a js expression returning a tooltip.
#' @return A D3partitionR object
#' @export
set_tooltip_parameters<-function(D3partitionR_object,visible=T,style=NULL,builder='table')
{
  if (!is.logical(visible))
  {
    stop('visible should be a boolean')
  }
  if (!is.character(style) & !is.null(style))
  {
    stop('style should be a valid CSS string')
  }
  if (is.null(builder))
  {
    builder=tooltip_builder('table')

  }
  if (builder=='basic' | builder=='table')
  {
    builder=tooltip_builder(builder)
  }
  D3partitionR_object$tooltip<-list(visible=visible,style=style,builder=builder)
  return(D3partitionR_object)
}


#' Set the legend parameter
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param visible boolean, should the trail be diplayed ? Default: TRUE
#' @param zoom_subset boolean, if TRUE, only the modalities present in the children of the zoomed rrot are displayed kin the legend.
#' @param width legend width in pixel
#' @return A D3partitionR object
#' @export
set_legend_parameters<-function(D3partitionR_object,visible=T,zoom_subset=F,width=100)
{
  if (!is.logical(visible))
  {
    stop('visible should be a boolean')
  }
  if (!is.numeric(width))
  {
    stop('width should be a number')
  }
  D3partitionR_object$legend<-list(visible=visible,zoom_subset=zoom_subset,width=width)
  return(D3partitionR_object)
}

#' Set the chart_type
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param chart_type type fo chart to use (in c('sunburst','treemap','circle_treemap','partition_chart','icicle') )
#' @return A D3partitionR object
#' @export
set_chart_type<-function(D3partitionR_object,chart_type)
{
  possible_charts=c('sunburst','treemap','circle_treemap','partition_chart','icicle')
  if (chart_type%in%possible_charts)
  {
    D3partitionR_object$chart_type<-chart_type
    return(D3partitionR_object)
  }
  else
  {
    stop(c('Invalid chart type. The chart type must be among ','\n', paste0(possible_charts,collapse = '\n')))
  }
}

#' Configuration of a D3partitionR object as a Shiny input
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @param input_id The id of the input
#' @param enabled_inputs which inputs should be enabled ? defaut to list(clicked_node=T,leaf=T,nodes=T,ancestors=T,child_path=F)
#' @return A D3partitionR object
#' @export
set_shiny_input=function(D3partitionR_object,input_id,enabled_inputs=list(clicked_node=T,leaves=T,nodes=T,ancestors=T,children_path=F))
{
  D3partitionR_object$shiny_input=list(enabled_inputs=enabled_inputs,input_id=input_id)
}

#' Compile D3partitionR object to plot it
#' @param D3partitionR_object The D3partitionR object to which the data should be appended
#' @return A D3partitionR compiled object
#' @import RColorBrewer
#' @export
compile_D3_partitionR<-function(D3partitionR_object)
{
  ####Creation of local binding for variables
  category=NULL
  rn=NULL
  maxcolors=NULL



  ##
  d3=D3partitionR_object
  ###Cheking data format
  if (!is_present_variable(d3$data$color,d3) & !is.null(d3$data$color))
  {
    stop(paste0('The color variable ',d3$data$color,' is not in the D3partitionR object'))
  }
  if (!all(sapply(d3$data$tooltip,is_present_variable,d3)) & !is.null(d3$data$tooltip))
  {
    stop(paste0('The tooltip variable ',d3$data$tooltip,' is not in the D3partitionR object'))
  }
  if (!is_present_variable(d3$data$label,d3) & !is.null(d3$data$label))
  {
    stop(paste0('The label variable ',d3$data$label,' is not in the D3partitionR object'))
  }
  if (!all(sapply(d3$data$steps,function(x){x%in%colnames(d3$data$data)})))
  {
    stop('One of the steps variable is missing.')
  }
  if (!all(sapply(d3$data$other,function(x){x%in%colnames(d3$data$data)})))
  {
    stop('One of the "other" variable is missing.')
  }
  if (!is.null(d3$data$aggregate_fun))
  {
    if (!all(sapply(d3$data$other,function(x){x%in%names(d3$data$aggregate_fun)})))
    {
      stop('One of the "other" variable does not have an aggregate function')
    }
    else
    {
      d3$data$aggregate_fun[[d3$data$count]]=sum
    }

  }
  ###Nesting data
  compiled_data=df_to_nest(d3$data$data,step_cols = d3$data$steps,nodes_data = d3$nodes_data,count_col = d3$data$count,value_cols = d3$data$other,agg_function = d3$data$aggregate_fun)
  compiled_D3=D3partitionR()
  compiled_D3$data=compiled_data

  ###Color scale####

  ##If no color variable have been provided, default to name

  ##if no color scale have been supplied
  if (is.null(d3$color_scale))
  {
    if (is.null(d3$data$color))
    {
      d3$data$color='name'
    }
    scale_type=scale_type(d3$data$color,d3)
    if (scale_type=='discrete')
    {
      nodes_names=get_all_nodes_names(compiled_D3$data,d3$data$color)
      qual_palette=as.data.table(RColorBrewer::brewer.pal.info,keep.rownames = T)[category=='qual']
      palette=sapply(qual_palette$rn,function(x){brewer.pal(qual_palette[rn==x,maxcolors],x)})%>%unlist()%>%unique()
      palette=palette[1:length(nodes_names)]%>%`names<-`(nodes_names)
      d3$color=list(type='discrete',color_palette=palette)

    }
    else
    {
      palette=c('#FFD700','#551A8B')
      d3$color=list(type='continuous',color_palette=palette)
    }
  }
  else
  {
    if (is.null(d3$data$color))
    {
      if (d3$color$type=='discrete')
        d3$data$color='name'
      else
        d3$data$color='depth'
    }
    scale_type=scale_type(d3$data$color,d3)
    if (scale_type!=d3$color$type)
    {
      stop('Invalid legend type,please switch.')
    }
    else
    {
      if (d3$color$type=='discrete')
      {

        nodes_names=get_all_nodes_names(compiled_D3$data,d3$data$color)

        if (is.null(names(palette)))
        {
          if (length(palette)<length(nodes_names))
          {
            warning('Not enough colors, defaut colors are automatically added')
            n_missing_color=length(nodes_names)-length(palette)
            qual_palette=as.data.table(RColorBrewer::brewer.pal.info,keep.rownames = T)[category=='qual']
            new_colors=sapply(qual_palette$rn,function(x){brewer.pal(qual_palette[rn==x,maxcolors],x)})%>%unlist()%>%unique()
            palette=unique(c(palette,new_colors))[1:length(nodes_names)]
            names(palette)<-nodes_names
            d3$color$color_palette=palette
          }
        }
        else
        {
          if (length(palette)<length(nodes_names))
          {
            warning('Not enough named colors, defaut colors are automatically added for missing nodes')
            n_missing_color=length(nodes_names)-length(palette)
            missing_names=nodes_names[which(!nodes_names%in%names(palette))]
            qual_palette=as.data.table(RColorBrewer::brewer.pal.info,keep.rownames = T)[category=='qual']
            new_colors=sapply(qual_palette$rn,function(x){brewer.pal(qual_palette[rn==x,maxcolors],x)})%>%unlist()%>%unique()
            names_palette=c(names(palette),missing_names)
            palette=unique(c(palette,new_colors))[1:length(nodes_names)]
            names(palette)<-names_palette
            d3$color$color_palette=palette
          }
        }

      }
      else
      {
        if (length(d3$color$color_palette)!=2)
        {
          stop('In case of numeric/continuous color scale, only two colors should be provided.',
              'The bottom one and the top one of the gradient fill.'
               )
        }
      }

    }


  }
  compiled_D3$color_scale<-list(type=d3$color$type,palette=as.list(d3$color$color_palette))
  if (d3$color$type=='continuous')
  {
    min_max=find_min_max_tree(compiled_D3$data,d3$data$color)
    compiled_D3$color_scale<-c(as.list(compiled_D3$color_scale),list(min=min_max[1],max=min_max[2]))
  }


  ###Hide/show legend
  if (is.null(d3$legend))
  {
    d3%<>%set_legend_parameters()
  }
  compiled_D3$legend=d3$legend

  ###Add labels
  if (is.null(d3$labels))
  {
    d3%<>%set_labels_parameters(visible = F)
  }
  compiled_D3$labels=d3$labels

  ###Add tooltips
  if (is.null(d3$tooltip))
  {
    d3%<>%set_tooltip_parameters()
  }
  compiled_D3$tooltip=d3$tooltip
  ##Add Trail
  if (is.null(d3$trail))
  {
    d3%<>%set_trail()
  }
  compiled_D3$trail=d3$trail

  ##Add chart type
  if (d3$chart_type=='blank')
  {
    d3$chart_type<-'sunburst'
  }
  compiled_D3$chart_type=d3$chart_type

  ###Add color, label and text variable
  compiled_D3$variable=list(value=d3$data$count,color=d3$data$color,label=d3$data$label,tooltip=d3$data$tooltip,other=d3$data$other)


  ##Add chart type
  compiled_D3$title=d3$title

  compiled_D3$compiled=T
  return(compiled_D3)

}

#' Check if a variable is present in a D3partitionR object
#' @param variable The variable which presence is to be checked
#' @param D3partitionR_object The D3partitionR object
#' @return TRUE/FALSE
#' @export
is_present_variable<-function(variable,D3partitionR_object)
{
  if (variable %in% compute_unique_leaf_name(D3partitionR_object$nodes_data))
    return(TRUE)
  else if (variable %in% c(colnames(D3partitionR_object$data$data),D3partitionR_object$data$count))
    return(TRUE)
  else if (is.null(variable))
    return(TRUE)
  else if (variable=='name')
    return(TRUE)
  else
    return(FALSE)
}


#' Check if the scale variable is discrete or continuous
#' @param color_variable The color variable to be assessed
#' @param D3partitionR_object The D3partitionR object
#' @return TRUE/FALSE
#' @export
scale_type<-function(color_variable,D3partitionR_object)
{
  ###Local binding for global variable
  nodes_data=NULL


  if (color_variable %in% compute_unique_leaf_name(D3partitionR_object$nodes_data))
  {
    all_numeric=T
    for (node in nodes_data)
    {
      if (!((is.null(node[[color_variable]])) | is.numeric(node[[color_variable]])))
        all_numeric=F
    }
    if (all_numeric==T)
    {
      return('numeric')
    }
    else
    {
      return('discrete')
    }
  }
  else
  {
    if (is.numeric(D3partitionR_object$data$data[[color_variable]]))
    {
      return('numeric')
    }
    else
    {
      return('discrete')
    }
  }
}






