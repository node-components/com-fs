//     com-fs basic io components for using with processor.js
//     (c) 2013 vadim b. https://github.com/node-components/com-fs
//     license: MIT

(function(){

    var processor = require('processor'),
        NodePrototype = processor.node_prototype,
        fs = require('fs');

    function FSPath(parameters, args) {
        this.initialize('fs.path', parameters, args);

        // prime or params[0] is path
        var def_params = this.splitParams();
        args.path = this.removePrime(args) || (def_params && def_params[0]);

        Object.defineProperty(this, 'isAbsolute', {
            get: function() {
                return this.arguments.isAbsolute;
            },
            set: function(value) {
                if (!this.arguments.path)
                    throw new TypeError('Ivalid file system path!');
                this.arguments.isAbsolute = value;
            }
        });

        Object.defineProperty(this, 'path', {
            get: function() {
                var path = this.arguments.path;
                return (path === undefined) ? '' : path;
            },
            set: function(value) {
                var path = this.arguments.path;
                if (typeof value !== 'string') {
                    if ('path' in value)
                        value = value.path;
                    if (typeof value !== 'string')
                        throw new TypeError('Ivalid file system path!');
                }
                this.arguments.path = value;
                if (value !== path)
                    this.raise('path', value, path);
            }
        });

        Object.defineProperty(this, 'fileName', {
            get: function() {
                var path = this.arguments.path;
                path = (path === undefined) ? '' : path;
                var full_name = path.split('/').slice(-1)[0];
                return ((full_name.indexOf('.') < 0) ? full_name : full_name.split('.').slice(0,1));
            }
        });

        Object.defineProperty(this, 'fileExtension', {
            get: function() {
                var path = this.arguments.path;
                path = (path === undefined) ? '' : path;
                var full_name = path.split('/').slice(-1)[0],
                    dotpos = full_name.indexOf('.');
                if (!full_name || dotpos < 0)
                    return '';
                return full_name.slice(dotpos);
            },
            set: function(value) {
                var path = this.arguments.path;
                path = (path === undefined) ? '' : path;
                // TODO
            }
        });

        Object.defineProperty(this, 'fullName', {
            get: function() {
                var args = this.arguments;
                return args.path && args.path.split('/').slice(-1);
            }
        });

        /**
         * @returns Returns the absolute path which can be a combination of several stacked objects fs.path representing path segments.
         */
        this.getFullPath = function() {
            var parent = this.parent;
            // skipt non path objects in hierarchy
            while(parent && parent._type !== 'fs.path' && !(parent instanceof FSObject))
                parent = parent.parent;
            return (parent) ? (parent.getFullPath() + '/' + this.path) : this.path;
        };

        this.getParentPath = function(algorithm) {
            // algorithm
            // 0 - parent from local path
            // 1 - parent from full path
            var path = (algorithm) ? this.getFullPath() : this.path;
            if (path) {
                if (path.slice(-2) === '//')
                    throw new TypeError('fs.path.getParentPath() invalid parent path');

                var last_slash = (path.slice(-1) === '/');
                if (last_slash)
                    path = path.slice(0, -1);
                path = path.split('/');
                var last_segment = path.slice(-1)[0],
                    parent_path = path.slice(0, -1).join('/');
                if (last_segment && last_segment.indexOf(':') >= 0)
                    throw new TypeError('fs.path.getParentPath() invalid parent path');
                if (last_slash)
                    parent_path += '/';
            } else {
                parent_path = '../';
            }
            return (this.parameters.raw) ? parent_path : processor.create('fs.path', parent_path);
        };

        this.getStat = function() {
            return fs.statSync(this.getFullPath());
        };

        this.ifExists = function(path, callback) {
            if (typeof path === 'function') {
                callback = path;
                path = this.getFullPath();
            }
            if (callback) {
                fs.exists(path, function(exists) {
                    if (exists)
                        callback.call(this);
                });
            }
            return this;
        };

        this.ifExistsSync = function(path, callback) {
            if (typeof path === 'function') {
                callback = path;
                path = this.getFullPath();
            }
            if (callback && fs.existsSync(path))
                callback.call(this);
            return this;
        };

        this.exists = function(path, callback) {
            if (typeof path === 'function') {
                fs.exists(this.getFullPath(), path);
            } else if (arguments.length)
                fs.exists.apply(fs, arguments);
            else
                fs.exists(this.getFullPath());
            return this;
        };

        this.existsSync = function(path, err_callback) {
            if (typeof path === 'function') {
                try {
                    fs.existsSync(this.getFullPath());
                } catch (e) {
                    path(e);
                }
            } else if (arguments.length)
                if (err_callback) {
                    try {
                        return fs.existsSync(path);
                    } catch (e) {
                        err_callback.call(this, e);
                    }
                } else
                    return fs.existsSync(path);
            else
                return fs.existsSync(this.getFullPath());
        };

        this.unlink = function(path, callback) {
            if (typeof path === 'function') {
                fs.unlink(this.getFullPath(), path);
            } else if (arguments.length)
                fs.unlink.apply(fs, arguments);
            else
                fs.unlink(this.getFullPath());
            return this;
        };

        this.unlinkSync = function(path, err_callback) {
            if (typeof path === 'function') {
                try {
                    fs.unlinkSync(this.getFullPath());
                } catch (e) {
                    path(e);
                }
            } else if (arguments.length)
                if (err_callback) {
                    try {
                        fs.unlinkSync(path);
                    } catch (e) {
                        err_callback(e);
                    }
                } else
                    fs.unlinkSync(path);
            else
                fs.unlinkSync(this.getFullPath());
            return this;
        };

        this.combine = function(sub_path) {
            var path = this.path || '';
            if (path)
                path += '/';
            path += sub_path;
            return processor.create('fs.path', path);
        };
    }
    FSPath.prototype = new NodePrototype();
    processor.typeRegister('fs.path', FSPath);


    // Common functions

    function normalizePathList(argument) {

        // to get the argument value call if it is a getter function
        if (typeof argument === 'function')
            argument = argument();

        // cast to array
        if (!Array.isArray(argument))
            argument = [argument];

        for(var i = 0, c = argument.length; i < c; i++) {

            var item = argument[i];

            // to get the path value call if item is a getter function
            if (typeof item === 'function')
                item = item();

            // cast to fs.path
            if (typeof item !== 'object' || (item.__type !== 'fs.path' && !(item instanceof FSPath)))
                item = argument[i] = processor.create('fs.path', item);
        }

        return argument;
    }

    function iterateArgumentPairs(args, callback) {

        // cast src and dst to array of fs.path objects
        var src = normalizePathList(args.src),
            dst = normalizePathList(args.dst);

        // case: incorrect destination list length
        if (dst.length !== 1 && dst.length !== src.length)
            throw new SyntaxError('Invalid destination argument');

        for(var i = 0, c = src.length; i < c; i++) {
            var src_item = src[i],
                dst_item = (dst.length === 1) ? dst[0] : dst[i];
            var src_stat = src_item.getStat();
            if (src_stat.isDirectory())
                throw new SyntaxError('Directory is invalid source');
            var src_path = src_item.getFullPath();
            var dst_stat = dst_item.getStat(),
                dst_path = (dst_stat.isDirectory()) ? dst_item.combine(src_item.fullName).getFullPath() : dst_item.getFullPath();
            callback(src_path, dst_path);
        }
    };

    function FSObject() {

        this.getRealPath = function() {
            var full_path = this.getFullPath();
            return fs.realpathSync(full_path);
        };

        // set file system watcher with fs.watch()
        this.setWatcher = function(persistent) {
            var full_path = this.getFullPath();

            if (!fs.existsSync(full_path))
                throw new TypeError('Invalid file system path!');

            if (!arguments.length)
                persistent = this.parameter('persistent-watcher');

            // set watcher
            return this.__watcher || (this.__watcher = fs.watch(full_path, {persistent: persistent}, function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift('watcher');
                this.raise.apply(this, args);
            }.bind(this)));
        };

        this.removeWatcher = function() {
            var watcher = this.__watcher;
            if (watcher) {
                watcher.close();
                delete this.__watcher;
            }
        };

        /*
         * Set file system watcher with fs.watchFile()
         *
         * @param {boolean} persistent indicates whether the process should continue to run as long as files are being watched
         * @param {number} interval indicates how often the target should be polled, in milliseconds
         */
        this.setFileWatcher = function(persistent, /* polled,ms */ interval) {
            var full_path = this.getFullPath();

            // remove previous watcher
            var watcher = this.__file_watcher;
            if (watcher && this.__file_watcher_file !== full_path) {
                fs.unwatchFile(this.__file_watcher_file);
                this.__file_watcher_file = undefined;
                this.__file_watcher = undefined;
                watcher = undefined;
            }
            // set watcher
            if (!watcher) {
                this.__file_watcher_file = full_path;
                this.__file_watcher = fs.watchFile(full_path, { persistent: persistent, interval: interval || 1007 }, function() {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift('fileWatcher');
                    this.raise.apply(this, args);
                }.bind(this));
            }
        };

        this.removeFileWatcher = function() {
            var watcher = this.__file_watcher;
            if (watcher) {
                fs.unwatchFile(this.__file_watcher_file);
                this.__file_watcher_file = undefined;
                this.__file_watcher = undefined;
            }
        };
    }
    FSObject.prototype = new FSPath({},{});

    function FSDirectory(parameters, args) {
        // prime is path
        args.path = this.removePrime(args);

        this.initialize('fs.directory', parameters, args);
    }
    FSDirectory.prototype = new FSObject();
    processor.typeRegister('fs.directory', FSDirectory);
    processor.typeRegister('fs.dir', FSDirectory);

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

    function FSConcat(parameters, args) {
        this.initialize('fs.concat', parameters, args);
    }
    FSConcat.prototype = new NodePrototype();
    processor.typeRegister('fs.concat', FSConcat);

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

        // fixed parameter is a path of target file
        var fixed_params = parameters['{params}'];
        if (fixed_params && fixed_params.length)
            if (!('path' in args)) args.path  = fixed_params[0];

        this.initialize('fs.fileconcat', parameters, args);

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

})();