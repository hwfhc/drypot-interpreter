const generator = require('../../src/index');
const {
    TokGen,
    ModeGen,
    tokenStream,
    rule,
    ENV
} = generator;

const sep = new TokGen({
    MATCH: /^(\(|\)|,|\.)/,
    type: 'sep',
    isStrictEqual: true
});
const ident = new TokGen({
    MATCH: /^[a-zA-Z_]+/,
    type: 'ident',
    eval: function () {
        return this.value;
    }
});
const html = new TokGen({
    MATCH: /^[^(`|{{|}})]+/,
    type: 'html',
    eval: function () {
        return this.value;
    }
});
const num = new TokGen({
    MATCH: /^[0-9]+/,
    type: 'num',
    eval: function () {
        return this.value;
    }
});

const code = new TokGen({
    MATCH: /^({{|}})/,
    type: 'code',
    hidden: true,
    isStrictEqual: true,
});
const quo = new TokGen({
    MATCH: /^(`)/,
    type: 'quo',
    hidden: true,
    isStrictEqual: true,
});
const punc = new TokGen({
    MATCH: /^(\(|\)|,|\.)/,
    type: 'punc',
    hidden: true,
    isStrictEqual: true,
});


const mode = new ModeGen({
    switch: function (char) {
        if (char === '{{')
            this.list = this.rule[2];


        if (char === '}}')
            this.list = this.rule[0];

        if (char === '`') {
            if (this.list === this.rule[1])
                this.list = this.rule[2];
            else
                this.list = this.rule[1];
        }

    },
    rule: [
        [html, code],//outCode
        [html, quo],//inStr
        [num, ident, quo, punc, code]//outStr
    ]
});

// arg : ident '=' ident 
var equal = rule('equal').add(ident).add(sep('=')).add(ident).setEval(
    function () {
        return this.getFirstChild().eval();
    }
);

module.exports = async function (code,callback){
    var ts = new tokenStream(code,mode);

    if(isError(ts)){
        callback(ts);
        return;
    }

    var ast =  equal.match(ts);
    
    if(isError(ast)){
        callback(ast);
        return;
    }

    callback(null,await ast.eval());
}

function isError(obj){
    return obj.__proto__ === Error.prototype;
}