

#' Aggregate a data.frame in long format with a column containing steps of each session
#' For instance the function can be used with a frame of the form Unique ID - Step - Value 1 - ... -Value N
#' @param data A dataframe
#' @param step_col The name of the column containig the steps. The steps are assumed to be ordered
#' @param id_col Column containing the unique identifier of each session
#' @param values_cols Names of the other columns to keep. Default: NULL
#' @param agg_function_path Aggregation function on a path level
#' @param agg_function_session Aggregation function on a session level
#' @param sep String used to separate the different steps. Default: "->"
#' @import data.table
#' @import functional
#' @import magrittr
#' @return A data.table with the columns specified in count_col, value_cols and one column per step in the path
#' @export
aggregate_sessions_to_path <- function(data, step_col = "step", id_col = "ID", values_cols = NULL, agg_function_path = sum,
    agg_function_session = sum, sep = "->") {

  ##Creating local varibales
  step=NULL
  ID=NULL
  number_of_occurences=NULL
  path=NULL

    data <- data.table(data)[, c(id_col, step_col, values_cols), with = F]
    setnames(data, c("ID", "step", values_cols))
    if (is.null(values_cols)) {
        data_path = data[, list(path = paste0(step, collapse = "->"), number_of_occurences = 1), by = ID]
        data_path[, list(count = sum(number_of_occurences)), by = path][order(path)]
    } else {

        data_path <- data[, c(path = paste0(step, collapse = "->"), number_of_occurences = 1, lapply(.SD, agg_function_session)),
            by = ID, .SDcols = values_cols]
        data_path[, c(count = sum(number_of_occurences), lapply(.SD, agg_function_path)), by = path, .SDcols = values_cols][order(path)]

    }
}


#' Strip a dataframe containing a step into separate columns
#'
#' @param data A dataframe containing the path.
#' @param path_col Name of the column containing the path. The path should be a string of the format "step 1 -> step 2 -> step 3" .Default: "path"
#' @param count_col Name of the column containing the number of occurences of the path. Default: "count"
#' @param value_cols Names of the other columns to keep. Default: NULL
#' @param sep String used to separate the different steps. Default: "->"
#' @import data.table
#' @import functional
#' @import magrittr
#' @return A data.table with the columns specified in count_col, value_cols and one column per step in the path
#'
#' @export
strip_path = function(data, path_col = "path", count_col = "count", value_cols = NULL, sep = "->") {
  data_agg=NULL

  ## Selecting only the need rows
    data_tp = data[, c(path_col, count_col, value_cols), with = F]
    setnames(data_tp, c("path", "count", value_cols))
    ## Splitting path
    split_path = data_tp[, tstrsplit(paste0(data_agg$path, sep, "End"), split = sep, fixed = T)]
    ## Renaming steps to have a standard naming
    data_tp[, `:=`(paste0("step_", 1:ncol(split_path)), split_path)]
    if (!is.null(data_tp$path_col))
    {
      data_tp[,path_col:=NULL]
    }
    return(data_tp)
}


