export const skillsCatalog: Record<string,string[]> = {
 Python:['python'], SQL:['sql','postgresql','mysql'], Excel:['excel','spreadsheet','tabellenkalkulation'],
 Research:['research','recherche','forschung'], 'Project management':['project management','projektmanagement','projektleitung'],
 Sales:['sales','vertrieb','verkauf','business development'], Marketing:['marketing','seo','campaign','kampagne'],
 Recruiting:['recruiting','recruitment','talent acquisition','personalgewinnung'], Finance:['finance','accounting','buchhaltung','controlling'],
 'Customer service':['customer service','customer support','kundenservice','kundenbetreuung'],
 Design:['design','figma','adobe'], JavaScript:['javascript','typescript','react'],
 Operations:['operations','logistics','logistik','supply chain'], Leadership:['team lead','teamleitung','leadership','führung'],
 Healthcare:['nursing','pflege','healthcare','patient'], Teaching:['teaching','teacher','unterricht','training'],
 Engineering:['engineering','engineer','ingenieur','cad'], Hospitality:['hospitality','hotel','gastronomie'],
 Communication:['communication','kommunikation','stakeholder'], Sustainability:['sustainability','nachhaltigkeit','climate'],
};
export type Signal={skill:string;excerpt:string};
const detectors=Object.entries(skillsCatalog).map(([skill,aliases])=>({skill,patterns:aliases.map(alias=>new RegExp('(^|[^\\p{L}\\p{N}])'+alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|[^\\p{L}\\p{N}])','iu'))}));
export function extractSignals(text:string):Signal[]{
 const lines=text.split(/\n+/).map(s=>s.trim()).filter(Boolean);
 return detectors.flatMap(({skill,patterns})=>{
  const line=lines.find(line=>patterns.some(pattern=>pattern.test(line)));
  return line?[{skill,excerpt:line.slice(0,240)}]:[];
 });
}
const paths=[
 ['Data analyst',['SQL','Excel','Python'],'Direct','data analyst'],
 ['Software developer',['JavaScript','Python'],'Direct','software developer'],
 ['Project coordinator',['Project management','Communication'],'Direct','project coordinator'],
 ['Sales / business development specialist',['Sales','Communication'],'Direct','sales'],
 ['Marketing specialist',['Marketing','Design'],'Direct','marketing'],
 ['Recruitment coordinator',['Recruiting','Communication'],'Direct','recruiting'],
 ['Finance / controlling analyst',['Finance','Excel'],'Direct','finance'],
 ['Customer success specialist',['Customer service','Communication'],'Adjacent','customer success'],
 ['Operations coordinator',['Operations','Excel','Project management'],'Direct','operations'],
 ['UX researcher',['Research','Design'],'Adjacent','ux researcher'],
 ['Learning and development coordinator',['Teaching','Communication'],'Adjacent','learning development'],
 ['Technical customer support',['Customer service','JavaScript','Python'],'Adjacent','technical support'],
 ['Engineering project coordinator',['Engineering','Project management'],'Adjacent','engineering'],
 ['Hospitality operations coordinator',['Hospitality','Operations'],'Direct','hospitality'],
 ['Healthcare project coordinator',['Healthcare','Project management'],'Adjacent','healthcare'],
 ['People operations specialist',['Recruiting','Operations','Communication'],'Adjacent','people operations'],
 ['Sustainability data coordinator',['Sustainability','Excel','Research'],'Unconventional','sustainability'],
 ['Sales enablement specialist',['Sales','Teaching','Marketing'],'Unconventional','sales enablement'],
 ['Research operations specialist',['Research','Operations','Project management'],'Unconventional','research operations'],
 ['Community program manager',['Communication','Marketing','Project management'],'Unconventional','community manager'],
] as const;
export function matchCareer(skills:string[],ambitions:string){
 const interest=ambitions.toLowerCase();
 return paths.map(([title,required,category,query])=>{
  const evidence=required.filter(s=>skills.includes(s)); const gaps=required.filter(s=>!skills.includes(s));
  const interestAligned=query.split(' ').some(word=>word.length>3&&interest.includes(word));
  return {title,category,query,evidence,gaps,interestAligned,rank:evidence.length/required.length+(interestAligned?0.1:0)};
 }).filter(r=>r.evidence.length>0).sort((a,b)=>b.rank-a.rank).slice(0,6);
}
export type CareerMatch=ReturnType<typeof matchCareer>[number];
export type PublicJob={title:string;company:string;location:string;remote:boolean;url:string;tags:string[];postedAt:string};
export function rankJobs(jobs:PublicJob[],skills:string[],target:CareerMatch|null,location:string){
 return jobs.filter(j=>!location||j.location.toLowerCase().includes(location.toLowerCase())).map(job=>{
  const text=[job.title,...job.tags].join(' '); const evidence=extractSignals(text).filter(s=>skills.includes(s.skill)).map(s=>s.skill);
  const words=(target?.query??'').split(' ').filter(w=>w.length>3); const roleOverlap=words.filter(w=>text.toLowerCase().includes(w));
  return {...job,evidence,roleOverlap,rank:evidence.length+roleOverlap.length};
 }).filter(j=>j.rank>0).sort((a,b)=>b.rank-a.rank).slice(0,12);
}
