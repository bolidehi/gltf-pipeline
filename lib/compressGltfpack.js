'use strict';
const Cesium = require('cesium');

const defaultValue = Cesium.defaultValue;

module.exports = compressGltfpack;

/**
 * Compresses the glTF using gltfpack.
 *
 * @param {Object} gltf A javascript object containing a glTF asset.
 * @param {Object} options The same options object as {@link processGltf}
 * @param {Object} options.gltfpackOptions Options defining gltfpack compression settings.
 * @param {Number} [options.gltfpackOptions.compressionLevel=7] A value between 0 and 10 specifying the quality of the gltfpack compression TODO.
 * @returns {Object} The glTF asset with compressed meshes
 *
 * @private
 */
function compressGltfpack(gltf, options) {
    options = defaultValue(options, {});
    const gltfpackOptions = defaultValue(options.gltfpackOptions, {});
    const defaults = compressGltfpack.defaults;
    const compressionLevel = defaultValue(gltfpackOptions.compressionLevel, defaults.compressionLevel);

    console.log('Compressing with gltfpack: ' + compressionLevel);

    return gltf;
}

compressGltfpack.defaults = {
    compressionLevel: 7
};
