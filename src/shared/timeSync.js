export async function serverTimeSync(){
  try{
    const r = await fetch('/time/now', {cache:'no-store'});
    const d = await r?.json();
    return d?.now || Date.now();
  }catch{
    return Date.now();
  }
}