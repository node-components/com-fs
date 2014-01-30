    function File(parameters, args) {

        // prime is path
        args.path = this.removePrime(args);

        this.initialize('fs.file', parameters, args)
            .on('tick', function() {
                var path = args.path;
                if (path) {
                }
            });

        this.getOptions = function(options, write_mode) {
            if (!options) {
                var options = {},
                    parameters = this.parameters,
                    fixed_params = parameters['{params}'];

                if ('encoding' in args)             options.encoding = args.encoding;
                else if ('encoding' in parameters)  options.encoding = parameters.encoding;
                else                                options.encoding = fixed_params[0];

                if ('flag' in args)                 options.flag = args.flag;
                else if ('flag' in parameters)      options.flag = parameters.flag;
                else                                options.flag = fixed_params[(fixed_params.length > 2) ? 2 : 1];

                if ('mode' in args)                 options.mode = parseInt(args.mode);
                else if ('mode' in parameters)      options.mode = parseInt(parameters.mode);
                else if (fixed_params.length > 2)   options.mode = parseInt(fixed_params[1]);
            }
            return options;
        };
    }
    File.prototype = new FSObject();
    processor.typeRegister('fs.file', File);
