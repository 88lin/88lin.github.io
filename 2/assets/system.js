/* Local-only personal whiteboard. No remote persistence or shared user content. */
(() => {
 'use strict';
 const app=document.getElementById('main'), viewport=document.getElementById('canvas-viewport'),world=document.getElementById('canvas-world');
 if(!app||!viewport||!world)return;
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const svgNS='http://www.w3.org/2000/svg', storageKey='88lin.whiteboard.v2';
 const colors=['#FFE583','#FFD9DC','#D1E7FF','#DDF0D6','#E9DEF6','#FFFFFF'];
 const inkColors=['#4273B5','#ED6673','#D5A527','#53936A','#263247'];
 const kinds=['sticky','polaroid','sticker','intro','checklist'];
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const defaults=new Map($$('[data-card]').map(e=>[e.id,{x:+e.dataset.x,y:+e.dataset.y,a:+e.dataset.angle,s:1}]));
 const seeds=new Map($$('[data-card]').map(e=>[e.id,e]));
 let model={version:2,poses:{},cards:[],strokes:[],order:[...defaults.keys()]};
 let history=[],future=[],selected=null,gesture=null,tool='hand',penColor=inkColors[0],currentStroke=null;
 let view={x:0,y:0,scale:.8},points=new Map(),saveTimer,noticeTimer,centerTimer,exportBusy=false;
 let wheelDelta=0,wheelFrame=0,wheelPoint=[0,0],userMovedView=false,lastWidth=innerWidth;
 let kind='sticky',paperColor=colors[0],sticker='✨',photo='',editing=null,photoLoading=false;
 const snapshot=()=>JSON.stringify(model);
 const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const icon=name=>{const e=document.createElementNS(svgNS,'svg');e.setAttribute('class','icon');e.setAttribute('aria-hidden','true');const u=document.createElementNS(svgNS,'use');u.setAttribute('href',`#i-${name}`);e.append(u);return e;};
 const allCards=()=>[...world.querySelectorAll('.wb-card')];
 const cardById=id=>allCards().find(c=>c.id===id);
 const pose=id=>model.poses[id]||(model.poses[id]={...(defaults.get(id)||{x:400,y:350,a:0,s:1})});
 const canvasMode=()=>app.dataset.view==='canvas';
 function notice(text,permanent=false){clearTimeout(noticeTimer);$('#save-status').textContent=text;if(!permanent)noticeTimer=setTimeout(()=>{$('#save-status').textContent='';},4200);}
 function safeUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
 function validate(data){
  if(!data||data.version!==2||!Array.isArray(data.cards)||!Array.isArray(data.strokes)||data.cards.length>40||data.strokes.length>180)throw Error('这不是有效的白板备份，或内容超出了当前容量。');
  const result={version:2,poses:{},cards:[],strokes:[],order:[]},ids=new Set();
  for(const item of data.cards){
   if(!item||!kinds.includes(item.kind)||typeof item.id!=='string'||!/^local-[a-zA-Z0-9-]{1,70}$/.test(item.id)||ids.has(item.id))throw Error('备份中的卡片格式不正确。');
   ids.add(item.id);
   const c={id:item.id,kind:item.kind,title:String(item.title||'').slice(0,45),body:String(item.body||'').slice(0,600),caption:String(item.caption||'').slice(0,80),color:colors.includes(item.color)?item.color:colors[0],emoji:String(item.emoji||'✨').slice(0,12),link:safeUrl(item.link||''),image:'',items:[]};
   if(item.image){if(typeof item.image!=='string'||item.image.length>1400000||!/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(item.image))throw Error('照片格式不正确。');c.image=item.image;}
   if(c.kind==='polaroid'&&!c.image)throw Error('拍立得缺少照片。');
   if(Array.isArray(item.items))c.items=item.items.slice(0,15).map(v=>({text:String(v.text||'').slice(0,120),done:v.done===true}));
   result.cards.push(c);
  }
  for(const [id,p] of Object.entries(data.poses||{}))if((defaults.has(id)||ids.has(id))&&p&&[p.x,p.y,p.a,p.s].every(finite))result.poses[id]={x:clamp(p.x,-5000,5000),y:clamp(p.y,-5000,5000),a:clamp(p.a,-40,40),s:clamp(p.s,.5,1.8)};
  for(const s of data.strokes){
   if(!s||!Array.isArray(s.points)||s.points.length<1||s.points.length>2000||!inkColors.includes(s.color)||!finite(s.width))throw Error('备份中的笔迹格式不正确。');
   const ps=s.points.map(p=>{if(!Array.isArray(p)||p.length!==2||!p.every(finite))throw Error('笔迹坐标不正确。');return p.map(v=>clamp(v,-6000,6000));});
   result.strokes.push({color:s.color,width:clamp(s.width,2,12),points:ps});
  }
  const known=[...defaults.keys(),...ids];
  result.order=[...new Set([...(Array.isArray(data.order)?data.order:[]),...known])].filter(id=>known.includes(id));
  return result;
 }
 function save(){
  clearTimeout(saveTimer);
  try{const data=snapshot();if(data.length>4200000)throw Error('full');localStorage.setItem(storageKey,data);notice('已存到本机 · 只有你能看见');}
  catch{notice('当前创作还在，但浏览器未能保存。请从下载菜单备份白板。',true);}
 }
 function updateHistory(){ $$('[data-action="undo"]').forEach(e=>e.disabled=!history.length);$$('[data-action="redo"]').forEach(e=>e.disabled=!future.length); }
 function commit(before){if(before===snapshot())return;history.push(before);if(history.length>25)history.shift();future=[];updateHistory();save();}
 function change(fn){const before=snapshot();fn();render();commit(before);}
 function undo(redo=false){const from=redo?future:history,to=redo?history:future;if(!from.length)return;to.push(snapshot());model=JSON.parse(from.pop());selected=null;render();updateHistory();save();notice(redo?'已重做':'已撤销');}
 function actionButton(action,label,ico){const b=node('button','',undefined);b.type='button';b.dataset.cardAction=action;b.setAttribute('aria-label',label);b.title=label;if(ico)b.append(icon(ico));else b.textContent=label;return b;}
 function addActions(card,local){
  card.querySelector('.card-actions')?.remove();card.querySelector('.resize-handle')?.remove();
  const bar=node('div','card-actions');bar.setAttribute('role','group');bar.setAttribute('aria-label','卡片操作');
  bar.append(actionButton('rotate','旋转卡片','rotate'),actionButton('front','置于最前','grip'));
  if(local)bar.append(actionButton('edit','编辑','pen'),actionButton('delete','删除','trash'));
  card.append(bar);const resize=actionButton('resize','调整卡片大小','resize');resize.className='resize-handle';card.append(resize);
 }
 function renderLocal(c){
  const e=node('article',`wb-card paper-${c.kind}`);e.id=c.id;e.tabIndex=0;e.dataset.local='true';e.dataset.kind=c.kind;e.dataset.width=String(c.kind==='sticker'?110:c.kind==='polaroid'?260:310);e.style.setProperty('--local-color',c.color);e.style.setProperty('--w',`${e.dataset.width}px`);
  e.setAttribute('aria-label',c.title||c.caption||`${c.emoji||''} ${c.kind==='sticker'?'贴纸':'我的卡片'}`);
  if(c.kind==='sticker'){e.append(node('span','big-sticker',c.emoji));}
  else if(c.kind==='polaroid'){const img=node('img','polaroid-image');img.src=c.image;img.alt=c.caption||'我的拍立得';img.draggable=false;e.append(img,node('h2','polaroid-caption',c.caption||'a little moment.'));}
  else{e.append(node('h2','',c.title));if(c.kind==='checklist'){const list=node('ul','local-checklist');c.items.forEach((item,i)=>{const li=node('li'),label=node('label'),input=node('input');input.type='checkbox';input.checked=item.done;input.dataset.item=String(i);label.append(input,node('span','',item.text));li.append(label);list.append(li);});e.append(list);}else{e.append(node('p','local-copy',c.body));if(c.kind==='intro'&&c.link){const a=node('a','paper-link','我的主页 ↗');a.href=c.link;a.target='_blank';a.rel='noopener noreferrer';e.append(a);}}}
  return e;
 }
 function place(card){const p=pose(card.id);card.style.setProperty('--x',`${p.x}px`);card.style.setProperty('--y',`${p.y}px`);card.style.setProperty('--angle',`${p.a}deg`);card.style.setProperty('--card-scale',p.s);}
 function pathData(ps){return ps.length===1?`M${ps[0][0]} ${ps[0][1]}l.1 .1`:ps.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');}
 function makePath(s){const e=document.createElementNS(svgNS,'path');e.setAttribute('d',pathData(s.points));e.setAttribute('stroke',s.color);e.setAttribute('stroke-width',s.width);e.setAttribute('fill','none');e.setAttribute('stroke-linecap','round');e.setAttribute('stroke-linejoin','round');return e;}
 function renderStrokes(){const layer=$('#drawing-layer');layer.replaceChildren(...model.strokes.map(makePath));}
 function renderLayers(){
  const q=$('#card-search').value.trim().toLowerCase(),list=$('#layer-list');list.replaceChildren();
  for(const card of allCards()){
   const label=card.getAttribute('aria-label')||card.querySelector('h2')?.textContent||'卡片';if(q&&!label.toLowerCase().includes(q)&&!card.textContent.toLowerCase().includes(q))continue;
   const a=node('a');a.href=`#${card.id}`;a.append(node('span','',label),node('small','',card.dataset.local?'我的':'88lin'));if(card.id===selected)a.setAttribute('aria-current','true');if(card.dataset.local)a.style.setProperty('--layer-color','#C8DDF8');list.append(a);
  }
  if(!list.childElementCount)list.append(node('p','layer-empty','没找到这张卡片，换个词试试。'));
 }
 function render(){
  world.querySelectorAll('[data-local]').forEach(e=>e.remove());model.cards.forEach(c=>world.append(renderLocal(c)));
  const ids=allCards().map(card=>card.id);model.order=[...new Set([...model.order,...ids])].filter(id=>ids.includes(id));
  allCards().forEach(card=>{place(card);addActions(card,!!card.dataset.local);card.classList.toggle('is-selected',selected===card.id);card.style.zIndex=String(selected===card.id?100:model.order.indexOf(card.id)+2);});renderLayers();renderStrokes();
 }
 function select(card){selected=card?.id||null;allCards().forEach((e,i)=>{e.classList.toggle('is-selected',e.id===selected);e.style.zIndex=String(e.id===selected?100:model.order.indexOf(e.id)+2);});renderLayers();}
 function renderView(animate=false){clearTimeout(centerTimer);world.classList.toggle('is-centering',animate);world.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.scale})`;viewport.style.backgroundSize=`${26*view.scale}px ${26*view.scale}px`;viewport.style.backgroundPosition=`${view.x}px ${view.y}px`;$('#zoom-level').value=`${Math.round(view.scale*100)}%`;if(animate)centerTimer=setTimeout(()=>world.classList.remove('is-centering'),400);}
 function worldPoint(clientX,clientY){const r=viewport.getBoundingClientRect();return [(clientX-r.left-view.x)/view.scale,(clientY-r.top-view.y)/view.scale];}
 function zoom(factor,x=viewport.clientWidth/2,y=viewport.clientHeight/2){userMovedView=true;const next=clamp(view.scale*factor,.2,2.5),ratio=next/view.scale;view.x=x-(x-view.x)*ratio;view.y=y-(y-view.y)*ratio;view.scale=next;renderView();}
 function bounds(){
  let left=150,top=65,right=1400,bottom=1220;
  for(const card of allCards()){const p=pose(card.id),w=Number(card.dataset.width)||310,h=card.offsetHeight||300;left=Math.min(left,p.x-w*.15);top=Math.min(top,p.y-h*.15);right=Math.max(right,p.x+w*p.s+w*.15);bottom=Math.max(bottom,p.y+h*p.s+h*.15);}
  for(const s of model.strokes)for(const [x,y]of s.points){left=Math.min(left,x-15);top=Math.min(top,y-15);right=Math.max(right,x+15);bottom=Math.max(bottom,y+15);}
  return {left,top,width:right-left,height:bottom-top};
 }
 function fit(){if(!canvasMode())return;const b=bounds();view.scale=clamp(Math.min((viewport.clientWidth-45)/b.width,(viewport.clientHeight-110)/b.height),.2,1);view.x=(viewport.clientWidth-b.width*view.scale)/2-b.left*view.scale;view.y=45-b.top*view.scale;renderView(true);}
 function focusCard(card,keyboard=false){
  if(!canvasMode()){card.scrollIntoView({block:'center',behavior:'auto'});if(keyboard)card.focus({preventScroll:true});return;}
  select(card);const p=pose(card.id),w=Number(card.dataset.width)||310,h=card.offsetHeight;
  view.scale=clamp(Math.min(1.15,(viewport.clientWidth-64)/(w*p.s),(viewport.clientHeight-160)/(h*p.s)),.2,2.5);
  view.x=viewport.clientWidth/2-(p.x+w/2)*view.scale;view.y=(viewport.clientHeight-70)/2-(p.y+h/2)*view.scale;renderView(true);if(keyboard)card.focus({preventScroll:true});
 }
 function setTool(next){tool=next;app.dataset.tool=next;$('#pen-palette').hidden=next==='hand';$$('[data-action="draw"]').forEach(b=>b.setAttribute('aria-pressed',String(next!=='hand')));$$('[data-action="eraser"]').forEach(b=>b.setAttribute('aria-pressed',String(next==='eraser')));if(next!=='hand')select(null);}
 function setView(mode){app.dataset.view=mode;setTool('hand');select(null);$$('[data-action="view"]').forEach(b=>{b.setAttribute('aria-pressed',String(mode==='list'));b.title=b.ariaLabel=mode==='list'?'切换自由画布':'切换列表阅读';});if(mode==='canvas'){viewport.scrollTop=0;requestAnimationFrame(()=>{renderView();});}else world.style.transform='none';}
 function sidebar(toggle=true){if(toggle)app.classList.toggle('sidebar-hidden');const open=!app.classList.contains('sidebar-hidden'),modal=open&&innerWidth<=760;app.classList.toggle('sidebar-open',modal);$('#card-sidebar').setAttribute('aria-hidden',String(!open));$$('[data-action="sidebar"]').forEach(e=>e.setAttribute('aria-expanded',String(open)));$('.sidebar-shade').hidden=!modal;viewport.inert=modal;if(toggle&&innerWidth<=760)(open?$('#card-search'):$('.wb-toolbar [data-action="sidebar"]')).focus({preventScroll:true});}
 function startingView(){if(innerWidth<=760){const card=seeds.get('card-welcome');focusCard(card);view.y=86-pose(card.id).y*view.scale;renderView();select(null);}else{view.scale=clamp((viewport.clientWidth-40)/1430,.55,.93);view.x=(viewport.clientWidth-1450*view.scale)/2;view.y=-25;renderView();}}
 function chooseKind(value){kind=value;$$('[data-kind-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kindChoice===kind)));$$('[data-fields]').forEach(group=>{const show=group.dataset.fields.split(' ').includes(kind);group.hidden=!show;group.querySelectorAll('input,textarea').forEach(e=>e.disabled=!show);});$('#form-error').textContent='';}
 function openEditor(card=null){
  if(!canvasMode())setView('canvas');setTool('hand');$('#card-form').reset();editing=card?.id||null;photo=card?.image||'';photoLoading=false;paperColor=card?.color||colors[0];sticker=card?.emoji||'✨';chooseKind(card?.kind||'sticky');
  for(const field of ['title','body','caption','link'])$('#card-form').elements[field].value=card?.[field]||'';
  $('#card-form').elements.items.value=card?.items?.map(v=>v.text).join('\n')||'';
  $('#photo-preview').hidden=!photo;if(photo)$('#photo-preview').src=photo;else $('#photo-preview').removeAttribute('src');
  $$('[data-paper-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.paperColor===paperColor)));$$('[data-sticker]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sticker===sticker)));
  $('#dialog-title').textContent=editing?'再修饰一下这张卡片':'给白板添点什么？';$('#card-submit').textContent=editing?'保存修改 ↗':'贴到白板上 ↗';$('#card-dialog').showModal();
 }
 $('#photo-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;const error=$('#form-error');error.textContent='';photoLoading=true;$('#card-submit').disabled=true;
  let url;
  try{
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('请选择 10 MB 以内的 JPG、PNG 或 WebP 照片。');
   url=URL.createObjectURL(file);const img=new Image();img.src=url;await img.decode();if(img.width*img.height>40000000)throw Error('照片尺寸过大，请先缩小后再添加。');
   const scale=Math.min(1,900/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);photo=canvas.toDataURL('image/jpeg',.82);$('#photo-preview').src=photo;$('#photo-preview').hidden=false;
  }catch(e){error.textContent=e.message;photo='';$('#photo-preview').hidden=true;}finally{photoLoading=false;$('#card-submit').disabled=false;if(url)URL.revokeObjectURL(url);}
 });
 $('#card-form').addEventListener('submit',event=>{
  event.preventDefault();const f=event.currentTarget,error=$('#form-error');error.textContent='';if(!f.reportValidity())return;
  if(photoLoading){error.textContent='照片还在处理，请稍等一下。';return;}
  if(kind==='polaroid'&&!photo){error.textContent='先选择一张照片，再贴到白板上。';return;}
  if(!editing&&model.cards.length>=40){error.textContent='已经有 40 张创作卡片，请先备份或移除一些。';return;}
  const c={id:editing||`local-${crypto.randomUUID()}`,kind,title:f.elements.title.value.trim(),body:f.elements.body.value.trim(),caption:f.elements.caption.value.trim(),link:safeUrl(f.elements.link.value.trim()),color:paperColor,emoji:sticker,image:kind==='polaroid'?photo:'',items:[]};
  if(kind==='checklist'){const original=model.cards.find(x=>x.id===editing);c.items=f.elements.items.value.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,15).map(text=>({text,done:original?.items.find(x=>x.text===text)?.done||false}));if(!c.items.length){error.textContent='至少写下一件待办事项。';return;}}
  if(kind==='intro'&&f.elements.link.value&&!c.link){error.textContent='主页链接请使用 http:// 或 https://。';return;}
  const [x,y]=worldPoint(viewport.getBoundingClientRect().left+viewport.clientWidth/2,viewport.getBoundingClientRect().top+viewport.clientHeight/2);
  change(()=>{if(editing)model.cards=model.cards.map(item=>item.id===editing?c:item);else{model.cards.push(c);model.poses[c.id]={x:x-155,y:y-130,a:0,s:1};}selected=c.id;});$('#card-dialog').close();focusCard(cardById(c.id),true);
 });
 function download(blob,name){const url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 async function exportPng(){
  if(exportBusy)return;exportBusy=true;notice('正在把白板装进一张图片…',true);let wrapper;
  try{
   if(!window.html2canvas)await new Promise((resolve,reject)=>{const s=node('script');s.src='../assets/vendor/html2canvas.min.js';s.onload=resolve;s.onerror=()=>reject(Error('图片导出工具未能加载，请重试。'));document.head.append(s);});
   if(document.fonts)await document.fonts.ready;const b=bounds();if(b.width>8000||b.height>8000)throw Error('卡片分得太散了，请先整理到一起后再导出图片。');
   wrapper=node('div');Object.assign(wrapper.style,{position:'fixed',left:'-15000px',top:'0',width:`${Math.ceil(b.width+60)}px`,height:`${Math.ceil(b.height+60)}px`,background:'#FFFDF7'});
   const clone=world.cloneNode(true);Object.assign(clone.style,{transform:'none',left:`${30-b.left}px`,top:`${30-b.top}px`,position:'absolute'});clone.querySelectorAll('.card-actions,.resize-handle').forEach(e=>e.remove());clone.querySelectorAll('.is-selected').forEach(e=>e.classList.remove('is-selected'));
   // The HTML renderer offsets an overflowing SVG. Draw ink from its world coordinates instead.
   clone.querySelector('#drawing-layer').remove();wrapper.append(clone);document.body.append(wrapper);
   const exportScale=Math.min(1.5,4096/Math.max(b.width+60,b.height+60));
   const canvas=await window.html2canvas(wrapper,{backgroundColor:'#FFFDF7',scale:exportScale,useCORS:true,logging:false});
   const ctx=canvas.getContext('2d');ctx.save();ctx.setTransform(exportScale,0,0,exportScale,(30-b.left)*exportScale,(30-b.top)*exportScale);ctx.lineCap='round';ctx.lineJoin='round';
   for(const stroke of model.strokes){ctx.strokeStyle=ctx.fillStyle=stroke.color;ctx.lineWidth=stroke.width;ctx.beginPath();if(stroke.points.length===1){const[x,y]=stroke.points[0];ctx.arc(x,y,stroke.width/2,0,Math.PI*2);ctx.fill();}else{stroke.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}}
   ctx.restore();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('图片生成失败，请重试。');download(blob,'88lin-whiteboard.png');notice('图片已导出。');
  }catch(e){notice(e.message||'导出失败，请重试或先备份白板。',true);}finally{wrapper?.remove();exportBusy=false;}
 }
 $('#import-file').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>6000000)throw Error('备份超过 6 MB，无法导入。');const data=validate(JSON.parse(await file.text()));if(!confirm('导入将替换当前浏览器里的创作。要继续吗？（可用撤销恢复）'))return;change(()=>{model=data;selected=null;});setView('canvas');fit();notice('备份已导入，可用撤销恢复之前的内容。');}catch(e){notice(e.message||'备份文件无法读取。',true);}finally{event.target.value='';}});
 async function action(name){
  switch(name){
   case 'sidebar':sidebar();break;
   case 'add':openEditor();break;
   case 'draw':setTool(tool==='hand'?'pen':'hand');break;
   case 'eraser':setTool(tool==='eraser'?'pen':'eraser');break;
   case 'undo':undo();break;case 'redo':undo(true);break;
   case 'zoom-in':zoom(1.12);break;case 'zoom-out':zoom(1/1.12);break;
   case 'fit':fit();break;
   case 'view':userMovedView=true;setView(canvasMode()?'list':'canvas');break;
   case 'help':$('#help-dialog').showModal();break;
   case 'close-help':$('#help-dialog').close();break;
   case 'close-dialog':$('#card-dialog').close();break;
   case 'fullscreen':try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notice('这个浏览器暂不支持全屏，可继续拖动和缩放白板。');}break;
   case 'export-png':await exportPng();break;
   case 'export-json':download(new Blob([snapshot()],{type:'application/json'}),'88lin-whiteboard-backup.json');notice('备份已下载，照片也包含在文件里。');break;
   case 'import':$('#import-file').click();break;
   case 'reset-layout':change(()=>{for(const[id,p]of defaults)model.poses[id]={...p};});fit();notice('原有卡片已恢复摆放，你的创作仍然保留。');break;
   case 'clear-local':if(confirm('清空你在本机添加的卡片和涂鸦？原有内容会保留，可用撤销恢复。')){change(()=>{model.cards=[];model.strokes=[];model.poses=Object.fromEntries([...defaults].map(([id,p])=>[id,{...p}]));selected=null;});startingView();}break;
  }
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(button){if(button.tagName==='BUTTON')event.preventDefault();action(button.dataset.action);if(button.closest('.menu-panel'))$('.export-menu').open=false;return;}
  const choice=event.target.closest('[data-kind-choice]');if(choice){chooseKind(choice.dataset.kindChoice);return;}
  const paper=event.target.closest('[data-paper-color]');if(paper){paperColor=paper.dataset.paperColor;$$('[data-paper-color]').forEach(b=>b.setAttribute('aria-pressed',String(b===paper)));return;}
  const emoji=event.target.closest('[data-sticker]');if(emoji){sticker=emoji.dataset.sticker;$$('[data-sticker]').forEach(b=>b.setAttribute('aria-pressed',String(b===emoji)));return;}
  const pen=event.target.closest('[data-pen-color]');if(pen){penColor=pen.dataset.penColor;setTool('pen');$$('[data-pen-color]').forEach(b=>b.setAttribute('aria-pressed',String(b===pen)));return;}
  const ca=event.target.closest('[data-card-action]');if(ca){const card=ca.closest('.wb-card'),id=card.id;select(card);switch(ca.dataset.cardAction){case'rotate':change(()=>{const p=pose(id);p.a=p.a>=20?-20:p.a+5;});break;case'front':change(()=>{model.order=model.order.filter(value=>value!==id);model.order.push(id);});notice('卡片已置于最前');break;case'edit':openEditor(model.cards.find(c=>c.id===id));break;case'delete':change(()=>{model.cards=model.cards.filter(c=>c.id!==id);delete model.poses[id];selected=null;});break;}return;}
  if(!event.target.closest('.export-menu'))$('.export-menu').open=false;
 });
 $('#layer-list').addEventListener('click',event=>{const a=event.target.closest('a');if(!a||event.ctrlKey||event.metaKey)return;const card=cardById(a.hash.slice(1));if(!card)return;event.preventDefault();if(innerWidth<=760){app.classList.add('sidebar-hidden');sidebar(false);}focusCard(card,true);try{historyReplace(a.hash);}catch{}});
 function historyReplace(hash){window.history.replaceState(null,'',hash);}
 $('#card-search').addEventListener('input',renderLayers);
 world.addEventListener('change',event=>{const checkbox=event.target.closest('[data-item]');if(!checkbox)return;const card=checkbox.closest('[data-local]');change(()=>{model.cards.find(c=>c.id===card.id).items[+checkbox.dataset.item].done=checkbox.checked;});});
 world.addEventListener('dblclick',event=>{const card=event.target.closest('[data-local]');if(card&&!event.target.closest('a,button,input'))openEditor(model.cards.find(c=>c.id===card.id));});
 function eraseAt(x,y){const radius=16/view.scale;model.strokes=model.strokes.filter(s=>!s.points.some(p=>Math.hypot(p[0]-x,p[1]-y)<radius+s.width));renderStrokes();}
 viewport.addEventListener('pointerdown',event=>{
  if(!canvasMode()||event.button!==0||event.target.closest('.pen-palette,.canvas-hint'))return;
  const resize=event.target.closest('.resize-handle');if(event.target.closest('a,input,button')&&!resize)return;
  userMovedView=true;event.preventDefault();points.set(event.pointerId,{x:event.clientX,y:event.clientY});viewport.setPointerCapture(event.pointerId);world.classList.remove('is-centering');
  if(points.size>1){if(gesture?.before)commit(gesture.before);currentStroke=null;gesture={type:'pinch'};allCards().forEach(c=>c.classList.remove('is-dragging'));return;}
  const wp=worldPoint(event.clientX,event.clientY),card=event.target.closest('.wb-card');
  if(tool==='pen'){
   if(model.strokes.length>=180){notice('笔迹有点多了，可以先备份或擦掉一些。');gesture=null;return;}
   gesture={type:'draw',before:snapshot()};currentStroke={color:penColor,width:+$('#pen-width').value,points:[wp]};model.strokes.push(currentStroke);renderStrokes();
  }else if(tool==='eraser'){gesture={type:'erase',before:snapshot()};eraseAt(...wp);}
  else if(card){select(card);gesture={type:resize?'resize':'card',card,before:snapshot()};card.focus({preventScroll:true});card.classList.add('is-dragging');}
  else{select(null);gesture={type:'pan'};viewport.focus({preventScroll:true});viewport.classList.add('is-panning');}
 });
 viewport.addEventListener('pointermove',event=>{
  if(!points.has(event.pointerId)||!gesture)return;const previous=[...points.values()],old=points.get(event.pointerId),p={x:event.clientX,y:event.clientY};points.set(event.pointerId,p);
  if(points.size===2){const current=[...points.values()],dist=ps=>Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y),mid=ps=>({x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2});const a=mid(previous),b=mid(current),r=viewport.getBoundingClientRect();if(dist(previous)>0)zoom(dist(current)/dist(previous),a.x-r.left,a.y-r.top);view.x+=b.x-a.x;view.y+=b.y-a.y;renderView();return;}
  const dx=p.x-old.x,dy=p.y-old.y;
  if(gesture.type==='card'){const pos=pose(gesture.card.id);pos.x=clamp(pos.x+dx/view.scale,-5000,5000);pos.y=clamp(pos.y+dy/view.scale,-5000,5000);place(gesture.card);}
  else if(gesture.type==='resize'){const pos=pose(gesture.card.id);pos.s=clamp(pos.s+(dx+dy)/(500*view.scale),.5,1.8);place(gesture.card);}
  else if(gesture.type==='draw'&&currentStroke){const wp=worldPoint(p.x,p.y),last=currentStroke.points.at(-1);if(Math.hypot(wp[0]-last[0],wp[1]-last[1])>1.5&&currentStroke.points.length<2000){currentStroke.points.push(wp);$('#drawing-layer').lastElementChild.setAttribute('d',pathData(currentStroke.points));}}
  else if(gesture.type==='erase')eraseAt(...worldPoint(p.x,p.y));
  else{view.x+=dx;view.y+=dy;renderView();}
 });
 function release(event){if(!points.has(event.pointerId))return;points.delete(event.pointerId);if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);if(!points.size){if(gesture?.before)commit(gesture.before);gesture=null;currentStroke=null;allCards().forEach(c=>c.classList.remove('is-dragging'));viewport.classList.remove('is-panning');}else gesture={type:'pan'};}
 for(const name of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(name,release);
 viewport.addEventListener('wheel',event=>{
  if(!canvasMode()||event.target.closest('.pen-palette,.canvas-hint'))return;event.preventDefault();
  const r=viewport.getBoundingClientRect(),delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1);
  wheelDelta=clamp(wheelDelta+delta,-120,120);wheelPoint=[event.clientX-r.left,event.clientY-r.top];
  if(!wheelFrame)wheelFrame=requestAnimationFrame(()=>{wheelFrame=0;if(canvasMode())zoom(Math.exp(-wheelDelta*.00055),...wheelPoint);wheelDelta=0;});
 },{passive:false});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!$('dialog[open]')&&innerWidth<=760&&!app.classList.contains('sidebar-hidden')){event.preventDefault();sidebar();return;}
  if(event.target.closest('input,textarea,[contenteditable="true"]')||$('dialog[open]'))return;
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();undo(event.shiftKey);return;}
  if(event.key==='Escape'){setTool('hand');select(null);$('.export-menu').open=false;return;}
  if(!canvasMode()||event.ctrlKey||event.metaKey||event.altKey||!viewport.contains(event.target))return;
  const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(moves[event.key]){event.preventDefault();const[dx,dy]=moves[event.key];if(selected){const before=snapshot(),p=pose(selected),step=event.shiftKey?5:20;p.x=clamp(p.x+dx*step,-5000,5000);p.y=clamp(p.y+dy*step,-5000,5000);place(cardById(selected));commit(before);}else{view.x-=dx*65;view.y-=dy*65;renderView();}}
  else if(['+','=','-','0'].includes(event.key)){event.preventDefault();event.key==='0'?fit():zoom(event.key==='-'?1/1.12:1.12);}
  else if(event.key==='Delete'&&selected?.startsWith('local-')){event.preventDefault();change(()=>{model.cards=model.cards.filter(c=>c.id!==selected);delete model.poses[selected];selected=null;});}
 });
 world.addEventListener('focusin',event=>{if(!canvasMode()||gesture)return;const card=event.target.closest('.wb-card');if(!card)return;const r=card.getBoundingClientRect(),v=viewport.getBoundingClientRect();if(r.left<v.left||r.right>v.right||r.top<v.top||r.bottom>v.bottom-70)focusCard(card);else select(card);requestAnimationFrame(()=>{viewport.scrollLeft=0;viewport.scrollTop=0;});});
 window.addEventListener('resize',()=>{const changedWidth=innerWidth!==lastWidth;lastWidth=innerWidth;sidebar(false);if(changedWidth){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(canvasMode())fit();},120);}});
 document.addEventListener('fullscreenchange',()=>{$$('[data-action="fullscreen"]').forEach(e=>e.setAttribute('aria-pressed',String(!!document.fullscreenElement)));});
 window.addEventListener('hashchange',()=>{const card=cardById(location.hash.slice(1));if(card)focusCard(card,true);});
 for(const dialog of $$('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 try{const raw=localStorage.getItem(storageKey);if(raw)model=validate(JSON.parse(raw));}catch{notice('无法读取本机白板，已展示初始内容；你仍可浏览和创作。',true);}
 render();updateHistory();if(innerWidth<=760)app.classList.add('sidebar-hidden');sidebar(false);setView('canvas');$$('[data-interactive]').forEach(e=>e.hidden=false);startingView();
 if(document.fonts)document.fonts.ready.then(()=>{if(userMovedView)return;startingView();const card=cardById(location.hash.slice(1));if(card)focusCard(card);});
})();
