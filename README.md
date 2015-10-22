## PIXI-CUSTOM

PIXI-CUSTOM provides PIXI users a flexible(sort of) way to use custom geometries and vertex shader in PIXI 3.

PIXI-CUSTOM is made with browserify and love. However, I believe most of our users use the standalone version for PIXI, therefore even though you can install PIXI-CUSTOM with npm `pixi-custom`, I assume you have your PIXI exposed as a global variable in your website. If you just use to download the standalone version of PIXI-CUSTOM, you can [**DOWNLOAD IT HERE**](https://raw.githubusercontent.com/edankwan/pixi-custom/master/examples/js/pixiCustom.js) 

Do you want to put a 3D globe or other 3D models into PIXI? Pixi-custom can make it happens!

Not convinced yet? Check out the the following examples:

### Examples
#### Particles
[![http://edankwan.github.io/pixi-custom/examples/points.html](http://edankwan.github.io/pixi-custom/screenshot/points.jpg)](http://edankwan.github.io/pixi-custom/examples/points.html)

#### Lines
[![http://edankwan.github.io/pixi-custom/examples/lines.html](http://edankwan.github.io/pixi-custom/screenshot/lines.jpg)](http://edankwan.github.io/pixi-custom/examples/lines.html)

#### Mesh
[![http://edankwan.github.io/pixi-custom/examples/mesh.html](http://edankwan.github.io/pixi-custom/screenshot/mesh.jpg)](http://edankwan.github.io/pixi-custom/examples/mesh.html)

#### Update Attributes
[![http://edankwan.github.io/pixi-custom/examples/update-attributes.html](http://edankwan.github.io/pixi-custom/screenshot/update-attributes.jpg)](http://edankwan.github.io/pixi-custom/examples/update-attributes.html)

#### Multi Instances
[![http://edankwan.github.io/pixi-custom/examples/multi-instances.html](http://edankwan.github.io/pixi-custom/screenshot/multi-instances.jpg)](http://edankwan.github.io/pixi-custom/examples/multi-instances.html)

#### Draw Offset
[![http://edankwan.github.io/pixi-custom/examples/draw-offset.html](http://edankwan.github.io/pixi-custom/screenshot/draw-offset.jpg)](http://edankwan.github.io/pixi-custom/examples/draw-offset.html)

#### Model
[![http://edankwan.github.io/pixi-custom/examples/model.html](http://edankwan.github.io/pixi-custom/screenshot/model.jpg)](http://edankwan.github.io/pixi-custom/examples/model.html)

#### Using filters with PIXI-CUSTOM
[![http://edankwan.github.io/pixi-custom/examples/mesh-post-processing.html](http://edankwan.github.io/pixi-custom/screenshot/mesh-post-processing.jpg)](http://edankwan.github.io/pixi-custom/examples/mesh-post-processing.html)


### Usage

```js
var shader = new pixiCustom.Shader({
    renderer: renderer,
    vs : vsString,
    fs : fsString,
    attributes : {
        aRandom: { type: '1f' }
    },
    uniforms : {
        uTime:  { type: '1f' }
    }
});
```
The codes above will define the shader interface but it doesn't store the data.

As you have to have vertices in the PIXI mesh, otherwise it will throw an error, I pre-inserted the default vertices attribute in the Class like:

```js
attributes : {
	vertices: {
	    // id is the variable name in the glsl, if not defined, it uses the property name instead
	    id: 'aVertexPosition',
	    // usage: 'DYNAMIC_DRAW',
	    // not support object type like v2 PIXI.Point
	    type: '2f'
	}
}
```
If you want to override it using 3 dimensional float, you can add the whole chunk in to override it (See [Mesh](http://edankwan.github.io/pixi-custom/examples/mesh.html)) 

After the shader is created, the values will be placed at the root of the object like this:
```js
particles = new pixiCustom.Points({
    shader : shader,
    vertices : vertices,
    aRandom : aRandom,
    uTime : 0,
    beforeRender : function(gl) {
        // in case you want to do some advanced stuff
        // gl.enable(gl.DEPTH_TEST);
        // gl.enable(gl.CULL_FACE);
        // gl.cullFace(gl.BACK);
    },
    afterRender : function(gl) {
        // gl.disable(gl.DEPTH_TEST);
    }
});

```
Which means you can easily change the values by doing:
```
particles.aRandom[0] = 100;
particles.dirties['aRandom'] = true;

particles.uTime += dt;
```

### Internal Uniforms
If we don't take good use of the PIXI container system, there is no point to use PIXI. So, PIXI Custom respect the internal uniform setting.
```
// translation matrix
uniform mat3 translationMatrix;

// projection matrix
uniform mat3 projectionMatrix;

// alpha value that multiplied parent container alpha 
uniform float alpha;
```


### Using filters with Pixi-custom
As Pixi-custom allows us to customize the geometry and to use the vertex shader, there is no way for PIXI to know what is the actual bound box of the instance to apply the filters. So, since PIXI-custom `0.0.7`, we allow you to set the bound box manually so that the filters can work properly.
```
var myMesh = new pixiCustom.Mesh({...});
myMesh.bounds = new PIXI.Rectangle(-100, -100, 200, 200); // x: -100, y: -100, width: 200, height: 2000

var blurFilter = new PIXI.filters.BlurFilter();
blurFilter.blur = 4;
myMesh.filters = [blurFilter];

```

## Contribute

Please files issues for any bugs you ran into and features you want to be added into PIXI-CUSTOM. Any pull requests are welcome as well :)

## License

This content is released under the (http://opensource.org/licenses/MIT) MIT License.