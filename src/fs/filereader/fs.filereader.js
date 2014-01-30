    function FileReader(parameters, args) {

        // prime is path
        if ('' in args) args.path = this.removePrime(args);

        this.initialize('fs.filereader', parameters, args);

        this.read = function(callback) {
            var fullpath = this.getFullPath(),
                options = this.getOptions(options);
            fs.readFile(fullpath, options, callback);
            return this;
        };

        this.readSync = function() {
            var fullpath = this.getFullPath(),
                options = this.getOptions(options);
            return fs.readFileSync(fullpath, options);
        };

        this.readBufferSync = function(file_path) {
            this.buffer = this.readSync.apply(this, arguments);
            return this;
        };

        this.readFromSync = function(file_path) {
            var fullpath = arguments.length ? file_path : this.getFullPath(),
                options = this.getOptions(options);
            return fs.readFileSync(fullpath, options);
        };
    }
    FileReader.prototype = new File({},{});
    processor.typeRegister('fs.filereader', FileReader);