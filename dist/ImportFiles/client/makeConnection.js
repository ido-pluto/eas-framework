async function connector(n,o){const t=await fetch(location.href,{method:"POST",body:JSON.stringify({connectorCall:{name:n,values:o}}),headers:{"Content-Type":"application/json"}});return await t.json()}