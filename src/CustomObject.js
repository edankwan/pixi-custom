// define([
//         'PIXI',
//         'mout/object/mixIn'
//     ],
//     function(PIXI, mixIn) {

var CustomObject = (function () {

    var mixIn = mout.object.mixIn;

    var undef;

    function CustomObject(cfg) {

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

    var _p = CustomObject.prototype = Object.create(PIXI.Container.prototype);
    _p.constructor = CustomObject;

    _p._renderWebGL = function (renderer) {
        renderer.setObjectRenderer(this.shader);
       this.shader.render(this);
    };

    _p._beforeDrawing = function (gl) {};


    return CustomObject;

}());
