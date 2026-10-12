import test from 'node:test';
import assert from 'node:assert/strict';
import {salaryAssessment,shortlistJobs,type JobPreferences} from '../src/lib/job-scorecard';
import type {PublicJob} from '../src/lib/cv-matching';
const prefs:JobPreferences={minimumSalary:60000,currency:'EUR',hideUnknownSalary:false,limit:5,seniority:'any'};
const job:PublicJob={title:'Data analyst',company:'Synthetic test',location:'Berlin',remote:false,url:'https://jobicy.com/jobs/test',tags:['SQL'],description:'SQL and Excel analysis',postedAt:'2026-10-12',salaryMin:65000,salaryMax:80000,salaryCurrency:'EUR',salaryPeriod:'yearly'};
test('salary compares only known annual ranges in the same currency',()=>{
 assert.equal(salaryAssessment(job,prefs).points,15);
 assert.equal(salaryAssessment({...job,salaryMin:50000},prefs).points,10);
 assert.equal(salaryAssessment({...job,salaryMax:55000,salaryMin:50000},prefs).status,'below');
 for(const patch of [{salaryCurrency:'USD'},{salaryPeriod:'hourly'},{salaryMin:undefined,salaryMax:undefined},{salaryMin:90000,salaryMax:70000},{salaryMin:50000,salaryMax:undefined}])assert.equal(salaryAssessment({...job,...patch},prefs).status,'unknown');
});
test('shortlist ranks evidence, limits output, excludes low salaries and flags unknowns',()=>{
 const jobs=Array.from({length:12},(_,i)=>({...job,url:job.url+i,title:'Data analyst '+i}));
 jobs.push({...job,url:job.url+'low',salaryMin:40000,salaryMax:50000});
 jobs.push({...job,url:job.url+'unknown',salaryCurrency:'USD'});
 const results=shortlistJobs(jobs,['SQL','Excel'],null,'Berlin','data analyst',false,prefs);
 assert.equal(results.length,5);assert.equal(results[0].score,100);assert.equal(results[0].rows.length,4);assert.ok(!results.some(j=>j.url.endsWith('low')));
 const unknown={...job,salaryCurrency:'USD'};
 assert.equal(shortlistJobs([unknown],['SQL','Excel'],null,'Berlin','data analyst',false,prefs)[0].score,85);
 assert.equal(shortlistJobs([unknown],['SQL','Excel'],null,'Berlin','data analyst',false,{...prefs,hideUnknownSalary:true}).length,0);
 assert.equal(shortlistJobs([{...job,title:'Senior Data analyst'}],['SQL'],null,'Berlin','data analyst',false,{...prefs,seniority:'early'}).length,0);
});
