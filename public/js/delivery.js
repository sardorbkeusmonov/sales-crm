function getStockLeft(prod){
  if(prod.stock===null||prod.stock===undefined) return null;
  const totalSold=D.sales.filter(s=>Number(s.pid)===Number(prod.id)).length;
  const baseline=prod.stockBaseline||0;
  const soldAfter=Math.max(0, totalSold - baseline);
  return Math.max(0, prod.stock - soldAfter);
}
function getStockStatus(left){
  if(left===null) return null;
  if(left===0) return 'out';
  if(left<=2) return 'low';
  return 'ok';
}


function buildMobilografTabs(){
  const _icM=s=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
  const taskIcM=_icM('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6"/><path d="M9 16h4"/>');
  const videoIcM=_icM('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>');
  const kpiIcM=_icM('<circle cx="12" cy="12" r="1"/><path d="M12 7a5 5 0 1 0 5 5"/><path d="M13 3.055a9 9 0 1 0 7.941 7.945"/><path d="M15 6v3h3l3 -3h-3v-3z"/><path d="M15 9l-3 3"/>');
  document.getElementById('tabbar').innerHTML=`
    <button class="tab on" onclick="goTab('tKPI','KPI Maqsadlar',this)">${kpiIcM}<span style="font-size:13px">KPI</span></button>
    <button class="tab" onclick="goTab('tTasks','Topshiriqlar',this)">${taskIcM}<span style="font-size:13px">Topshiriq</span></button>
    <button class="tab" onclick="goTab('tVideo','Video muloqot',this)">${videoIcM}<span style="font-size:13px">Video</span></button>`;
  buildSidebar([
    {id:'tKPI',label:'KPI Maqsadlar',icon:kpiIcM},
    {id:'tTasks',label:'Topshiriqlar',icon:taskIcM},
    {id:'tVideo',label:'Video muloqot',icon:videoIcM},
  ]);
  setSidebarActive('tKPI');
}

function buildDeliveryTabs(){
  const ic=s=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
  const delIc=ic('<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>');
  const taskIcD=ic('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6"/><path d="M9 16h4"/>');
  const videoIcD=ic('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>');
  document.getElementById('tabbar').innerHTML=
    `<button class="tab on" onclick="goTab('tDelivery','Buyurtmalar',this)">${delIc}<span style="font-size:13px">Buyurtmalar</span></button>
     <button class="tab" onclick="goTab('tTasks','Topshiriqlar',this)">${taskIcD}<span style="font-size:13px">Topshiriq</span></button>
     <button class="tab" onclick="goTab('tVideo','Video muloqot',this)">${videoIcD}<span style="font-size:13px">Video</span></button>`;
  buildSidebar([{id:'tDelivery',label:'Buyurtmalar',icon:delIc},{id:'tTasks',label:'Topshiriqlar',icon:taskIcD},{id:'tVideo',label:'Video muloqot',icon:videoIcD}]);
  setSidebarActive('tDelivery');
}

const STATUS_LABELS={new:'Yangi',sent:'Jo\'natildi',delivered:'Yetkazildi'};
const STATUS_COLORS={new:'#EFF6FF|#1e40af',sent:'#EDE9FE|#5b21b6',delivered:'#DCFCE7|#14532d'};
const STATUS_BG={new:'#EFF6FF',sent:'#EDE9FE',delivered:'#DCFCE7'};
const STATUS_CL={new:'#1e40af',sent:'#5b21b6',delivered:'#14532d'};
function nextStatuses(status){
  if(status==='new') return [['sent','Jo\'natildi']];
  if(status==='sent') return [['delivered','Yetkazildi']];
  return [];
}

let DELIVERY_FILTER='new'; // default - yangi

