> Render [Dust](https://github.com/linkedin/dustjs) templates

The simplest of use case uses a JSON file as context to prerendered templates.
To use an object as for context, take a look at
[vinyl-source-stream](https://github.com/hughsk/vinyl-source-stream).

## Example
Precompile a bunch of templates:
```js
var gulp = require('gulp');
var compile = require('gulp-dust');

// Precompile a bunch of templates.
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

In some other module, say `index.js` of a `rendering-promises` package, create
 a rendering promise (we're after a 
`partial1({k1:v1, k2:v2}).done(console.log, console.error)` use case):
```js
var dust = require('dustjs-linkedin');
var when = require('when/node');

/*
 * Memoize the partials for dust to use later.  Beware of name
 * collisions--another module that memoizes more partials can clobber these
 * ones.
 */
require('precompiled/blob');

exports.partial1 = function (context) {
    return when.lift(dust.render)('memoized/path/to/some/partial', context);
};

exports.partial2 = function (context) {
    return when.lift(dust.render)('memoized/path/to/another/partial', context);
};
```

Use a promise from `rendering-promises` in a task:
```
var render = require('gulp-dust-render');
var partials = require('rendering-promises');

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
example using [when](https://github.com/cujojs/when).

## License

MIT © Tim Popham
