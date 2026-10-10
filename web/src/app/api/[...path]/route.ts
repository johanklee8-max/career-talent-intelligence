import {handle} from '@/lib/api';
export const runtime='nodejs';
export const maxDuration=30;
async function route(request:Request,context:{params:Promise<{path:string[]}>}){return handle(request,(await context.params).path.join('/'));}
export const GET=route;export const POST=route;export const DELETE=route;export const PUT=route;export const PATCH=route;
