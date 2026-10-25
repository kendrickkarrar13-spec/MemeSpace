"use client";
import {useEffect,useRef,useState} from 'react';
type Props={inside:boolean;warp:boolean;reduced:boolean;quality:boolean;onReady:()=>void;focus?:string|null;glow?:number;paused?:boolean};
type Point={x:number;y:number;z:number;nx:number;ny:number;nz:number;seed:number;eye:number};
const TAU=Math.PI*2;
const receptors:Record<string,[number,number,number]>={history:[-.65,.35,.5],coins:[.6,.4,.5],games:[-.78,-.15,.25],chat:[.78,0,.25],media:[-.45,-.5,.4],nft:[.88,.28,.2],learn:[.5,-.5,.4],wallet:[0,.75,.3],profile:[0,-.65,.4],social:[0,.05,.55]};
function eyelid(t:number){const phase=t%6.3;return Math.exp(-(((phase-5.3)/.085)**2))+.65*Math.exp(-(((phase-5.55)/.07)**2));}
function decode(buffer:ArrayBuffer):Point[]{const a=new Float32Array(buffer),out:Point[]=[];for(let i=0;i<a.length;i+=6)out.push({x:a[i],y:a[i+1],z:a[i+2],nx:a[i+3],ny:a[i+4],nz:a[i+5],seed:((i*16807)%2147483647)/2147483647,eye:0});return out;}
function atlas(){const c=document.createElement('canvas');c.width=32*2*3;c.height=32*24;const x=c.getContext('2d')!;x.textAlign='center';x.textBaseline='middle';x.font='600 27px monospace';for(let palette=0;palette<3;palette++)for(let b=0;b<24;b++)for(let d=0;d<2;d++){const intensity=.12+b/23*.88;const rgb=palette===0?[107,255,150]:palette===1?[188,130,255]:[220,255,236];x.fillStyle=`rgb(${rgb.map(v=>Math.round(v*intensity)).join(',')})`;x.fillText(String(d),(palette*2+d)*32+16,b*32+16);}return c;}
export default function Scene({inside,warp,reduced,quality,onReady,focus,glow=1,paused=false}:Props){const ref=useRef<HTMLCanvasElement>(null);const state=useRef({inside,warp,reduced,quality,focus,glow,paused});state.current={inside,warp,reduced,quality,focus,glow,paused};const ready=useRef(onReady);ready.current=onReady;const[error,setError]=useState(false);
 useEffect(()=>{const canvas=ref.current!,ctx=canvas.getContext('2d',{alpha:false})!;if(!ctx){setError(true);ready.current();return;}const controller=new AbortController();let stopped=false,raf=0,head:Point[]=[],brain:Point[]=[],began=performance.now(),last=0,frameCount=0,mx=0,my=0,yaw=0,pitch=0,zoom=0,blend=0,lastInside=false;const sprites=atlas();
 const drops=Array.from({length:86},(_,i)=>({x:(i*.6180339887)%1,y:(i*.39271)%1,s:.012+(i%7)*.004}));
 const sparks=Array.from({length:170},(_,i)=>({a:i*2.3999,r:.25+((i*37)%100)/100,z:(i%17)/17}));
 const buckets:Array<Array<{x:number;y:number;size:number;b:number;palette:number;digit:number}>>=Array.from({length:80},()=>[]);
 Promise.all(['/geometry/head.bin','/geometry/brain.bin'].map(async url=>{const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('Geometry unavailable');return decode(await r.arrayBuffer());})).then(([h,b])=>{if(stopped)return;head=h;brain=b;began=performance.now();canvas.dataset.geometry='loaded';canvas.dataset.headGlyphs=String(head.length);canvas.dataset.brainGlyphs=String(brain.length);ready.current();}).catch(e=>{if(e.name!=='AbortError'){setError(true);ready.current();}});
 const move=(e:PointerEvent)=>{mx=Math.max(-1,Math.min(1,(e.clientX/innerWidth-.5)*2));my=Math.max(-1,Math.min(1,(e.clientY/innerHeight-.45)*2));};const leave=()=>{mx=0;my=0;};window.addEventListener('pointermove',move);document.addEventListener('pointerleave',leave);
 function draw(now:number){if(stopped)return;raf=requestAnimationFrame(draw);const s=state.current;if(document.hidden||s.paused||now-last<1000/(s.quality?40:24))return;const dt=Math.min(.08,(now-last)/1000||.025);last=now;frameCount++;const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio,1.5);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#020504';ctx.fillRect(0,0,w,h);const t=s.reduced?0:(now-began)/1000;
 if(s.inside!==lastInside){blend=0;lastInside=s.inside;}blend=Math.min(1,blend+dt*1.6);yaw+=(mx*.28+(s.inside?.28:.015)+(!s.reduced?Math.sin(t*.42)*.026:0)-yaw)*Math.min(1,dt*3);pitch+=(-my*.12+(s.inside?.55:0)-pitch)*Math.min(1,dt*3);zoom+=(Number(s.warp)-zoom)*Math.min(1,dt*2.5);
 if(!s.reduced){ctx.font='12px monospace';for(const d of drops){d.y=(d.y+dt*d.s)%1.35;for(let k=0;k<10;k++){ctx.fillStyle=k===0?'#82e59b50':`rgba(31,127,69,${(10-k)*.012})`;ctx.fillText((Math.floor(t*1.8+d.x*100+k)%2).toString(),d.x*w,(d.y*1.1-.1)*h-k*14);}}}
 const cx=w*.5,cy=h*(s.inside?.50:.39),scale=Math.min(h*(s.inside?.31:.25),w*(s.inside?.37:.32));const forming=s.reduced?1:Math.min(1,Math.max(0,t/3.2));const form=1-Math.pow(1-forming,3);const rotY=s.reduced?(s.inside?.24:0):yaw,rotX=s.reduced?(s.inside?.55:0):pitch,co=Math.cos(rotY),si=Math.sin(rotY),cxr=Math.cos(rotX),sxr=Math.sin(rotX);
 function project(x:number,y:number,z:number){const x1=x*co+z*si,z1=z*co-x*si,y1=y*cxr-z1*sxr,z2=y*sxr+z1*cxr;const perspective=3.6/Math.max(.4,3.6-z2-zoom*2.9);return {x:cx+x1*scale*perspective,y:cy-y1*scale*perspective,z:z2,p:perspective};}
 const points=s.inside?brain:head;for(const b of buckets)b.length=0;const step=s.quality?1:2;
 for(let i=0;i<points.length;i+=step){const p=points[i];let x=p.x,y=p.y,z=p.z;const seed=((i*73.173)%997)/997;
 if(!s.inside&&form<1){const a=seed*TAU*4+(1-form)*8;const r=1.5+(1-form)*4;x=x*form+Math.cos(a)*r*(1-form);y=y*form+(Math.sin(a)*1.8+(seed-.5)*2)*(1-form);z=z*form+Math.sin(a*1.7)*2*(1-form);}
 if(!s.reduced){const breath=Math.sin(t*1.3)*.0025;y+=breath;const nearEye=!s.inside&&Math.abs(y-.18)<.09&&Math.abs(Math.abs(x)-.25)<.14&&z>.42;const blink=eyelid(t);if(nearEye)y=.18+(y-.18)*(1-blink*.86);}
 const nx=p.nx*co+p.nz*si,nz1=p.nz*co-p.nx*si,ny=p.ny*cxr-nz1*sxr,nz=p.ny*sxr+nz1*cxr;if(nz<.02&&form>.98)continue;
 const q=project(x,y,z);if(q.x<-20||q.x>w+20||q.y<-20||q.y>h+20)continue;
 const diffuse=Math.max(0,nx*-.32+ny*.52+nz*.79);let light=.15+Math.pow(diffuse,.9)*.82+Math.pow(1-Math.max(0,nz),2)*.18;const pulse=s.inside&&!s.reduced?Math.pow(Math.max(0,Math.cos(x*4.1+y*5.2+z*3-t*2.4)),28):0;const focusPoint=s.focus?receptors[s.focus]:null;
 const distance=focusPoint?Math.hypot(x-focusPoint[0],y-focusPoint[1],z-focusPoint[2]):5;
 const focused=s.inside&&focusPoint?Math.exp(-distance*2.8)*(s.reduced?.45:.35+.3*Math.sin(t*5-distance*8)**2):0;
 const eyeDistance=!s.inside?Math.hypot(Math.abs(x)-.255,y-.181,(z-.685)*.6):5;
 light=Math.min(1,light+pulse*.6+focused+Math.exp(-eyeDistance*21)*.5*s.glow);const purple=s.inside?(pulse>.24||x>.62):(nx<-.7&&diffuse<.4);let palette=purple?1:0;if(pulse>.7)palette=2;
 const reveal=s.inside?blend:1;light*=reveal;const size=Math.max(3,scale*.026*q.p)*(s.quality?1:1.2);const digit=(Math.floor(seed*31)+Math.floor(t*(.26+seed*.22)))%2;const b=Math.min(79,Math.max(0,Math.floor((q.z+2)*20)));buckets[b].push({x:q.x,y:q.y,size,b:Math.round(light*23),palette,digit});}
 ctx.globalAlpha=Math.max(0,1-zoom*.7);for(const bucket of buckets)for(const p of bucket){ctx.drawImage(sprites,(p.palette*2+p.digit)*32,p.b*32,32,32,p.x-p.size*.34,p.y-p.size*.5,p.size*.68,p.size);}
 ctx.globalAlpha=1;
 // The eyes remain individually drawn binary glyphs; light is composited around them.
 if(!s.inside&&form>.98){for(const side of [-1,1]){
   const ex=side*.255+(s.reduced?0:mx*.019),ey=.181+(s.reduced?0:-my*.013),ez=.69;
   const blink=s.reduced?0:eyelid(t),openness=Math.max(.04,1-blink),center=project(ex,ey,ez),radius=scale*.056*center.p;
   ctx.save();ctx.globalAlpha=(1-zoom*.7)*openness;
   const halo=ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,radius*3.5);
   halo.addColorStop(0,`rgba(99,255,142,${.52*s.glow})`);halo.addColorStop(.35,`rgba(24,255,87,${.27*s.glow})`);halo.addColorStop(1,'rgba(0,255,90,0)');
   ctx.globalCompositeOperation='screen';ctx.fillStyle=halo;ctx.fillRect(center.x-radius*3.5,center.y-radius*3.5,radius*7,radius*7);
   ctx.shadowColor='#20ff75';ctx.shadowBlur=radius*1.35*s.glow;
   for(let j=0;j<84;j++){const angle=j*2.39996,r=.053*Math.sqrt(j/84);if(r<.018)continue;
     const q=project(ex+Math.cos(angle)*r,ey+Math.sin(angle)*r*openness,ez),size=Math.max(2.1,scale*.012*q.p);
     ctx.drawImage(sprites,((j+Math.floor(t*1.8))%2)*32,23*32,32,32,q.x-size*.35,q.y-size*.5,size*.7,size);
   }
   ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';
   ctx.fillStyle='#00160b';ctx.beginPath();ctx.ellipse(center.x,center.y,radius*.25,radius*.3*openness,0,0,TAU);ctx.fill();
   const glint=project(ex-.019,ey+.021*openness,ez+.005);ctx.font=`${Math.max(3,radius*.48)}px monospace`;ctx.fillStyle='#d5ffe7';ctx.fillText('1',glint.x,glint.y);
   ctx.restore();
 }}
 if(s.inside){
   const selected=s.focus?receptors[s.focus]:null;
   for(let k=0;k<12;k++){
     const angle=k*TAU/12,target=selected&&k<4?selected:[Math.cos(angle)*.81,Math.sin(angle)*.62,.34];
     const phase=s.reduced?.5:(t*(selected?.38:.2)+k*.083)%1;
     const pathPoint=(f:number)=>project(target[0]*f+Math.sin(f*Math.PI)*Math.cos(angle+1)*.13,target[1]*f+Math.sin(f*TAU+k)*.055,.4+Math.sin(f*3+k)*.16);
     ctx.beginPath();for(let j=0;j<=24;j++){const q=pathPoint(j/24);j?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)}
     ctx.strokeStyle=selected&&k<4?'#6dffad6b':'#b78bff20';ctx.lineWidth=selected&&k<4?1.15:.65;ctx.stroke();
     if(!s.reduced){for(let tail=0;tail<5;tail++){const f=(phase-tail*.016+1)%1,q=pathPoint(f);ctx.globalAlpha=(1-tail/5)*.85;ctx.shadowColor=k%3?'#52ffac':'#bd8dff';ctx.shadowBlur=tail?0:14;ctx.fillStyle=k%3?'#b9ffd7':'#e2caff';ctx.font='10px monospace';ctx.fillText((k+tail)%2?'1':'0',q.x,q.y);}}
     ctx.shadowBlur=0;ctx.globalAlpha=1;
   }
   if(selected){const q=project(...selected),r=scale*.075*q.p;ctx.strokeStyle='#97ffc690';ctx.lineWidth=1;ctx.beginPath();ctx.arc(q.x,q.y,r*(s.reduced?1:1+Math.sin(t*3)*.1),0,TAU);ctx.stroke();}
 }
 if(!s.reduced){ctx.font='11px monospace';for(const p of sparks){const a=p.a+t*.12,r=Math.min(w,h)*p.r*(.32+(1-form)*.6+zoom*2);ctx.fillStyle=p.z>.7?'#ac6eee70':'#66da9345';ctx.fillText(p.z>.5?'1':'0',cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7);}}
 if(frameCount%40===0){canvas.dataset.frames=String(frameCount);canvas.dataset.gaze=`${yaw.toFixed(3)},${pitch.toFixed(3)}`;canvas.dataset.mode=s.inside?'brain':'head';canvas.dataset.focus=s.focus||'';canvas.dataset.eyeGlow=String(s.glow);canvas.dataset.glyphs=String(points.length);}
 }
 raf=requestAnimationFrame(draw);return()=>{stopped=true;controller.abort();cancelAnimationFrame(raf);window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);};},[]);
 return <><canvas ref={ref} className="binary-scene" role="img" aria-label={inside?'Live three-dimensional brain composed of animated binary digits':'Live three-dimensional human head composed of binary digits, following your pointer'}/>{error&&<div className="scene-error" role="status">The binary geometry could not load. You can still enter and use every module.</div>}</>;
}
