import{SvelteComponent,append_hydration,attr,children,claim_component,claim_element,claim_space,claim_text,create_component,destroy_component,detach,element,init,insert_hydration,listen,mount_component,safe_not_equal,set_data,space,text,transition_in,transition_out}from"/serv/svelte/internal";import BigNumber from"./from2.svelte";function create_fragment(ctx1){let main;let div;let p;let t0;let t1;let t2;let button;let t3;let t4;let bignumber;let t5;let t6_value=JSON.stringify(ctx1[1],null,2)+"";let t6;let current;let mounted;let dispose;bignumber=new BigNumber({props:{number:ctx1[2]}});return{c(){main=element("main");div=element("div");p=element("p");t0=text("Counte: ");t1=text(ctx1[0]);t2=space();button=element("button");t3=text("+");t4=space();create_component(bignumber.$$.fragment);t5=space();t6=text(t6_value);this.h()},l(nodes){main=claim_element(nodes,"MAIN",{});var main_nodes=children(main);div=claim_element(main_nodes,"DIV",{class:true});var div_nodes=children(div);p=claim_element(div_nodes,"P",{class:true});var p_nodes=children(p);t0=claim_text(p_nodes,"Counte: ");t1=claim_text(p_nodes,ctx1[0]);p_nodes.forEach(detach);t2=claim_space(div_nodes);button=claim_element(div_nodes,"BUTTON",{class:true});var button_nodes=children(button);t3=claim_text(button_nodes,"+");button_nodes.forEach(detach);div_nodes.forEach(detach);t4=claim_space(main_nodes);claim_component(bignumber.$$.fragment,main_nodes);t5=claim_space(main_nodes);t6=claim_text(main_nodes,t6_value);main_nodes.forEach(detach);this.h()},h(){attr(p,"class","svelte-1i3xkcf");attr(button,"class","svelte-1i3xkcf");attr(div,"class","counter svelte-1i3xkcf")},m(target,anchor){insert_hydration(target,main,anchor);append_hydration(main,div);append_hydration(div,p);append_hydration(p,t0);append_hydration(p,t1);append_hydration(div,t2);append_hydration(div,button);append_hydration(button,t3);append_hydration(main,t4);mount_component(bignumber,main,null);append_hydration(main,t5);append_hydration(main,t6);current=true;if(!mounted){dispose=listen(button,"click",ctx1[3]);mounted=true}},p(ctx,[dirty]){if(!current||dirty&1)set_data(t1,ctx[0]);if((!current||dirty&2)&&t6_value!==(t6_value=JSON.stringify(ctx[1],null,2)+""))set_data(t6,t6_value)},i(local){if(current)return;transition_in(bignumber.$$.fragment,local);current=true},o(local){transition_out(bignumber.$$.fragment,local);current=false},d(detaching){if(detaching)detach(main);destroy_component(bignumber);mounted=false;dispose()}}}function instance($$self,$$props1,$$invalidate){let{count=0}=$$props1;let settings={max:100,current:count};let makeNumber=Number(Math.random().toFixed(3));const click_handler=()=>settings.max>count?$$invalidate(0,count++,count):null;$$self.$$set=$$props=>{if("count"in $$props)$$invalidate(0,count=$$props.count)};$$self.$$.update=()=>{if($$self.$$.dirty&1){$:{$$invalidate(1,settings.current=count,settings)}}};return[count,settings,makeNumber,click_handler]}class From1 extends SvelteComponent{constructor(options){super();init(this,options,instance,create_fragment,safe_not_equal,{count:0})}}export default From1