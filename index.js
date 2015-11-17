var R = require('ramda');

R.lensIndexes = R.compose(R.apply(R.compose), R.map(R.lensIndex)) ;

var AST = exports.AST = {
  // [0, [0, [0, 1, -2]]] => [1, 1, 2]
  //deepest array shouldnot be ampty
  indexesOfDeepLast: function(ast){
    var indexes = []
    while(true){
      var lastidx  = ast.length - 1
      indexes.push(lastidx)
      if(Array.isArray(ast[lastidx])){
        ast = ast[lastidx]
      }else{
        return indexes
      }
    }
  },
  down: function(ast){
    var target = R.init(R.init(AST.indexesOfDeepLast(ast)))
    var concater = R.concat(R.__,[[[['']]]])
    if(target.length == 0)
      return concater(ast)

    return R.over( R.lensIndexes(target), concater, ast )
  },
  up: function(ast){
    var target = R.init(R.init(R.init(R.init(AST.indexesOfDeepLast(ast)))))
    var concater = R.concat(R.__,[['']])
    if(target.length == 0)
      return concater(ast)

    return R.over( R.lensIndexes(target), concater, ast )
  },
  flush: function(ast){
    var target = R.init(R.init(R.init(AST.indexesOfDeepLast(ast))))
    var concater = R.concat(R.__,[[['']]])
    if(target.length ==0)
      return concater(ast)

    return R.over( R.lensIndexes(target), concater, ast )
  },
  push: function(ast,char){
    return R.over(
      R.lensIndexes(AST.indexesOfDeepLast(ast)),
      R.concat(R.__,char),
      ast
    )
  }
}

var toAST = exports.toAST = R.compose(R.unnest,R.reduce(function(ast, char){
  if(char == '{'){
    return AST.down(ast)
  }else if(char =='}'){
    return AST.up(ast)
  }else if(char ==','){
    return AST.flush(ast)
  }else{
    return AST.push(ast,char)
  }
},[[['']]]))


var isArrayofArrays = function(arr){
  return R.is(Array,arr) && R.all(R.is(Array),arr)
}

var join = exports.join = R.map(R.join(''))

var generate = exports.generate = function(ast){
  var resolved = ast.map( function(node){
    if(isArrayofArrays(node)){
      return R.unnest(R.map(generate,node))
    } else {
      return node
    }
  })
  return R.map( R.flatten, ( R.commute( R.of, resolved)))
}

exports.curlygen = R.cond([
  [R.contains('{'),   R.compose(join,generate,toAST)],
  [R.T,               R.of]
])