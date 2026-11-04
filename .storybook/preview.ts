import type {Preview} from '@storybook/web-components-vite';
import {registerTabs} from '@vypdev/ha-ui/tabs';
import {registerField} from '@vypdev/ha-ui/field';
import {catalogFrame} from '../stories/catalog-frame.js';
const preview:Preview={
  beforeAll:()=>{registerTabs();registerField();},decorators:[catalogFrame],
  initialGlobals:{theme:'light',locale:'en',width:'wide',motion:'system'},
  globalTypes:{
    theme:{description:'HA-compatible theme',toolbar:{title:'Theme',icon:'circlehollow',items:[{value:'light',title:'Light'},{value:'dark',title:'Dark'}],dynamicTitle:true}},
    locale:{description:'Example language; English fallback',toolbar:{title:'Language',icon:'globe',items:[{value:'en',title:'English'},{value:'es',title:'Español'}],dynamicTitle:true}},
    width:{description:'Example width',toolbar:{title:'Width',icon:'mobile',items:[{value:'wide',title:'Wide'},{value:'narrow',title:'Narrow'}],dynamicTitle:true}},
    motion:{description:'System preference or stronger reduced motion',toolbar:{title:'Motion',icon:'lightning',items:[{value:'system',title:'System'},{value:'reduced',title:'Reduced'}],dynamicTitle:true}},
  },
  parameters:{layout:'fullscreen',a11y:{test:'error'},docs:{codePanel:true},controls:{expanded:true}},
};
export default preview;
