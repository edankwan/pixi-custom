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

