'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,Download,Dices,FileJson,Save,Sparkles,Wand2} from 'lucide-react';
import {Tabs,TabsContent,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {useIdentityScope} from './identity-scope';
import './nft-generator.css';

export type NftForm='orb'|'glyph'|'circuit'|'crystal'|'pulse';
export type NftPalette='mint'|'violet'|'neon'|'sunset'|'mono';

export type NftConfig={
 seed:string;
 name:string;
 form:NftForm;
 palette:NftPalette;
 density:number;
 rings:number;
 glitch:number;
 symmetry:boolean;
};

type SavedApi={
 items:any[];
 error:string;
 save:(kind:string,key:string,payload:unknown)=>Promise<boolean>;
 remove:(kind:string,key:string)=>Promise<boolean>;
};

const FORMS:Array<{id:NftForm;label:string;hint:string}>=[
 {id:'orb',label:'Neural orb',hint:'Concentric mind energy'},
 {id:'glyph',label:'Binary glyph',hint:'Sigil of 0s and 1s'},
 {id:'circuit',label:'Circuit core',hint:'Wired meme architecture'},
 {id:'crystal',label:'Meme crystal',hint:'Faceted digital relic'},
 {id:'pulse',label:'Signal pulse',hint:'Radiating frequency art'},
];

const PALETTES:Array<{id:NftPalette;label:string;colors:string[]}>=[
 {id:'mint',label:'Mint mind',colors:['#04140c','#0d2a1c','#39f5a4','#a5ffb4','#e8fff0']},
 {id:'violet',label:'Memeverse violet',colors:['#0b0714','#1a1030','#9c3efc','#d2b4ff','#f4ecff']},
 {id:'neon',label:'Neon dual',colors:['#050812','#102018','#38d4ff','#a5ffb4','#f0fbff']},
 {id:'sunset',label:'Acid sunset',colors:['#12080c','#2a1020','#ea50b0','#ffb86b','#fff0f6']},
 {id:'mono',label:'Binary mono',colors:['#050705','#141a16','#8d9c93','#d9eadf','#f4faf6']},
];

function hashSeed(input:string){
 let h=2166136261>>>0;
 for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}
 return h>>>0;
}

function mulberry32(seed:number){
 let t=seed>>>0;
 return()=>{
  t+=0x6D2B79F5;
  let r=Math.imul(t^t>>>15,1|t);
  r^=r+Math.imul(r^r>>>7,61|r);
  return((r^r>>>14)>>>0)/4294967296;
 };
}

export function defaultNftConfig(seed?:string):NftConfig{
 const s=seed||Math.random().toString(36).slice(2,10).toUpperCase();
 const rnd=mulberry32(hashSeed(s));
 const forms=FORMS.map(f=>f.id);
 const pals=PALETTES.map(p=>p.id);
 return {
  seed:s,
  name:'MemeSignal #'+s.slice(0,4),
  form:forms[Math.floor(rnd()*forms.length)],
  palette:pals[Math.floor(rnd()*pals.length)],
  density:3+Math.floor(rnd()*6),
  rings:2+Math.floor(rnd()*5),
  glitch:Math.floor(rnd()*4),
  symmetry:rnd()>.35,
 };
}

export function nftTraits(cfg:NftConfig){
 const rarity=Math.min(
  99,
  12+cfg.density*4+cfg.rings*5+cfg.glitch*7+(cfg.symmetry?8:14)+(cfg.form==='crystal'?10:0)+(cfg.palette==='sunset'?6:0)
 );
 return [
  {trait_type:'Form',value:FORMS.find(f=>f.id===cfg.form)?.label||cfg.form},
  {trait_type:'Palette',value:PALETTES.find(p=>p.id===cfg.palette)?.label||cfg.palette},
  {trait_type:'Density',value:String(cfg.density)},
  {trait_type:'Rings',value:String(cfg.rings)},
  {trait_type:'Glitch',value:String(cfg.glitch)},
  {trait_type:'Symmetry',value:cfg.symmetry?'Mirrored':'Asymmetric'},
  {trait_type:'Seed',value:cfg.seed},
  {trait_type:'Rarity score',value:String(rarity)},
 ];
}

