const isError = require('iserror');

class Repeat{
    /*
     * repeat 0 time or more time
     *
     */
    constructor(list){
        this.list = list;

        if (!list || list.length === 0)
            throw new Error('arg of repeat can not be undefined');
    }

    match(tokenStream){
        let astArr = [];

        while(!tokenStream.isNull()){
            let result = matchOnce(this.list,tokenStream);

            if (result)
                insertAtLastOfArr(astArr, result);
            else
                break;
        }

        return astArr;
    }
}

function matchOnce(list,tokenStream){
    var rollbackPoint = tokenStream.createRollbackPoint();
    var arrOfResult = [];

    for(var i=0;i<list.length;i++){
        var result =  list[i].match(tokenStream);

        if(isError(result)){
            tokenStream.rollback(rollbackPoint);
            return false;
        }else
            arrOfResult.push(result);
    }

    return arrOfResult;
}


function insertAtLastOfArr(main,arr){
    for(var i=0;i<arr.length;i++)
        main.push(arr[i]);
}

module.exports = Repeat;
