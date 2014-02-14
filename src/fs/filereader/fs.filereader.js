    function FileReader(parameters, args) {

        // prime is path
        if ('' in args) args.path = this.removePrime(args);

        this.initialize('fs.filereader', parameters, args);

        /**
         * Asynchronously reads the entire contents of the file.
         *
         * @param {object} [options] Options http://nodejs.org/api/fs.html
         * @param callback The callback is passed two arguments (err, data), where data is the contents of the file.
         * @returns {object} Returns this.
         */
        this.read = function(options, callback) {
            var fullpath = this.getFullPath();
            this.readFrom(fullpath, options, callback);
            return this;
        };

        /**
         * Asynchronously reads the entire contents of specified file.
         *
         * @param {string|fs.path} file_path File path.
         * @param {object} [options] Options http://nodejs.org/api/fs.html
         * @param callback The callback is passed two arguments (err, data), where data is the contents of the file.
         * @returns {object} Returns this.
         */
        this.readFrom = function(file_path, options, callback) {

            var fullpath = (typeof file_path === 'object') ? file_path.getFullPath() : file_path;

            if (typeof options === 'function')
                fs.readFile(fullpath, this.getOptions(), options);
            else
                fs.readFile(fullpath, options || this.getOptions(), callback);

            return this;
        };

        /**
         * Synchronously reads the entire contents of the file.
         *
         * @param {object} [options] Options http://nodejs.org/api/fs.html
         * @param {function} [callback] The callback is passed the contents of the file.
         * @returns {object} Returns this if specified callback and content of the file otherwise.
         */
        this.readSync = function(options, callback) {
            var fullpath = this.getFullPath();
            return this.readFromSync(fullpath, options, callback);
        };

        /**
         * Synchronously reads the entire contents of specified file.
         *
         * @param {string|fs.path} file_path File path.
         * @param {object} [options] Options http://nodejs.org/api/fs.html
         * @param {function} [callback] The callback is passed the contents of the file.
         * @returns {object} Returns this if specified callback and content of the file otherwise.
         */
        this.readFromSync = function(file_path, options, callback) {

            var fullpath = (typeof file_path === 'object') ? file_path.getFullPath() : file_path;

            if (typeof options === 'function') {
                var data = fs.readFileSync(fullpath, this.getOptions());
                options(data, this);
                return this;
            } else if (typeof callback === 'function') {
                var data = fs.readFileSync(fullpath, options || this.getOptions());
                options(data, this);
                return this;
            } else {
                return fs.readFileSync(fullpath, options || this.getOptions());
            }
        };

        this.readBufferSync = function(file_path) {
            this.buffer = this.readSync.apply(this, arguments);
            return this;
        };
    }
    FileReader.prototype = new File({},{});
    processor.typeRegister('fs.filereader', FileReader);