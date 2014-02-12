    function FSDirectory(parameters, args) {

        // prime is path
        if ('' in args)
            args.path = this.removePrime(args);

        this.initialize('fs.directory', parameters, args);

        this.unsafeRemoveSync = function(_path) {

            var path = (arguments.length) ? _path : this.getFullPath();

            if (!path)
                throw new TypeError('Invalid directory path!');

            while (path.slice(-1) === '/')
                path = path.slice(0, -1);

            var dirs = [path],
                rmdirs = [];

            while(path = dirs.pop()) {
                rmdirs.push(path);
                fs.readdirSync(path).forEach(function(name) {
                    var subpath = path + '/' + name;
                    if (fs.statSync(subpath).isDirectory())
                        dirs.push(subpath)
                    else
                        // delete file
                        fs.unlinkSync(subpath);
                });
            }
            while(path = rmdirs.pop())
                // delete directory
                fs.rmdirSync(path);
        };
    }
    FSDirectory.prototype = new FSObject();
    processor.typeRegister('fs.directory', FSDirectory);
    processor.typeRegister('fs.dir', FSDirectory);