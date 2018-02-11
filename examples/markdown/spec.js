const generator = require('../../src/index');
const {
    TokGen,
    ModeGen,
    rule,
    getInterpreter,
    ENV
} = generator;

const punc = new TokGen({
    MATCH: /^((##)|(\*\*)|(\+)|(\`\`\`)|\n)/,
    type: 'punc',
    isStrictEqual: true,
    hidden: true
});
const str = new TokGen({
    MATCH: /^[a-zA-Z_]+/,
    type: 'ident',
    eval: function () {
        return this.value;
    }
});

const mode = new ModeGen({
    switch: function (char) {
    },
    rule: [
        [punc, str]
    ]
});

// title : ## str
var title = rule('title').add(punc('##')).add(str).add(punc('\n')).setEval(
    function () {
        return `<h1>${this.getFirstChild().eval()}</h1>`;
    }
);

var black = rule('black').add(punc('**')).add(str).add(punc('**')).setEval(
    function () {
        return `<b>${this.getFirstChild().eval()}</b>`;
    }
);

var code = rule('code').add(punc('\`\`\`')).add(str).add(punc('\`\`\`')).setEval(
    function () {
        return `<code>${this.getFirstChild().eval()}</code>`
    }
);




var inline = rule('inline').or([black, code, str]).setEval(
    function () {
        return `${this.getFirstChild().eval()}`;
    }
);

var para = rule('para').repeat([inline]).add(punc('\n')).setEval(
    function () {
        var str = '';
        var arr = this.getChildren();

        arr.forEach((item) => {
            str += item.eval();
        });

        return str;
    }
);

var item = rule('item').add(punc('+')).repeat([inline]).setEval(
    function () {
        var str = '';
        var arr = this.getChildren();

        arr.forEach((item) => {
            str += item.eval();
        });

        return `<li>${str}</li>`;
    }
);

var list = rule('list').add(item).add(punc('\n')).repeat([item, punc('\n')]).setEval(
    function () {
        var str = '';
        var arr = this.getChildren();

        arr.forEach((item) => {
            str += `${item.eval()}`;
        });

        return `<ul>${str}</ul>`;
    }
);
var stmt = rule('stmt').or([list,title,para]).setEval(
    function () {
        return `${this.getFirstChild().eval()}`;
    }
);

var text = rule('text').repeat([stmt]).setEval(
    function () {
        var str = '';
        var arr = this.getChildren();

        arr.forEach((item)=>{
            str += item.eval();
        });

        return str;
    }
);

module.exports = getInterpreter(mode,text);
