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

// this is for internal use
_p._beforeDrawing = function (gl) {};

// over this to do things like gl.enable(gl.CULL_FACE) or gl.enable(gl.DEPTH_TEST)
_p.beforeRender = function(gl) {};

_p.afterRender = function(gl) {};

module.exports = Points;
