JARS.module('tests.internals.Resolvers.PathList').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        PathResolver = InternalsRegistry.get('Resolvers/Path');

    describe('Resolvers/PathList', function() {
        var PathListResolver = InternalsRegistry.get('Resolvers/PathList');

        describe('.resolve()', function() {
            it('should compute a sorted list of dependency paths', function(done) {
                var bundle = Injector.getSubject('pathlist.*'),
                    moduleA = Injector.getSubject('pathlist.A'),
                    moduleB = Injector.getSubject('pathlist.B'),
                    moduleC = Injector.getSubject('pathlist.C');

                bundle.$import(['A', 'B', 'C']);
                bundle.parent.$export();
                moduleA.$export();
                moduleB.$import(['.C']);
                moduleB.$export();
                moduleC.$import(['.A']);
                moduleC.$export();

                PathListResolver.resolve('pathlist.*', function(list) {
                    expect(list).to.deep.equal([
                        PathResolver(Injector.getSubject('pathlist')),
                        PathResolver(moduleA),
                        PathResolver(moduleC),
                        PathResolver(moduleB)
                    ]);

                    done();
                });
            });
        });
    });
});
