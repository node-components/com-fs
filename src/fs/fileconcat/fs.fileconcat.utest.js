var processor = require('processor'),
    create = processor.create;
// using


// prepare test files
create('fs.filewriter(utf8)')
    .writeToSync('temp/test1.data', '0123456789')
    .writeToSync('temp/test2.data', 'abcdefghjk');

// concatenate files
create('fs.fileconcat', [['temp/test1.data', 'temp/test2.data'], 'temp/test3.data'])
    .startSync();

// check result
if ('0123456789abcdefghjk' !== create('fs.filereader(utf8)').readFromSync('temp/test3.data')) {
    debugger; throw new TypeError();
}


