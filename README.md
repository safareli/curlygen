# curlygen
generate string variations from nested curly brace strings

##example 
```
> var curlygen = require('curlygen').curlygen
> curlygen('testSize-{m@s,l@m,xl@l}')
[ 'testSize-m@s', 'testSize-l@m', 'testSize-xl@l' ]
> curlygen('u-{padding,margin}{Left,Right}-{m@{s,xl},l@{m,xxl}}')
[ 'u-paddingLeft-m@s',
  'u-paddingLeft-m@xl',
  'u-paddingLeft-l@m',
  'u-paddingLeft-l@xxl',
  'u-paddingRight-m@s',
  'u-paddingRight-m@xl',
  'u-paddingRight-l@m',
  'u-paddingRight-l@xxl',
  'u-marginLeft-m@s',
  'u-marginLeft-m@xl',
  'u-marginLeft-l@m',
  'u-marginLeft-l@xxl',
  'u-marginRight-m@s',
  'u-marginRight-m@xl',
  'u-marginRight-l@m',
  'u-marginRight-l@xxl' ]
```