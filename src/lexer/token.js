module.exports = generator;

function generator(config) {
    // read properties of config
    if (!config.MATCH)
        throw Error(`token ${config.type}: MATCH can not be null`);

    const MATCH = getRegExp(config.MATCH);
    const type = config.type;
    const evalFunc = config.eval;
    const isStrictEqual = config.isStrictEqual;
    const hidden = config.isHiddenInAST;

    if (!type) throw Error(`token ${type}: type can not be undefined`);
    if (!hidden && !evalFunc) throw Error(`token ${type}: isHiddenInAST and eval can not be undefined simultaneously`);

    // create prototype of token constructor
    var proto = {
        _isHidden: function () {
            if (hidden)
                return true;
            else
                return false;
        },
        _isValueNull: isValueNull,
        _isTok: true,
        eval: evalFunc
    };

    // create token constructor
    var tok = function (value) {
        var obj = {};

        obj.type = type;
        obj.value = value;
        obj.hidden = hidden;

        obj.__proto__ = proto;

        return obj;
    };

    // add properties of constructor
    tok.MATCH = function (str) {
        var result = str.match(MATCH);
        if (!result) return { str, tokStr: false };

        str = str.substr(result[0].length);
        // return the string of token
        return { str, tokStr: result[0] };

    };
    tok.match = isStrictEqual ? matchValueEqual : matchTokTypeEqual;
    proto.match = tok.match;

    // set prototype
    tok.prototype = proto;
    tok.__proto__ = proto;

    return tok;
}

function getRegExp(exp) {
    if(Array.isArray(exp))
        return getRegExpFromArr(exp);
    else
        return getRegExpFromStr(exp);


    function getRegExpFromStr(exp) {
        return new RegExp(`^${exp}+`);
    }

    function getRegExpFromArr(arr) {
        if (arr.length === 0)
            throw Error('length of MATCH arr can not be 0');

        let str = '^(';
        let index = arr.length;
        let result = arr.map((item) => {
            return escape(item);
        });

        (function dispatch(i) {
            if (i >= index) return;

            if (i < index - 1)
                str += `(${result[i]})|`;
            else
                str += `(${result[i]})`;

            dispatch(i + 1);
        })(0);

        str += ')';

        return new RegExp(str);
    }
}

function isValueNull() {
    if (!this) throw Error('this is miss');
    if (this.value === undefined)
        return true;
    else
        return false;
}

function matchTokTypeEqual(tokenStream) {
    var tok = tokenStream.peek();

    if (!tok)
        return new Error('no tok in tokenStream');

    if (isSameToken(this, tok)) {
        tokenStream.next();
        return tok;
    } else {
        return new Error(formErrMessage(tokenStream));
    }

}
function matchValueEqual(tokenStream) {
    var tok = tokenStream.peek();

    if(!tok)
        return new Error('no tok in tokenStream');

    if (isValueEqual(this, tok)) {
        tokenStream.next();
        return tok;
    } else {
        return new Error(formErrMessage(tokenStream));
    }

}
function isSameToken(tok1, tok2) {
    if (tok1.__proto__ === tok2.__proto__)
        return true;
    else
        return false;
}

function isValueEqual(RuleTok, StreamTok) {
    return RuleTok.value === StreamTok.value;
}

function formErrMessage(tokenStream) {
    if (tokenStream.peek(0))
        var errMessage = tokenStream.peek(0).value;

    errMessage += tokenStream.peek().value;

    if (tokenStream.peek(2))
        errMessage += tokenStream.peek(2).value;
    if (tokenStream.peek(3))
        errMessage += tokenStream.peek(3).value;
        
    return `not match Error: "${errMessage.replace('\n', '\\n')}"
    at ${tokenStream.getLine()} : ${tokenStream.getLoc()}`;
}

function escape(item){
    let str = '';
    let char = '';

    for (let i = 0; i < item.length; i++) {
        if (item[i] === '\s')
            char = '\\s';
        else if (item[i] === '\n')
            char = '\\n';
        else if (item[i] === '\r')
            char = '\\r';
        else if (item[i] === '"')
            char = '\\"';
        else if (item[i] === '\'')
            char = '\\\'';
        else
            char = `\\${item[i]}`;

        str += char;
    }

    return str;
}

