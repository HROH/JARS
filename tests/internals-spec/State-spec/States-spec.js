JARS.module('internals-spec.State-spec.States-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('State/States', function() {
        var States = InternalsRegistry.get('State/States');

        describe('.each()', function() {
            it('should call the callback with all states', function() {
                var callback = sinon.spy();

                States.each(callback);

                expect(callback).to.have.callCount(6);
                expect(callback.args).to.deep.equal([
                    [States.WAITING, 0],
                    [States.LOADING, 1],
                    [States.REGISTERED, 2],
                    [States.INTERCEPTED, 3],
                    [States.LOADED, 4],
                    [States.ABORTED, 5]
                ]);
            });
        });

        describe('.hasNext()', function() {
            describe('when called with current state `waiting`', function() {
                var currentState = States.WAITING;

                it('should return `false` when the next state is `waiting`', function() {
                    expect(States.hasNext(currentState, States.WAITING)).to.be.false;
                });

                it('should return `true` when the next state is `loading`', function() {
                    expect(States.hasNext(currentState, States.LOADING)).to.be.true;
                });

                it('should return `true` when the next state is `registered`', function() {
                    expect(States.hasNext(currentState, States.REGISTERED)).to.be.true;
                });

                it('should return `false` when the next state is `intercepted`', function() {
                    expect(States.hasNext(currentState, States.INTERCEPTED)).to.be.false;
                });

                it('should return `false` when the next state is `loaded`', function() {
                    expect(States.hasNext(currentState, States.LOADED)).to.be.false;
                });

                it('should return `true` when the next state is `aborted`', function() {
                    expect(States.hasNext(currentState, States.ABORTED)).to.be.true;
                });
            });

            describe('when called with current state `loading`', function() {
                var currentState = States.LOADING;

                it('should return `false` when the next state is `waiting`', function() {
                    expect(States.hasNext(currentState, States.WAITING)).to.be.false;
                });

                it('should return `false` when the next state is `loading`', function() {
                    expect(States.hasNext(currentState, States.LOADING)).to.be.false;
                });

                it('should return `true` when the next state is `registered`', function() {
                    expect(States.hasNext(currentState, States.REGISTERED)).to.be.true;
                });

                it('should return `false` when the next state is `intercepted`', function() {
                    expect(States.hasNext(currentState, States.INTERCEPTED)).to.be.false;
                });

                it('should return `false` when the next state is `loaded`', function() {
                    expect(States.hasNext(currentState, States.LOADED)).to.be.false;
                });

                it('should return `true` when the next state is `aborted`', function() {
                    expect(States.hasNext(currentState, States.ABORTED)).to.be.true;
                });
            });

            describe('when called with current state `registered`', function() {
                var currentState = States.REGISTERED;

                it('should return `false` when the next state is `waiting`', function() {
                    expect(States.hasNext(currentState, States.WAITING)).to.be.false;
                });

                it('should return `false` when the next state is `loading`', function() {
                    expect(States.hasNext(currentState, States.LOADING)).to.be.false;
                });

                it('should return `false` when the next state is `registered`', function() {
                    expect(States.hasNext(currentState, States.REGISTERED)).to.be.false;
                });

                it('should return `true` when the next state is `intercepted`', function() {
                    expect(States.hasNext(currentState, States.INTERCEPTED)).to.be.true;
                });

                it('should return `true` when the next state is `loaded`', function() {
                    expect(States.hasNext(currentState, States.LOADED)).to.be.true;
                });

                it('should return `true` when the next state is `aborted`', function() {
                    expect(States.hasNext(currentState, States.ABORTED)).to.be.true;
                });
            });

            describe('when called with current state `intercepted`', function() {
                var currentState = States.INTERCEPTED;

                it('should return `false` when the next state is `waiting`', function() {
                    expect(States.hasNext(currentState, States.WAITING)).to.be.false;
                });

                it('should return `false` when the next state is `loading`', function() {
                    expect(States.hasNext(currentState, States.LOADING)).to.be.false;
                });

                it('should return `false` when the next state is `registered`', function() {
                    expect(States.hasNext(currentState, States.REGISTERED)).to.be.false;
                });

                it('should return `true` when the next state is `intercepted`', function() {
                    expect(States.hasNext(currentState, States.INTERCEPTED)).to.be.true;
                });

                it('should return `true` when the next state is `loaded`', function() {
                    expect(States.hasNext(currentState, States.LOADED)).to.be.true;
                });

                it('should return `true` when the next state is `aborted`', function() {
                    expect(States.hasNext(currentState, States.ABORTED)).to.be.true;
                });
            });

            describe('when called with current state `loaded`', function() {
                var currentState = States.LOADED;

                it('should return `true` when the next state is `waiting`', function() {
                    expect(States.hasNext(currentState, States.WAITING)).to.be.true;
                });

                it('should return `false` when the next state is `loading`', function() {
                    expect(States.hasNext(currentState, States.LOADING)).to.be.false;
                });

                it('should return `false` when the next state is `registered`', function() {
                    expect(States.hasNext(currentState, States.REGISTERED)).to.be.false;
                });

                it('should return `false` when the next state is `intercepted`', function() {
                    expect(States.hasNext(currentState, States.INTERCEPTED)).to.be.false;
                });

                it('should return `false` when the next state is `loaded`', function() {
                    expect(States.hasNext(currentState, States.LOADED)).to.be.false;
                });

                it('should return `false` when the next state is `aborted`', function() {
                    expect(States.hasNext(currentState, States.ABORTED)).to.be.false;
                });
            });

            describe('when called with current state `aborted`', function() {
                var currentState = States.ABORTED;

                it('should return `true` when the next state is `waiting`', function() {
                    expect(States.hasNext(currentState, States.WAITING)).to.be.true;
                });

                it('should return `false` when the next state is `loading`', function() {
                    expect(States.hasNext(currentState, States.LOADING)).to.be.false;
                });

                it('should return `false` when the next state is `registered`', function() {
                    expect(States.hasNext(currentState, States.REGISTERED)).to.be.false;
                });

                it('should return `false` when the next state is `intercepted`', function() {
                    expect(States.hasNext(currentState, States.INTERCEPTED)).to.be.false;
                });

                it('should return `false` when the next state is `loaded`', function() {
                    expect(States.hasNext(currentState, States.LOADED)).to.be.false;
                });

                it('should return `false` when the next state is `aborted`', function() {
                    expect(States.hasNext(currentState, States.ABORTED)).to.be.false;
                });
            });
        });
    });
});
