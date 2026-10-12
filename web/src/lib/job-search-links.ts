export function jobSearchLinks(role:string,location:string){
 const query=[role.trim(),location.trim()].filter(Boolean).join(' '),q=encodeURIComponent(query);
 return [
  {name:'Google · jobs across the web',url:'https://www.google.com/search?q='+encodeURIComponent(query+' jobs')},
  {name:'Google · company career pages',url:'https://www.google.com/search?q='+encodeURIComponent(query+' (careers OR vacancies OR Stellenangebote) (site:jobs.lever.co OR site:boards.greenhouse.io OR site:jobs.ashbyhq.com OR site:myworkdayjobs.com)')},
  {name:'Indeed',url:'https://www.indeed.com/jobs?q='+encodeURIComponent(role.trim())+'&l='+encodeURIComponent(location.trim())},
  {name:'LinkedIn',url:'https://www.linkedin.com/jobs/search/?keywords='+encodeURIComponent(role.trim())+'&location='+encodeURIComponent(location.trim())},
 ];
}
