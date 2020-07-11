'use strict';
const Cesium = require('cesium');
const fsExtra = require('fs-extra');
const readResources = require('../../lib/readResources');
const compressGltfpack = require('../../lib/compressDracoMeshes');

const WebGLConstants = Cesium.WebGLConstants;

const boxPath = 'specs/data/2.0/box-textured-embedded/box-textured-embedded.gltf';

let gltf;

function readGltf(gltfPath) {
    const gltf = fsExtra.readJsonSync(gltfPath);
    return readResources(gltf);
}

describe('compressGltfpack', () => {
    beforeEach(async () => {
        gltf = await readGltf(boxPath);
    });

    it('compresses meshes with default options', () => {
        expect(gltf.accessors.length).toBe(4); // 3 attributes + indices
        expect(gltf.bufferViews.length).toBe(4); // position/normal + texcoord + indices + image

        compressGltfpack(gltf);

        expect(gltf.accessors.length).toBe(4); // accessors are not removed
        expect(gltf.extensionsUsed.indexOf('KHR_mesh_quantization') >= 0).toBe(true);
        expect(gltf.extensionsRequired.indexOf('KHR_mesh_quantization') >= 0).toBe(true);

        const primitive = gltf.meshes[0].primitives[0];

        const positionAccessor = gltf.accessors[primitive.attributes.POSITION];
        const normalAccessor = gltf.accessors[primitive.attributes.NORMAL];
        const texcoordAccessor = gltf.accessors[primitive.attributes.TEXCOORD_0];

        expect(positionAccessor.componentType).toBe(WebGLConstants.UNSIGNED_SHORT);
        expect(normalAccessor.componentType).toBeUndefined(); // TODO
        expect(texcoordAccessor.componentType).toBeUndefined(); // TODO
    });
});
