

ConvertPathToHierarchy<-function(list_path,list_value,root_in=FALSE)
{
  res=list()
  print(root_in)


  unique_elt<-unique(unlist(lapply(1:length(list_path),function(x){list_path[[x]][1]})))
  for (i in unique_elt)
  {

    list_rec_path=c()
    list_rec_value=c()
    res_tp=c()

    for (k in 1:length(list_path))
    {
      path_temp=list_path[[k]]
      if (path_temp[1]==i)
      {
        if (length(path_temp)==1)
        {
          res_tp=list(name=i,value=unlist(list_value[k]))
        }
        else
        {
          list_rec_value=c(list_rec_value,list_value[k])
          list_rec_path=c(list_rec_path,list(path_temp[2:length(path_temp)]))
        }
      }
    }
    if (length(list_rec_path)>0)
    {
      if (length(res_tp)>0)
        res=c(res,list(list(name=i,value=max(res_tp$value,0,na.rm=T),is_root=root_in,cumulative_value=sum(list_rec_value)+max(res_tp$value,0,na.rm=T),children=ConvertPathToHierarchy(list_rec_path,list_rec_value))))
      else
        res=c(res,list(list(name=i,is_root=root_in,value=max(res_tp$value,0,na.rm=T),cumulative_value=sum(list_rec_value)+max(res_tp$value,0,na.rm=T),children=ConvertPathToHierarchy(list_rec_path,list_rec_value))))
    }
    else
      res=c(res,list(list(name=i,is_root=root_in,value=res_tp$value,cumulative_value=res_tp$value)))
  }
  res<<-res
  return(res)
}

#' @import stats
generateRandomPath<-function(step=8,n_path=100)
{
  SAMPLE<-sample(LETTERS,10)
  list_path=unique(replicate(n_path,c('step A',paste('step', sample(SAMPLE,sample(sample(2:step,1),1))))))
  list_value=round(abs(rnorm(n_path,50,200)))[1:length(list_path)]
  RandomData<-ConvertPathToHierarchy(list_path,list_value,root_in=T)
  return(RandomData[[1]])
}

