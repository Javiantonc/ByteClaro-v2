const form=document.querySelector("#search-form");
const queryInput=document.querySelector("#query");
const maxPriceInput=document.querySelector("#max-price");
const sortInput=document.querySelector("#sort");
const statusBox=document.querySelector("#search-status");
const resultsBox=document.querySelector("#search-results");
const searchButton=document.querySelector("#search-button");
const euro=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
function safeText(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
function validHttpUrl(value){try{const url=new URL(value);return url.protocol==="https:"||url.protocol==="http:"?url.href:"#";}catch{return "#";}}
function renderProducts(products){
 if(!Array.isArray(products)||products.length===0){resultsBox.innerHTML="";statusBox.textContent="No se han encontrado ofertas para esa búsqueda. Prueba con el nombre o modelo más concreto.";return;}
 resultsBox.innerHTML=products.map(product=>{
  const title=safeText(product.title||"Producto sin nombre");
  const store=safeText(product.store?.name||"Tienda no especificada");
  const amount=product.price?.amount===null||product.price?.amount===undefined?NaN:Number(product.price.amount);
  const price=Number.isFinite(amount)&&amount>=0?euro.format(amount):"Precio no disponible";
  const shipping=product.shipping_cost?safeText(product.shipping_cost):"Gastos de envío no indicados";
  const availability=product.availability==="in_stock"?"Disponible según la fuente":product.availability?safeText(product.availability):"Disponibilidad no indicada";
  const updated=product.updated_at?new Date(product.updated_at):null;
  const updatedText=updated&&!Number.isNaN(updated.getTime())?"Actualizado: "+updated.toLocaleString("es-ES",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Madrid"}):"Fecha de actualización no indicada";
  const image=product.image?validHttpUrl(product.image):"";
  const buy=validHttpUrl(product.links?.buy||product.links?.web||"");
  const img=image&&image!=="#"?`<img src="${image}" alt="" loading="lazy" referrerpolicy="no-referrer">`:"<span aria-hidden=\"true\">▣</span>";
  const link=buy!=="#"?`<a class="offer-link" href="${buy}" target="_blank" rel="noopener noreferrer sponsored">Ver oferta ↗</a>`:"<span class=\"small\">Enlace de oferta no disponible</span>";
  return `<article class="offer-card"><div class="offer-image">${img}</div><div class="offer-info"><h3>${title}</h3><p class="offer-store">${store}</p><p class="offer-meta">${safeText(shipping)} · ${availability}</p><p class="offer-updated">${safeText(updatedText)}</p></div><div class="offer-price"><strong>${price}</strong>${link}</div></article>`;
 }).join("");
 const prices=products.map(p=>p.price?.amount===null||p.price?.amount===undefined?NaN:Number(p.price.amount)).filter(n=>Number.isFinite(n)&&n>=0);
 statusBox.textContent=`Se han encontrado ${products.length} oferta(s)${prices.length?" · precio más bajo: "+euro.format(Math.min(...prices)):""}.`;
}
form.addEventListener("submit",async event=>{
 event.preventDefault();
 const q=queryInput.value.trim();
 if(q.length<2){statusBox.textContent="Escribe al menos dos caracteres.";return;}
 const params=new URLSearchParams({q,sort:sortInput.value,limit:"30"});
 const max=Number(maxPriceInput.value);
 if(maxPriceInput.value!==""&&Number.isFinite(max)&&max>=0)params.set("max_price",String(max));
 searchButton.disabled=true;searchButton.textContent="Buscando…";resultsBox.innerHTML="";
 statusBox.textContent="Consultando ofertas reales…";
 try{
  const response=await fetch(`/api/search?${params.toString()}`,{headers:{Accept:"application/json"}});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok){const messages={api_not_configured:"La API todavía no está configurada. El propietario debe solicitar acceso y añadir la clave en las variables de entorno del servidor.",account_pending:"La solicitud de acceso a la API está pendiente de aprobación.",account_suspended:"El acceso a la API está suspendido o rechazado.",rate_limited:"Se ha alcanzado el límite de consultas. Inténtalo más tarde.",invalid_request:"La búsqueda contiene un filtro no válido.",upstream_error:"La fuente de precios no está disponible ahora mismo."};const code=payload?.error?.code;throw new Error(messages[code]||payload?.error?.message||"No se ha podido consultar la fuente de precios.");}
  renderProducts(payload.data);
 }catch(error){resultsBox.innerHTML="";statusBox.textContent=error.message||"Ha ocurrido un error al buscar. Inténtalo de nuevo más tarde.";}
 finally{searchButton.disabled=false;searchButton.textContent="Buscar";}
});
const toggle=document.querySelector("#menu-toggle"),nav=document.querySelector("#nav");
toggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");toggle.setAttribute("aria-expanded","false");}));