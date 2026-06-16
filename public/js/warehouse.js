
function buildWarehouseTabs(){
  const ic=s=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
  const taskIcW=ic('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6"/><path d="M9 16h4"/>');
  const videoIcW=ic('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>');
  document.getElementById('tabbar').innerHTML=
    `<button class="tab on" id="whtab_stock" onclick="goTab('tWarehouse','Ombor',this)">${ic('<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/><circle cx="10" cy="20.5" r="1.5"/><circle cx="18" cy="20.5" r="1.5"/>')}<span style="font-size:13px">Ombor</span></button>
     <button class="tab" id="whtab_orders" onclick="goTab('tDelivery','Buyurtmalar',this)">${ic('<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>')}<span style="font-size:13px">Buyurtmalar</span></button>
     <button class="tab" onclick="goTab('tTasks','Topshiriqlar',this)">${taskIcW}<span style="font-size:13px">Topshiriq</span></button>
     <button class="tab" onclick="goTab('tVideo','Video muloqot',this)">${videoIcW}<span style="font-size:13px">Video</span></button>`;
  buildSidebar([
    {id:'tWarehouse',label:'Ombor',icon:ic('<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/><circle cx="10" cy="20.5" r="1.5"/><circle cx="18" cy="20.5" r="1.5"/>')},
    {id:'tDelivery',label:'Buyurtmalar',icon:ic('<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>')},
    {id:'tTasks',label:'Topshiriqlar',icon:taskIcW},
    {id:'tVideo',label:'Video muloqot',icon:videoIcW},
  ]);
  setSidebarActive('tWarehouse');
}

function setWhTab(tab){
  WH_TAB=tab;
  const stockF=document.getElementById('wh_stock_filters');
  const orderF=document.getElementById('wh_order_filters');
  const wc=document.getElementById('warehouseContent');
  const oc=document.getElementById('whOrderContent');
  const stBtn=document.getElementById('wh_tab_stock');
  const orBtn=document.getElementById('wh_tab_orders');
  if(tab==='stock'){
    stockF.style.display='flex';orderF.style.display='none';
    wc.style.display='block';oc.style.display='none';
    stBtn.style.borderColor='var(--p)';stBtn.style.background='var(--pbg)';stBtn.style.color='var(--p)';
    orBtn.style.borderColor='var(--bd)';orBtn.style.background='var(--bg1)';orBtn.style.color='var(--c4)';
    renderWarehouse();
  } else {
    stockF.style.display='none';orderF.style.display='flex';
    wc.style.display='none';oc.style.display='block';
    stBtn.style.borderColor='var(--bd)';stBtn.style.background='var(--bg1)';stBtn.style.color='var(--c4)';
    orBtn.style.borderColor='var(--p)';orBtn.style.background='var(--pbg)';orBtn.style.color='var(--p)';
    setDeliveryFilter(DELIVERY_FILTER||'new');
  }
}


