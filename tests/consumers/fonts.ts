import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
/** The consuming app supplies the same licensed fonts as HA; the SDK never fetches them. */
export async function fixtureFonts(root:string,consumer:string){
 await mkdir(join(consumer,'fonts'),{recursive:true});
 for(const [weight,digest] of [['Regular','47107401d0adb375ab9aa167f9d62489a849d510e740a307b5a4db60e5db3562'],['Medium','96025fe9db6578d8bc7f4b8be739750b1490e07221c2b1f16acde2ea7669cedf']]){
  const source=join(root,'node_modules/roboto-fontface/fonts/roboto/Roboto-'+weight+'.woff2');assert.equal(createHash('sha256').update(await readFile(source)).digest('hex'),digest);await copyFile(source,join(consumer,'fonts','Roboto-'+weight+'.woff2'));
 }
 const path=join(consumer,'index.html');await writeFile(path,(await readFile(path,'utf8')).replace('</head>','<style>@font-face{font-family:Roboto;font-weight:400;src:url(/fonts/Roboto-Regular.woff2)}@font-face{font-family:Roboto;font-weight:500;src:url(/fonts/Roboto-Medium.woff2)}body{font-family:Roboto,Noto,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}</style></head>'));
}
