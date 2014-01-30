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