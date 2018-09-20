module.exports.Foo = function (file) {

    module.exports.Foo_0(file);
};

module.exports.Foo_0 = function (file) {
    file.print("3");

    module.exports.Foo_1(file);
};

module.exports.Foo_1 = function (file) {
    file.print("4");
};

module.exports.Bar = function (file) {

    module.exports.Bar_0(file);
};

module.exports.Bar_0 = function (file) {
    file.print(file.counter);
    module.exports.Bar_1(file);
};

module.exports.Bar_1 = function (file) {
    file.counter++;
    if (file.counter <= 10) {
        module.exports.Bar_0(file);
    }
};

module.exports.Parent = function (file) {

    module.exports.Parent_0(file);
};

module.exports.Parent_0 = function (file) {
    file.print("Hello World");
    file.print("1");

    module.exports.Parent_1(file);
};

module.exports.Parent_1 = function (file) {
    file.print("2");
    module.exports.Foo_0(file);
    module.exports.Parent_2(file);
};

module.exports.Parent_2 = function (file) {
    file.print("5");
    module.exports.Parent_3(file);
};

module.exports.Parent_3 = function (file) {
    file.print("6");
    module.exports.Bar(file);
};
