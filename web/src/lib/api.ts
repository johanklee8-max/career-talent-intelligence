import {publicJobs} from './public-jobs';
import {DemoInput,analyze,outreach,interview} from './intelligence';
import { z } from 'zod';
const generation= z.object({profile:DemoInput,roleIndex:z.number().int().min(0).max(2)}).strict();
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function handle(request:Request,path:string){
 // No configurable bypass: all private endpoints remain closed until an audited auth/storage implementation exists.
 if(path==='jobs')return request.method==='GET'?publicJobs():json({error:{code:'METHOD_NOT_ALLOWED',message:'Use GET'}},405);
 if(path==='health'&&request.method==='GET')return json({status:'ok',mode:'browser-local-cv',uploadsEnabled:true,serverUploadsEnabled:false,authenticationConfigured:false});
 if(!['demo/analyze','demo/outreach','demo/interview'].includes(path))return json({error:{code:'PRIVATE_MODE_DISABLED',message:'Authentication and private storage are not configured. Real-data endpoints are disabled.'}},403);
 if(request.method!=='POST')return json({error:{code:'METHOD_NOT_ALLOWED',message:'Use POST'}},405);
 try{const reader=request.body?.getReader();let size=0;const chunks:Uint8Array[]=[];if(reader){for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return json({error:{code:'PAYLOAD_TOO_LARGE',message:'Maximum demo payload is 2 KiB'}},413);}chunks.push(value);}}
 const body=JSON.parse(new TextDecoder().decode(Buffer.concat(chunks)));
 if(path==='demo/analyze'){const input=DemoInput.parse(body);return json({recommendations:analyze(input)});}
 const input=generation.parse(body);return json(path==='demo/outreach'?outreach(input.profile,input.roleIndex):interview(input.roleIndex));
 }catch{return json({error:{code:'INVALID_INPUT',message:'Provide valid synthetic demo choices only.'}},400);}
}
