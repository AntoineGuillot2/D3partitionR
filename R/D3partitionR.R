#' Plot D3partitionR object
#'
#' @import htmlwidgets
#' @param x A D3partitionR object to plot
#' @param width width of the widget in pixel/percent
#' @param height height of the widget in pixel/percent
#' @param elementId html id of the widget
#' @param ... Other graphical parameters
#' @export
plot.D3partitionR <- function(x, width = NULL, height = NULL, elementId = NULL, sizingPolicy = NULL) {




    x =  compile_D3_partitionR(x)
    
    if(is.null(sizingPolicy)){
      sizingPolicy <- htmlwidgets::sizingPolicy(browser.fill=TRUE)
    }
    
    # create widget
    htmlwidgets::createWidget(name = "D3partitionR", x, width = width, height = height, package = "D3partitionR", elementId = elementId,sizingPolicy = sizingPolicy)
}

#' Shiny bindings for D3partitionR
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
D3partitionROutput <- function(outputId, width = "100%", height = "400px") {
    htmlwidgets::shinyWidgetOutput(outputId, "D3partitionR", width, height, package = "D3partitionR")
}

#' @rdname D3partitionR-shiny
#' @export
renderD3partitionR <- function(expr, env = parent.frame(), quoted = FALSE) {
    if (!quoted)
        {
            expr <- substitute(expr)
        }  # force quoted
    htmlwidgets::shinyRenderWidget(expr, D3partitionROutput, env, quoted = TRUE)
}
