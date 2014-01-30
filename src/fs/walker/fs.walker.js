    function FSWalker(parameters, args) {

        var def_params = this.splitParams(),
            prime = this.removePrime(args);
        if (!Array.isArray(prime))
            prime = [undefined, prime];
        // prime[0] or params[0] is match expression
        args.filter = !('filter' in args) && (prime && prime[0]) || (def_params && def_params[0]);
        // prime[1] or params[1] is start path
        args.path   = !('path' in args)   && (prime && prime[1]) || (def_params && def_params[1]);
        // prime[2] or params[2] is flags
        args.flags  = !('flags' in args)  && (prime && prime[2]) || (def_params && def_params[2]);

        if (typeof args.filter === 'string') {
            var filter = args.filter;
            if (filter[0] === '/') {
                var match = /\/(.*)\/([gimy]*)]/.exec(filter);
                if (match)
                    args.filter = new RegExp(match[0], match[1]);
            } else
                args.filter = new RegExp(args.filter, 'i'); // default case-insensitive
        }

        this.initialize('fs.walker', parameters, args);

        Object.defineProperties(this, {
            'filter': {
                get: function() { return this.arguments.filter; },
                set: function(value) { this.arguments.filter = value; }
            },
            'flags': {
                get: function() { return this.arguments.flags; },
                set: function(value) { this.arguments.flags = value; }
            }
        });

        this.listSync = function(callback) {
            // get flags
            var flags, params = this.parameters, args = this.arguments;
            if ('flags' in args)        flags = args.flags;
            else if ('flags' in params) flags = params.flags;
            else {
                for(var prop in params)
                if (params.hasOwnProperty(prop))
                if (prop[0] === '[' && prop.slice(-1) === ']') {
                    flags = prop.slice(1, -1);
                    break;
                }
            }
            flags = flags || 'f';
            var d_flag = (flags.indexOf('d') >= 0),
                f_flag = (flags.indexOf('f') >= 0),
                raw = params.raw,
                path,
                stack = [this.getFullPath()],
                filter = args.filter,
                result = [];

            while(path = stack.pop()) {

                var stat = fs.statSync(path);
                if (stat.isDirectory()) {
                    var list = fs.readdirSync(path);
                    list.reverse();
                    if (path)
                        for(var  i = 0, c = list.length; i < c; i++)
                            list[i] = path + '/' + list[i];
                    stack.push.apply(stack, list);
                    if (d_flag)
                        addResultItem(path);
                } else if (f_flag && (!filter || filter.test(path))) {
                    addResultItem(path);
                }
            }

            function addResultItem(item) {
                if (!raw)
                    item = processor.create('fs.path', item);
                if (!callback || callback(item))
                    result.push(item)
            }

            return result;
        };
    }
    FSWalker.prototype = new FSPath({},{});
    processor.typeRegister('fs.walker', FSWalker);