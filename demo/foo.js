/*
Function deceleration example.
 */
const bar = require('./bar');

available_methonds = {
    
    func1: function (arg1, arg2) {
        console.log('f1: %s, %s', arg1, arg2);
    },

    func2: function(arg1) {
        console.log('f2: %s', arg1);
    }
};

console.log(available_methonds);

bar.Root(available_methonds);
