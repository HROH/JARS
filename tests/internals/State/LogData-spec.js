JARS.module('tests.internals.State.LogData').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        States = InternalsRegistry.get('State/States');

    describe('State/LogData', function() {
        var LogData = InternalsRegistry.get('State/LogData');

        describe('.getInfo()', function() {
            it('should return the correct info object when given the current and next state', function() {
                expect(LogData.getInfo('someState', 'nextState')).to.deep.equal({
                    s0: 'someState',
                    s1: 'nextState'
                });
            });
        });

        describe('.getMethod()', function() {
            describe('when it can transition', function() {
                var canTransition = true;

                it('should return `info` when given the `waiting` state', function() {
                    expect(LogData.getMethod(canTransition, States.WAITING)).to.equal('info');
                });

                it('should return `info` when given the `loading` state', function() {
                    expect(LogData.getMethod(canTransition, States.LOADING)).to.equal('info');
                });

                it('should return `info` when given the `registered` state', function() {
                    expect(LogData.getMethod(canTransition, States.REGISTERED)).to.equal('info');
                });

                it('should return `info` when given the `intercepted` state', function() {
                    expect(LogData.getMethod(canTransition, States.INTERCEPTED)).to.equal('info');
                });

                it('should return `info` when given the `loaded` state', function() {
                    expect(LogData.getMethod(canTransition, States.LOADED)).to.equal('info');
                });

                it('should return `error` when given the `aborted` state', function() {
                    expect(LogData.getMethod(canTransition, States.ABORTED)).to.equal('error');
                });
            });

            describe('when it can not transition', function() {
                var canTransition = false;

                it('should return `warn` when given the `waiting` state', function() {
                    expect(LogData.getMethod(canTransition, States.WAITING)).to.equal('warn');
                });

                it('should return `debug` when given the `loading` state', function() {
                    expect(LogData.getMethod(canTransition, States.LOADING)).to.equal('debug');
                });

                it('should return `warn` when given the `registered` state', function() {
                    expect(LogData.getMethod(canTransition, States.REGISTERED)).to.equal('warn');
                });

                it('should return `warn` when given the `intercepted` state', function() {
                    expect(LogData.getMethod(canTransition, States.INTERCEPTED)).to.equal('warn');
                });

                it('should return `debug` when given the `loaded` state', function() {
                    expect(LogData.getMethod(canTransition, States.LOADED)).to.equal('debug');
                });

                it('should return `warn` when given the `aborted` state', function() {
                    expect(LogData.getMethod(canTransition, States.ABORTED)).to.equal('warn');
                });
            });
        });

        describe('.getMessage()', function() {
            describe('when it can transition', function() {
                var canTransition = true;

                describe('given a message', function() {
                    it('should return the correct message with the given message appended', function() {
                        expect(LogData.getMessage(canTransition, 'test')).to.equal('is ${s1} - test');
                    });
                });

                describe('given no message', function() {
                    it('should return the correct message', function() {
                        expect(LogData.getMessage(canTransition)).to.equal('is ${s1}');
                    });
                });
            });

            describe('when it can not transition', function() {
                var canTransition = false;

                describe('given a message', function() {
                    it('should return the correct message with the given message appended', function() {
                        expect(LogData.getMessage(canTransition, 'test')).to.equal('attempted to mark as ${s1} but is currently ${s0} - test');
                    });
                });

                describe('given no message', function() {
                    it('should return the correct message', function() {
                        expect(LogData.getMessage(canTransition)).to.equal('attempted to mark as ${s1} but is currently ${s0}');
                    });
                });
            });
        });
    });
});
