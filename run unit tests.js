//     processor.js
//     (c) 2013 vadim b. http://aplib.github.io/processor.js
//     license: MIT

// Run all *.utest.js recursively in subdirectories of /src

(function() { 'use strict';

    var processor = require('processor'),
        create = processor.create.bind(processor);
// using
    require('./com-fs.js');

    var failed = [];
    create('fs.walker raw [f]', [/.*\.utest\.js/i, '.'])
        .listSync(function(fname) {
            console.log('\n#' + fname);
            console.log('--------------------------');
            try {
                var unit = require('./' + fname);
            } catch (e) {
                console.log(e);
                failed.push(fname);
            }
            console.log('/#' + fname);
        });

    console.log('\n==========================');
    console.log('failed:\n' + failed.join('\n'));

})();