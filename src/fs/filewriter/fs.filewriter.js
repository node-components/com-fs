    function FileWriter(parameters, args) {

        // prime is path
        args.path = this.removePrime(args);
        this.initialize('fs.filewriter', parameters, args);

        this.write = function(data, options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = undefined;
            }
            var fullpath = this.getFullPath(),
                options = this.getOptions(options, true),
                write_data = (typeof data === 'function') ? data() : data;

            fs.writeFile(fullpath, write_data, options, callback);
            return this;
        };

        this.writeSync = function(data, options) {
            var fullpath = this.getFullPath(),
                options = this.getOptions(options, true),
                write_data = (typeof data === 'function') ? data() : data;

            fs.writeFileSync(fullpath, write_data, options);
            return this;
        };

        this.writeTo = function(file_path, data, options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = undefined;
            }
            var fullpath = arguments.length ? file_path : this.getFullPath(),
                options = this.getOptions(options, true),
                write_data = (typeof data === 'function') ? data() : data;

            fs.writeFile(fullpath, data, options, callback);
            return this;
        };

        this.writeToSync = function(file_path, data, options) {
            var fullpath = arguments.length ? file_path : this.getFullPath(),
                options = this.getOptions(options, true),
                write_data = (typeof data === 'function') ? data() : data;

            fs.writeFileSync(fullpath, data, options);
            return this;
        };

        this.writeBuffer = function(options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = undefined;
            }
            return this.write(this.buffer, options, callback);
        };

        this.writeBufferSync = function(options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = undefined;
            }
            return this.writeSync(this.buffer, options);
        };

        this.writeBufferTo = function(file_path, options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = undefined;
            }
            return this.writeTo(this.buffer, options, callback);
        };
    }
    FileWriter.prototype = new File({},{});
    processor.typeRegister('fs.filewriter', FileWriter);