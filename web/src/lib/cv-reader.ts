import {unzipSync} from 'fflate';
export const MAX_CV_BYTES=3*1024*1024;
export function validateFile(name:string,data:Uint8Array){
 if(!data.length||data.length>MAX_CV_BYTES)throw Error('Choose a non-empty PDF or DOCX up to 3 MiB.');
 const extension=name.toLowerCase().split('.').pop();
 if(extension==='pdf'&&new TextDecoder().decode(data.slice(0,5))==='%PDF-')return 'pdf';
 if(extension==='docx'&&data[0]===0x50&&data[1]===0x4b&&data[2]===3&&data[3]===4)return 'docx';
 throw Error('The file contents do not match a PDF or DOCX document.');
}
export function docxDocument(data:Uint8Array){
 let total=0,count=0;
 const files=unzipSync(data,{filter(file){
  total+=file.originalSize;count++;
  if(count>1000||total>10*1024*1024||file.originalSize>10*1024*1024)throw Error('DOCX archive exceeds safe extraction limits.');
  if(/vbaProject|\.bin$|\.docm$/i.test(file.name))throw Error('Macro-enabled documents are not accepted.');
  return file.name==='word/document.xml'||file.name==='[Content_Types].xml';
 }});
 if(!files['word/document.xml']||!files['[Content_Types].xml'])throw Error('This is not a valid DOCX document.');
 const xml=new TextDecoder().decode(files['word/document.xml']);
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('Unsafe XML declarations are not accepted.');
 return xml;
}
export async function readCV(file:File){
 if(file.size>MAX_CV_BYTES)throw Error('Maximum CV size is 3 MiB.');
 const data=new Uint8Array(await file.arrayBuffer()); const type=validateFile(file.name,data); let text='';
 if(type==='docx'){
  const doc=new DOMParser().parseFromString(docxDocument(data),'application/xml');
  if(doc.querySelector('parsererror'))throw Error('The DOCX document contains invalid XML.');
  text=Array.from(doc.getElementsByTagNameNS('*','p')).map(p=>Array.from(p.getElementsByTagNameNS('*','t')).map(t=>t.textContent??'').join('')).join('\n');
 }else{
  const pdf=await import('pdfjs-dist');
  pdf.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString();
  const loading=pdf.getDocument({data,useSystemFonts:true,disableFontFace:true});
  const timeout=setTimeout(()=>{void loading.destroy();},20000);
  try{
   const doc=await loading.promise;
   if(doc.numPages>40)throw Error('Maximum PDF length is 40 pages.');
   const pages=[];
   for(let i=1;i<=doc.numPages;i++){
    const page=await doc.getPage(i), content=await page.getTextContent();
    pages.push(content.items.map(item=>'str' in item?item.str+(item.hasEOL?'\n':' '):'').join(''));page.cleanup();
   }
   text=pages.join('\n');
  }finally{clearTimeout(timeout);await loading.destroy();}
 }
 if(text.length>100000)throw Error('Extracted CV exceeds 100,000 characters.');
 if(text.trim().length<30)throw Error('No usable text found. Scanned PDFs need OCR; export a text-based PDF or DOCX.');
 return text.trim();
}