function setDeliveryFilter(f){
  DELIVERY_FILTER=f;
  window._myOrdersPage=1;
  window._deliveryPage=1;
  window.scrollTo({top:0,behavior:'smooth'});
  document.getElementById('contentArea')&&(document.getElementById('contentArea').scrollTop=0);
  _posFilterBar();
  ['new','sent','delivered'].forEach(s=>{
    const btn=document.getElementById('df_'+s);
    if(!btn) return;
    const isOn=s===f;
    const colors={new:['#185FA5','#EFF6FF'],sent:['#7c3aed','#EDE9FE'],delivered:['#166534','#DCFCE7']};
    const [cl,bg]=colors[s]||['#888','white'];
    btn.style.borderColor=isOn?cl:'#e5e7eb';
    btn.style.background=isOn?bg:'white';
    btn.style.color=isOn?cl:'#888';
  });
  // Qaysi tab ochiq bo'lsa o'shani render qilamiz
  if(document.getElementById("tMyOrders")&&document.getElementById("tMyOrders").style.display!=="none") renderMyOrders();
  else renderDelivery();
}

function renderDelivery(){
  const dcEl=document.getElementById('deliveryContent');
  const woEl=document.getElementById('whOrderContent');
  const el=(woEl&&woEl.style.display!=='none')?woEl:dcEl;
  if(!el) return;
  const allOrders=D.sales.filter(s=>s.customer).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  // Filter tugma holatini yangilaymiz
  ['new','sent','delivered'].forEach(s=>{
    const btn=document.getElementById('df_'+s);
    if(!btn) return;
    const isOn=s===DELIVERY_FILTER;
    const colors={new:['#185FA5','#EFF6FF'],sent:['#7c3aed','#EDE9FE'],delivered:['#166534','#DCFCE7']};
    const [cl,bg]=colors[s]||['#888','white'];
    btn.style.borderColor=isOn?cl:'#e5e7eb';
    btn.style.background=isOn?bg:'white';
    btn.style.color=isOn?cl:'#888';
  });
  const orders=[...allOrders].filter(s=>(s.status||'new')===DELIVERY_FILTER).sort((a,b)=>(b.date+(b.time||'')).localeCompare(a.date+(a.time||'')));
  if(!allOrders.length){el.innerHTML='<div style="text-align:center;padding:40px 20px;color:var(--c5);font-size:14px">Hozircha buyurtma yo\'q</div>';return;}

  function orderCard(s){
    const items=getSaleItems(s);
    const p=gP(s.pid),sel=gS(s.sid),ig=gI(s.igId),cust=s.customer||{};
    const payIcon=cust.payType==='cash'?'&#128181;':'&#128179;';
    const total=s.total||items.reduce(function(a,it){return a+(it.price||(gP(it.pid)?gP(it.pid).price:0))*it.qty;},0);
    const itemsHtml=items.map(function(it){
      const ip=gP(it.pid);
      const si=it.selectedImg||(ip?ip.img:'');
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:0.5px solid var(--bg4)">'
        +(si?'<img src="'+si+'" onclick="showFullReceipt(\''+si+'\')" style="width:40px;height:40px;border-radius:8px;object-fit:contain;background:var(--bg3);flex-shrink:0;cursor:pointer">':'<div style="width:40px;height:40px;border-radius:8px;background:#f5f5f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px">&#128230;</div>')
        +'<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700;color:var(--c1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(ip?ip.name:'-')+'</div>'
        +'<div style="font-size:12px;color:#185FA5;font-weight:600">'+(it.price||(ip?ip.price:0)?(fmt(it.price||(ip?ip.price:0))+' so\'m'):'')+' &times; '+it.qty+' ta</div>'
        +'</div></div>';
    }).join('');
    return '<div style="background:var(--bg1);border-radius:14px;border:0.5px solid var(--bd);margin-bottom:8px;overflow:hidden">'
      +'<div style="background:#f8f9fb;padding:6px 12px;display:flex;justify-content:space-between;align-items:center;border-bottom:0.5px solid #f0f0ec">'
      +'<div style="font-size:11px;color:var(--c4)">'+(ig?ig.name:'')+(sel?' &middot; '+sel.name:'')+'</div>'
      +'<div style="font-size:12px;font-weight:700;color:#185FA5">'+fmt(total)+' so\'m</div>'
      +'</div>'
      +itemsHtml
      +'<div style="display:flex;gap:10px;padding:10px 12px;border-bottom:0.5px solid var(--bg4)">'
      +(s.receiptUrl?'<div style="flex-shrink:0;cursor:pointer" onclick="showFullReceipt(\''+s.receiptUrl+'\')">'
        +'<img src="'+s.receiptUrl+'" style="width:64px;height:64px;border-radius:8px;object-fit:cover;border:0.5px solid #eee">'
        +'<div style="font-size:10px;color:var(--c5);text-align:center;margin-top:2px">Chek</div></div>'
        :'<div style="width:64px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--bg2);border-radius:8px;height:64px;border:1px dashed #e5e7eb"><span style="font-size:22px">&#129534;</span></div>')
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:13px;color:var(--c1);margin-bottom:2px">&#128100; '+(cust.name||'-')+'</div>'
      +'<div style="font-size:13px;color:#555;margin-bottom:1px">&#128222; '+(cust.phone||'-')+'</div>'
      +'<div style="font-size:13px;color:#555;margin-bottom:1px">&#128205; '+(cust.address||'-')+'</div>'
      +(cust.note?'<div style="font-size:13px;color:var(--c4);font-style:italic">&#128172; '+cust.note+'</div>':'')
      +'<div style="font-size:13px;color:var(--c4);margin-top:1px">'+payIcon+' '+(cust.payType==='cash'?'Naqd':'Karta')+'</div>'
      +'<div style="font-size:11px;color:#aaa;margin-top:2px">'+s.date+' '+s.time+'</div>'
      +'</div></div>'
      +'<div style="padding:8px 12px;display:flex;gap:6px">'
      +nextStatuses(s.status||'new').map(([k,v],i)=>'<button onclick="updateOrderStatus(this)" data-id="'+(s._id||String(s.id))+'" data-status="'+k+'" style="flex:1;padding:8px;border-radius:8px;border:none;background:'+(i===0?'#185FA5':'#f0f0ec')+';color:'+(i===0?'white':'#555')+';font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">'+v+' &#8594;</button>').join('')
      +'</div></div>';
  }

  if(!orders.length){
    el.innerHTML='<div style="text-align:center;padding:30px 20px;color:var(--c5);font-size:14px">Bu bo\'limda buyurtma yo\'q</div>';
    return;
  }
  // Pagination
  const _OP=15;
  const _myOrdPage=window._deliveryPage||1;
  const _total=orders.length;
  const _totalPages=Math.ceil(_total/_OP);
  const _start=(_myOrdPage-1)*_OP;
  const _shown=orders.slice(_start,_start+_OP);
  let _pagin='';
  if(_totalPages>1){
    let _btns='';
    for(let i=1;i<=_totalPages;i++){
      const isOn=i===_myOrdPage;
      _btns+=`<button onclick="setDeliveryPage(${i})" style="min-width:34px;height:34px;border-radius:8px;border:${isOn?'2px solid #185FA5':'1px solid #e5e7eb'};background:${isOn?'#EFF6FF':'white'};color:${isOn?'#185FA5':'#555'};font-size:14px;font-weight:${isOn?'700':'400'};cursor:pointer;font-family:inherit">${i}</button>`;
    }
    _pagin=`<div style="padding:12px 0;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">
      <button onclick="setDeliveryPage(${Math.max(1,_myOrdPage-1)})" ${_myOrdPage===1?'disabled':''} style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:#555;font-size:16px;cursor:pointer;font-family:inherit;opacity:${_myOrdPage===1?'.4':'1'}">&#8249;</button>
      ${_btns}
      <button onclick="setDeliveryPage(${Math.min(_totalPages,_myOrdPage+1)})" ${_myOrdPage===_totalPages?'disabled':''} style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:#555;font-size:16px;cursor:pointer;font-family:inherit;opacity:${_myOrdPage===_totalPages?'.4':'1'}">&#8250;</button>
    </div>`;
  }
  el.innerHTML='<div style="padding:8px 0;font-size:13px;font-weight:700;color:var(--c5);margin-bottom:6px">'
    +(_start+1)+'–'+Math.min(_start+_OP,_total)+' / '+_total+' ta buyurtma</div>'
    +_shown.map(orderCard).join('')
    +_pagin;
}

