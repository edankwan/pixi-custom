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

        bounds: new PIXI.Rectangle(-1, -1, 2, 2),

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

_p.getBounds = function (matrix) {
    if(!this._currentBounds) {

        if (!this.renderable) {
            return PIXI.math.Rectangle.EMPTY;
        }
        var bounds = this.bounds;
        var w0 = bounds.x;
        var w1 = bounds.width + bounds.x;
        var h0 = bounds.y;
        var h1 = bounds.height + bounds.y;
        var worldTransform = matrix || this.worldTransform;
        var a = worldTransform.a;
        var b = worldTransform.b;
        var c = worldTransform.c;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;
        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;
        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;
        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;
        var x4 =  a * w1 + c * h0 + tx;
        var y4 =  d * h0 + b * w1 + ty;
        var maxX = x1;
        var maxY = y1;
        var minX = x1;
        var minY = y1;
        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;
        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;
        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;
        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;
        this._bounds.x = minX;
        this._bounds.width = maxX - minX;
        this._bounds.y = minY;
        this._bounds.height = maxY - minY;
        this._currentBounds = this._bounds;
    }
    return this._currentBounds;
};

module.exports = Points;
