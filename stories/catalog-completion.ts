import {STORY_FINISHED,type StoryFinishedPayload} from 'storybook/internal/core-events';
import type {Channel} from 'storybook/internal/channels';
/** Observe the public completion event after all hooks, including automatic accessibility audits. */
export function observeCatalogCompletion(channel:Pick<Channel,'on'|'off'>,root:HTMLElement):()=>void{
 const finished=({storyId,status,reporters}:StoryFinishedPayload)=>{root.dataset.haUiCompletion=JSON.stringify({storyId,status,reports:reporters.map(({type,status})=>({type,status}))});};
 channel.on(STORY_FINISHED,finished);
 return()=>{channel.off(STORY_FINISHED,finished);delete root.dataset.haUiCompletion;};
}
