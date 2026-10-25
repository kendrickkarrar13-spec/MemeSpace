import {database} from '@/db/raw';
import {identity,body,failure} from '../common';
const kinds=['bookmark','lesson','meme','note','nft'];
const nftForms=['orb','glyph','circuit','crystal','pulse'];
const nftPalettes=['mint','violet','neon','sunset','mono'];
function validNft(p:any){
 if(!p||typeof p.name!=='string'||p.name.length<1||p.name.length>48)return false;
 if(typeof p.seed!=='string'||!/^[A-Z0-9]{1,16}$/.test(p.seed))return false;
 if(!nftForms.includes(p.form)||!nftPalettes.includes(p.palette))return false;
 if(!Number.isInteger(p.density)||p.density<1||p.density>10)return false;
 if(!Number.isInteger(p.rings)||p.rings<1||p.rings>8)return false;
 if(!Number.isInteger(p.glitch)||p.glitch<0||p.glitch>5)return false;
 if(typeof p.symmetry!=='boolean')return false;
 if(p.rarity!==undefined&&(!Number.isFinite(p.rarity)||p.rarity<0||p.rarity>99))return false;
 return true;
}
export async function GET(request:Request){try{const id=await identity(request);const result=await database().prepare('SELECT kind,item_key,payload,updated_at FROM saved_items WHERE user_id=? ORDER BY updated_at DESC LIMIT 300').bind(id).all();return Response.json({items:result.results.map((r:any)=>({...r,payload:JSON.parse(r.payload)}))},{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e)}}
export async function POST(request:Request){try{const id=await identity(request),d=await body(request);if(!d||!kinds.includes(d.kind)||typeof d.key!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(d.key)||!d.payload||JSON.stringify(d.payload).length>2000)throw Error('INPUT');if(d.kind==='meme'&&(typeof d.payload.top!=='string'||typeof d.payload.bottom!=='string'||d.payload.top.length>100||d.payload.bottom.length>100||!['head','brain'].includes(d.payload.image)))throw Error('INPUT');if(d.kind==='note'&&(typeof d.payload.text!=='string'||d.payload.text.length>1200||typeof d.payload.title!=='string'||d.payload.title.length>120))throw Error('INPUT');if(d.kind==='meme'&&((d.payload.fontSize!==undefined&&(!Number.isInteger(d.payload.fontSize)||d.payload.fontSize<28||d.payload.fontSize>64))||(d.payload.color!==undefined&&!['#ffffff','#b4ffc8','#d2b4ff'].includes(d.payload.color))))throw Error('INPUT');if(d.kind==='nft'&&!validNft(d.payload))throw Error('INPUT');const result=await database().prepare('INSERT INTO saved_items(id,user_id,kind,item_key,payload,updated_at) SELECT ?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM saved_items WHERE user_id=?)<300 OR EXISTS(SELECT 1 FROM saved_items WHERE user_id=? AND kind=? AND item_key=?) ON CONFLICT(user_id,kind,item_key) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at').bind(crypto.randomUUID(),id,d.kind,d.key,JSON.stringify(d.payload),Date.now(),id,id,d.kind,d.key).run();if(!result.meta.changes)return Response.json({error:'Your collection is full. Remove a saved story before adding another item.'},{status:409});return Response.json({ok:true});}catch(e){return failure(e)}}
export async function DELETE(request:Request){try{const id=await identity(request),d=await body(request);if(!d||!kinds.includes(d.kind)||typeof d.key!=='string')throw Error('INPUT');await database().prepare('DELETE FROM saved_items WHERE user_id=? AND kind=? AND item_key=?').bind(id,d.kind,d.key).run();return Response.json({ok:true});}catch(e){return failure(e)}}
