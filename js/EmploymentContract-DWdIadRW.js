var F=Object.defineProperty,M=Object.defineProperties;var L=Object.getOwnPropertyDescriptors;var D=Object.getOwnPropertySymbols;var R=Object.prototype.hasOwnProperty,k=Object.prototype.propertyIsEnumerable;var A=(i,r,a)=>r in i?F(i,r,{enumerable:!0,configurable:!0,writable:!0,value:a}):i[r]=a,o=(i,r)=>{for(var a in r||(r={}))R.call(r,a)&&A(i,a,r[a]);if(D)for(var a of D(r))k.call(r,a)&&A(i,a,r[a]);return i},l=(i,r)=>M(i,L(r));var P=(i,r,a)=>new Promise((_,j)=>{var y=n=>{try{s(a.next(n))}catch(p){j(p)}},f=n=>{try{s(a.throw(n))}catch(p){j(p)}},s=n=>n.done?_(n.value):Promise.resolve(n.value).then(y,f);s((a=a.apply(i,r)).next())});import{f as G,r as N,j as e,B as g,C as u,p as v,q as E,v as w,Q as C}from"./main-Dczk40-q.js";import{u as q,a as $,C as m,o as Y,s as c}from"./schemas-DMZ6hVDA.js";import{I as x}from"./index-DxDoSqvO.js";import{T as B}from"./textarea-fzgM4rGq.js";import{L as d}from"./label-KS36zHkM.js";import{S as U}from"./separator-CnmZayxo.js";import{A as z,a as H}from"./alert-vAohCTxn.js";import{R as V}from"./ResponsiveLayout-CxdDAcTl.js";import{A as W}from"./arrow-left-CzEz-wbP.js";import{F as S}from"./file-text-BzwMQdpb.js";import{A as I}from"./alert-triangle-BCAhts2_.js";import{P as X}from"./pen-square-BFdqAlw9.js";import{L as J}from"./loader-2-DzDjnuQG.js";import{E as K}from"./eye-CXD-3Vg7.js";import{D as b}from"./download-DJFdPVar.js";import{I as Q}from"./info-2owXF18k.js";import{C as h}from"./check-circle-CJSaU0rJ.js";import"./index-Bvi8qGb8.js";import"./index-p4sF6Wge.js";import"./databaseUtils-DDxBFZda.js";import"./badge-iBsRNaSn.js";import"./scroll-area-Ya-nYYPz.js";import"./index-BCwUGNws.js";import"./tabs-ChvN7mKq.js";import"./check-Dn5E7z_E.js";import"./useNotifications-DdfHYMMR.js";import"./notificationService-DiBkqnn5.js";import"./bell-CB9MQoCr.js";import"./user-xzPyfs-H.js";import"./search-CoqTXUJe.js";import"./calendar-DbYgxsnG.js";import"./zap-BM2f935p.js";import"./plus-B7hFD5Z2.js";import"./message-square-BskFJ3te.js";import"./map-pin-B65WKje7.js";import"./wifi-D1BoRTe0.js";import"./log-out-vClmguiA.js";const Z=Y({title:c().min(1,"Title is required"),employer_name:c().min(1,"Employer name is required"),employee_name:c().min(1,"Employee name is required"),position:c().min(1,"Position is required"),salary:c().min(1,"Salary is required"),start_date:c().min(1,"Start date is required"),additional_terms:c().optional()}),ke=()=>{const i=G(),[r,a]=N.useState(!1),[_,j]=N.useState(""),[y,f]=N.useState(!1),s=q({resolver:$(Z),defaultValues:{title:"Employment Contract",employer_name:"",employee_name:"",position:"",salary:"",start_date:"",additional_terms:""}}),n=t=>P(void 0,null,function*(){f(!0);try{yield new Promise(O=>setTimeout(O,2e3));const T=`
EMPLOYMENT CONTRACT

This Employment Contract (the "Contract") is made and entered into on ${new Date().toLocaleDateString()} by and between:

EMPLOYER: ${t.employer_name}
EMPLOYEE: ${t.employee_name}

1. POSITION AND DUTIES
   - Position: ${t.position}
   - Employee shall perform all duties and responsibilities associated with this position
   - Employee shall report to their designated supervisor
   - Employee shall comply with all company policies and procedures

2. COMPENSATION
   - Annual Salary: $${t.salary}
   - Payment Schedule: Bi-weekly
   - Payment Method: Direct deposit or check as designated by employee

3. EMPLOYMENT TERM
   - Start Date: ${t.start_date}
   - Employment Type: At-will employment
   - Either party may terminate this agreement with appropriate notice

4. WORK SCHEDULE
   - Standard work hours: Monday to Friday, 9:00 AM to 5:00 PM
   - Overtime may be required based on business needs
   - Flexible work arrangements may be available based on position

5. BENEFITS
   - Health insurance coverage (if applicable)
   - Paid time off and holidays
   - Retirement plan participation (if applicable)
   - Professional development opportunities

6. CONFIDENTIALITY
   - Employee shall maintain confidentiality of company information
   - Non-disclosure of trade secrets and proprietary information
   - Obligation continues after employment termination

7. NON-COMPETE CLAUSE
   - Employee agrees not to work for direct competitors for 12 months after termination
   - Geographic and temporal restrictions apply
   - Reasonable limitations based on position and industry

8. ADDITIONAL TERMS
   ${t.additional_terms||"No additional terms specified."}

9. TERMINATION
   - Either party may terminate employment with appropriate notice
   - Immediate termination for cause (misconduct, violation of policies)
   - Exit interview and return of company property required

10. GOVERNING LAW
    - This contract is governed by the laws of the state of employment
    - Any disputes shall be resolved through appropriate legal channels

This Contract constitutes the entire understanding between the parties and supersedes all prior agreements.

EMPLOYER SIGNATURE: _________________ DATE: _______________
EMPLOYEE SIGNATURE: _________________ DATE: _______________
      `;j(T),a(!0),C.success("Document generated successfully!")}catch(T){C.error("Failed to generate document")}finally{f(!1)}}),p=t=>{C.success(`Document exported as ${t.toUpperCase()}`)};return e.jsx(V,{children:e.jsxs("div",{className:"container mx-auto p-6 max-w-6xl",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[e.jsxs(g,{variant:"ghost",size:"sm",onClick:()=>i(-1),children:[e.jsx(W,{className:"w-4 h-4 mr-2"}),"Back"]}),e.jsx("div",{className:"w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center",children:e.jsx(S,{className:"w-6 h-6 text-green-600"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-900",children:"Employment Contract"}),e.jsx("p",{className:"text-gray-600",children:"Create a comprehensive employment agreement"})]})]}),e.jsxs(z,{className:"bg-green-50 border-green-200",children:[e.jsx(I,{className:"h-4 w-4 text-green-600"}),e.jsxs(H,{className:"text-green-800",children:[e.jsx("strong",{children:"Important:"})," This is a template for general use. Please review with a legal professional to ensure it meets your specific needs and complies with local employment laws."]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8",children:[e.jsx("div",{className:"space-y-6",children:e.jsxs(u,{children:[e.jsx(v,{children:e.jsxs(E,{className:"flex items-center gap-2",children:[e.jsx(X,{className:"w-5 h-5"}),"Contract Details"]})}),e.jsx(w,{children:e.jsxs("form",{onSubmit:s.handleSubmit(n),className:"space-y-6",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx(d,{htmlFor:"title",children:"Contract Title"}),e.jsx(m,{name:"title",control:s.control,render:({field:t})=>e.jsx(x,l(o({},t),{placeholder:"Employment Contract"}))}),s.formState.errors.title&&e.jsx("p",{className:"text-sm text-red-600 mt-1",children:s.formState.errors.title.message})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx(d,{htmlFor:"employer_name",children:"Employer Name"}),e.jsx(m,{name:"employer_name",control:s.control,render:({field:t})=>e.jsx(x,l(o({},t),{placeholder:"Enter employer's name"}))}),s.formState.errors.employer_name&&e.jsx("p",{className:"text-sm text-red-600 mt-1",children:s.formState.errors.employer_name.message})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"employee_name",children:"Employee Name"}),e.jsx(m,{name:"employee_name",control:s.control,render:({field:t})=>e.jsx(x,l(o({},t),{placeholder:"Enter employee's name"}))}),s.formState.errors.employee_name&&e.jsx("p",{className:"text-sm text-red-600 mt-1",children:s.formState.errors.employee_name.message})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx(d,{htmlFor:"position",children:"Position/Job Title"}),e.jsx(m,{name:"position",control:s.control,render:({field:t})=>e.jsx(x,l(o({},t),{placeholder:"Enter job title"}))}),s.formState.errors.position&&e.jsx("p",{className:"text-sm text-red-600 mt-1",children:s.formState.errors.position.message})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"start_date",children:"Start Date"}),e.jsx(m,{name:"start_date",control:s.control,render:({field:t})=>e.jsx(x,l(o({},t),{type:"date"}))}),s.formState.errors.start_date&&e.jsx("p",{className:"text-sm text-red-600 mt-1",children:s.formState.errors.start_date.message})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx(d,{htmlFor:"salary",children:"Annual Salary ($)"}),e.jsx(m,{name:"salary",control:s.control,render:({field:t})=>e.jsx(x,l(o({},t),{type:"number",placeholder:"0.00"}))}),s.formState.errors.salary&&e.jsx("p",{className:"text-sm text-red-600 mt-1",children:s.formState.errors.salary.message})]}),e.jsxs("div",{children:[e.jsx(d,{htmlFor:"additional_terms",children:"Additional Terms (Optional)"}),e.jsx(m,{name:"additional_terms",control:s.control,render:({field:t})=>e.jsx(B,l(o({},t),{placeholder:"Any additional terms or conditions...",rows:4}))})]})]})]}),e.jsx("div",{className:"flex gap-3",children:e.jsx(g,{type:"submit",disabled:y,className:"flex-1",children:y?e.jsxs(e.Fragment,{children:[e.jsx(J,{className:"w-4 h-4 mr-2 animate-spin"}),"Generating..."]}):e.jsxs(e.Fragment,{children:[e.jsx(S,{className:"w-4 h-4 mr-2"}),"Generate Document"]})})})]})})]})}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs(u,{children:[e.jsx(v,{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(E,{className:"flex items-center gap-2",children:[e.jsx(K,{className:"w-5 h-5"}),"Document Preview"]}),r&&e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(g,{size:"sm",variant:"outline",onClick:()=>p("pdf"),children:[e.jsx(b,{className:"w-4 h-4 mr-2"}),"PDF"]}),e.jsxs(g,{size:"sm",variant:"outline",onClick:()=>p("docx"),children:[e.jsx(b,{className:"w-4 h-4 mr-2"}),"DOCX"]})]})]})}),e.jsx(w,{children:r?e.jsx("div",{className:"bg-gray-50 p-6 rounded-lg",children:e.jsx("pre",{className:"whitespace-pre-wrap text-sm font-mono text-gray-800",children:_})}):e.jsxs("div",{className:"text-center py-12 text-gray-500",children:[e.jsx(S,{className:"w-12 h-12 mx-auto mb-4 text-gray-300"}),e.jsx("p",{children:'Fill out the form and click "Generate Document" to see a preview'})]})})]}),e.jsxs(u,{children:[e.jsx(v,{children:e.jsxs(E,{className:"flex items-center gap-2",children:[e.jsx(Q,{className:"w-5 h-5"}),"Document Features"]})}),e.jsxs(w,{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(h,{className:"w-4 h-4 text-green-600"}),e.jsx("span",{className:"text-sm",children:"Comprehensive employment terms"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(h,{className:"w-4 h-4 text-green-600"}),e.jsx("span",{className:"text-sm",children:"Confidentiality and non-compete clauses"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(h,{className:"w-4 h-4 text-green-600"}),e.jsx("span",{className:"text-sm",children:"Intellectual property protection"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(h,{className:"w-4 h-4 text-green-600"}),e.jsx("span",{className:"text-sm",children:"Benefits and compensation terms"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(h,{className:"w-4 h-4 text-green-600"}),e.jsx("span",{className:"text-sm",children:"Performance review framework"})]})]}),e.jsx(U,{}),e.jsxs("div",{className:"text-xs text-gray-500 space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(I,{className:"w-3 h-3"}),e.jsx("span",{children:"Review with legal professional"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(b,{className:"w-3 h-3"}),e.jsx("span",{children:"Export to PDF or DOCX"})]})]})]})]})]})]})]})})};export{ke as EmploymentContract,ke as default};
