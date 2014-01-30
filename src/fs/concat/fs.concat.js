    function FSConcat(parameters, args) {
        this.initialize('fs.concat', parameters, args);
    }
    FSConcat.prototype = new NodePrototype();
    processor.typeRegister('fs.concat', FSConcat);