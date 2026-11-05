import {resolve} from 'node:path';
import {originalRasterReader} from '../../tooling/raster-archive.mjs';

export const readOriginalRaster=originalRasterReader(resolve('tests/storybook/reference'));