function setMyOrdersPage(page){
  window._myOrdersPage=page;
  renderMyOrders();
}

function setDeliveryPage(page){
  window._deliveryPage=page;
  renderDelivery();
}

function updateOrderStatus(el, confirmedStatus){
  // Agar confirmedStatus yo'q - tasdiqlash so'raymiz
  if(!confirmedStatus){
    const saleId=el?(el.dataset.id):null;
    const status=el?(el.dataset.status||el.value):null;
    const sale=D.sales.find(s=>String(s._id||s.id)===String(saleId));
    if(!sale) return;
    const label=STATUS_LABELS[status]||status;
    // Zamonaviy tasdiqlash modali
    _pendingStatusEl=el;
    _pendingStatus=status;
    document.getElementById('_statusConfTitle').textContent='Statusni o\'zgartirish';
    document.getElementById('_statusConfText').textContent='"'+((sale.customer&&sale.customer.name)||'Noma\'lum')+'" buyurtmasi — '+label+' deb belgilansinmi?';
    document.getElementById('_statusConfW').classList.add('show');
    return;
  }
  // Tasdiqlangan
  const saleId=el?(el.dataset.id):null;
  const status=confirmedStatus;
  const sale=D.sales.find(s=>String(s._id||s.id)===String(saleId));
  if(!sale) return;
  sale.status=status;
  if(window.FS) window.FS.addSale(sale);
  // Filter o'zgarmaydi - shunda qoladi, buyurtma o'z yeridan o'chadi
  const _myOrd=document.getElementById('tMyOrders');
  if(_myOrd&&_myOrd.style.display!=='none') renderMyOrders();
  else renderDelivery();
  const icons={sent:'📦 ',delivered:'✅ '};
  showToast((icons[status]||'')+STATUS_LABELS[status]+'!');
}


