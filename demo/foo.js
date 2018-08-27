const bar = require('./bar');

available_methonds = {
    
    func1: function (arg1, arg2) {
        console.log('f1: %s, %s', arg1, arg2);
    },

    func2: function() {
        console.log('f2');
    }
};

console.log(this.available_methonds);

bar.a72b484ce617307bf_4(available_methonds);
