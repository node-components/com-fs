var processor = require('processor'),
    create = processor.create.bind(processor);

var w;

console.log('1. One primary value is path');
w = create('fs.walker', 'test/path1');
if (w.path !== 'test/path1') {
    debugger; throw new TypeError('expected: test/path1, value:' + w.path);
}

console.log('2. Two primary value is filter + path');
var regex = /.*/;
w = create('fs.walker', [regex, 'test/path1']);
if (w.filter !== regex || w.path !== 'test/path1') {
    debugger; throw new TypeError('fail');
}

console.log('3. Three primary value is filter + path + flags');
var regex = /.*/;
w = create('fs.walker', [regex, 'test/path1', 'fd']);
if (w.filter !== regex || w.path !== 'test/path1' || w.flags !== 'fd') {
    debugger; throw new TypeError('fail');
}
