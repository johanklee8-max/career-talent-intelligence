import {z} from 'zod';
const listing=z.object({title:z.string().max(500),company_name:z.string().max(300),location:z.string().max(300),remote:z.boolean(),url:z.string().url(),tags:z.array(z.string().max(100)).max(100),created_at:z.number().finite()});
export async function publicJobs(fetcher:typeof fetch=fetch){
 try{
  const upstream=await fetcher('https://www.arbeitnow.com/api/job-board-api',{signal:AbortSignal.timeout(10000),next:{revalidate:900},headers:{Accept:'application/json'}});
  if(!upstream.ok)throw Error('Job source unavailable');
  const body=await upstream.json();
  const feed=z.object({data:z.array(z.unknown()).max(500)}).parse(body);
  const jobs=feed.data.flatMap(raw=>{const p=listing.safeParse(raw);if(!p.success)return [];const j=p.data,url=new URL(j.url);if(url.protocol!=='https:'||url.hostname!=='www.arbeitnow.com')return [];return [{title:j.title,company:j.company_name,location:j.location,remote:j.remote,url:j.url,tags:j.tags,postedAt:new Date(j.created_at*1000).toISOString()}];});
  return Response.json({jobs,source:'https://www.arbeitnow.com/api/job-board-api',retrievedAt:new Date().toISOString(),notice:'Job-board listings; vacancy status and employer claims require confirmation.'},{headers:{'Cache-Control':'public, s-maxage=900','X-Content-Type-Options':'nosniff'}});
 }catch{return Response.json({error:{code:'JOB_SOURCE_UNAVAILABLE',message:'Live job source is unavailable. Try again later or use the external search links.'}},{status:502,headers:{'Cache-Control':'no-store'}});}
}
