var P=Object.defineProperty,F=Object.defineProperties;var O=Object.getOwnPropertyDescriptors;var A=Object.getOwnPropertySymbols;var G=Object.prototype.hasOwnProperty,L=Object.prototype.propertyIsEnumerable;var D=(s,r,i)=>r in s?P(s,r,{enumerable:!0,configurable:!0,writable:!0,value:i}):s[r]=i,o=(s,r)=>{for(var i in r||(r={}))G.call(r,i)&&D(s,i,r[i]);if(A)for(var i of A(r))L.call(r,i)&&D(s,i,r[i]);return s},l=(s,r)=>F(s,O(r));var j=(s,r,i)=>new Promise((y,f)=>{var g=a=>{try{t(i.next(a))}catch(m){f(m)}},u=a=>{try{t(i.throw(a))}catch(m){f(m)}},t=a=>a.done?y(a.value):Promise.resolve(a.value).then(g,u);t((i=i.apply(s,r)).next())});import{f as q,r as N,j as e,B as h,C as I,p as T,q as w,v as S,Q as p}from"./main-Dczk40-q.js";import{u as U,a as M,o as k,s as c}from"./schemas-DMZ6hVDA.js";import{I as x}from"./index-DxDoSqvO.js";import{T as C}from"./textarea-fzgM4rGq.js";import{L as d}from"./label-KS36zHkM.js";import{S as $}from"./separator-CnmZayxo.js";import{A as V,a as Y}from"./alert-vAohCTxn.js";import{R as B}from"./ResponsiveLayout-CxdDAcTl.js";import{A as z}from"./arrow-left-CzEz-wbP.js";import{F as v}from"./file-text-BzwMQdpb.js";import{S as H}from"./save-DN_6e_8W.js";import{L as W}from"./loader-2-DzDjnuQG.js";import{E as X}from"./eye-CXD-3Vg7.js";import{D as E}from"./download-DJFdPVar.js";import{A as Q}from"./alert-triangle-BCAhts2_.js";import"./index-Bvi8qGb8.js";import"./index-p4sF6Wge.js";import"./databaseUtils-DDxBFZda.js";import"./badge-iBsRNaSn.js";import"./scroll-area-Ya-nYYPz.js";import"./index-BCwUGNws.js";import"./tabs-ChvN7mKq.js";import"./check-Dn5E7z_E.js";import"./useNotifications-DdfHYMMR.js";import"./notificationService-DiBkqnn5.js";import"./bell-CB9MQoCr.js";import"./user-xzPyfs-H.js";import"./search-CoqTXUJe.js";import"./calendar-DbYgxsnG.js";import"./zap-BM2f935p.js";import"./plus-B7hFD5Z2.js";import"./message-square-BskFJ3te.js";import"./map-pin-B65WKje7.js";import"./wifi-D1BoRTe0.js";import"./log-out-vClmguiA.js";const J=k({title:c().min(1,"Title is required"),disclosing_party:c().min(1,"Disclosing party is required"),receiving_party:c().min(1,"Receiving party is required"),confidential_information:c().min(1,"Confidential information description is required"),term:c().min(1,"Term is required"),additional_terms:c().optional()}),Fe=()=>{const s=q(),[r,i]=N.useState(!1),[y,f]=N.useState(""),[g,u]=N.useState(!1),t=U({resolver:M(J),defaultValues:{title:"Non-Disclosure Agreement",disclosing_party:"",receiving_party:"",confidential_information:"",term:"",additional_terms:""}}),a=n=>j(void 0,null,function*(){u(!0);try{yield new Promise(R=>setTimeout(R,2e3));const _=`
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between:

DISCLOSING PARTY: ${n.disclosing_party}
RECEIVING PARTY: ${n.receiving_party}

1. PURPOSE
   The parties wish to explore a potential business relationship and may disclose confidential information to each other for evaluation purposes.

2. CONFIDENTIAL INFORMATION
   "Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party, either directly or indirectly, in writing, orally, or by inspection of tangible objects, which is designated as "Confidential," "Proprietary," or some similar designation, or that should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure.

   Confidential Information includes, but is not limited to:
   ${n.confidential_information}

3. NON-DISCLOSURE AND NON-USE
   The Receiving Party agrees not to:
   - Disclose any Confidential Information to any third party
   - Use any Confidential Information for any purpose other than the stated business purpose
   - Copy, reproduce, or distribute any Confidential Information
   - Reverse engineer or attempt to derive the composition or underlying structure of any Confidential Information

4. EXCEPTIONS
   The obligations of confidentiality shall not apply to information that:
   - Was known to the Receiving Party prior to disclosure
   - Is or becomes publicly available through no fault of the Receiving Party
   - Is independently developed by the Receiving Party without use of the Confidential Information
   - Is required to be disclosed by law or court order

5. TERM
   This Agreement shall remain in effect for: ${n.term}
   The obligations of confidentiality shall survive termination of this Agreement for a period of 5 years.

6. RETURN OF MATERIALS
   Upon termination of this Agreement or upon written request of the Disclosing Party, the Receiving Party shall return all Confidential Information and any copies, notes, or other materials containing such information.

7. NO RIGHTS GRANTED
   Nothing in this Agreement shall be construed as granting any rights under any patent, copyright, or other intellectual property right, nor shall this Agreement grant any party any rights in or to the other party's Confidential Information other than the limited right to review such Confidential Information for the purposes described herein.

8. REMEDIES
   The Receiving Party acknowledges that unauthorized disclosure of Confidential Information may cause irreparable harm to the Disclosing Party, and that monetary damages may be inadequate to compensate for such harm. The Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedies available at law or in equity.

9. ADDITIONAL TERMS
   ${n.additional_terms||"No additional terms specified."}

10. GOVERNING LAW
    This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction where the Disclosing Party is located.

11. ENTIRE AGREEMENT
    This Agreement constitutes the entire understanding between the parties concerning the subject matter hereof and supersedes all prior agreements, understandings, and negotiations.

DISCLOSING PARTY SIGNATURE: _________________ DATE: _______________
RECEIVING PARTY SIGNATURE: _________________ DATE: _______________
      `;f(_),i(!0),p.success("Document generated successfully!")}catch(_){p.error("Failed to generate document")}finally{u(!1)}}),m=n=>j(void 0,null,function*(){try{p.success("Draft saved successfully!")}catch(_){p.error("Failed to save draft")}}),b=n=>{p.success(`Document exported as ${n.toUpperCase()}`)};return e.jsx(B,{children:e.jsxs("div",{className:"container mx-auto py-6 space-y-6",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs(h,{variant:"ghost",size:"sm",onClick:()=>s("/legal-assistant"),className:"flex items-center gap-2",children:[e.jsx(z,{className:"w-4 h-4"}),"Back to Legal Assistant"]}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Non-Disclosure Agreement"}),e.jsx("p",{className:"text-muted-foreground",children:"Create a confidentiality agreement"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsxs(I,{children:[e.jsx(T,{children:e.jsxs(w,{className:"flex items-center gap-2",children:[e.jsx(v,{className:"w-5 h-5"}),"Agreement Details"]})}),e.jsx(S,{children:e.jsxs("form",{onSubmit:t.handleSubmit(a),className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx(d,{htmlFor:"title",children:"Document Title"}),e.jsx(x,l(o({id:"title"},t.register("title")),{placeholder:"Non-Disclosure Agreement"})),t.formState.errors.title&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:t.formState.errors.title.message})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx(d,{htmlFor:"disclosing_party",children:"Disclosing Party"}),e.jsx(x,l(o({id:"disclosing_party"},t.register("disclosing_party")),{placeholder:"Company Name"})),t.formState.errors.disclosing_party&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:t.formState.errors.disclosing_party.message})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"receiving_party",children:"Receiving Party"}),e.jsx(x,l(o({id:"receiving_party"},t.register("receiving_party")),{placeholder:"Individual or Company Name"})),t.formState.errors.receiving_party&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:t.formState.errors.receiving_party.message})]})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"confidential_information",children:"Confidential Information Description"}),e.jsx(C,l(o({id:"confidential_information"},t.register("confidential_information")),{placeholder:"Describe the confidential information that will be shared (e.g., trade secrets, business plans, customer data, technical specifications, etc.)",rows:3})),t.formState.errors.confidential_information&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:t.formState.errors.confidential_information.message})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"term",children:"Agreement Term"}),e.jsx(x,l(o({id:"term"},t.register("term")),{placeholder:"2 years"})),t.formState.errors.term&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:t.formState.errors.term.message})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"additional_terms",children:"Additional Terms (Optional)"}),e.jsx(C,l(o({id:"additional_terms"},t.register("additional_terms")),{placeholder:"Any additional terms or conditions...",rows:3}))]}),e.jsx($,{}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(h,{type:"button",variant:"outline",onClick:t.handleSubmit(m),className:"flex-1",children:[e.jsx(H,{className:"w-4 h-4 mr-2"}),"Save Draft"]}),e.jsx(h,{type:"submit",disabled:g,className:"flex-1",children:g?e.jsxs(e.Fragment,{children:[e.jsx(W,{className:"w-4 h-4 mr-2 animate-spin"}),"Generating..."]}):e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"w-4 h-4 mr-2"}),"Generate Document"]})})]})]})})]}),e.jsxs(I,{children:[e.jsx(T,{children:e.jsxs(w,{className:"flex items-center gap-2",children:[e.jsx(X,{className:"w-5 h-5"}),"Document Preview"]})}),e.jsx(S,{children:r?e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"bg-gray-50 p-4 rounded-lg",children:e.jsx("pre",{className:"whitespace-pre-wrap text-sm font-mono",children:y})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(h,{variant:"outline",onClick:()=>b("pdf"),className:"flex-1",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Export PDF"]}),e.jsxs(h,{variant:"outline",onClick:()=>b("docx"),className:"flex-1",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Export DOCX"]})]}),e.jsxs(V,{children:[e.jsx(Q,{className:"h-4 w-4"}),e.jsx(Y,{children:"This is a template document. Please review with a legal professional before use."})]})]}):e.jsxs("div",{className:"text-center py-8 text-muted-foreground",children:[e.jsx(v,{className:"w-12 h-12 mx-auto mb-4 opacity-50"}),e.jsx("p",{children:"Fill out the form and generate your document to see a preview here."})]})})]})]})]})})};export{Fe as NDA,Fe as default};
