    function FSFileConcat(parameters, args) {

        var prime = this.removePrime(args);
        if (Array.isArray(prime)) {
            // prime is array of arguments
            if (prime.length && !args.src)      args.src  = prime[0];
            if (prime.length > 1 && !args.path) args.path = prime[1];
        } else if (prime) {
            // prime is hash
            if ('src'  in prime && !('src' in args))  args.src  = prime.src;
            if ('dst'  in prime && !('path' in args)) args.path = prime.dst;
            if ('path' in prime && !('path' in args)) args.path = prime.path;
        }

        var fixed_params = parameters['{params}'];
        if (fixed_params && fixed_params.length) {
            if (!('src' in args)) args.src  = fixed_params[0];
            if (fixed_params.length > 1 && !('path' in args)) args.path = fixed_params[1];
        }

        this.initialize('fs.concat', parameters, args);

        this.startSync = function(err_callback) {
            try {
                var src = normalizePathList(args.src),
                    dst = args.path;

                if (Array.isArray(dst))
                    dst = dst[0];

                // to get the path value call if item is a getter function
                if (typeof dst === 'function')
                    dst = dst();

                // cast to fs.path
                if (typeof dst !== 'object' || (dst.__type !== 'fs.path' && !(dst instanceof FSPath)))
                    dst = processor.create('fs.path', dst);

                if (!dst.path)
                    throw new TypeError('Empty destination file path!');

                // prototype implementation
                for(var i = 0, c = src.length; i < c; i++) {

                    var src_item = src[i];

                    if (!src_item.path)
                        throw new TypeError('Empty source file path!');

                    data = fs.readFileSync(src_item.path, {});
                    if (i === 0)
                        fs.writeFileSync(dst.path, data);
                    else
                        fs.appendFileSync(dst.path, data);
                }

            } catch (e) {
                if (err_callback)
                    err_callback(e);
                else
                    throw e;
            }
        };
    }
    FSFileConcat.prototype = new FSPath({},{});
    processor.typeRegister('fs.fileconcat', FSFileConcat);