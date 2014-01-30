    function FSDirectory(parameters, args) {
        // prime is path
        args.path = this.removePrime(args);

        this.initialize('fs.directory', parameters, args);
    }
    FSDirectory.prototype = new FSObject();
    processor.typeRegister('fs.directory', FSDirectory);
    processor.typeRegister('fs.dir', FSDirectory);