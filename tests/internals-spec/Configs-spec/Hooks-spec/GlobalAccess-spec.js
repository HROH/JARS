JARS.module('internals-spec.Configs-spec.Hooks-spec.GlobalAccess-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        GlobalConfig = InternalsRegistry.get('Configs/Global');

    describe('Configs/Hooks/GlobalAccess()', function() {
        var GlobalAccess = InternalsRegistry.get('Configs/Hooks/GlobalAccess');

        afterEach(function() {
            if(JARS.internals) {
                delete JARS.internals;
            }
        });

        it('should expose the internals on JARS when given `true`', function() {
            expect(JARS.internals).to.not.exist;

            GlobalAccess(GlobalConfig, true);

            expect(JARS.internals).to.equal(InternalsRegistry);
        });

        it('should remove the internals on JARS when given `false`', function() {
            GlobalAccess(GlobalConfig, true);

            expect(JARS.internals).to.exist;

            GlobalAccess(GlobalConfig, false);

            expect(JARS.internals).to.not.exist;
        });
    });
});
