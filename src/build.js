console.log('com-fs.js build script started');
console.log('---Initialization---');

var processor = require('processor'),
    fs = require('fs'),
    root = processor.root,
    create = processor.create.bind(processor);
// using
    require('com-fs');

var build_list = {'com-fs.js': '../com-fs.js'},
    watch_list = [],
    mtimes = {};

rebuildAll();
setInterval(checkFiles, 15000);
console.log('==Watchers started==');

function checkFiles() {
    // check files listed in watch_list
    for(var modified = false, i = 0, c = watch_list.length; i < c; i++) {
        var fpath = watch_list[i],
            mtime = fs.statSync(fpath).mtime.valueOf();
        if (mtime !== mtimes[fpath]) {
            modified = true;
            mtimes[fpath] = mtime;
        }
    }
    if (modified)
        rebuildAll();
}

function rebuildAll() {
    watch_list.length = 0;
    for(var source_path in build_list)
    if (build_list.hasOwnProperty(source_path)) {

        var target_path = build_list[source_path],
            // build source file
            result = processSourceFile('.', source_path);

        // watch source file
        watch_list.push(source_path);

        // changed, update target file
        var writer = create('fs.filewriter(utf8)', target_path);
        writer.writeSync(result);
        console.log(writer.path + ' updated');
    }
}

// recursively perform #include substitutions and build *.js parts list
function processSourceFile(work_directory, file_path) {

    var path = create('fs.path', work_directory).combine(file_path),
        source = create('fs.filereader(utf8)', path).readSync();

    // replace /*#include filename.ext*/
    var result = source.replace(/\/\*#include \S+\*\//gm, function(line) {
        var include_file_path = /\/\*#include (\S+)\*\//.exec(line)[1];
        // list .js file
        watch_list.push(include_file_path);
        // recursively perform substitutions
        return processSourceFile(path.getParentPath().path, include_file_path);
    });

    return result;
}

