// define([
//         'PIXI',
//         './CustomObject',
//         'mout/object/fillIn'
//     ],
//     function(PIXI, CustomObject, fillIn) {

var CustomMesh = (function () {

    var fillIn = mout.object.fillIn;

    var undef;

    function CustomMesh(cfg) {

        fillIn(cfg, {
            drawMode: 'TRIANGLES'
        });

        if(!cfg.vertices && cfg.planeWidth && cfg.planeHeight) {
            var planeHalfWidth = cfg.planeWidth / 2;
            var planeHalfHeight = cfg.planeHeight / 2;
            cfg.vertices = new Float32Array([
                -planeHalfWidth, planeHalfHeight, planeHalfWidth, planeHalfHeight,
                -planeHalfWidth, -planeHalfHeight, planeHalfWidth, -planeHalfHeight
            ]);
            cfg.uv = new Float32Array([
                0, 0, 1, 0,
                0, 1, 1, 1
            ]);
            cfg.drawMode = 'TRIANGLE_STRIP';
        }

        CustomObject.call( this, cfg );

    }

    var _p = CustomMesh.prototype = Object.create(CustomObject.prototype);
    _p.constructor = CustomMesh;

    return CustomMesh;

}());
