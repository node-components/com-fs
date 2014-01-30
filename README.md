com-fs
======

### basic file system components for [processor.js](http://aplib.github.io/processor.js)

[![NPM version](https://badge.fury.io/js/com-fs.png)](http://badge.fury.io/js/com-fs)

[GitHub repository](https://github.com/nodejs-components/com-fs)

### Installing

    npm install com-fs

### using


    var processor = require('processor'),
        create = processor.create.bind(processor);
    // using
        require('com-fs');


    // recursively walk and build file list
    create('fs.walker raw', [/.*\.js/, '/src'])
        .listSync(function(path) {
            ...
        });
    });

### components

fs.concat

fs.copy

fs.directory

fs.file

fs.fileconcat

fs.filereader

fs.filewriter

fs.list

fs.path

fs.replace

[fs.waker](src\fs\walker\fs.walker.html)
Iterate through a directory tree, enumerate directories and files