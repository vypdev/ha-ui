import type {StorybookConfig} from '@storybook/web-components-vite';
const config:StorybookConfig={
  framework:'@storybook/web-components-vite',stories:['../stories/**/*.stories.ts'],
  staticDirs:[{from:'../LICENSES',to:'/licenses'}],
  addons:['@storybook/addon-docs','@storybook/addon-a11y','@storybook/addon-vitest'],
  core:{disableTelemetry:true,enableCrashReports:false},
  viteFinal:async config=>({...config,base:'./'}),
};
export default config;
