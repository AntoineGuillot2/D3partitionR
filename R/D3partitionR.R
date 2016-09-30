library(htmlwidgets)

#' D3partitionR
#'
#' This function generates the CircleTreeMap from your data or from random data
#' @param random generates a radom CircleTreeMap, default to FALSE.
#' @param data The inputs data, it should be in one of the following form:
#'      -a dataframe with two columns, the first one being the paths (and named path) and the second one the value of the paths.
#'      -a list of two lists with the same properties.
#' @param width width of the element
#' @param height height of the element
#' @param elementId Id of the elemen, default to null
#' @import htmlwidgets
#'
#' @export
D3partitionR <- function(random=F,data=NULL, type='circleTreeMap',tooltipOptions=list(showAbsolutePercent=T,showRelativePercent=T),width = NULL, height = NULL, elementId = NULL, title=list(text=NULL,fontSize="auto"),legend=list(type='categorical',color=NULL)) {

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
    else if (!is.list(data$path[[1]]))
      stop("The path must be a list having the form: [Step A,Step B,...]")
    else
      CircleData<-ConvertPathToHierarchy(data$path,data$value)[[1]]

  }
  # forward options using x
  input_x = list(
    root=CircleData,type=type,tooltipOptions=tooltipOptions,title=title,legend=legend,width=width,height=height
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
#' Output and render functions for using CircleTreeMapR within Shiny
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