#' Transform a dataframe to a nested lists structure (i.e. hierarchical).
#'
#' @param data The data frame to convert to the nested structure. It needs to have several comlumns, each ones account for a given step
#' @param step_cols vector containing the names of the columns which should be used as steps. The vector should be ordered. ex: c('step1','step2','step3')
#' @param count_col Number of occurences in this path (succesion of steps). Default: NULL
#' @param value_cols Names of the other columns to keep. Default: NULL
#' @param nodes_data A named list to add addition informations to each nodes
#' @param agg_function aggregation function to be applied to value_cols.Ex: mean, sum. Default: sum. Weighted version can also be used, the weighting will be done using the counting variable
#' @param na_behavior How to deal with missing data ?
#' @import data.table
#' @import functional
#' @import magrittr
#' @return A data.table with the columns specified in count_col, value_cols and one column per step in the path
#'
#' @export
df_to_nest<-function(data, step_cols,nodes_data=NULL,count_col = "value", value_cols = NULL, agg_function = sum, na_behavior='rm')
{
  ##Creating local varibales
  step=NULL
  ID=NULL
  number_of_occurences=NULL
  path=NULL
  . = NULL

  if (length(step_cols)==0)
  {
    stop("At leat one step is required.")
  }
  if (is.null(agg_function))
  {
    agg_function=sum
  }
  if (length(agg_function)==1)
  {
    agg_function%<>%replicate(length(c(count_col,value_cols)),.)%>%`names<-`(c(count_col,value_cols))
  }
  ###Recursive function
  ###Base case, only one step or NA are left
  if (
    ifelse(length(step_cols)==1,T,
           if (na_behavior=='rm')
             all(is.na(data[[step_cols[2]]]))
           else
             T
    ))

  {
    ###Creating the final leaf
    ##No need to aggregate since unicity of paths is assumed
    data[['current_step']]=data[[step_cols[1]]]
    res<-data[, list(nest = c(list(step = current_step), as.list(.SD))), by = step_cols,
              .SDcols = c(count_col,value_cols)]$nest

    names(res)<-c('name',count_col,value_cols)
    if (!is.null(nodes_data))
    {
      res=c(res,nodes_data[[res$name]])
    }
    res
  }
  else if (length(step_cols)>1)
  {
    ##Reduction

    ###Defining current step
    current_step=step_cols[1]
    ###Splitting the children
    children_data=split(data,by=step_cols[2])
    ###Recursion
    children<-lapply(children_data,function(child)
    {
      df_to_nest(child,step_cols[-1],nodes_data, count_col, value_cols , agg_function,na_behavior)
    })
    names(children)<-NULL

    ###Computing the aggregated values for the count and other columns
    res<-list(
      ##The current step is the first element of the steps list
      step=unique(data[[step_cols[1]]]),
      ##The children have bben computed previously
      children=children,
      ###Computing the different variable for the node
      {
      ##Coercing the list of children to a datatabel
      rbindlist(lapply(children,function(child)
      {
        as.data.table(child[c(count_col,value_cols)])
      }))[,sapply(c(count_col,value_cols),function(col_index,data_tp){

        ###Counting required arguments
        args_names=names(formals(agg_function[[col_index]]))
        required_args=args_names[which(args_names!="...")]

        ##Arity of the function can be either 1 or 2 (for instance for weighted.mean)
        if (length(required_args)>1)
        {
          agg_function[[col_index]](data_tp[[col_index]],data_tp[[count_col]])
        }
        else
        {
          agg_function[[col_index]](data_tp[[col_index]])
        }


        },data_tp=.SD),.SDcols=c(count_col,value_cols)]
    }
    )
    ##Unnesting
    res[3:(3+length(value_cols))]<-res[[3]]%>%as.list()
    ##Setting proper names
    names(res)<-c('name','children',count_col, value_cols)
    if (!is.null(nodes_data))
    {
      res=c(res,nodes_data[[res$name]])
    }
    return(res)
  }
}


#' Return al the possible nodes names
#' @param nested_list A nested_list where each node has a name attribute
#' @param variable the variable to collect
#' @export
get_all_nodes_names=function(nested_list,variable='name')
{
  if (is.null(nested_list$children))
  {
    return(null_swap(nested_list[[variable]]))
  }
  else
  {
    return(c(null_swap(nested_list[[variable]]),sapply(nested_list$children,get_all_nodes_names,variable)%>%unlist())%>%unique())
  }

}

null_swap=function(x)
{
  if (is.null(x))
  {
    return('NA')
  }
  else
  {
    return(x)
  }
}

#' Return al the leaf names
#' @param nested_list A nested_list where each node has a name attribute
#' @export
compute_unique_leaf_name<-function(nested_list)
{
  res=c()
  for (elt in nested_list)
  {
    res=c(res,names(elt))%>%unique()
  }
  return(res)
}

#' Find the maximum values of a given var in a tree
#' @param nested_list A nested_list where each node has a name attribute
#' @param variable A nested_list where each node has a name attribute
#' @export
find_min_max_tree<-function(nested_list,variable='value')
{
  current_max=nested_list[[variable]]
  current_min=nested_list[[variable]]
  if (!is.null(nested_list$children))
  {
    child_value=sapply(nested_list$children,find_min_max_tree,variable)
    if (max(child_value)>current_max)
      current_max=max(child_value)
    if (min(child_value)<current_min)
      current_min=min(child_value)
  }
  return(c(current_min,current_max))
}
