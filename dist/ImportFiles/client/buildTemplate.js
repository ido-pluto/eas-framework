class buildTemplate{constructor(t){this.script=t,this.setResponse=this.setResponse.bind(this),this.write=this.write.bind(this),this.safeWrite=this.safeWrite.bind(this),this.sendToSelector=this.sendToSelector.bind(this)}static ToStringInfo(t){return"object"==typeof t?JSON.stringify(t):String(t)}setResponse(t){this.script.text=buildTemplate.ToStringInfo(t)}write(t=""){this.script.text+=buildTemplate.ToStringInfo(t)}safeWrite(t=""){t=buildTemplate.ToStringInfo(t);for(const e of t)this.script.text+="&#"+e.charCodeAt(0)+";"}sendToSelector(t){const e=document.createElement("div");return e.innerHTML=this.script.text,t&&document.querySelector(t).append(...e.children),e.children}}