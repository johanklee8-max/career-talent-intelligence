import test from 'node:test';
import assert from 'node:assert/strict';
import {zipSync,strToU8} from 'fflate';
import {validateFile,docxDocument,MAX_CV_BYTES} from '../src/lib/cv-reader';
import {extractSignals,matchCareer,rankJobs} from '../src/lib/cv-matching';
import {sampleCV} from '../src/lib/sample-cv';
import {publicJobs} from '../src/lib/public-jobs';
test('PDF and DOCX samples pass content validation; invalid and oversized documents fail',async()=>{
 for(const type of ['pdf','docx'] as const){const file=sampleCV(type);assert.equal(validateFile(file.name,new Uint8Array(await file.arrayBuffer())),type);}
 assert.throws(()=>validateFile('cv.pdf',strToU8('fake PDF')),/contents/);
 assert.throws(()=>validateFile('cv.exe',strToU8('%PDF-1.4')),/contents/);
 assert.throws(()=>validateFile('cv.pdf',new Uint8Array(MAX_CV_BYTES+1)),/3 MiB/);
});
test('DOCX reads only document XML and rejects macros, unsafe XML and expansion bombs',async()=>{
 const sample=new Uint8Array(await sampleCV('docx').arrayBuffer());assert.match(docxDocument(sample),/Python and SQL/);
 const pack=(xml:string,extra:Record<string,Uint8Array>={})=>zipSync({'[Content_Types].xml':strToU8('<Types/>'),'word/document.xml':strToU8(xml),...extra});
 assert.throws(()=>docxDocument(pack('<doc/>',{'word/vbaProject.bin':strToU8('macro')})),/Macro/);
 assert.throws(()=>docxDocument(pack('<!DOCTYPE doc><doc/>')),/Unsafe/);
 assert.throws(()=>docxDocument(pack('x'.repeat(10*1024*1024+1))),/limits/);
 assert.throws(()=>docxDocument(zipSync({'other.txt':strToU8('not a DOCX')})),/valid DOCX/);
});
test('skill extraction records evidence, avoids substring false positives and adapts to corrections',()=>{
 assert.deepEqual(extractSignals('Worked with Python and SQL.').map(s=>s.skill),['Python','SQL']);
 assert.deepEqual(extractSignals('I built a pythonic squirrel designator.'),[]);
 assert.equal(extractSignals('Projektmanagement und Kundenservice').length,2);
 const before=matchCareer(['SQL','Excel','Python'],'data');assert.equal(before[0].title,'Data analyst');
 const after=matchCareer(['Sales','Communication'],'sales');assert.equal(after[0].title,'Sales / business development specialist');
 assert.equal(matchCareer([],'software').length,0);
 assert.equal(matchCareer(['Communication'],'sales').length,0);
 assert.ok(extractSignals('Python experience')[0].excerpt.includes('experience'));
});
test('public listings are source restricted and matching filters without sending CV',async()=>{
 const item={title:'Data analyst',company_name:'Example',location:'Berlin',remote:true,url:'https://www.arbeitnow.com/jobs/example',tags:['SQL'],created_at:1700000000};
 let received='';
 const fetcher=(async(url:unknown)=>{received=String(url);return Response.json({data:[item,{...item,url:'javascript:alert(1)'},{title:'bad'}]});}) as typeof fetch;
 const response=await publicJobs(fetcher),body=await response.json();assert.equal(response.status,200);assert.equal(body.jobs.length,1);
 assert.equal(received,'https://www.arbeitnow.com/api/job-board-api');
 assert.equal(rankJobs(body.jobs,['SQL'],null,'Berlin').length,1);
 assert.equal(rankJobs(body.jobs,['SQL'],null,'Rome').length,0);
 assert.equal(rankJobs(body.jobs,['Teaching'],null,'').length,0);
 const dataTarget=matchCareer(['SQL','Excel','Python'],'')[0];
 const unrelated={title:'Sales manager',company:'Example',location:'Berlin',remote:false,url:'https://www.arbeitnow.com/jobs/unrelated',tags:['Communication'],postedAt:'2026-10-10'};
 assert.equal(rankJobs([...body.jobs,unrelated],['SQL','Communication'],dataTarget,'').length,1);
});
test('job feed failure is explicit and never substitutes invented jobs',async()=>{
 const failing=(async()=>{throw Error('upstream down');}) as typeof fetch;
 const r=await publicJobs(failing);assert.equal(r.status,502);assert.equal((await r.json()).error.code,'JOB_SOURCE_UNAVAILABLE');
});
