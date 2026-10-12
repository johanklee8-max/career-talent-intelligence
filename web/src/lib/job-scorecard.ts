import {rankJobs,type PublicJob,type CareerMatch} from './cv-matching';
export type JobPreferences={minimumSalary:number;currency:string;hideUnknownSalary:boolean;limit:number;seniority:'any'|'early'|'experienced'};
export function salaryAssessment(job:PublicJob,p:JobPreferences){
 const annual=['year','yearly','annual','annually'].includes(job.salaryPeriod?.toLowerCase()??'');
 const comparable=annual&&job.salaryCurrency?.toUpperCase()===p.currency&&(job.salaryMax!==undefined||job.salaryMin!==undefined)&&!(job.salaryMin!==undefined&&job.salaryMax!==undefined&&job.salaryMax<job.salaryMin);
 const display=job.salaryText?.trim()||(job.salaryMin!==undefined||job.salaryMax!==undefined?`${job.salaryCurrency??'Currency unknown'} ${job.salaryMin?.toLocaleString('en-US')??'?'} – ${job.salaryMax?.toLocaleString('en-US')??'?'} / ${job.salaryPeriod??'period unknown'}`:'Not disclosed');
 if(!p.minimumSalary)return {status:'not-set',points:0,display,note:'No salary preference set.'};
 if(!comparable)return {status:'unknown',points:0,display,note:'No comparable annual range in your chosen currency. No currency conversion or salary estimate.'};
 const upper=job.salaryMax??job.salaryMin!;
 if(job.salaryMax===undefined&&upper<p.minimumSalary)return {status:'unknown',points:0,display,note:'Only a lower salary bound is published; the upper budget is unknown.'};
 if(upper<p.minimumSalary)return {status:'below',points:0,display,note:'Published range is below your minimum.'};
 const fully=(job.salaryMin??0)>=p.minimumSalary;
 return {status:'meets',points:fully?15:10,display,note:fully?'Published lower bound meets your minimum.':'Your minimum overlaps the published range; actual offer needs confirmation.'};
}
export function shortlistJobs(jobs:PublicJob[],skills:string[],target:CareerMatch|null,location:string,query:string,includeRemote:boolean,p:JobPreferences){
 const candidates=rankJobs(jobs,skills,target,location,query,includeRemote);
 return candidates.flatMap(job=>{
  const seniorTitle=/\b(senior|staff|principal|lead|director|head|chief)\b/i.test(job.title);
  if(p.seniority==='early'&&seniorTitle)return [];
  const salary=salaryAssessment(job,p);
  if(salary.status==='below'||(p.minimumSalary>0&&p.hideUnknownSalary&&salary.status==='unknown'))return [];
  const relevant=target?.evidence??skills,skillPoints=relevant.length?Math.round(45*job.evidence.length/relevant.length):0;
  const roleSet=!!(query.trim()||target?.query),words=(query.trim()||target?.query||'').toLowerCase().split(/\s+/).filter(w=>w.length>1);
  const titleHits=words.filter(w=>job.title.toLowerCase().includes(w)).length;
  const rolePoints=roleSet?Math.round(25*(0.7*(words.length?titleHits/words.length:0)+0.3*(words.length?job.roleOverlap.length/words.length:0))):0;
  const locationSet=!!location.trim(),exactLocation=locationSet&&job.location.toLowerCase().includes(location.trim().toLowerCase());
  const locationPoints=locationSet?(exactLocation?15:job.remote&&includeRemote?5:0):0;
  const denominator=(relevant.length?45:0)+(roleSet?25:0)+(locationSet?15:0)+(p.minimumSalary?15:0);
  const score=denominator?Math.round(100*(skillPoints+rolePoints+locationPoints+salary.points)/denominator):0;
  const rows=[{criterion:'Reviewed skill keywords',value:relevant.length?`${job.evidence.length}/${relevant.length} · ${job.evidence.join(', ')||'No overlap'}`:'No reviewed skills',points:skillPoints,maximum:relevant.length?45:0},{criterion:'Role keywords',value:roleSet?`${titleHits}/${words.length} in title; ${job.roleOverlap.length}/${words.length} in listing`:'No role filter',points:rolePoints,maximum:roleSet?25:0},{criterion:'Location',value:locationSet?(exactLocation?'Location text matches':'Remote alternative; eligibility unverified'):'No location preference',points:locationPoints,maximum:locationSet?15:0},{criterion:'Salary',value:salary.note,points:salary.points,maximum:p.minimumSalary?15:0}];
  return [{...job,score,salary,rows,seniorityNote:p.seniority==='early'?'Senior titles excluded; remaining seniority unverified.':seniorTitle?'Senior title detected; check required experience.':'Experience requirements need review.',unknowns:['Experience and seniority','Qualifications and licences','Work eligibility',...(salary.status==='unknown'||salary.display==='Not disclosed'?['Salary compatibility']:[])]}];
 }).sort((a,b)=>b.score-a.score||b.rank-a.rank||Date.parse(b.postedAt)-Date.parse(a.postedAt)).slice(0,p.limit);
}
