    function FSCopy(parameters, args) {

        var prime = this.removePrime(args);
        if (Array.isArray(prime)) {
            // prime is array of arguments
            if (prime.length && !args.src)      args.src = prime[0];
            if (prime.length > 1 && !args.dst)  args.dst = prime[1];
        } else if (prime) {
            // prime is hash
            if ('src' in prime && !args.src) args.src = prime.src;
            if ('dst' in prime && !args.dst) args.dst = prime.dst;
        }

        var fixed_params = parameters['{params}'];
        if (fixed_params && fixed_params.length) {
            if (!('src' in args)) args.src = fixed_params[0];
            if (fixed_params.length > 1 && !('dst' in args)) args.dst = fixed_params[1];
        }

        this.initialize('fs.copy', parameters, args);

        this.updateSync = function(err_callback) {
            try {
                iterateArgumentPairs(this.arguments, function(src_path, dst_path) {
                    var err_fired = false;
                    var read_stream = fs.createReadStream(src_path);
                    read_stream.on("error", function(err) {
                        if (!err_fired) {
                            err_fired = true;
                            err_callback(err);
                        }
                    });
                    var write_stream = fs.createWriteStream(dst_path);
                    write_stream.on("error", function(err) {
                        if (!err_fired) {
                            err_fired = true;
                            err_callback(err);
                        }
                    });
                    read_stream.pipe(write_stream);
                });
            } catch (e) {
                if (err_callback)
                    err_callback(e);
                else
                    throw e;
            }
        };
    }
    FSCopy.prototype = new NodePrototype();
    processor.typeRegister('fs.copy', FSCopy);