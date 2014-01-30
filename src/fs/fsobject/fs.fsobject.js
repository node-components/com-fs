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