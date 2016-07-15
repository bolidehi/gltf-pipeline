'use strict';
var clone = require('clone');
var fsExtra = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');

var addPipelineExtras = require('../../lib/addPipelineExtras');
var gltfPipeline = require('../../lib/gltfPipeline');
var readGltf = require('../../lib/readGltf');

var processFile = gltfPipeline.processFile;
var processFileToDisk = gltfPipeline.processFileToDisk;
var processJSON = gltfPipeline.processJSON;
var processJSONToDisk = gltfPipeline.processJSONToDisk;

var fsExtraReadFile = Promise.promisify(fsExtra.readFile);

var gltfPath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest.gltf';
var gltfEmbeddedPath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTestEmbedded.gltf';
var glbPath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest.glb';
var outputGltfPath = './output/CesiumTexturedBoxTest.gltf';
var outputGlbPath = './output/CesiumTexturedBoxTest.glb';

describe('gltfPipeline', function() {
    it('optimizes a gltf JSON with embedded resources', function(done) {
        var options = {};
        var gltfCopy;
        expect(readGltf(gltfEmbeddedPath, options)
            .then(function(gltf) {
                gltfCopy = clone(gltf);
                return processJSON(gltf, options);
            })
            .then(function(gltf) {
                expect(gltf).toBeDefined();
                expect(clone(gltf)).not.toEqual(gltfCopy);
            }), done).toResolve();
    });
    
    it('optimizes a gltf JSON with external resources', function(done) {
        var options = { basePath : path.dirname(gltfPath) };
        var gltfCopy;
        expect(fsExtraReadFile(gltfPath, options)
            .then(function(data) {
                var gltf = JSON.parse(data);
                gltfCopy = clone(gltfCopy);
                addPipelineExtras(gltf);
                return processJSON(gltf, options);
            })
            .then(function(gltf) {
                expect(gltf).toBeDefined();
                expect(clone(gltf)).not.toEqual(gltfCopy);
            }), done).toResolve();
    });

    it('optimizes a glTF file', function(done) {
        var gltfCopy;
        var options = {};
        expect(readGltf(gltfPath, options)
            .then(function(gltf) {
                gltfCopy = clone(gltf);
                return processFile(gltfPath, options);
            })
            .then(function(gltf) {
                expect(gltf).toBeDefined();
                expect(clone(gltf)).not.toEqual(gltfCopy);
            }), done).toResolve();
    });

    it('optimizes a glb file', function(done) {
        var gltfCopy;
        var options = {};
        expect(readGltf(glbPath, options)
            .then(function(gltf) {
                gltfCopy = clone(gltf);
                return processFile(glbPath, options);
            })
            .then(function(gltf) {
                expect(gltf).toBeDefined();
                expect(clone(gltf)).not.toEqual(gltfCopy);
            }), done).toResolve();
    });

    it('will write a file to the correct directory', function(done) {
        var spy = spyOn(fsExtra, 'outputJsonAsync').and.callFake(function() {});
        var options = {
            createDirectory : false
        };
        expect(processFileToDisk(gltfPath, outputGltfPath, options)
            .then(function() {
                expect(path.normalize(spy.calls.first().args[0])).toEqual(path.normalize(outputGltfPath));
            })
            .catch(function(err) {
                throw err;
            }), done).toResolve();
    });

    it('will write a binary file', function(done) {
        var spy = spyOn(fsExtra, 'outputFileAsync').and.callFake(function() {});
        var options = {
            binary : true,
            createDirectory : false
        };
        expect(processFileToDisk(gltfPath, outputGlbPath, options)
            .then(function() {
                expect(path.normalize(spy.calls.first().args[0])).toEqual(path.normalize(outputGlbPath));
            })
            .catch(function(err) {
                throw err;
            }), done).toResolve();

    });

    it('will write a file from JSON', function(done) {
        var spy = spyOn(fsExtra, 'outputJsonAsync').and.callFake(function() {});
        var readOptions = {};
        var processOptions = {
            createDirectory : false, 
            basePath : path.dirname(gltfPath)
        };
        expect(readGltf(gltfPath, readOptions)
            .then(function(gltf) {
                return processJSONToDisk(gltf, outputGltfPath, processOptions);
            })
            .then(function() {
                expect(path.normalize(spy.calls.first().args[0])).toEqual(path.normalize(outputGltfPath));
            })
            .catch(function(err) {
                throw err;
            }), done).toResolve();
    });

    it('will write sources from JSON', function(done) {
        var initialUri;
        var options = {};
        expect(readGltf(gltfEmbeddedPath, options)
            .then(function(gltf) {
                initialUri = gltf.buffers.CesiumTexturedBoxTest.uri;
                return processJSON(gltf, options);
            })
            .then(function(gltf) {
                var finalUri = gltf.buffers.CesiumTexturedBoxTest.uri;
                expect(initialUri).not.toEqual(finalUri);
            }), done).toResolve();
    });

    it('will write sources from file', function(done) {
        var initialUri;
        var options = {};
        expect(readGltf(gltfEmbeddedPath, options)
            .then(function(gltf) {
                initialUri = gltf.buffers.CesiumTexturedBoxTest.uri;
                return processFile(gltfEmbeddedPath, options);
            })
            .then(function(gltfFinal) {
                var finalUri = gltfFinal.buffers.CesiumTexturedBoxTest.uri;
                expect(initialUri).not.toEqual(finalUri);
            }), done).toResolve();
    });
});
