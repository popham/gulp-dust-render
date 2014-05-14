var gutil = require('gulp-util');
var through = require('through2');

module.exports = function (renderPromise) {
    return through.obj(function (file, enc, cb) {
	if (file.isNull()) {
            this.push(file);
            return cb();
	}

	if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-dust-render', 'Streaming not supported'));
            return cb();
	}

	try {
            var context = {};
            if (file.contents.toString().trim()) {
                context = JSON.parse(file.contents.toString());
            }
            renderPromise(context)
                .done(
                    function (rendering) {
                        file.contents = new Buffer(rendering);
                        this.push(file);
                        cb();
                    }.bind(this),
                    function (err) {
                        this.emit('error', new gutil.PluginError('gulp-dust-render', err));
                    }.bind(this));
	} catch (err) {
            this.emit('error', new gutil.PluginError('gulp-dust-render', err));
	}
    });
};
