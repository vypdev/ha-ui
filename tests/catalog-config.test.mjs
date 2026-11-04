import {expect,test} from 'vitest';
import config from '../.storybook/main.js';
test('the catalog uses the real component framework, local static base, all stories and required addons',async()=>{
 expect(config.framework).toBe('@storybook/web-components-vite');expect(config.stories).toEqual(['../stories/**/*.stories.ts']);
 expect(config.addons).toEqual(expect.arrayContaining(['@storybook/addon-docs','@storybook/addon-a11y','@storybook/addon-vitest']));
 expect(config.core.disableTelemetry).toBe(true);expect(config.core.enableCrashReports).toBe(false);
 const result=await config.viteFinal({base:'/',define:{retained:true}});expect(result.base).toBe('./');expect(result.define.retained).toBe(true);
});
