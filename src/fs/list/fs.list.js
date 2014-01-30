    function FSList(parameters, args) {
        var def_params = this.splitParams(),
            prime = this.removePrime(args);
        // prime[0] or params[0] is filter
        args.filter = (prime && prime[0]) || (def_params && def_params[0]);
        // prime[1] or params[1] is path
        args.path = (prime && prime[1]) || (def_params && def_params[1]);
        if (typeof args.filter === 'string') {
            var filter = args.filter;
            if (filter[0] === '/') {
                var match = /\/(.*)\/([gimy]*)]/.exec(filter);
                if (match)
                    args.filter = new RegExp(match[0], match[1]);
            } else
                args.filter = new RegExp(args.filter, 'i'); // default case-insensitive
        }

        this.initialize('fs.list', parameters, args);
        this.readSync = function() {
            var list = fs.readdirSync(this.getFullPath()),
                filter = args.filter,
                result = [];
            if (!filter)
                result = list;
            else {
                for(var i = 0, c = list.length; i < c; i++) {
                    var item = list[i];
                    if (filter.test(item))
                        result.push(item);
                }
            }

            // if not raw parameter cast items to fs.path
            if (!this.parameters.raw)
            for(var i = 0, c = result.length; i < c; i++)
                result[i] = process.create('fs.path', result[i]);

            return result;
        };
    }
    FSList.prototype = new FSPath({},{});
    processor.typeRegister('fs.list', FSList);