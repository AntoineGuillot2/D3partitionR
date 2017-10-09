# D3 partition R 0.5.0

D3 partition R is an R package to build interactive visualisation of nested data. Through easy to-use R functions (in a ggplot-like syntax) you will be able to plot and customise sunburst, treemap, circle treemap, icicle and partition chart. All the visualisations are interactive, zoom-able and based on the latest version of d3.js (V4).

![Examples](inst/img/ExampleD3partitionR.gif?raw=true)

## Installation
The package is now available on the CRAN.

```rmethods to add data
install.packages("D3partitionR")
```

## Global structure of the package

The D3partitionR package uses a S3 class of object: D3partitionR objects. Two sets of methods are available, methods to add data (i.e. add_data, add_nodes_data, add_title) and methods to customise the chart (set_chart_type, set_labels_parameters, set_legend_parameter, ...).
These methods return a D3partitionR object which will be plotted and compiled by the plot method.

## Examples

### Simple chart using Titanic data
For this first example, we will use the [Titanic data from Kaggle](https://www.kaggle.com/c/titanic/data/)

```R
## Loading packages
library("data.table")
library("D3partitionR")

## Reading data
titanic_data = fread("train.csv")

##Agregating data to have unique sequence for the 4 variables
var_names=c('Sex','Embarked','Pclass','Survived')
data_plot=titanic_data[,.N,by=var_names]
data_plot[,(var_names):=lapply(var_names,function(x){data_plot[[x]]=paste0(x,' ',data_plot[[x]])
  })]

## Plotting the chart
library("magrittr")
D3partitionR() %>%
  add_data(data_plot,count = 'N',steps=c('Sex','Embarked','Pclass','Survived')) %>%
  add_title('Titanic') %>%
  plot()
```
The add_data function is used to specify the data.frame to use and the variables to use:

  * count: The variable which will define the size of each nodes (in this example the number of passengers)
  * steps: The different steps or levels to be plotted

### Choice of the type of chart

You can easily change the type of chart with **set_chart type**.

```R
##Treemap
D3partitionR() %>%
  add_data(data_plot,count = 'N',steps=c('Sex','Embarked','Pclass','Survived')) %>%
  set_chart_type('treemap') %>%
  plot()

##Circle treemap
D3partitionR() %>%
    add_data(data_plot,count = 'N',steps=c('Sex','Embarked','Pclass','Survived')) %>%
    set_chart_type('circle_treemap') %>%
    plot()
```


## Additional data for some nodes

You can also add additional data for some nodes. For instance you can add comments on the nodes where the Embarking location is provided using the function add_nodes_data.

```R
d3 = D3partitionR() %>%
  add_data(data_plot,count = 'N',tooltip=c('name','Location'),steps=c('Sex','Embarked','Pclass','Survived')) %>%
  add_nodes_data(list('Embarked S'=list('Location'='<a href="https://fr.wikipedia.org/wiki/Southampton">Southampton</a>'),
                 'Embarked C'=list('Location'='<a href="https://fr.wikipedia.org/wiki/Cherbourg-Octeville">Cherbourg</a>'),
                 'Embarked Q'=list('Location'='<a href="https://fr.wikipedia.org/wiki/Cobh">Queenstown</a>')
                 )
                 )
d3 %>%
  set_legend_parameters(zoom_subset = TRUE) %>%
  set_chart_type('circle_treemap') %>%
  set_tooltip_parameters(visible=TRUE, style='background-color:lightblue;',builder='basic') %>% 
  plot()
``` 

With this code, the nodes Embarked S, Embarked C, Embarked Q will have additional data apended (the url of the wikipedia page of the location).
![Examples](inst/img/additionalNodesInformation.png?raw=true)


## Specification of additional variables and nodes data

### Specify color, tooltips and labels variable
The add_data also contains parameters to specify the variables to used as:

  * **color**: name of the color variable (the variable can be numeric or categorical).
  * **label**: name of the label variable (the variable can be numeric or categorical).
  * **tooltip**: vector of the variables to use in the tooltip (the variable can be numeric or categorical).

```R
D3partitionR() %>%
  add_data(data_plot,count = 'N',steps=c('Sex','Embarked','Pclass','Survived'),tooltip=c('name','N'),label='name',color='N') %>%
  set_chart_type('treemap') %>%
  plot()
```

These variables should either be:

  * the variable used as the count variable
  * Variables provided in add_nodes_data
  * Numeric variables from the data.frame used in add_data. In this last case, a named list of functions (or a list of length one, the function will then be applied to all the variables) should be provided for the variables.

```R
titanic_data = fread("train.csv")

## Selecting variables
var_names = c('Sex','Embarked','Pclass','Survived')

## Merging steps data and data with ages
data_plot = merge(titanic_data[,.N, by = c(var_names)], titanic_data[,.(mean_age=mean(Age,na.rm =TRUE), Survived_num=Survived), by=c(var_names)], by=var_names)

##Improving steps naming
data_plot[,(var_names):=lapply(var_names,function(x){data_plot[[x]]=paste0(x,' ',data_plot[[x]])
  })]

D3partitionR()%>%
  add_data(data_plot,count = 'N',steps=c('Sex','Embarked','Pclass','Survived'),tooltip=c('name','N','mean_age'),label='name',color='Survived_num',aggregate_fun = list(mean_age=weighted.mean,Survived_num=weighted.mean)) %>%
  set_chart_type('treemap') %>%
  set_labels_parameters(cut_off=10) %>%
  plot()
```
![Examples](inst/img/exampleAggregationFunction.png?raw=true)

## Modify the tooltips, lengends and labels parameters

The modification of legend, labels and tooltips parameters are easily done too.

#### Legend

To modify the legend parameters, you need to use **set_legend_parameters**, it has three parameters.
```R
##Circle treemap
D3partitionR()%>%
    add_data(data_plot,count = 'N',steps=c('Sex','Embarked','Pclass','Survived'))%>%
    set_legend_parameters(visible=T,zoom_subset=T,width=100)%>%
    plot()    
```
The use of visible and width are obvious. On the other hand, the zoom_subset will enable or disable the filtering of the legend labels based on the current level of zoom. If the zoom_subset is set to TRUE, only the direct children of the current root are shown in the legend.

#### Tooltips

To modify the tooltips parameters, you need to use **set_tooltip_parameters**, it has three parameters.

```R
##Circle treemap
D3partitionR()%>%
    add_data(data_plot,count = 'N',steps=c('Sex','Embarked','Pclass','Survived'))%>%
    set_tooltip_parameters(visible=T,style='background-color:lightblue;',builder='basic')%>%
    plot()    
```
The style argument is used to customise the tooltips using a CSS string. The builder parameter changes the type of tooltip using a js expression. Two builders are currently in the package ('basic' and 'table').

#### Labels

To modify the labels parameters, you need to use **set_tooltip_parameters**, it has three parameters.

```R
##Circle treemap
D3partitionR()%>%
    add_data(data_plot,count = 'N',steps=c('Sex','Embarked','Pclass','Survived'))%>%
    set_label_parameters(visible=T,cut_off=3,style='fill:lightblue;')%>%
    plot()    
```
The style argument is used to customise the labels using a CSS string. 
The cut_off parameter is used to choose which proportion of the labels is to be shown. For instance if the cut-off is set to 3, only the labels belonging to a node with a size which is greater than 3% of the current root size will be displaued.

#### Trail

The trail can only be enabled/disabled using **set_trail**

#### Title

A title can be added using **add_title which** has two parameters text to provide the text and style.

```R
##Circle treemap
D3partitionR()%>%
    add_data(data_plot,count = 'N',steps=c('Sex','Embarked','Pclass','Survived'))%>%
    add_title(text='Titanic',style='font-size:20px;')%>%
    plot()
```

## D3.js code modularity

The d3.js code was thought to be modular, hence it is easy to add new chart types. Each chart type has its own .js file with its drawing function. In this file:

  * The chart is plotted, the labels and the colors are added
  * The function return a click behavior which is called when a node is clicked. This file is called in the general function in charge of drawing the chart, the legend, the title and the breadcrumb.

Hence any hierarchical-like d3.js visualisation can easily be generalised and added to the package