function renderMyOrders(){
  const el=document.getElementById('myOrdersContent');
  if(!el) return;
  const myOrders=D.sales.filter(s=>s.customer&&String(s.sid)===String(D.user.id))
    .sort((a,b)=>(b.date+(b.time||'')).localeCompare(a.date+(a.time||'')));
  
  if(!myOrders.length){
    el.innerHTML='<div style="text-align:center;padding:40px 20px;color:var(--c5);font-size:14px">Hozircha buyurtma yo\'q</div>';
    return;
  }

  const orders=myOrders.filter(s=>(s.status||'new')===DELIVERY_FILTER);
  
  function orderCard(s){
    const items=getSaleItems(s);
    const isMulti=items.length>1;
    const p=gP(s.pid),ig=gI(s.igId),cust=s.customer||{};
    const payIcon=cust.payType==='cash'?'💵':'💳';
    const total=s.total||items.reduce(function(a,it){return a+(it.price||(gP(it.pid)?gP(it.pid).price:0))*it.qty;},0);
    const imgHtml=(function(){
      if(!isMulti){
        const si=s.selectedImg||(items[0]&&items[0].selectedImg)||(p?p.img:'')||'';
        return si?'<img src="'+si+'" onclick="showFullReceipt(this.src)" style="width:40px;height:40px;border-radius:8px;object-fit:contain;background:var(--bg3);flex-shrink:0;cursor:pointer">':'<div style="width:40px;height:40px;border-radius:8px;background:#f5f5f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px">📦</div>';
      }
      const withImg=items.filter(function(it){return it.selectedImg;}).slice(0,2);
      const extra=items.length-withImg.length;
      return '<div style="display:flex;gap:2px;flex-shrink:0">'
        +withImg.map(function(it){return '<img src="'+it.selectedImg+'" onclick="showFullReceipt(this.src)" style="width:38px;height:38px;border-radius:7px;object-fit:contain;background:var(--bg3);cursor:pointer">';}).join('')
        +(extra>0?'<div style="width:38px;height:38px;border-radius:7px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#185FA5">+'+extra+'</div>':'')
        +(withImg.length===0?'<div style="width:40px;height:40px;border-radius:8px;background:#f5f5f0;display:flex;align-items:center;justify-content:center;font-size:20px">📦</div>':'')
        +'</div>';
    })();
    const nameHtml=isMulti
      ?items.map(function(it){const ip=gP(it.pid);return(ip?ip.name:'-')+(it.qty>1?' ×'+it.qty:'');}).join(', ')
      :(p?p.name:'-');
    const itemsDetail=!isMulti?''
      :'<div style="padding:4px 12px 8px;display:flex;flex-wrap:wrap;gap:4px">'
        +items.map(function(it){const ip=gP(it.pid);return '<span style="background:#EFF6FF;color:#185FA5;border-radius:6px;padding:2px 8px;font-size:12px;font-weight:600">'+(ip?ip.name:'-')+' ×'+it.qty+' — '+fmt((it.price||(ip?ip.price:0))*it.qty)+' so\'m</span>';}).join('')
        +'</div>';
    return '<div style="background:var(--bg1);border-radius:14px;border:0.5px solid var(--bd);margin-bottom:8px;overflow:hidden">'
      +'<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:0.5px solid var(--bg4)">'
      +imgHtml
      +'<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700;color:var(--c1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+nameHtml+'</div>'
      +'<div style="font-size:11px;color:var(--c4)">'+(ig?ig.name:'')+'</div></div>'
      +'<div style="text-align:right;flex-shrink:0"><div style="font-size:12px;font-weight:700;color:#185FA5">'+fmt(total)+' so\'m</div>'
      +'<div style="font-size:11px;color:var(--c4)">'+s.date+' '+(s.time||'')+'</div></div></div>'
      +itemsDetail
      +'<div style="display:flex;gap:10px;padding:10px 12px;border-bottom:0.5px solid var(--bg4)">'
      +(s.receiptUrl?'<div style="flex-shrink:0;cursor:pointer" onclick="showFullReceipt(this.querySelector(\'img\').src)"><img src="'+s.receiptUrl+'" style="width:64px;height:64px;border-radius:8px;object-fit:cover;border:0.5px solid #eee"><div style="font-size:10px;color:var(--c5);text-align:center;margin-top:2px">Chek</div></div>'
        :'<div style="width:64px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--bg2);border-radius:8px;height:64px;border:1px dashed #e5e7eb"><span style="font-size:22px">🧾</span></div>')
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:13px;color:var(--c1);margin-bottom:2px">👤 '+(cust.name||'-')+'</div>'
      +((!isMulti&&cust.qty&&cust.qty>1)?'<div style="font-size:13px;font-weight:700;color:#185FA5;margin-bottom:2px">📦 Soni: '+cust.qty+' ta</div>':'')
      +'<div style="font-size:13px;color:#555;margin-bottom:1px">📞 '+(cust.phone||'-')+'</div>'
      +'<div style="font-size:13px;color:#555;margin-bottom:1px">📍 '+(cust.address||'-')+'</div>'
      +(cust.note?'<div style="font-size:13px;color:var(--c4);font-style:italic">💬 '+cust.note+'</div>':'')
      +'<div style="font-size:13px;color:var(--c4);margin-top:1px">'+payIcon+' '+(cust.payType==='cash'?'Naqd':'Karta')+'</div>'
      +'</div></div>'
      +'<div style="padding:8px 12px;display:flex;gap:6px">'
      +nextStatuses(s.status||'new').map(function(ns,i){return '<button onclick="updateOrderStatus(this)" data-id="'+(s._id||String(s.id))+'" data-status="'+ns[0]+'" style="flex:1;padding:8px;border-radius:8px;border:none;background:'+(i===0?'#185FA5':'#f0f0ec')+';color:'+(i===0?'white':'#555')+';font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">'+ns[1]+' →</button>';}).join('')
      +'</div></div>';
  }

  if(!orders.length){
    el.innerHTML='<div style="text-align:center;padding:30px 20px;color:var(--c5);font-size:14px">Bu bo\'limda buyurtma yo\'q</div>';
    return;
  }
  // Pagination
  const _OP=15;
  const _myOrdPage=window._myOrdersPage||1;
  const _total=orders.length;
  const _totalPages=Math.ceil(_total/_OP);
  const _start=(_myOrdPage-1)*_OP;
  const _shown=orders.slice(_start,_start+_OP);
  let _pagin='';
  if(_totalPages>1){
    let _btns='';
    for(let i=1;i<=_totalPages;i++){
      const isOn=i===_myOrdPage;
      _btns+=`<button onclick="setMyOrdersPage(${i})" style="min-width:34px;height:34px;border-radius:8px;border:${isOn?'2px solid #185FA5':'1px solid #e5e7eb'};background:${isOn?'#EFF6FF':'white'};color:${isOn?'#185FA5':'#555'};font-size:14px;font-weight:${isOn?'700':'400'};cursor:pointer;font-family:inherit">${i}</button>`;
    }
    _pagin=`<div style="padding:12px 0;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">
      <button onclick="setMyOrdersPage(${Math.max(1,_myOrdPage-1)})" ${_myOrdPage===1?'disabled':''} style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:#555;font-size:16px;cursor:pointer;font-family:inherit;opacity:${_myOrdPage===1?'.4':'1'}">&#8249;</button>
      ${_btns}
      <button onclick="setMyOrdersPage(${Math.min(_totalPages,_myOrdPage+1)})" ${_myOrdPage===_totalPages?'disabled':''} style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:#555;font-size:16px;cursor:pointer;font-family:inherit;opacity:${_myOrdPage===_totalPages?'.4':'1'}">&#8250;</button>
    </div>`;
  }
  el.innerHTML='<div style="padding:8px 0;font-size:13px;font-weight:700;color:var(--c5);margin-bottom:6px">'
    +(_start+1)+'–'+Math.min(_start+_OP,_total)+' / '+_total+' ta buyurtma</div>'
    +_shown.map(orderCard).join('')
    +_pagin;
}

let _pendingStatusEl=null, _pendingStatus=null;
function _confirmStatusChange(){
  document.getElementById('_statusConfW').classList.remove('show');
  if(_pendingStatusEl&&_pendingStatus){
    updateOrderStatus(_pendingStatusEl, _pendingStatus);
    _pendingStatusEl=null;_pendingStatus=null;
  }
}

function showFullReceipt(url_or_src){
  const url=typeof url_or_src==='string'?url_or_src:url_or_src;
  if(!url) return;
  const old=document.getElementById('_receiptOv');
  if(old) old.remove();
  const ov=document.createElement('div');
  ov.id='_receiptOv';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.onclick=()=>ov.remove();
  ov.innerHTML='<div style="background:var(--bg1);border-radius:16px;padding:8px;max-width:90vw;max-height:80vh;display:flex;flex-direction:column;align-items:center"><img src="'+url+'" style="max-width:100%;max-height:70vh;border-radius:10px;object-fit:contain"><div style="font-size:12px;color:var(--c5);margin-top:8px">Yopish uchun bosing</div></div>';
  document.body.appendChild(ov);
}
let WH_TAB='stock'; // stock | orders
let WH_FILTER='all'; // all | out | low | ok
