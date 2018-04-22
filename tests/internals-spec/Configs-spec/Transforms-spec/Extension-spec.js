JARS.module('internals-spec.Configs-spec.Transforms-spec.Extension-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Extension()', function() {
        var ExtensionTransform = InternalsRegistry.get('Configs/Transforms/Extension');

        it('should prepend a `.` to the extension', function() {
            expect(ExtensionTransform('js')).to.equal('.js');
        });

        it('should not prepend a `.` to the extension if it is already prepended', function() {
            expect(ExtensionTransform('.js')).to.equal('.js');
        });
    });
});
