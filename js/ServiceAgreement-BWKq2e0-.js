var R=Object.defineProperty,L=Object.defineProperties;var O=Object.getOwnPropertyDescriptors;var E=Object.getOwnPropertySymbols;var F=Object.prototype.hasOwnProperty,G=Object.prototype.propertyIsEnumerable;var w=(i,t,s)=>t in i?R(i,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):i[t]=s,o=(i,t)=>{for(var s in t||(t={}))F.call(t,s)&&w(i,s,t[s]);if(E)for(var s of E(t))G.call(t,s)&&w(i,s,t[s]);return i},l=(i,t)=>L(i,O(t));var _=(i,t,s)=>new Promise((f,v)=>{var x=a=>{try{r(s.next(a))}catch(m){v(m)}},u=a=>{try{r(s.throw(a))}catch(m){v(m)}},r=a=>a.done?f(a.value):Promise.resolve(a.value).then(x,u);r((s=s.apply(i,t)).next())});import{f as k,r as j,j as e,B as p,C as A,p as C,q as I,v as b,Q as h}from"./main-jfCIwKxb.js";import{u as M,a as V,o as B,s as c}from"./schemas-DYxMo0bf.js";import{I as y}from"./index-DGobKVbi.js";import{T as N}from"./textarea-Dm2RgXBl.js";import{L as d}from"./label-BhjyL16S.js";import{S as U}from"./separator-CQeeh5sy.js";import{A as $,a as q}from"./alert-f_BC70aV.js";import{R as Y}from"./ResponsiveLayout-Dd-U-XTf.js";import{A as z}from"./arrow-left-BUiGB43w.js";import{F as S}from"./file-text-C_1z4c-s.js";import{S as H}from"./save-CTzb2421.js";import{L as Q}from"./loader-2-iBg9Stez.js";import{E as W}from"./eye-CYa_iGA4.js";import{D as P}from"./download-N2wYwcou.js";import{A as X}from"./alert-triangle-DO8UyvKH.js";import"./index-D6sgUugm.js";import"./index-CaL9moq2.js";import"./databaseUtils-Cc-GydU0.js";import"./badge-Cxniq3nT.js";import"./scroll-area-Bsyy6uVd.js";import"./index-DCmZQWeX.js";import"./tabs-Bho2AISw.js";import"./check-CWeqS_MX.js";import"./useNotifications-DlynYvan.js";import"./notificationService-DPR46Nx3.js";import"./bell-CXNc_0l5.js";import"./user-cZSM4iEh.js";import"./search-DIpOLffQ.js";import"./calendar-CXbnSY_4.js";import"./zap-C2TAeX5H.js";import"./plus-Bi3vU8QF.js";import"./message-square-oWFCH1Pi.js";import"./map-pin-B5hnRU36.js";import"./wifi-Ue5kLFZw.js";import"./log-out-CxjypOOW.js";const J=B({title:c().min(1,"Title is required"),service_provider:c().min(1,"Service provider is required"),client:c().min(1,"Client is required"),services:c().min(1,"Services description is required"),payment_terms:c().min(1,"Payment terms are required"),additional_terms:c().optional()}),Le=()=>{const i=k(),[t,s]=j.useState(!1),[f,v]=j.useState(""),[x,u]=j.useState(!1),r=M({resolver:V(J),defaultValues:{title:"Service Agreement",service_provider:"",client:"",services:"",payment_terms:"",additional_terms:""}}),a=n=>_(void 0,null,function*(){u(!0);try{yield new Promise(D=>setTimeout(D,2e3));const g=`
SERVICE AGREEMENT

This Service Agreement (the "Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between:

SERVICE PROVIDER: ${n.service_provider}
CLIENT: ${n.client}

1. SERVICES
   The Service Provider agrees to provide the following services to the Client:
   ${n.services}

2. TERM
   This Agreement shall commence on the date of execution and shall continue until terminated by either party in accordance with the terms herein.

3. COMPENSATION
   Payment Terms: ${n.payment_terms}
   
   The Client agrees to pay the Service Provider for services rendered in accordance with the payment schedule outlined above.

4. SERVICE PROVIDER OBLIGATIONS
   The Service Provider shall:
   - Perform all services in a professional and workmanlike manner
   - Use reasonable care and skill in the performance of services
   - Comply with all applicable laws and regulations
   - Maintain appropriate insurance coverage
   - Provide regular updates on project progress

5. CLIENT OBLIGATIONS
   The Client shall:
   - Provide necessary information and materials in a timely manner
   - Make payments in accordance with the payment schedule
   - Provide reasonable access to facilities and personnel as needed
   - Cooperate with the Service Provider in the performance of services

6. INTELLECTUAL PROPERTY
   - Any intellectual property created by the Service Provider specifically for the Client shall be assigned to the Client upon full payment
   - The Service Provider retains rights to any pre-existing intellectual property used in providing services
   - The Service Provider may use work product for portfolio and marketing purposes unless otherwise specified

7. CONFIDENTIALITY
   Both parties agree to maintain the confidentiality of any proprietary or confidential information shared during the course of this Agreement.

8. LIMITATION OF LIABILITY
   The Service Provider's liability shall be limited to the amount paid by the Client for services under this Agreement, except in cases of gross negligence or willful misconduct.

9. TERMINATION
   Either party may terminate this Agreement with 30 days written notice. Upon termination:
   - The Client shall pay for all services rendered up to the termination date
   - The Service Provider shall deliver any completed work product
   - Both parties shall return any confidential information

10. INDEPENDENT CONTRACTOR
    The Service Provider is an independent contractor and not an employee of the Client. The Service Provider is responsible for their own taxes, insurance, and compliance with applicable laws.

11. DISPUTE RESOLUTION
    Any disputes arising under this Agreement shall be resolved through good faith negotiation. If resolution cannot be reached, disputes shall be resolved through mediation or arbitration as mutually agreed.

12. GOVERNING LAW
    This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction where the Service Provider is located.

13. ADDITIONAL TERMS
    ${n.additional_terms||"No additional terms specified."}

14. ENTIRE AGREEMENT
    This Agreement constitutes the entire understanding between the parties and supersedes all prior agreements, understandings, and negotiations.

SERVICE PROVIDER SIGNATURE: _________________ DATE: _______________
CLIENT SIGNATURE: _________________ DATE: _______________
      `;v(g),s(!0),h.success("Document generated successfully!")}catch(g){h.error("Failed to generate document")}finally{u(!1)}}),m=n=>_(void 0,null,function*(){try{h.success("Draft saved successfully!")}catch(g){h.error("Failed to save draft")}}),T=n=>{h.success(`Document exported as ${n.toUpperCase()}`)};return e.jsx(Y,{children:e.jsxs("div",{className:"container mx-auto py-6 space-y-6",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs(p,{variant:"ghost",size:"sm",onClick:()=>i("/legal-assistant"),className:"flex items-center gap-2",children:[e.jsx(z,{className:"w-4 h-4"}),"Back to Legal Assistant"]}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Service Agreement"}),e.jsx("p",{className:"text-muted-foreground",children:"Create a service provider contract"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsxs(A,{children:[e.jsx(C,{children:e.jsxs(I,{className:"flex items-center gap-2",children:[e.jsx(S,{className:"w-5 h-5"}),"Agreement Details"]})}),e.jsx(b,{children:e.jsxs("form",{onSubmit:r.handleSubmit(a),className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx(d,{htmlFor:"title",children:"Document Title"}),e.jsx(y,l(o({id:"title"},r.register("title")),{placeholder:"Service Agreement"})),r.formState.errors.title&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:r.formState.errors.title.message})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx(d,{htmlFor:"service_provider",children:"Service Provider"}),e.jsx(y,l(o({id:"service_provider"},r.register("service_provider")),{placeholder:"Company or Individual Name"})),r.formState.errors.service_provider&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:r.formState.errors.service_provider.message})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"client",children:"Client"}),e.jsx(y,l(o({id:"client"},r.register("client")),{placeholder:"Client Name"})),r.formState.errors.client&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:r.formState.errors.client.message})]})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"services",children:"Services Description"}),e.jsx(N,l(o({id:"services"},r.register("services")),{placeholder:"Describe the services to be provided in detail...",rows:3})),r.formState.errors.services&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:r.formState.errors.services.message})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"payment_terms",children:"Payment Terms"}),e.jsx(N,l(o({id:"payment_terms"},r.register("payment_terms")),{placeholder:"Describe payment schedule, amounts, and methods...",rows:3})),r.formState.errors.payment_terms&&e.jsx("p",{className:"text-sm text-red-500 mt-1",children:r.formState.errors.payment_terms.message})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"additional_terms",children:"Additional Terms (Optional)"}),e.jsx(N,l(o({id:"additional_terms"},r.register("additional_terms")),{placeholder:"Any additional terms or conditions...",rows:3}))]}),e.jsx(U,{}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(p,{type:"button",variant:"outline",onClick:r.handleSubmit(m),className:"flex-1",children:[e.jsx(H,{className:"w-4 h-4 mr-2"}),"Save Draft"]}),e.jsx(p,{type:"submit",disabled:x,className:"flex-1",children:x?e.jsxs(e.Fragment,{children:[e.jsx(Q,{className:"w-4 h-4 mr-2 animate-spin"}),"Generating..."]}):e.jsxs(e.Fragment,{children:[e.jsx(S,{className:"w-4 h-4 mr-2"}),"Generate Document"]})})]})]})})]}),e.jsxs(A,{children:[e.jsx(C,{children:e.jsxs(I,{className:"flex items-center gap-2",children:[e.jsx(W,{className:"w-5 h-5"}),"Document Preview"]})}),e.jsx(b,{children:t?e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"bg-gray-50 p-4 rounded-lg",children:e.jsx("pre",{className:"whitespace-pre-wrap text-sm font-mono",children:f})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(p,{variant:"outline",onClick:()=>T("pdf"),className:"flex-1",children:[e.jsx(P,{className:"w-4 h-4 mr-2"}),"Export PDF"]}),e.jsxs(p,{variant:"outline",onClick:()=>T("docx"),className:"flex-1",children:[e.jsx(P,{className:"w-4 h-4 mr-2"}),"Export DOCX"]})]}),e.jsxs($,{children:[e.jsx(X,{className:"h-4 w-4"}),e.jsx(q,{children:"This is a template document. Please review with a legal professional before use."})]})]}):e.jsxs("div",{className:"text-center py-8 text-muted-foreground",children:[e.jsx(S,{className:"w-12 h-12 mx-auto mb-4 opacity-50"}),e.jsx("p",{children:"Fill out the form and generate your document to see a preview here."})]})})]})]})]})})};export{Le as ServiceAgreement,Le as default};
