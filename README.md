## PIXI-CUSTOM

A flexible(sort of) way to expose the possibility of using vertex shader in PIXI 3.0

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
    uTime : 0
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