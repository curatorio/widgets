

let makeArray = function(array, results) {
    array = Array.prototype.slice.call( array );
    if ( results ) {
        results.push.apply( results, array );
        return results;
    }
    return array;
};

export default makeArray;
