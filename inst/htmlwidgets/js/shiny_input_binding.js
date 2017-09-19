
//get all the leaves of the current root
function getAllLeaves(root) {

      if (root.children===undefined)
      {
        return([root.data])
      }
      else
      {
        var res = []
        for (var child in root.children)
        {
          var leaves=getAllLeaves(root.children[child])
          for (leaf in leaves)
          {
            res.push(leaves[leaf])
          }
        }
        return(res)
      }
}


//Get all the nodes from the current root
function getAllNodes(root) {

      if (root.children===undefined)
      {
        return([root.data])
      }
      else
      {
        var res = []

        for (var child in root.children)
        {
          var nodes=getAllNodes(root.children[child])
          for (node in nodes)
          {
            res.push(nodes[node])
          }
        }
        delete root.data.children
        res.push(root.data)
        return(res)
      }
}

//Get the list of ancestors
function getAncestors(root) {

      if (root.parent===null)
      {
        delete root.data.children
        return(root.data)
      }
      else
      {
        res=[]
        delete root.data.children
        res.push(root.data)
        res.push(getAncestors(root.parent))
        return(res)
      }
}


//Getting all the path of a given tree i?e? all the succession of nodes
function getChildPath(root,current_path) {

  var current_path_tp=current_path.concat([root.data.name])

  if (root.children===undefined)
  {
    return([current_path_tp])
  }
  else
  {
    res=[]
    for (var child in root.children)
    {
        res=res.concat(getChildPath(root.children[child],current_path_tp))
    }
    return(res)
  }

}