function _posFilterBar(){
  const fb=document.getElementById('tabFilterBar');
  if(!fb||fb.style.display==='none') return;
  fb.style.position='fixed';
  fb.style.zIndex='90';
  if(window.innerWidth<=767){
    const tb=document.querySelector('#contentArea .topbar');
    const tbH=tb?tb.getBoundingClientRect().height:56;
    fb.style.top=(Math.round(tbH)+8)+'px';
    fb.style.left='0';
    fb.style.right='0';
  } else {
    fb.style.top='0';
    fb.style.left='220px';
    fb.style.right='0';
  }
}
function setWarehouseFilter(f){
  WH_FILTER=f;
  window._whPage=1;
  window.scrollTo({top:0,behavior:'smooth'});
  document.getElementById('contentArea')&&(document.getElementById('contentArea').scrollTop=0);
  _posFilterBar();
  ['all','out','low','ok'].forEach(s=>{
    const btn=document.getElementById('wf_'+s);
    if(!btn) return;
    const isOn=s===f;
    const colors={all:'#185FA5',out:'#dc2626',low:'#d97706',ok:'#166534'};
    const bgs={all:'#EFF6FF',out:'#FEF2F2',low:'#FFFBEB',ok:'#F0FDF4'};
    btn.style.borderColor=isOn?(colors[s]||'#185FA5'):'var(--bd)';
    btn.style.background=isOn?(bgs[s]||'#EFF6FF'):'var(--bg1)';
    btn.style.color=isOn?(colors[s]||'#185FA5'):'var(--c4)';
  });
  renderWarehouse();
}
function renderWarehouse(){
  const el=document.getElementById('warehouseContent');
  if(!el) return;
  // Barcha mahsulotlar (stock null bo'lsa ham)
  const allProds=D.products.map(p=>({
    p,
    left:getStockLeft(p),
    status:getStockStatus(getStockLeft(p))
  }));
  // WH_FILTER
  let filtered_w;
  if(WH_FILTER==='out') filtered_w=allProds.filter(x=>x.status==='out');
  else if(WH_FILTER==='low') filtered_w=allProds.filter(x=>x.status==='low');
  else if(WH_FILTER==='ok') filtered_w=allProds.filter(x=>x.status==='ok'||x.status===null);
  else filtered_w=allProds;
  const _wq=(document.getElementById('whSearch')||{}).value||'';
  if(_wq.trim()) filtered_w=filtered_w.filter(x=>x.p.name.toLowerCase().includes(_wq.trim().toLowerCase()));
  const _WP=20,_wpg=window._whPage||1,_wt=filtered_w.length,_ws=(_wpg-1)*_WP;
  let prods=filtered_w.slice(_ws,_ws+_WP);
  const out=allProds.filter(x=>x.status==='out');
  const low=allProds.filter(x=>x.status==='low');
  const ok=allProds.filter(x=>x.status==='ok');
  function prodCard(x){
    const {p,left,status}=x;
    const ig=gI(p.igId);
    const bg=status==='out'?'#FEF2F2':status==='low'?'#FFFBEB':'#F0FDF4';
    const border=status==='out'?'#FECACA':status==='low'?'#FDE68A':'#BBF7D0';
    const badge=status==='out'
      ?'<span style="background:#FEE2E2;color:#991b1b;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:700">Tugagan</span>'
      :status==='low'
      ?'<span style="background:#FEF3C7;color:#92400e;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:700">'+left+' ta qoldi</span>'
      :'<span style="background:#DCFCE7;color:#14532d;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:700">'+left+' ta bor</span>';
    return '<div style="background:'+bg+';border:1px solid '+border+';border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:10px">'
      +'<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">'
      +(p.img?'<img src="'+p.img+'" onclick="showFullReceipt(this.src)" style="width:44px;height:44px;border-radius:8px;object-fit:contain;background:var(--bg1);flex-shrink:0;cursor:pointer">'
             :'<div style="width:44px;height:44px;border-radius:8px;background:var(--bg1);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">&#128230;</div>')
      +'<div style="min-width:0"><div style="font-size:14px;font-weight:700;color:var(--c1)">'+p.name+'</div>'
      +'<div style="font-size:12px;color:var(--c4)">'+(ig?ig.name:'')+'</div></div></div>'
      +'<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'
      +badge
      +(WH_FILTER!=='all'?'<button onclick="addStock('+p.id+')" style="background:#185FA5;color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:18px;font-weight:700;cursor:pointer;line-height:1">+</button>':'')
      +'</div></div>';
  }
  // Summary chips
  let summary='<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">';
  if(out.length) summary+='<span style="background:#FEE2E2;color:#991b1b;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700">⛔ Tugagan: '+out.length+'</span>';
  if(low.length) summary+='<span style="background:#FEF3C7;color:#92400e;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700">⚠️ Oz qoldi: '+low.length+'</span>';
  if(ok.length) summary+='<span style="background:#DCFCE7;color:#14532d;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700">✅ Yetarli: '+ok.length+'</span>';
  summary+='</div>';

  // Search input (filter tugmalar TAGIDA, summary tagida)
  const _mobileSpacer=window.innerWidth<=767?'<div style="height:54px"></div>':'';
  const _wInp='<div style="position:relative;margin-bottom:8px"><input class="inp" id="whSearch" placeholder="\uD83D\uDD0D Mahsulot qidirish..." value="'+(_wq||'')+'" oninput="clearTimeout(window._wst);window._wst=setTimeout(()=>{window._whPage=1;renderWarehouse()},300)" style="background:var(--bg1);border-radius:12px"></div>';
  const _wHdr=_wt>0?'<div style="font-size:13px;font-weight:700;color:var(--c5);padding:2px 0 8px">Mahsulotlar '+(_ws+1)+'–'+Math.min(_ws+_WP,_wt)+' / '+_wt+'</div>':'';
  let _wPgn='';
  if(Math.ceil(_wt/_WP)>1){const _tp=Math.ceil(_wt/_WP);let _bt='';for(let i=1;i<=_tp;i++){const on=i===_wpg;_bt+='<button onclick="window._whPage='+i+';renderWarehouse()" style="min-width:34px;height:34px;border-radius:8px;border:'+(on?'2px solid var(--p)':'1px solid var(--bd)')+';background:'+(on?'var(--pbg)':'var(--bg1)')+';color:'+(on?'var(--p)':'var(--c2)')+';font-size:14px;cursor:pointer;font-family:inherit">'+i+'</button>';}_wPgn='<div style="padding:14px 0;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><button onclick="if(window._whPage>1){window._whPage--;renderWarehouse()}" '+(_wpg===1?'disabled':'')+' style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;opacity:'+(_wpg===1?'.4':'1')+'">&#8249;</button>'+_bt+'<button onclick="if(window._whPage<'+_tp+'){window._whPage++;renderWarehouse()}" '+(_wpg===_tp?'disabled':'')+' style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;opacity:'+(_wpg===_tp?'.4':'1')+'">&#8250;</button></div>';}
  let h=summary+_wInp+_wHdr;
  if(prods.length) h+=prods.map(prodCard).join('');
  else h+='<div style="text-align:center;padding:30px 20px;color:var(--c5);font-size:14px">Bu bo\'limda mahsulot yo\'q</div>';
  h+=_wPgn;
  el.innerHTML=h;
  if(_wq){const inp=document.getElementById('whSearch');if(inp){const l=inp.value.length;inp.focus();inp.setSelectionRange(l,l);}}
}
function addStock(prodId){
  const p=gP(prodId);if(!p)return;
  const _s=D.sales.filter(s=>Number(s.pid)===Number(p.id)).length;
  const _b=p.stockBaseline||0;
  const left=Math.max(0,(p.stock||0)-Math.max(0,_s-_b));
  // Modal ochish
  document.getElementById('_addStockTitle').textContent=p.name+' — hozir '+left+' ta bor';
  document.getElementById('_addStockInp').value='';
  document.getElementById('_addStockId').value=String(prodId);
  document.getElementById('_addStockW').classList.add('show');
  setTimeout(()=>document.getElementById('_addStockInp').focus(),300);
}
async function _confirmAddStock(){
  const prodIdRaw=document.getElementById('_addStockId').value;
  const val=parseInt(document.getElementById('_addStockInp').value);
  if(!val||val<=0){showToast('Miqdor kiriting!');return;}
  // gP ni string va number ikkalasida ham qidiradi
  const p=D.products.find(x=>String(x.id)===String(prodIdRaw));
  if(!p)return;
  const _curSold=D.sales.filter(s=>Number(s.pid)===Number(p.id)).length;
  const _baseline=p.stockBaseline||0;
  const _curLeft=p.stock!==null&&p.stock!==undefined ? Math.max(0,p.stock-Math.max(0,_curSold-_baseline)) : 0;
  // Yangi: hozirgi qoldiq + qo'shilgan
  p.stock=_curLeft+val;
  p.stockBaseline=_curSold;
  if(window.FS) await window.FS.saveProduct(p);
  document.getElementById('_addStockW').classList.remove('show');
  // Filter o'zgarmaydi, renderWarehouse qayta chizadi
  const _newLeft=getStockLeft(p);
  const _newSt=getStockStatus(_newLeft);
  renderWarehouse();
  const _stLabel=_newSt==='ok'?'✅ Yetarli':_newSt==='low'?'⚠️ Oz qoldi':'⛔ Tugagan';
  showToast('+'+val+' ta qo\'shildi! Qoldi: '+(_newLeft||0)+' ta ('+_stLabel+')');
}

