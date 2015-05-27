// define([
//         'PIXI',
//         './CustomObject',
//         'mout/object/fillIn'
//     ],
//     function(PIXI, CustomObject, fillIn) {

var CustomLine = (function () {

    var fillIn = mout.object.fillIn;

    var undef;

    function CustomLine(cfg) {

        fillIn(cfg, {
            drawMode: 'LINES',
            lineWidth: 1
        });

        CustomObject.call( this, cfg );

    }

    var _p = CustomLine.prototype = Object.create(CustomObject.prototype);
    _p.constructor = CustomLine;

    _p._beforeDrawing = function (gl) {
        gl.lineWidth(this.lineWidth);
    };

    return CustomLine;

}());
