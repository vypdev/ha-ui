import {expect,test} from 'vitest';
import {catalogSettings,catalogCopy,catalogPalettes} from '../../stories/catalog-state.js';
test.each([undefined,null,[],false,3,'es'])('invalid globals retain safe English/light/wide/system defaults',raw=>{
 expect(catalogSettings(raw)).toEqual({locale:'en',theme:'light',width:960,motion:'system'});
});
test.each(['es','ES','es-ES','es-MX'])('Spanish locale %s preserves the other scoped settings',locale=>{
 const raw={locale,theme:'dark',width:'narrow',motion:'reduced'},result=catalogSettings(raw);raw.theme='light';
 expect(result).toEqual({locale:'es',theme:'dark',width:360,motion:'reduced'});expect(Object.isFrozen(result)).toBe(true);
});
test.each(['en','en-US','fr',3,'es<script>'])('unsupported or English locale %s uses English fallback',locale=>expect(catalogSettings({locale}).locale).toBe('en'));
test('copy and token presets are immutable English/Spanish, with the same public theme keys',()=>{
 expect(catalogCopy.en.fieldLabel).toBe('Task name');expect(catalogCopy.es.fieldLabel).toBe('Nombre de la tarea');
 expect(Object.keys(catalogCopy.en)).toEqual(Object.keys(catalogCopy.es));expect(Object.isFrozen(catalogCopy)).toBe(true);
 for(const value of Object.values(catalogCopy))expect(Object.isFrozen(value)).toBe(true);
 expect(Object.keys(catalogPalettes.light)).toEqual(Object.keys(catalogPalettes.dark));
 for(const value of Object.values(catalogPalettes))expect(Object.isFrozen(value)).toBe(true);
});
