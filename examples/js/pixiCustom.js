(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pixiCustom = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    Lines: require('./lib/Lines'),
    Mesh: require('./lib/Mesh'),
    Points: require('./lib/Points'),
    Shader: require('./lib/Shader')
};

},{"./lib/Lines":2,"./lib/Mesh":3,"./lib/Points":4,"./lib/Shader":5}],2:[function(require,module,exports){
var fillIn = require('mout/object/fillIn');
var Points = require('./Points');

var undef;

function Lines(cfg) {

    fillIn(cfg, {
        drawMode: 'LINES',
        lineWidth: 1
    });

    Points.call( this, cfg );

}

var _p = Lines.prototype = Object.create(Points.prototype);
_p.constructor = Lines;

_p._beforeDrawing = function (gl) {
    gl.lineWidth(this.lineWidth);
};

module.exports = Lines;

},{"./Points":4,"mout/object/fillIn":10}],3:[function(require,module,exports){
var fillIn = require('mout/object/fillIn');
var Points = require('./Points');

var undef;

function Mesh(cfg) {

    fillIn(cfg, {
        drawMode: 'TRIANGLES'
    });

    Points.call( this, cfg );

}

var _p = Mesh.prototype = Object.create(Points.prototype);
_p.constructor = Mesh;

module.exports = Mesh;

},{"./Points":4,"mout/object/fillIn":10}],4:[function(require,module,exports){
var mixIn = require('mout/object/mixIn');

var undef;

function Points(cfg) {

    PIXI.Container.call(this);

    mixIn(this, {

        vertices: undef,

        shader: undef,

        drawMode: 'POINTS',

        buffers: {},

        dirties: {},

        drawOffset: 0,

        cullFace: false, //'BACK' or 'FRONT'

        blendMode : PIXI.BLEND_MODES.NORMAL,

        drawCount: 4294967295

    }, cfg);

    if(!this.shader) {
        console.error('shader is missing.');
    }

    if(!this.vertices) {
        console.error('vertices is missing.');
    }

    this.hasInitialized = false;

}

var _p = Points.prototype = Object.create(PIXI.Container.prototype);
_p.constructor = Points;

_p._renderWebGL = function (renderer) {
    renderer.setObjectRenderer(this.shader);
   this.shader.render(this);
};

_p._beforeDrawing = function (gl) {};

module.exports = Points;

},{"mout/object/mixIn":14}],5:[function(require,module,exports){
var deepMixIn = require('mout/object/deepMixIn');

var undef;

// actually it is extending ObjectRenderer. but the name renderer is confusing
// so I use shader instead and put the shader instance into this class
function Shader(cfg) {

    deepMixIn(this, {

        // need to pass the current renderer here
        renderer: undef,

        vs: '',

        fs: '',

        internalUniforms: {
            // not support object type like v2 PIXI.Point
            alpha:  { type: '1f', value: 0 },
            translationMatrix: { type: 'm3', value: new Float32Array(9) },
            projectionMatrix: { type: 'm3', value: new Float32Array(9) }
        },

        internalAttributes: {
            aVertexPosition: 0
        },

        attributes : {
            vertices: {
                // id is the variable name in the glsl, if not defined, it uses the property name instead
                id: 'aVertexPosition',

                // usage: 'DYNAMIC_DRAW',

                // not support object type like v2 PIXI.Point
                type: '2f'
            }
            // indices: {
            //     id: 'aIndex',
            //     bufferType: 'ELEMENT_ARRAY_BUFFER',
            //     type: '1f'
            // }
            // uvs: {
            //     id: 'aTextureCoord',
            //     type: '2f'
            // }
        },

        uniforms : {
            // store the value in the Object
            // uTime:  { type: '1f'},
            // texture:  { id: 'uSampler', type: '1f'}
        }
    }, cfg);

    this.vs = this.vs;
    this.fs = this.fs;

    if(!this.renderer) {
        console.error('renderer is missing.');
    }

    this.shader = new PIXI.Shader(
        this.renderer.shaderManager,
        this.vs,
        this.fs,
        this.internalUniforms,
        this.internalAttributes
    );

    this.gl = this.renderer.gl;
    this.program = this.shader.program;

    this._initUniforms();
    this._initAttributes();

    PIXI.ObjectRenderer.call(this, this.renderer);

}

var _p = Shader.prototype = Object.create(PIXI.ObjectRenderer.prototype);
_p.constructor = Shader;

function _initUniforms() {

    this.internalUniforms = this.shader.uniforms;

    var id, uniform;
    var gl = this.gl;
    var program = this.program;
    var uniforms = this.uniforms;
    var textureIndex = 0;
    var notFoundIds = [];

    for(id in this.uniforms) {
        uniform = uniforms[id];
        uniform.id = uniform.id || id;
        uniform.location = gl.getUniformLocation(program, uniform.id);
        if(uniform.location < 0) {
            notFoundIds.push(id);
        } else {
            if(uniform.type == 't') {
                uniform.isTexture = true;
                if(uniform.textureIndex === undef) {
                    uniform.textureIndex = textureIndex++;
                    gl.uniform1i(uniform.location, uniform.textureIndex);
                }
            } else {
                var suffix = uniform.type;
                if(suffix.indexOf('m') === 0) {
                    suffix = 'Matrix' + suffix.substr(1, 1) + 'fv';
                    uniform.isMatrix = true;
                }
                uniform.func = gl['uniform' + suffix];
            }
        }
    }

    this._removeNotFoundIds(uniform, notFoundIds);
}

function _initAttributes() {

    this.internalAttributes = this.shader.attributes;

    var id, attribute;
    var gl = this.gl;
    var program = this.program;
    var internalAttributes = this.internalAttributes;
    var attributes = this.attributes;
    var notFoundIds = [];

    for(id in this.attributes) {
        attribute = attributes[id];
        attribute.id = attribute.id || id;
        attribute.location = internalAttributes[attribute.id] === undef ? gl.getAttribLocation(program, attribute.id) : internalAttributes[attribute.id];

        if(attribute.location < 0 && attribute.bufferType !== 'ELEMENT_ARRAY_BUFFER') {
            notFoundIds.push(id);
        } else {
            attribute.attributeSize = parseInt(attribute.type, 10);
            if(!attribute.bufferType) attribute.bufferType = 'ARRAY_BUFFER';
            if(!attribute.usage) attribute.usage = 'STATIC_DRAW';

            internalAttributes[id] = attribute.location;
        }
    }
    this._removeNotFoundIds(attributes, notFoundIds);
}

_p._removeNotFoundIds = function(obj, notFoundIds) {
    for(var i = 0, len = notFoundIds.length; i < len; i++) {
        delete obj[notFoundIds[i]];
    }
};

_p.onContextChange = function() {

};

_p.render = function(customObject) {
    if(!customObject.visible || customObject.alpha <= 0) return;

    if(!customObject.hasInitialized) {
        this._initWebGL(customObject);
    }

    var id, ref, buffer, uniform, attribute;
    var renderer = this.renderer;
    var gl = this.gl;
    var drawMode = gl[customObject.drawMode];
    var buffers = customObject.buffers;
    var dirties = customObject.dirties;
    var uniforms = this.uniforms;
    var attributes = this.attributes;

    renderer.blendModeManager.setBlendMode(customObject.blendMode);

    // set uniforms
    gl.uniformMatrix3fv(this.internalUniforms.translationMatrix._location, false, customObject.worldTransform.toArray(true));
    gl.uniformMatrix3fv(this.internalUniforms.projectionMatrix._location, false, renderer.currentRenderTarget.projectionMatrix.toArray(true));
    gl.uniform1f(this.internalUniforms.alpha._location, customObject.worldAlpha);


    if(customObject.cullFace) {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl[customObject.cullFace]);
    }

    for(id in uniforms) {
        uniform = uniforms[id];
        ref = customObject[id];
        if(ref !== undef) {
            if(uniform.isTexture) {
                gl.activeTexture(gl['TEXTURE' + uniform.textureIndex]);

                if(ref.baseTexture._glTextures[gl.id]) {
                    gl.bindTexture(gl.TEXTURE_2D, ref.baseTexture._glTextures[gl.id]);
                } else {
                    renderer.updateTexture(ref.baseTexture);
                }
            } else if(uniform.isMatrix){
                uniform.func.apply(gl, [uniform.location, !!uniform.transpose].concat(ref));
            } else {
                uniform.func.apply(gl, [uniform.location].concat(ref));
            }
        }
    }

    var useDrawElement = false;
    var drawCount;
    var drawOffset = customObject.drawOffset;

    for(id in attributes) {
        attribute = attributes[id];
        ref = customObject[id];
        bufferType = attribute.bufferType;
        if(dirties[id]) {
            dirties[id] = false;
            gl.bindBuffer(gl[bufferType], buffers[id]);
            gl.bufferData(gl[bufferType], customObject[id], gl[attribute.usage]);
        } else {
            gl.bindBuffer(gl[bufferType], buffers[id]);
        }

        if(bufferType !== 'ELEMENT_ARRAY_BUFFER') {
            gl.vertexAttribPointer(attribute.location, attribute.attributeSize, gl.FLOAT, false, 0, 0);
        } else {
            drawCount = customObject[id].length;
            useDrawElement = true;
        }
    }

    customObject._beforeDrawing(gl);

    if(useDrawElement) {
        drawCount = Math.min(customObject.drawCount, drawCount);
        gl.drawElements(drawMode, drawCount, gl.UNSIGNED_SHORT, drawOffset);
    } else {
        drawCount = Math.min(customObject.drawCount, customObject.vertices.length / attributes.vertices.attributeSize);
        gl.drawArrays(drawMode, drawOffset, drawCount);
    }

    if(customObject.cullFace) {
        gl.disable(gl.CULL_FACE);
    }

};

_p._initWebGL = function(customObject) {

    customObject.hasInitialized = true;

    var id, attribute;
    var gl = this.renderer.gl;
    var attributes = this.attributes;
    var buffers = customObject.buffers;
    for( id in attributes) {
        attribute = attributes[id];
        gl.bindBuffer(gl[attribute.bufferType], buffers[id] = gl.createBuffer());
        gl.bufferData(gl[attribute.bufferType], customObject[id], gl[attribute.usage || 'STATIC_DRAW']);
    }
};

_p.flush = function() {

};

_p.start = function() {

    this.renderer.shaderManager.setShader(this.shader);

};

_p.destroy = function() {

};

_p._initUniforms = _initUniforms;
_p._initAttributes = _initAttributes;


module.exports = Shader;


},{"mout/object/deepMixIn":9}],6:[function(require,module,exports){


    /**
     * Array forEach
     */
    function forEach(arr, callback, thisObj) {
        if (arr == null) {
            return;
        }
        var i = -1,
            len = arr.length;
        while (++i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
                break;
            }
        }
    }

    module.exports = forEach;



},{}],7:[function(require,module,exports){


    /**
     * Create slice of source array or array-like object
     */
    function slice(arr, start, end){
        var len = arr.length;

        if (start == null) {
            start = 0;
        } else if (start < 0) {
            start = Math.max(len + start, 0);
        } else {
            start = Math.min(start, len);
        }

        if (end == null) {
            end = len;
        } else if (end < 0) {
            end = Math.max(len + end, 0);
        } else {
            end = Math.min(end, len);
        }

        var result = [];
        while (start < end) {
            result.push(arr[start++]);
        }

        return result;
    }

    module.exports = slice;



},{}],8:[function(require,module,exports){


    /**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value && typeof value === 'object' &&
            value.constructor === Object);
    }

    module.exports = isPlainObject;



},{}],9:[function(require,module,exports){
var forOwn = require('./forOwn');
var isPlainObject = require('../lang/isPlainObject');

    /**
     * Mixes objects into the target object, recursively mixing existing child
     * objects.
     */
    function deepMixIn(target, objects) {
        var i = 0,
            n = arguments.length,
            obj;

        while(++i < n){
            obj = arguments[i];
            if (obj) {
                forOwn(obj, copyProp, target);
            }
        }

        return target;
    }

    function copyProp(val, key) {
        var existing = this[key];
        if (isPlainObject(val) && isPlainObject(existing)) {
            deepMixIn(existing, val);
        } else {
            this[key] = val;
        }
    }

    module.exports = deepMixIn;



},{"../lang/isPlainObject":8,"./forOwn":12}],10:[function(require,module,exports){
var forEach = require('../array/forEach');
var slice = require('../array/slice');
var forOwn = require('./forOwn');

    /**
     * Copy missing properties in the obj from the defaults.
     */
    function fillIn(obj, var_defaults){
        forEach(slice(arguments, 1), function(base){
            forOwn(base, function(val, key){
                if (obj[key] == null) {
                    obj[key] = val;
                }
            });
        });
        return obj;
    }

    module.exports = fillIn;



},{"../array/forEach":6,"../array/slice":7,"./forOwn":12}],11:[function(require,module,exports){
var hasOwn = require('./hasOwn');

    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }


        if (_hasDontEnumBug) {
            var ctor = obj.constructor,
                isProto = !!ctor && obj === ctor.prototype;

            while (key = _dontEnums[i++]) {
                // For constructor, if it is a prototype object the constructor
                // is always non-enumerable unless defined otherwise (and
                // enumerated above).  For non-prototype objects, it will have
                // to be defined on this object, since it cannot be defined on
                // any prototype objects.
                //
                // For other [[DontEnum]] properties, check if the value is
                // different than Object prototype value.
                if (
                    (key !== 'constructor' ||
                        (!isProto && hasOwn(obj, key))) &&
                    obj[key] !== Object.prototype[key]
                ) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    module.exports = forIn;



},{"./hasOwn":13}],12:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var forIn = require('./forIn');

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn(obj, function(val, key){
            if (hasOwn(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    module.exports = forOwn;



},{"./forIn":11,"./hasOwn":13}],13:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],14:[function(require,module,exports){
var forOwn = require('./forOwn');

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments[i];
            if (obj != null) {
                forOwn(obj, copyProp, target);
            }
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
    }

    module.exports = mixIn;


},{"./forOwn":12}]},{},[1])(1)
});