module.exports.Section = function (file) {
    if (true) {
        module.exports.Section_0(file);
    }
};

module.exports.Section_0 = function (file) {
    file.func1(1, 'a');
    if (3 > 0) {
        module.exports.Table_1(file);
    }
    if (true) {
        module.exports.Section_1(file);
    }
};

module.exports.Section_1 = function (file) {
    file.func1(2, 'a');
    if (true) {
        module.exports.Section_2(file);
    }
};

module.exports.Section_2 = function (file) {
    file.func1(3, 'a');
    if (true) {
        module.exports.Table_2(file);
    }
};

module.exports.Table = function (file) {
    if (true) {
        module.exports.Table_0(file);
    }
};

module.exports.Table_0 = function (file) {
    file.func2(a);
    a++;
    if (true) {
        module.exports.Table_1(file);
    }
};

module.exports.Table_1 = function (file) {
    file.func1(1, 'b');
    if (true) {
        module.exports.Table_2(file);
    }
};

module.exports.Table_2 = function (file) {
    file.func1(1, 'b');
    if (a < 15) {
        module.exports.Table_0(file);
    }
};

module.exports.Root = function (file) {
    if (true) {
        module.exports.Root_0(file);
    }
    if (1 == 1) {
        module.exports.Section(file);
    }
};

module.exports.Root_0 = function (file) {
    a = 2;
    if (true) {
        module.exports.Root_1(file);
    }
};

module.exports.Root_1 = function (file) {
    file.func1(a, 'c');
    a++;
    if (true) {
        module.exports.Root_2(file);
    }
};

module.exports.Root_2 = function (file) {
    file.func1(a, 'c');
};
