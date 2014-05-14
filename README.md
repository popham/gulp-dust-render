Render [Dust](https://github.com/linkedin/dustjs) templates
===========================================================

## API

### render(renderer)

#### renderer

Type: `Function`

Map a context to a promise to render that context.  The promise should fulfill
or fail with the success or fail outputs of Dust's render callback.  See
[rendering promises](#Create Some Rendering Promises) for example use of
[when](https://github.com/cujojs/when)'s `lift` method.

## Using a File for Rendering Context
The simplest use case takes a JSON file as context to render templates.

### Precompile a Bunch of Templates

```js
var gulp = require('gulp');
var compile = require('gulp-dust');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var rename = require('gulp-rename');

gulp.task('pre', function () {
    // grep for "//" type comments and issue error
    return gulp.src('./templates/**/*.dust')
        .pipe(rename({ extname: "" }))
        .pipe(compile())
        .pipe(concat('blob.js'))
        .pipe(insert.prepend('var dust = require("dustjs-linkedin");'))
        .pipe(gulp.dest('precompiled'));
});
```

### Create Some Rendering Promises
In some other module, say `rendering_promises.js`, create a promise generator.
We're after a function that maps a context to a promise to render that context,
e.g. `partial1({k1:v1, k2:v2}).done(console.log, console.error)`.

```js
var dust = require('dustjs-linkedin');
var when = require('when/node');

/*
 * Memoize the partials for Dust to use later.  Beware of name
 * collisions--another module that memoizes additional partials can clobber
 * these ones.
 */
require('precompiled/blob');

exports.partial1 = function (context) {
    return when.lift(dust.render)('memoized/path/to/some/partial', context);
};

exports.partial2 = function (context) {
    return when.lift(dust.render)('memoized/path/to/another/partial', context);
};
```

### Rendering a Template
```
var render = require('gulp-dust-render');
var partials = require('./rendering-promises');

gulp.task('render', ['pre'], function () {
    gulp.src('./contexts/**/*.json')
        .pipe(render(partials.partial1))
        .pipe(rename({ extname : "js" }))
        .pipe(gulp.dest('compiled'));
});
```


## Object for Rendering Context
[vinyl-source-stream](https://github.com/hughsk/vinyl-source-stream) transforms
a text stream to a Gulp-compatible stream.

### Create a Data Source
Start the pipeline with some text.  The following helper should be helpful.

```
function sstream(text) {
    var s = new stream.Readable(text);
    s._read = function noop() {};
    s.push(text);
    s.push(null);

    return s;
}
```

### Pipe the Stream through `vinyl-source-stream`
### Buffer the Stream with `gulp-buffer`
### Pipe the Stream through `gulp-dust-render`


## Template without Context
Arises when the precompile stage completely determines the template.

### Start the Pipeline

```
function renderingStream(promise) {
    var s = new stream.Readable;
    s._read = function noop() {};
    promise.done(
        function (rendering) {
            s.push(rendering);
            s.push(null);
        },
        console.error
    );

    return s;
}
```

### Pipe the Stream through `vinyl-source-stream`
### Pipe the Stream to its target


## License

MIT © Tim Popham
