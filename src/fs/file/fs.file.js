    function File(parameters, args) {

        // prime is path
        args.path = this.removePrime(args);

        this.initialize('fs.file', parameters, args)
            .on('tick', function() {
                var path = args.path;
                if (path) {
                }
            });

        /**
         * Merge options from arguments, parameters, fixed parameters and default options object. Options object used as an argument to call fs* methods.
         *
         * @param {object} [options] Default options hash object.
         * @param {boolean} write_mode Merge "mode" option for write operations.
         * @returns {object} Returns options hash object.
         */
        this.getOptions = function(options, write_mode) {
            if (!options) {
                var options = extend({}, options),
                    args = this.arguments,
                    parameters = this.parameters,
                    fixed_params = parameters['{params}'];

                if ('encoding' in args)             options.encoding = args.encoding;
                else if ('encoding' in parameters)  options.encoding = parameters.encoding;
                else if (fixed_params)              options.encoding = fixed_params[0];

                if ('flag' in args)                 options.flag = args.flag;
                else if ('flag' in parameters)      options.flag = parameters.flag;
                else if (fixed_params)              options.flag = fixed_params[(fixed_params.length > 2) ? 2 : 1];

                if (write_mode) {
                    if ('mode' in args)                 options.mode = parseInt(args.mode);
                    else if ('mode' in parameters)      options.mode = parseInt(parameters.mode);
                    else if (fixed_params && fixed_params.length > 2)   options.mode = parseInt(fixed_params[1]);
                }
            }
            return options;
        };
    }
    File.prototype = new FSObject();
    processor.typeRegister('fs.file', File);
