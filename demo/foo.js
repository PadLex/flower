/*
Function deceleration example.
 */

//import compiled script
const bar = require('./bar');

available_parameters = {
    counter: 7,

    print: function(arg1) {
        console.log('print: %s', arg1);
    }
};

console.log(available_parameters);

//Call first function and pass parameters used by the flowchart.
bar.Parent(available_parameters);
