var assert = require('assert');
var R = require('ramda');
var curlygen = require('../index.js');

var testByCases = function(fn,testCases){ return function(){
  R.map(function(testCase){
    var actual = fn.apply(null,testCase.input)
    var desired = testCase.result
    assert.deepEqual(actual,desired)
  }, testCases) 
}}

describe('curlygen', function() {
  describe('#AST', function () {
    describe('indexesOfDeepLast', function () {
      it('should return indexes of deep$last element', testByCases(curlygen.AST.indexesOfDeepLast,[
        {
          input:[
            [0, [0, [0, 1, -2]]],
          ],
          result: [1, 1, 2]
        },
        {
          input:[
            [
              ['bar'],
              ['foo', 'bar', ['aa', ['b']]],
              ['']
            ],
          ],
          result: [2,0]
        }
      ]));
    });
    describe('push', function () {
      it('should push char to deep&last element', testByCases(curlygen.AST.push,[
        {
          input:[
            [
              ['bar'],
              [['foo'],[['bar'],['baz']]]
            ],
            'a'
          ],
          result: [
            ['bar'],
            [['foo'],[['bar'],['baza']]]
          ],
        }
      ]));
    });
    describe('flush', function () {
      it('should create new place for next insetation', testByCases(curlygen.AST.flush,[
        {
          input:[
            [
              ['u-margin'],
              [
                [
                  ['m@'],
                  [
                    [
                      ['s'],
                      ['l']
                    ]
                  ],
                  ['']
                ]
              ]
            ]
          ],
          result: [
            ['u-margin'],
            [
              [
                ['m@'],
                [
                  [
                    ['s'],
                    ['l']
                  ]
                ],
                [''],
              ],
              [
                ['']
              ]
            ]
          ],
        }
      ]));
    });
    describe('up', function () {
      it('should crate new place up the tree', testByCases(curlygen.AST.up,[
        { 
          input: [
            [
              ["m@"],
              [
                [
                  ["s"],
                  ["xl"]
                ]
              ]
            ]
          ],
          result: [
            ["m@"],
            [
              [
                ["s"],
                ["xl"]
              ]
            ],
            [""],
          ] 
        },
        {
          input:[
            [
              ['u-margin'],
              [
                [
                  ['m@'],
                  [
                    ['s'],
                    ['l']
                  ]
                ]
              ]
            ]
          ],
          result: [
            ['u-margin'],
            [
              [
                ['m@'],
                [
                  ['s'],
                  ['l']
                ]
              ],
              ['']
            ]
          ],
        }
      ]));
    });
    describe('down', function () {
      it('should crate new place down the tree', testByCases(curlygen.AST.down,[
        {
          input:[
            [
              ['u-margin-m@']
            ]
          ],
          result: [
            ['u-margin-m@'],
            [
              [
                ['']
              ]
            ]
          ],
        }
      ]));
    });
  });
  describe('#toAST()', function () {
    it('should parse string into AST', testByCases(curlygen.toAST,[
      {
        input: ['m@{s,xl}l@{m,xxl}'],
        result: [
          ["m@"],
          [
            [
              ["s"],
            ],
            [
              ["xl"]
            ]
          ],
          ["l@"],
          [
            [
              ["m"],
            ],
            [
              ["xxl"]
            ]
          ],
          [""]
        ]
      },
      {
        input: ['u-{margin,padding}-m'],
        result: [
          ["u-"],
          [
            [
              ["margin"],
            ],
            [
              ["padding"]
            ]
          ],
          ["-m"]
        ]
      },
      {
        input: ['u-margin-{m@{s,l},l@{m,xl}}'],
        result: [
          ['u-margin-'],
          [
            [
              ['m@'],
              [
                [
                  ['s'],
                ],
                [
                  ['l'],
                ]
              ],
              [''],
            ],
            [
              ['l@'],
              [
                [
                  ['m'],
                ],
                [
                  ['xl'],
                ]
              ],
              ['']
            ],
          ],
          ['']
        ]
      },
      {
        input: ["u-{margin{Left,Right},padding{Top,Bottom}}-{m@s,l@l}"],
        result: [
          ["u-"],
          [
            [
              ['margin'],
              [
                [
                  ['Left'],
                ],
                [
                  [ 'Right']
                ]
              ],
              [''],
            ],
            [  
              ['padding'],
              [
                [
                  ['Top'],
                ],
                [
                  [ 'Bottom']
                ]
              ],
              [''],
            ]
          ],
          ['-'],
          [
            [
              ['m@s'],
            ],
            [
              ['l@l']
            ]
          ],
          ['']
        ]
      }
    ]))
  });
  describe('#generate()', function () {
    it('should generate variations from AST', testByCases(curlygen.generate,[
      {
        input: [curlygen.toAST('u-{margin,padding}-m')],
        result:[ 
          [ 'u-', 'margin', '-m' ],
          [ 'u-', 'padding', '-m' ]
        ]
      },
      {
        input: [curlygen.toAST('u-margin-m@{s,m}')],
        result:[ 
          [ 'u-margin-m@', 's', '' ],
          [ 'u-margin-m@', 'm', '' ]
        ]
      },
      {
        input: [curlygen.toAST('u-{margin,padding}-m@{s,m}')],
        result:[ 
          [ 'u-', 'margin', '-m@', 's', '' ],
          [ 'u-', 'margin', '-m@', 'm', '' ],
          [ 'u-', 'padding', '-m@', 's', '' ],
          [ 'u-', 'padding', '-m@', 'm', '' ]
        ]
      },
      {
        input: [curlygen.toAST('u-margin-{m@{s,l}-,l@{m,xl}+}')],
        result:[ 
          [ 'u-margin-', 'm@', 's', '-','' ],
          [ 'u-margin-', 'm@', 'l', '-','' ],
          [ 'u-margin-', 'l@', 'm', '+','' ],
          [ 'u-margin-', 'l@', 'xl', '+','' ]
        ]
      },
      {
        input: [curlygen.toAST('u-{padding,margin}{Left,Right}-{m@{s,xl},l@{m,xxl}}')],
        result: [
          ['u-', 'padding', '', 'Left', '-', 'm@', 's', '', ''],
          ['u-', 'padding', '', 'Left', '-', 'm@', 'xl', '', ''],
          ['u-', 'padding', '', 'Left', '-', 'l@', 'm', '', ''],
          ['u-', 'padding', '', 'Left', '-', 'l@', 'xxl', '', ''],
          ['u-', 'padding', '', 'Right', '-', 'm@', 's', '', ''],
          ['u-', 'padding', '', 'Right', '-', 'm@', 'xl', '', ''],
          ['u-', 'padding', '', 'Right', '-', 'l@', 'm', '', ''],
          ['u-', 'padding', '', 'Right', '-', 'l@', 'xxl', '', ''],
          ['u-', 'margin', '', 'Left', '-', 'm@', 's', '', ''],
          ['u-', 'margin', '', 'Left', '-', 'm@', 'xl', '', ''],
          ['u-', 'margin', '', 'Left', '-', 'l@', 'm', '', ''],
          ['u-', 'margin', '', 'Left', '-', 'l@', 'xxl', '', ''],
          ['u-', 'margin', '', 'Right', '-', 'm@', 's', '', ''],
          ['u-', 'margin', '', 'Right', '-', 'm@', 'xl', '', ''],
          ['u-', 'margin', '', 'Right', '-', 'l@', 'm', '', ''],
          ['u-', 'margin', '', 'Right', '-', 'l@', 'xxl', '', ''],
        ]
      }
    ]))
  });
  describe('#curlygen()', function () {
    it('should generate variations', testByCases(curlygen.curlygen,[
      {
        input: ['u-{margin,padding}-m'],
        result:[ 
          'u-margin-m',
          'u-padding-m'
        ]
      },
      {
        input: ['u-margin-m@{s,m}'],
        result:[ 
          'u-margin-m@s',
          'u-margin-m@m'
        ]
      },
      {
        input: ['u-{margin,padding}-m@{s,m}'],
        result:[ 
          'u-margin-m@s',
          'u-margin-m@m',
          'u-padding-m@s',
          'u-padding-m@m'
        ]
      },
      {
        input: ['u-margin-{m@{s,l}-,l@{m,xl}+}'],
        result:[ 
          'u-margin-m@s-',
          'u-margin-m@l-',
          'u-margin-l@m+',
          'u-margin-l@xl+'
        ]
      },
      {
        input: ['u-{padding,margin}{Left,Right}-{m@{s,xl},l@{m,xxl}}'],
        result: [
          'u-paddingLeft-m@s',
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
          'u-marginRight-l@xxl',
        ]
      }
    ]))
  });
});