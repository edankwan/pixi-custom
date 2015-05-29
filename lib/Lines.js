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
