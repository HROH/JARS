JARS.module('tests.internals.Resolvers.PathList').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects'),
        PathResolver = InternalsRegistry.get('Resolvers/Path');

    describe('Resolvers/PathList', function() {
        var PathListResolver = InternalsRegistry.get('Resolvers/PathList');

        describe('.resolve()', function() {
            it('should compute a sorted list of dependency paths', function(done) {
                var bundle = SubjectsRegistry.getSubject('pathlist.*'),
                    moduleA = SubjectsRegistry.getSubject('pathlist.A'),
                    moduleB = SubjectsRegistry.getSubject('pathlist.B'),
                    moduleC = SubjectsRegistry.getSubject('pathlist.C');

                bundle.$import(['A', 'B', 'C']);
                bundle.parent.$export();
                moduleA.$export();
                moduleB.$import(['.C']);
                moduleB.$export();
                moduleC.$import(['.A']);
                moduleC.$export();

                PathListResolver.resolve('pathlist.*', function(list) {
                    expect(list).to.deep.equal([
                        PathResolver(SubjectsRegistry.getSubject('pathlist')),
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
