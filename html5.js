const path = require('path');

const exokitWindows = require(path.join(__dirname, 'build', 'Release', 'exokit.node'));

[
  'nativeGl',
  'nativeImage',
  'nativeImageData',
  'nativeImageBitmap',
  'nativeCanvasRenderingContext2D',
  'nativePath2D',
  'nativeWindow',
].forEach(k => { // XXX hook these in via exokit config option
  global[k] = exokitWindows[k];
});

const exokit = require('exokit');

// const {THREE} = exokit;

/* const {VERSION} = nativeGl;

nativeGl = {};
nativeGl.VERSION = VERSION; */
/* nativeGl.enable = () => {};
nativeGl.disable = () => {};
nativeGl.clear = () => {};
nativeGl.getExtension = () => null;
nativeGl.getParameter = id => {
  if (id === VERSION) {
    return 'WebGL 1';
  } else {
    return {};
  }
};
nativeGl.createTexture = () => {};
nativeGl.bindTexture = () => {};
nativeGl.texParameteri = () => {};
const _texImage2D = nativeGl.prototype.texImage2D;
nativeGl.prototype.texImage2D = function(a, b, c, d, e, f) {
  if (f.stack) {
    console.log('got teximage2d', f && f.constructor && f.constructor.name, f && f.stack);
  }
  try {
    return _texImage2D.apply(this, arguments);
  } catch(err) {
    console.log('failed teximage2d', f && f.constructor && f.constructor.name);

    throw err;
  }
};
nativeGl.clearColor = () => {};
nativeGl.clearDepth = () => {};
nativeGl.clearStencil = () => {};
nativeGl.depthFunc = () => {};
nativeGl.frontFace = () => {};
nativeGl.cullFace = () => {};
nativeGl.blendEquationSeparate = () => {};
nativeGl.blendFuncSeparate = () => {};
nativeGl.blendEquation = () => {};
nativeGl.blendFunc = () => {};
const _viewport = nativeGl.viewport;
nativeGl.viewport = function() {
  console.log('gl viewport', arguments, new Error().stack);
  _viewport.apply(this, arguments);
}; */

// BINDINGS



// CALLBACKS

global.nativeWindow.events.emit = (type, data) => {
  // console.log(type, data);

  switch (type) {
    case 'resize': {
      const {width, height} = data;
      innerWidth = width;
      innerHeight = height;

      if (window) {
        window.innerWidth = innerWidth;
        window.innerHeight = innerHeight;
        window.emit('resize');
      }
      break;
    }
    case 'quit': {
      process.exit();
      break;
    }
  }
};

/* const localMatrix = new THREE.Matrix4();
const localMatrix2 = new THREE.Matrix4();
const localMatrix3 = new THREE.Matrix4();
global.onDrawFrame = (viewMatrixFloat32Array, projectionMatrixFloat32Array, centerFloat32Array) => {
  console.log('draw frame', !!window); // XXX

  if (window) {
    const matrixWorldInverse = localMatrix.fromArray(viewMatrixFloat32Array);
    const matrixWorld = localMatrix2.getInverse(matrixWorldInverse)
      .premultiply(
        localMatrix3.makeTranslation(-centerFloat32Array[0], -centerFloat32Array[1], -centerFloat32Array[2])
      );
    matrixWorld.toArray(viewMatrixFloat32Array);

    window.alignFrame(viewMatrixFloat32Array, projectionMatrixFloat32Array);
    window.tickAnimationFrame();
  }
}; */

// EXPORTS

module.exports = exokit;

// MAIN

let window = null;
let innerWidth = 1280;
let innerHeight = 1024;
const FPS = 90;
if (require.main === module) {
  const url = process.argv[2];
  
  const nativeWindowHandle = global.nativeWindow.create(innerWidth, innerHeight);

  exokit.fetch(url)
    .then(site => {
      console.log('node site loaded');

      window = site.window;
      window.innerWidth = innerWidth;
      window.innerHeight = innerHeight;
      // window.navigator.setVRMode(vrMode);
      // window.navigator.setVRTexture(vrTexture);
      window.addEventListener('error', err => {
        console.warn('got error', err.error.stack);
      });
      
      const _recurse = () => {
        global.nativeWindow.update(nativeWindowHandle); // XXX hook this in on tick

        // window.alignFrame(viewMatrixFloat32Array, projectionMatrixFloat32Array); // XXX implement this
        window.tickAnimationFrame();
        
        global.nativeWindow.submit(nativeWindowHandle); // XXX hook this in on submitFrame
        
        setTimeout(_recurse, FPS / 1000);
      };
      _recurse();
    });
}

process.on('uncaughtException', err => {
  console.warn(err.stack);
});
process.on('unhandledRejection', err => {
  console.warn(err.stack);
});
