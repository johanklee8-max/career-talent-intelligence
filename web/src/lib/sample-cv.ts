import {zipSync,strToU8} from 'fflate';
export const sampleLines=['Alex Example - fictional CV','Experience: Research coordinator at Example Lab, 2022-2025','Used Python and SQL to analyze research data.','Managed projects with Excel and stakeholder communication.','Education: BSc Information Systems, Fictional University','Languages: English and German.'];
export function sampleCV(type:'pdf'|'docx'){
 if(type==='docx'){
  const xml='<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+sampleLines.map(s=>'<w:p><w:r><w:t>'+s+'</w:t></w:r></w:p>').join('')+'</w:body></w:document>';
  const data=zipSync({'[Content_Types].xml':strToU8('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'),'word/document.xml':strToU8(xml)});
  return new File([data as Uint8Array<ArrayBuffer>],'fictional-sample.docx',{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
 }
 const stream='BT /F1 12 Tf 50 750 Td '+sampleLines.map((s,i)=>(i?'0 -24 Td ':'')+'('+s+') Tj').join('\n')+' ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
 let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((obj,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;});const xref=pdf.length;pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return new File([pdf],'fictional-sample.pdf',{type:'application/pdf'});
}
