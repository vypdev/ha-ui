import {STORY_FINISHED,STORY_RENDER_PHASE_CHANGED,type StoryFinishedPayload} from 'storybook/internal/core-events';
import type {Channel} from 'storybook/internal/channels';
/** Observe the public completion event after all hooks, including automatic accessibility audits. */
export function observeCatalogCompletion(channel:Pick<Channel,'on'|'off'>,root:HTMLElement):()=>void{
 let revision=0;
 const finished=({storyId,status,reporters}:StoryFinishedPayload)=>{root.dataset.haUiCompletion=JSON.stringify({storyId,status,revision,reports:reporters.map(({type,status})=>({type,status}))});};
 const started=({newPhase}:{newPhase:string})=>{if(['preparing','loading','rendering'].includes(newPhase)){revision++;delete root.dataset.haUiCompletion;}};
 channel.on(STORY_FINISHED,finished);
 channel.on(STORY_RENDER_PHASE_CHANGED,started);
 return()=>{channel.off(STORY_FINISHED,finished);channel.off(STORY_RENDER_PHASE_CHANGED,started);delete root.dataset.haUiCompletion;};
}
