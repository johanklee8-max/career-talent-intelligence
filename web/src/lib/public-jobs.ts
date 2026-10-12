import {z} from 'zod';
import type {PublicJob} from './cv-matching';
const s=z.string().max(1000),html=z.string().max(300000).optional().default('');
const schemas={
 Arbeitnow:z.object({title:s,company_name:s,location:s,remote:z.boolean(),url:z.string().url(),tags:z.array(s).max(100),created_at:z.number().finite().min(0).max(4102444800),description:html}),
 Remotive:z.object({title:s,company_name:s,candidate_required_location:s,url:z.string().url(),publication_date:s,category:s,tags:z.array(s).max(100).optional().default([]),description:html}),
 Jobicy:z.object({jobTitle:s,companyName:s,jobGeo:s,url:z.string().url(),pubDate:s,jobIndustry:z.array(s).max(100).optional().default([]),jobDescription:html}),
};
export function plainDescription(value:string){return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim().slice(0,6000);}
export const jobSources=[
 {name:'Arbeitnow',url:'https://www.arbeitnow.com/api/job-board-api',key:'data',host:'www.arbeitnow.com',ttl:3600},
 {name:'Arbeitnow',url:'https://www.arbeitnow.com/api/job-board-api?page=2',key:'data',host:'www.arbeitnow.com',ttl:3600},
 {name:'Arbeitnow',url:'https://www.arbeitnow.com/api/job-board-api?page=3',key:'data',host:'www.arbeitnow.com',ttl:3600},
 {name:'Remotive',url:'https://remotive.com/api/remote-jobs',key:'jobs',host:'remotive.com',ttl:21600},
 {name:'Jobicy',url:'https://jobicy.com/api/v2/remote-jobs?count=200',key:'jobs',host:'jobicy.com',ttl:3600},
] as const;
export async function publicJobs(fetcher:typeof fetch=fetch){
 const outcomes=await Promise.all(jobSources.map(async source=>{
  try{
   const r=await fetcher(source.url,{signal:AbortSignal.timeout(12000),next:{revalidate:source.ttl},headers:{Accept:'application/json'}});
   if(!r.ok)throw Error('Source unavailable');
   const body=await r.json(),raw=z.array(z.unknown()).max(3000).parse(body[source.key]);
   const jobs:PublicJob[]=raw.flatMap(value=>{
    const parsed=schemas[source.name].safeParse(value);if(!parsed.success)return [];
    const j=parsed.data,url=new URL(j.url);if(url.protocol!=='https:'||url.hostname!==source.host||url.username||url.password)return [];
    let job:PublicJob;
    if('created_at' in j)job={title:j.title,company:j.company_name,location:j.location,remote:j.remote,url:j.url,tags:j.tags,postedAt:new Date(j.created_at*1000).toISOString(),description:plainDescription(j.description),source:source.name};
    else if('publication_date' in j)job={title:j.title,company:j.company_name,location:j.candidate_required_location,remote:true,url:j.url,tags:[j.category,...j.tags],postedAt:j.publication_date,description:plainDescription(j.description),source:source.name};
    else job={title:j.jobTitle,company:j.companyName,location:j.jobGeo,remote:true,url:j.url,tags:j.jobIndustry,postedAt:j.pubDate,description:plainDescription(j.jobDescription),source:source.name};
    return Number.isFinite(Date.parse(job.postedAt))?[job]:[];
   });return {name:source.name,ok:true,jobs};
  }catch{return {name:source.name,ok:false,jobs:[] as PublicJob[]};}
 }));
 const jobs=Array.from(new Map(outcomes.flatMap(o=>o.jobs).map(j=>[j.url,j])).values()).slice(0,2500);
 const sources=Array.from(new Set(outcomes.map(o=>o.name))).map(name=>({name,status:outcomes.some(o=>o.name===name&&o.ok)?'available':'unavailable',count:jobs.filter(j=>j.source===name).length}));
 if(!outcomes.some(o=>o.ok))return Response.json({error:{code:'JOB_SOURCE_UNAVAILABLE',message:'All job feeds are unavailable. Use the external portal searches.'}},{status:502,headers:{'Cache-Control':'no-store'}});
 return Response.json({jobs,sources,retrievedAt:new Date().toISOString(),notice:'Sourced board listings; check availability and location eligibility on the original listing. Remotive public listings have a 24-hour publication delay.'},{headers:{'Cache-Control':'public, s-maxage=3600','X-Content-Type-Options':'nosniff'}});
}