export function buildNftMetadata(cfg:NftConfig){
 return {
  name:cfg.name.slice(0,48)||'Untitled MemeSpace signal',
  description:'Generative MemeSpace art created in the NFT Studio. Local preview and export only — not minted on-chain.',
  attributes:nftTraits(cfg),
  properties:{
   category:'image',
   creators:[{name:'MemeSpace NFT Studio',share:100}],
   generator:'memespace-nft-studio-v1',
   seed:cfg.seed,
  },
  external_url:'https://memespace.local/#nft',
 };
}

export function renderNftArt(canvas:HTMLCanvasElement,cfg:NftConfig){
 const ctx=canvas.getContext('2d');
 if(!ctx)return;
 const size=canvas.width;
 const rnd=mulberry32(hashSeed(cfg.seed+'|'+cfg.form+'|'+cfg.palette));
 const palette=PALETTES.find(p=>p.id===cfg.palette)?.colors||PALETTES[0].colors;
 const cx=size/2;
 const cy=size/2;

 const bg=ctx.createRadialGradient(cx,cy,size*.05,cx,cy,size*.72);
 bg.addColorStop(0,palette[1]);
 bg.addColorStop(.55,palette[0]);
 bg.addColorStop(1,'#020504');
 ctx.fillStyle=bg;
 ctx.fillRect(0,0,size,size);

 ctx.save();
 ctx.globalAlpha=.12;
 ctx.fillStyle=palette[3];
 ctx.font=`${Math.max(10,Math.floor(size/48))}px monospace`;
 const step=Math.max(18,Math.floor(42-cfg.density*2));
 for(let y=18;y<size;y+=step){
  let row='';
  for(let x=0;x<size/10;x++)row+=rnd()>.5?'1':'0';
  ctx.fillText(row,12+(rnd()*8),y);
 }
 ctx.restore();

 ctx.beginPath();
 ctx.arc(cx,cy,size*.42,0,Math.PI*2);
 ctx.strokeStyle=palette[2]+'55';
 ctx.lineWidth=size*.01;
 ctx.stroke();

 const drawMirrored=(fn:()=>void)=>{
  fn();
  if(cfg.symmetry){
   ctx.save();
   ctx.translate(size,0);
   ctx.scale(-1,1);
   fn();
   ctx.restore();
  }
 };

 if(cfg.form==='orb'||cfg.form==='pulse'){
  for(let i=0;i<cfg.rings;i++){
   const r=size*(.12+i*.05+rnd()*.02);
   ctx.beginPath();
   ctx.arc(cx,cy,r,0,Math.PI*2);
   ctx.strokeStyle=i%2?palette[2]:palette[3];
   ctx.globalAlpha=.35+rnd()*.4;
   ctx.lineWidth=2+rnd()*4;
   ctx.stroke();
   if(cfg.form==='pulse'){
    const spikes=6+cfg.density*2;
    ctx.beginPath();
    for(let s=0;s<spikes;s++){
     const a=(s/spikes)*Math.PI*2+rnd()*.05;
     const rr=r+(rnd()*.08*size);
     const x=cx+Math.cos(a)*rr;
     const y=cy+Math.sin(a)*rr;
     if(s===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle=palette[3];
    ctx.globalAlpha=.25;
    ctx.stroke();
   }
  }
  ctx.globalAlpha=1;
  const core=ctx.createRadialGradient(cx,cy,0,cx,cy,size*.14);
  core.addColorStop(0,palette[4]);
  core.addColorStop(.4,palette[2]);
  core.addColorStop(1,palette[1]+'00');
  ctx.fillStyle=core;
  ctx.beginPath();
  ctx.arc(cx,cy,size*.14,0,Math.PI*2);
  ctx.fill();
 }

 if(cfg.form==='glyph'){
  drawMirrored(()=>{
   const arms=4+Math.floor(cfg.density/2);
   for(let a=0;a<arms;a++){
    const ang=(a/arms)*Math.PI*(cfg.symmetry?1:2)+rnd()*.2;
    const len=size*(.18+rnd()*.22);
    ctx.strokeStyle=palette[a%2?2:3];
    ctx.lineWidth=3+rnd()*5;
    ctx.globalAlpha=.55+rnd()*.35;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(ang)*len,cy+Math.sin(ang)*len);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx+Math.cos(ang)*len*.7,cy+Math.sin(ang)*len*.7,8+rnd()*14,0,Math.PI*2);
    ctx.fillStyle=palette[4];
    ctx.globalAlpha=.35;
    ctx.fill();
   }
  });
  ctx.globalAlpha=1;
  ctx.fillStyle=palette[2];
  ctx.font=`bold ${Math.floor(size*.12)}px monospace`;
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(rnd()>.5?'01':'10',cx,cy);
 }

 if(cfg.form==='circuit'){
  drawMirrored(()=>{
   const nodes=6+cfg.density;
   const pts:Array<{x:number;y:number}>=[];
   for(let i=0;i<nodes;i++){
    const ang=rnd()*Math.PI*(cfg.symmetry?1:2);
    const rad=size*(.1+rnd()*.32);
    pts.push({x:cx+Math.cos(ang)*rad,y:cy+Math.sin(ang)*rad});
   }
   ctx.strokeStyle=palette[2];
   ctx.lineWidth=2;
   ctx.globalAlpha=.7;
   for(let i=0;i<pts.length-1;i++){
    const a=pts[i];
    const b=pts[i+1];
    ctx.beginPath();
    ctx.moveTo(a.x,a.y);
    ctx.lineTo(a.x,b.y);
    ctx.lineTo(b.x,b.y);
    ctx.stroke();
   }
   pts.forEach((p,i)=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,4+rnd()*6,0,Math.PI*2);
    ctx.fillStyle=i%2?palette[3]:palette[4];
    ctx.globalAlpha=.85;
    ctx.fill();
   });
  });
 }

 if(cfg.form==='crystal'){
  for(let i=0;i<cfg.rings+2;i++){
   const sides=3+Math.floor(rnd()*4);
   const rad=size*(.1+i*.05+rnd()*.03);
   ctx.beginPath();
   for(let s=0;s<sides;s++){
    const a=(s/sides)*Math.PI*2+rnd()*.15+i*.2;
    const x=cx+Math.cos(a)*rad;
    const y=cy+Math.sin(a)*rad;
    if(s===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }
   ctx.closePath();
   ctx.strokeStyle=palette[i%2?2:3];
   ctx.fillStyle=palette[1]+'88';
   ctx.globalAlpha=.3+rnd()*.35;
   ctx.lineWidth=2;
   ctx.fill();
   ctx.stroke();
  }
  ctx.globalAlpha=1;
 }

 const particles=12+cfg.density*4;
 ctx.globalAlpha=.55;
 for(let i=0;i<particles;i++){
  const a=rnd()*Math.PI*2;
  const r=size*(.08+rnd()*.4);
  const x=cx+Math.cos(a)*r;
  const y=cy+Math.sin(a)*r;
  ctx.fillStyle=i%3?palette[3]:palette[2];
  ctx.beginPath();
  ctx.arc(x,y,1.5+rnd()*3.5,0,Math.PI*2);
  ctx.fill();
 }
 ctx.globalAlpha=1;

 for(let g=0;g<cfg.glitch;g++){
  const y=rnd()*size;
  const h=4+rnd()*18;
  ctx.globalAlpha=.18+rnd()*.2;
  ctx.fillStyle=palette[2];
  ctx.fillRect(0,y,size,h);
  ctx.globalAlpha=.12;
  ctx.fillStyle=palette[3];
  ctx.fillRect(rnd()*size*.2,y+2,size*.6,h*.5);
 }
 ctx.globalAlpha=1;

 ctx.strokeStyle=palette[2]+'99';
 ctx.lineWidth=size*.012;
 ctx.strokeRect(size*.04,size*.04,size*.92,size*.92);
 ctx.fillStyle='#020504cc';
 ctx.fillRect(size*.08,size*.82,size*.84,size*.1);
 ctx.fillStyle=palette[4];
 ctx.font=`600 ${Math.floor(size*.035)}px Arial`;
 ctx.textAlign='left';
 ctx.textBaseline='middle';
 ctx.fillText((cfg.name||'Untitled').slice(0,28),size*.11,size*.855);
 ctx.fillStyle=palette[3];
 ctx.font=`${Math.floor(size*.022)}px monospace`;
 ctx.fillText('SEED '+cfg.seed+' · MEMESPACE STUDIO',size*.11,size*.895);

 ctx.strokeStyle=palette[3];
 ctx.lineWidth=2;
 [[.06,.06],[.88,.06],[.06,.88],[.88,.88]].forEach(([x,y])=>{
  ctx.strokeRect(size*x,size*y,size*.06,size*.06);
 });
}

