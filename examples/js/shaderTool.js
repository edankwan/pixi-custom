var shaderTool = (function(exports){

    var shaders = exports.shaders = {};

    var compileOptions = exports.compileOptions = {
        interpolate : /\#pragma\sinterpolate\s(.*)/g
    };

    function loadList(list, cb, needCompile) {
        var count = 0;
        var amount = 0;
        for(var i in list) {
            amount++;
        }
        function onLoad(shader, id) {
            count++;
            if(count == amount) {
                cb(shaders);
            }
        }
        for( i in list) {
            load(i, list[i], onLoad, needCompile);
        }

    }

    function load(id, url, cb, needCompile) {
        if(!shaders[id]) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                _onXmlReadyStateChange(request, id, cb, needCompile);
            };
            request.open('GET', url, true);
            request.send();
        } else {
            _onLoadSingleComplete(id, cb, needCompile);
        }
    }

    function _onLoadSingleComplete(id, cb, shader, needCompile) {
        if(needCompile) {
            shader = compile(shader);
        }
        if(!shaders[id]) {
            shaders[id] = shader;
        }
        if(cb) cb(shader, id);
    }

    function _onXmlReadyStateChange(request, id, cb, needCompile) {
        if (request.readyState == 4 && request.status == 200) {
            _onLoadSingleComplete(id, cb, request.responseText, needCompile);
        }
    }

    function compile(shader) {
        return _.template(shader, compileOptions)(shaders);
    }

    exports.loadList = loadList;
    exports.load = load;
    exports.compile = compile;

    return exports;

}({}));
