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
