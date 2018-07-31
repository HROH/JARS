/**
 * @module Transports
 */
JARS.module('System.Transports', ['Console']).$import('*!Logger/Transports').$export(function(Transports) {
    'use strict';

    return Transports;
});
