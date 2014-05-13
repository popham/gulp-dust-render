Render [Dust](https://github.com/linkedin/dustjs) templates
===========================================================

The simplest use case takes a JSON file as context to render templates.  To use
an object for context instead of a file, try
[vinyl-source-stream](https://github.com/hughsk/vinyl-source-stream) combined
with

```
function sstream(text) {
    var s = new stream.Readable(text);
    s._read = function noop() {};
    s.push(text);
    s.push(null);
}
```

(instead of `gulp.src(...)`).

## Example
Precompile a bunch of templates:
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

In some other module, say `rendering_promises.js`, create some rendering
promises (we're after a
`partial1({k1:v1, k2:v2}).done(console.log, console.error)` use case):
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

And finally, use a promise from the `rendering-promises` module in a task:
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

## API

### render(renderer)

#### renderer

Type: `Function`

Map a context to a promise to render it.  The promise should fulfill or fail
with the success or fail outputs of Dust's render callback.  See the earlier
example using [when](https://github.com/cujojs/when)--specifically, `when.lift`.

## License

MIT © Tim Popham
