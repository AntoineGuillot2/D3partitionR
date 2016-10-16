library(htmlwidgets)

#' D3partitionR
#'
#' This function generates the partition chart from your data or from random data
#' @param random generates the selected chart with random values, default to FALSE.
#' @param data The inputs data, it should be in one of the following form:\cr 
#'      - a dataframe with two columns, the first one being the paths (and named path) and the second one the value of the paths.\cr 
#'      - a list of two lists with the same properties.
#' @param type type of plots, to be among circleTreeMap, partitionChart, treeMap, sunburst, collapsibleIndentedTree, collapsibleTree. Defaut to circleTreeMap.
#' @param tooltipOptions list of options for the tooltip:\cr 
#'                    - showAbsolutePercent: show the absolute percent from the beginning. Defaut to true.\cr 
#'                    - showRelativePercent: show the percent of remaining from the previous step. Defaut to true.
#' @param width width of the element.
#' @param height height of the element.
#' @param elementId Id of the element, default to null.
#' @param Input A list of options to use the chart as an input:\cr
#'              - enabled (default to FALSE), set to TRUE to enable the input\cr
#'              - id, the input id to access to the input in shiny\cr
#'              - clickedStep, set to true to get the name of the clicked node\cr
#'              - currentPath (default to TRUE), the path from the root to the clicked node\cr
#'              - visiblePath (default to TRUE), the paths that are currently visble\cr
#'              - visibleNode (default to TRUE), get all visible nodes\cr
#'              - visibleLEaf (default to TRUE), get all visible leafs
#' @param title options for the title:\cr 
#'          -text: text to be displayed\cr 
#'          -fontSize: fontSize (ex: "24px")\cr
#'          -style: A CSS string to change the title style ex:"opacity:0;"
#' @param legend List of options for the legend:\cr 
#'                  - type, the legend can be either categorical or sequential. \cr 
#'                        When setted to categorical, every different step has a different color.\cr 
#'                        When setted to sequential, the steps with a color provided are used as a reference. The further a steps from these reference, the darker.\cr 
#'                  - color, Coerce the colors of some steps. Notice: only the colors provided in these are going to be shown in the legend.\cr 
#'                  - style: A CSS string to change the legend style ex:"opacity:0;"
#' @param labelStyle A CSS string to change the labels style
#' @param specificOptions Options speficic to some king of charts\cr 
#'                  - collapsibleIndentedTree: list(bar=T), to true if you want to have bars proportional to the size of the step
#'                  
#' @import htmlwidgets
#'
#' @export
#' @examples
#' 
#' #Base bubbleTreeMap with random data
#' D3partitionR(TRUE)
#' 
#' #sunburst with categorical colors and some coerced legend and color
#' D3partitionR(TRUE,type="sunburst",
#' tooltipOptions = list(showAbsolutePercent=FALSE,showRelativePercent=FALSE),
#' legend=list(type="categorical",color=list("step A"="#0BA","step B"="#AA1","step C"="#ECC")))
#' 
#' 
D3partitionR <- function(random=F,
                         data=NULL, 
                         type='circleTreeMap',
                         tooltipOptions=list(showAbsolutePercent=T,showRelativePercent=T),
                         width = NULL, height = NULL, elementId = NULL,
                         Input=list(enabled=F,id="unique_id",clickedStep=T,currentPath=T,visiblePaths=T,visibleLeaf=T,visibleNode=T),
                         title=list(text=NULL,fontSize="auto"),
                         legend=list(type='categorical',color=NULL),
                         labelStyle=NULL,
                         specificOptions=NULL) {

  if (random)
  {
    CircleData<-generateRandomPath()
  }
  else
  {
    if (is.null(data))
      stop("Data is null when the function need data. To test the CircleTreeMap add random=T.")
    else if (!is.list(data) & length(data)!=2)
      stop("The data should be in one of the following form:
            -a dataframe with two columns, the first one being the paths (and named path) and the second one the value of the paths.
            -a list of two lists with the same properties")
    else
      CircleData<-ConvertPathToHierarchy(data$path,data$value,root_in=TRUE)[[1]]

  }
  # forward options using x
  input_x = list(
    root=CircleData,
    type=type,
    tooltipOptions=tooltipOptions,
    title=title,
    legend=legend,
    Input=Input,
    width=width,
    height=height,
    labelStyle=labelStyle,
    specificOptions=specificOptions
  )


  # create widget
  htmlwidgets::createWidget(
    name = 'D3partitionR',
    input_x,
    width = width,
    height = height,
    package = 'D3partitionR',
    elementId = elementId
  )
}

#' Shiny bindings for CircleTreeMapR
#'
#' Output and render functions for using D3partitionR within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a D3partitionR
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name D3partitionR-shiny
#'
#' @export
D3partitionROutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'D3partitionR', width, height, package = 'D3partitionR')
}

#' @rdname D3partitionR-shiny
#' @export
renderD3partitionR <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, D3partitionROutput, env, quoted = TRUE)
}
