import {expect,test} from 'vitest';
import {Channel} from 'storybook/internal/channels';
import {STORY_FINISHED,type StoryFinishedPayload} from 'storybook/internal/core-events';
import {observeCatalogCompletion} from '../../stories/catalog-completion.js';
test('completion follows the real channel event after addon reports and exposes only bounded status metadata',()=>{
 const channel=new Channel({}),root=document.createElement('div'),stop=observeCatalogCompletion(channel,root);
 expect(root.dataset.haUiCompletion).toBeUndefined();const event:StoryFinishedPayload={storyId:'forms-checkbox--default',status:'success',reporters:[{type:'a11y',status:'passed',result:{privateDetails:'not copied'}},{type:'component-test',status:'passed',result:{}}]};
 channel.emit(STORY_FINISHED,event);expect(JSON.parse(root.dataset.haUiCompletion!)).toEqual({storyId:event.storyId,status:'success',reports:[{type:'a11y',status:'passed'},{type:'component-test',status:'passed'}]});expect(root.dataset.haUiCompletion).not.toContain('privateDetails');stop();
});
test('failed or absent addon reports stay explicit rather than being presented as passing',()=>{
 const channel=new Channel({}),root=document.createElement('div'),stop=observeCatalogCompletion(channel,root);
 channel.emit(STORY_FINISHED,{storyId:'failed',status:'error',reporters:[{type:'a11y',status:'failed',result:{error:'diagnostic'}}]} satisfies StoryFinishedPayload);expect(JSON.parse(root.dataset.haUiCompletion!)).toEqual({storyId:'failed',status:'error',reports:[{type:'a11y',status:'failed'}]});
 channel.emit(STORY_FINISHED,{storyId:'empty',status:'success',reporters:[]} satisfies StoryFinishedPayload);expect(JSON.parse(root.dataset.haUiCompletion!).reports).toEqual([]);stop();
});
test('teardown removes the original channel listener and stale completion evidence',()=>{
 const channel=new Channel({}),root=document.createElement('div'),stop=observeCatalogCompletion(channel,root);channel.emit(STORY_FINISHED,{storyId:'before',status:'success',reporters:[]});stop();expect(root.dataset.haUiCompletion).toBeUndefined();channel.emit(STORY_FINISHED,{storyId:'after',status:'success',reporters:[]});expect(root.dataset.haUiCompletion).toBeUndefined();
});