async function call(path:string,body?:unknown,method='POST'){
 const r=await fetch('/api/'+path,body===undefined?undefined:{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const d:any=await r.json();
 if(!r.ok)throw Error(d.error||'The request could not be completed.');
 return d;
}

function useSaved():SavedApi{
 const[items,setItems]=useState<any[]>([]);
 const[error,setError]=useState('');
 const refresh=useCallback(()=>call('saved').then(d=>setItems(d.items)).catch(()=>setItems([])),[]);
 useEffect(()=>{refresh()},[refresh]);
 async function save(kind:string,key:string,payload:unknown){
  setError('');
  try{
   await call('saved',{kind,key,payload});
   await refresh();
   return true;
  }catch(e:any){
   setError(e.message);
   return false;
  }
 }
 async function remove(kind:string,key:string){
  setError('');
  try{
   await call('saved',{kind,key},'DELETE');
   await refresh();
   return true;
  }catch(e:any){
   setError(e.message);
   return false;
  }
 }
 return{items,error,save,remove};
}

function downloadBlob(blob:Blob,filename:string){
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;
 a.download=filename;
 document.body.appendChild(a);
 a.click();
 a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}

function configFromPayload(p:any):NftConfig{
 return {
  seed:String(p?.seed||'MIND0101').slice(0,16),
  name:String(p?.name||'Saved signal').slice(0,48),
  form:(FORMS.some(f=>f.id===p?.form)?p.form:'orb') as NftForm,
  palette:(PALETTES.some(x=>x.id===p?.palette)?p.palette:'mint') as NftPalette,
  density:Math.max(1,Math.min(10,Number(p?.density)||5)),
  rings:Math.max(1,Math.min(8,Number(p?.rings)||3)),
  glitch:Math.max(0,Math.min(5,Number(p?.glitch)||0)),
  symmetry:!!p?.symmetry,
 };
}

export function NftGenerator({target}:{target?:string}){
 const scope=useIdentityScope();
 const saved=useSaved();
 const[tab,setTab]=useState('studio');
 const[cfg,setCfg]=useState<NftConfig>(()=>defaultNftConfig('MIND0101'));
 const[status,setStatus]=useState('');
 const[editingKey,setEditingKey]=useState<string|null>(null);
 const[exportUrl,setExportUrl]=useState('');
 const canvasRef=useRef<HTMLCanvasElement|null>(null);
 const[canvasEl,setCanvasEl]=useState<HTMLCanvasElement|null>(null);
 const attachCanvas=useCallback((el:HTMLCanvasElement|null)=>{
  canvasRef.current=el;
  setCanvasEl(el);
 },[]);
 const opened=useRef('');
 const traits=useMemo(()=>nftTraits(cfg),[cfg]);
 const rarity=traits.find(t=>t.trait_type==='Rarity score')?.value||'—';

 useEffect(()=>()=>{if(exportUrl)URL.revokeObjectURL(exportUrl)},[exportUrl]);

 useEffect(()=>{
  if(!target||opened.current===target)return;
  const item=saved.items.find(i=>i.kind==='nft'&&i.item_key===target);
  if(!item)return;
  opened.current=target;
  setCfg(configFromPayload(item.payload));
  setEditingKey(item.item_key);
  setTab('studio');
  setStatus('Loaded a saved signal into the studio.');
 },[target,saved.items]);

 useEffect(()=>{
  if(tab!=='studio'||!canvasEl)return;
  renderNftArt(canvasEl,cfg);
 },[tab,canvasEl,cfg]);

 function patch<K extends keyof NftConfig>(key:K,value:NftConfig[K]){
  setCfg(c=>({...c,[key]:value}));
  setStatus('');
 }

 function randomize(){
  setCfg(defaultNftConfig());
  setEditingKey(null);
  setStatus('New random signal locked in.');
 }

 function exportPng(){
  const c=canvasRef.current;
  if(!c){setStatus('Preview is not ready yet.');return}
  c.toBlob(blob=>{
   if(!blob){setStatus('Could not export the image. Try again.');return}
   const url=URL.createObjectURL(blob);
   setExportUrl(url);
   downloadBlob(blob,`MemeSpace-NFT-${cfg.seed}.png`);
   setStatus('PNG ready. This is local art export only — nothing was minted.');
  },'image/png');
 }

 function exportJson(){
  const blob=new Blob([JSON.stringify(buildNftMetadata(cfg),null,2)],{type:'application/json'});
  downloadBlob(blob,`MemeSpace-NFT-${cfg.seed}.json`);
  setStatus('Metadata JSON exported for your records. Not an on-chain mint.');
 }

 async function saveCreation(){
  const safeSeed=cfg.seed.toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24)||'signal';
  const key=editingKey||('nft_'+safeSeed+'_'+Math.floor(Math.random()*999));
  const payload={
   name:cfg.name.slice(0,48),
   seed:cfg.seed.slice(0,16),
   form:cfg.form,
   palette:cfg.palette,
   density:cfg.density,
   rings:cfg.rings,
   glitch:cfg.glitch,
   symmetry:cfg.symmetry,
   rarity:Number(rarity)||0,
  };
  if(await saved.save('nft',key,payload)){
   setEditingKey(key);
   setStatus(scope==='guest'
    ?'Saved for this browser session identity. Sign in to keep it across visits on this install.'
    :'Signal saved to your collection.');
  }
 }

 const collection=saved.items.filter(i=>i.kind==='nft');

 return (
  <div className="nft-studio">
   <div className="nft-hero">
    <div>
     <p className="micro-label">GENERATIVE SIGNAL STUDIO</p>
     <h2>Craft a MemeSpace NFT look.</h2>
     <p>Dial traits, lock a seed, export art and metadata. This node is a creative studio — it does not mint, list, or charge.</p>
    </div>
    <div className="nft-hero-stats">
     <div><b>{rarity}</b><span>Rarity score</span></div>
     <div><b>{cfg.seed.slice(0,6)}</b><span>Seed</span></div>
     <div><b>{collection.length}</b><span>Saved</span></div>
    </div>
   </div>

   <Tabs value={tab} onValueChange={setTab}>
    <TabsList>
     <TabsTrigger value="studio">Studio</TabsTrigger>
     <TabsTrigger value="collection">Your signals</TabsTrigger>
     <TabsTrigger value="about">How it works</TabsTrigger>
    </TabsList>

    <TabsContent value="studio">
     <div className="nft-grid">
      <div className="nft-preview-pane">
       <canvas width={900} height={900} ref={attachCanvas} aria-label="Live NFT art preview"/>
       <div className="nft-preview-actions">
        <button type="button" className="primary-action" onClick={exportPng}><Download/>Export PNG</button>
        <button type="button" className="secondary-action" onClick={exportJson}><FileJson/>Export metadata</button>
        {exportUrl&&<a className="secondary-action" href={exportUrl} download={`MemeSpace-NFT-${cfg.seed}.png`}>Download PNG link <Download/></a>}
       </div>
      </div>

      <div className="nft-controls">
       <p className="micro-label">TRAIT CONSOLE</p>
       <h3>Shape the signal</h3>

       <label className="field-label">Piece name
        <input className="search-field" maxLength={48} value={cfg.name} onChange={e=>patch('name',e.target.value)} placeholder="Name this signal"/>
       </label>

       <label className="field-label">Seed
        <input
         className="search-field"
         maxLength={16}
         value={cfg.seed}
         onChange={e=>patch('seed',e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,16)||'MIND')}
         placeholder="SEED"
        />
       </label>

       <label className="field-label">Form</label>
       <div className="module-toolbar" role="group" aria-label="Art form">
        {FORMS.map(f=>(
         <button key={f.id} type="button" className={'chip '+(cfg.form===f.id?'selected':'')} onClick={()=>patch('form',f.id)} title={f.hint}>{f.label}</button>
        ))}
       </div>

       <label className="field-label">Palette</label>
       <div className="module-toolbar" role="group" aria-label="Color palette">
        {PALETTES.map(p=>(
         <button key={p.id} type="button" className={'chip '+(cfg.palette===p.id?'selected':'')} onClick={()=>patch('palette',p.id)}>{p.label}</button>
        ))}
       </div>

       <label className="field-label">Density: {cfg.density}
        <input aria-label="Density" type="range" min={1} max={10} value={cfg.density} onChange={e=>patch('density',Number(e.target.value))}/>
       </label>
       <label className="field-label">Rings: {cfg.rings}
        <input aria-label="Rings" type="range" min={1} max={8} value={cfg.rings} onChange={e=>patch('rings',Number(e.target.value))}/>
       </label>
       <label className="field-label">Glitch: {cfg.glitch}
        <input aria-label="Glitch amount" type="range" min={0} max={5} value={cfg.glitch} onChange={e=>patch('glitch',Number(e.target.value))}/>
       </label>

       <label className="nft-check">
        <input type="checkbox" checked={cfg.symmetry} onChange={e=>patch('symmetry',e.target.checked)}/>
        Mirror symmetry
       </label>

       <div className="nft-trait-list" aria-label="Current traits">
        {traits.filter(t=>t.trait_type!=='Seed').map(t=>(
         <div key={t.trait_type}><span>{t.trait_type}</span><b>{t.value}</b></div>
        ))}
       </div>

       <div className="module-toolbar">
        <button type="button" className="secondary-action" onClick={randomize}><Dices/>Randomize</button>
        <button type="button" className="secondary-action" onClick={saveCreation}><Save/>{editingKey?'Update saved signal':'Save signal'}</button>
        {editingKey&&<button type="button" className="text-button" onClick={()=>{setEditingKey(null);setStatus('Ready to save as a new signal.')}}>Save as new</button>}
       </div>

       <p className="notice">Export works without an account. Sign in to keep editable signals in your library.</p>
       {status&&<p role="status" className="notice">{status}</p>}
       {saved.error&&<p role="alert" className="error">{saved.error}</p>}
      </div>
     </div>
    </TabsContent>

    <TabsContent value="collection">
     <div className="vault-intro">
      <h2>Your signal vault.</h2>
      <p>Reopen a saved configuration, tweak traits, and export again.</p>
     </div>
     {saved.error&&<p className="error" role="alert">{saved.error}</p>}
     <div className="story-grid">
      {collection.map(item=>(
       <article className="module-card" key={item.item_key}>
        <small>{String(item.payload?.form||'signal').toUpperCase()} · {item.payload?.palette||'palette'}</small>
        <h3>{item.payload?.name||'Untitled signal'}</h3>
        <p>Seed {item.payload?.seed||'—'} · Rarity {item.payload?.rarity??'—'}</p>
        <button
         type="button"
         className="secondary-action"
         onClick={()=>{
          opened.current=item.item_key;
          setCfg(configFromPayload(item.payload));
          setEditingKey(item.item_key);
          setTab('studio');
          setStatus('Loaded from your vault.');
         }}
        >
         Open in studio <ArrowRight/>
        </button>
        <button type="button" className="text-button creation-delete" onClick={()=>saved.remove('nft',item.item_key)}>Remove signal</button>
       </article>
      ))}
     </div>
     {!collection.length&&<div className="empty-state">No saved signals yet.<br/>Generate one in the studio and hit save.</div>}
    </TabsContent>

    <TabsContent value="about">
     <div className="nft-about">
      <article className="module-card">
       <Sparkles/>
       <h3>What this node is</h3>
       <p>A generative art desk inside the Meme Mind. Seeds drive deterministic visuals so the same settings always redraw the same piece.</p>
      </article>
      <article className="module-card">
       <Wand2/>
       <h3>What you can take with you</h3>
       <p>PNG artwork and a simple metadata JSON (name, traits, seed). Useful for mockups, community planning, or personal archives.</p>
      </article>
      <article className="module-card">
       <FileJson/>
       <h3>What this is not</h3>
       <p>No wallet minting, no marketplace listing, no payments, and no claim of on-chain ownership. Financial NFT rails stay off until a separate product review.</p>
      </article>
     </div>
    </TabsContent>
   </Tabs>
  </div>
 );
}
