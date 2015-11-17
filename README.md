# curlygen
generate string variations from nested curly brace strings

##example 
```sh
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


### with React.js

monkeypatch React.createElement and desuger classNames

```javascript
import React from 'react'
import R from 'ramda'
import curlygen from 'curlygen'

const createElement = React.createElement
const desugar = R.compose(R.join(' '), R.flatten, R.map(curlygen.curlygen), R.split(' '))

// monkeypatch React
React.createElement = function(el, opts, ...args) {
  var params = Array.prototype.slice.call(arguments)
  if (opts && opts.className) {
    params = [el, R.assoc('className',desugar(opts.className),opts), ...args]
  }
  return createElement.apply(this, params)
}
```

instead of writing classes like this:

```html
<h1 className="u-textSize-3xl u-textSize-4xl@s u-textSize-5xl@m u-textSize-6xl@xl ">
  foo bar
</h1>
```

now you can write like so:

```html
<h1 className="u-textSize-{3xl,4xl@s,5xl@m,6xl@xl}">
  foo bar
</h1>
```