function _optionalChain(a){let e,t=a[0],s=1;for(;s<a.length;){const n=a[s],l=a[s+1];if(s+=2,("optionalAccess"===n||"optionalCall"===n)&&null==t)return;"access"===n||"optionalAccess"===n?(e=t,t=l(t)):"call"!==n&&"optionalCall"!==n||(t=l(((...a)=>t.call(e,...a))),e=void 0)}return t}export default(a,e,t,s,n,l)=>async function(a){var{sendFile:e,safeWrite:t,write:s,setResponse:n,out_run_script:i,run_script_name:r,Response:o,Request:c,Post:p,Query:d,Session:v,Files:h,Cookies:b,RequireVar:m}=a;i.text+='<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title> Home Page </title> <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous"/> ',i.text+='<link rel="stylesheet" href="./load-bG9hZ.pub.css" /><script type="text/javascript" src="/serv/connect.js" async><\/script><script type="text/javascript" src="./load-bG9hZ.pub.js" defer><\/script>',i.text+='</head> <body> <header> <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark"> <div class="container-fluid"> <a class="navbar-brand" href="#"> Beyond easy </a> <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation"> <span class="navbar-toggler-icon"></span> </button> <div class="collapse navbar-collapse" id="navbarCollapse"> <ul class="navbar-nav me-auto mb-2 mb-md-0"> <li class="nav-item"> <a class="nav-link active" href="#"> Home </a> </li> <li class="nav-item"> <a class="nav-link" href="#"> Getting started </a> </li> <li class="nav-item"> <a class="nav-link" href="#"> Guide </a> </li> <li class="nav-item"> <a class="nav-link" href="#"> API reference </a> </li> </ul> </div> </div> </nav> </header> <main class="flex-shrink-0 pt-5"> <div class="container mt-5"> <p> cool </p> ';if(i.text+=' <button onclick="heyFromServer()"> what </button> </div> </main> </body> </html>',_optionalChain([p,"optionalAccess",a=>a.connectorCall])&&await l("connect",a,[{name:"getData",sendTo:function(a){return"poop "+a},message:!0,validator:[["string-length-range",1,3]]}]))return};