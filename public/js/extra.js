// ===== KPI TIZIMI =====
var KPI_UNITS=['ta','so\'m','%','kun','soat','dona'];
var KPI_PERIODS=['Kunlik','Haftalik','Oylik'];
var _kpiEdit=null;

function kpiIcon(){
  const _ic=s=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
  return _ic('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>');
}

function buildKPITabs(){
  // Admin va sotuvchi uchun KPI tab qo'shamiz
  var tabbarEl=document.getElementById('tabbar');
  var sidebarTabsEl=document.getElementById('sidebarTabs');
  // Bu funksiya buildAdminTabs, buildSellerTabs ichida chaqiriladi
}

function getKpiCurrent(goal){
  var sid=goal.sid;
  var sel=gS(sid);
  if(!sel) return goal.manualValue||0;
  var now=new Date();
  var sales=D.sales.filter(function(s){return String(s.sid)===String(sid);});

  if(goal.period==='Kunlik'){
    var td=today();
    sales=sales.filter(function(s){return s.date===td;});
  } else if(goal.period==='Haftalik'){
    var w0=new Date(now);
    w0.setDate(now.getDate()-now.getDay());
    var wStr=w0.toISOString().slice(0,10);
    sales=sales.filter(function(s){return s.date>=wStr;});
  } else {
    var mStr=now.toISOString().slice(0,7);
    sales=sales.filter(function(s){return s.date&&s.date.slice(0,7)===mStr;});
  }

  if(goal.autoType==='sotuv_soni') return sales.length;
  if(goal.autoType==='sotuv_daromad') return sales.reduce(function(a){return a+(sel.comm||0);},0);
  if(goal.autoType==='dm_soni'){
    var dm=0;
    Object.values(TA&&TA.igData||{}).forEach(function(ig){
      Object.values(ig||{}).forEach(function(day){dm+=Number(day.dm)||0;});
    });
    return dm;
  }
  if(goal.autoType==='budjet'){
    var bdj=0;
    Object.values(TA&&TA.igData||{}).forEach(function(ig){
      Object.values(ig||{}).forEach(function(day){bdj+=Number(day.budget)||0;});
    });
    return bdj;
  }
  if(goal.autoType==='yetkazilgan'){
    return (D.sales||[]).filter(function(s){
      var delivered=s.status==='delivered';
      if(!delivered) return false;
      if(goal.period==='Kunlik') return s.date===today();
      if(goal.period==='Oylik') return s.date&&s.date.slice(0,7)===new Date().toISOString().slice(0,7);
      return true;
    }).length;
  }
  return Number(goal.manualValue)||0;
}

function kpiColor(pct){
  if(pct>=80) return {bg:'#F0FDF4',bar:'#22C55E',text:'#15803D'};
  if(pct>=50) return {bg:'#FFFBEB',bar:'#F59E0B',text:'#D97706'};
  return {bg:'#FEF2F2',bar:'#EF4444',text:'#DC2626'};
}

function renderKpiCard(goal,isAdmin){
  var cur=getKpiCurrent(goal);
  var pct=goal.target>0?Math.min(100,Math.round(cur/goal.target*100)):0;
  var r=44; var circ=2*Math.PI*r;
  var dash=circ*(1-pct/100);
  var col=pct>=80?'#22C55E':pct>=50?'#F59E0B':'#EF4444';
  var colBg=pct>=80?'#F0FDF4':pct>=50?'#FFFBEB':'#FEF2F2';
  var colTx=pct>=80?'#15803D':pct>=50?'#B45309':'#DC2626';
  var periods={Kunlik:{bg:'#EFF6FF',c:'#1D4ED8'},Haftalik:{bg:'#EDE9FE',c:'#6D28D9'},Oylik:{bg:'#F0FDF4',c:'#166534'}};
  var pd=periods[goal.period]||{bg:'#F1F5F9',c:'#475569'};
  var sel=gS(goal.sid); var selName=sel?sel.name:'—';
  var adminInfo=isAdmin?'<div style="font-size:12px;color:#888;margin-bottom:8px;display:flex;align-items:center;gap:4px"><span>👤</span><span>'+selName+'</span></div>':'';
  var gid=goal.id;
  var adminBtns=isAdmin?('<div style="display:flex;gap:6px;margin-top:12px"><button onclick="openEditKpi(\'' +gid+ '\')" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;font-size:13px;font-weight:600;cursor:pointer;color:#185FA5;font-family:inherit">Tahrirlash</button><button onclick="deleteKpi(\'' +gid+ '\')" style="flex:1;padding:8px;border-radius:8px;border:1px solid #fee2e2;background:#fff;font-size:13px;font-weight:600;cursor:pointer;color:#dc2626;font-family:inherit">O&apos;chirish</button></div>'):'';
  var manualInput=goal.autoType==='manual'&&!isAdmin?('<div style="margin-top:10px;display:flex;gap:8px;align-items:center"><span style="font-size:13px;color:#888">Hozirgi qiymat:</span><input type="number" value="'+(goal.manualValue||0)+'" onchange="updateKpiManual(\'' +gid+ '\',this.value)" style="width:80px;padding:6px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;font-family:inherit" min="0"><span style="font-size:13px;color:#888">'+goal.unit+'</span></div>'):'';
  return'<div class="sc-card" style="margin-bottom:10px">'+
    adminInfo+
    '<div style="display:flex;align-items:center;gap:14px">'+
      '<div style="position:relative;flex-shrink:0">'+
        '<svg width="100" height="100" viewBox="0 0 100 100">'+
          '<circle cx="50" cy="50" r="44" fill="'+colBg+'" stroke="#e5e7eb" stroke-width="8"/>'+
          '<circle cx="50" cy="50" r="44" fill="none" stroke="'+col+'" stroke-width="8" stroke-dasharray="'+circ.toFixed(1)+'" stroke-dashoffset="'+dash.toFixed(1)+'" stroke-linecap="round" transform="rotate(-90 50 50)" style="transition:stroke-dashoffset .8s ease"/>'+
          '<text x="50" y="46" text-anchor="middle" font-size="20" font-weight="800" fill="'+colTx+'" font-family="inherit">'+pct+'%</text>'+
          '<text x="50" y="62" text-anchor="middle" font-size="11" fill="#999" font-family="inherit">'+fmt(cur)+'/'+fmt(goal.target)+'</text>'+
        '</svg>'+
      '</div>'+
      '<div style="flex:1;min-width:0">'+
        '<div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:6px">'+goal.title+'</div>'+
        '<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:'+pd.bg+';color:'+pd.c+';margin-bottom:6px">'+goal.period+'</span>'+
        '<div style="height:6px;background:#f0f0ec;border-radius:6px;overflow:hidden;margin-bottom:4px">'+
          '<div style="height:100%;border-radius:6px;background:'+col+';width:'+pct+'%;transition:width .8s ease"></div>'+
        '</div>'+
        '<div style="font-size:12px;color:#999">'+fmt(cur)+' '+goal.unit+' / '+fmt(goal.target)+' '+goal.unit+'</div>'+
      '</div>'+
    '</div>'+
    manualInput+adminBtns+'</div>';
}


function renderKPI(){
  var el=document.getElementById('kpiContent');
  if(!el) return;
  var isAdmin=D.user&&D.user.isAdmin;
  var isMob=D.user&&D.user.role==='mobilograf';
  var userId=isAdmin?null:(D.user?D.user.id:null);

  var myGoals=isAdmin
    ? (D.kpiGoals||[])
    : (D.kpiGoals||[]).filter(function(g){return String(g.sid)===String(userId);});

  var addBtn=isAdmin?
    '<button onclick="openAddKpi()" style="width:100%;padding:12px;border-radius:10px;background:#185FA5;color:#fff;border:none;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:14px;margin-top:8px">+ Maqsad qo\'shish</button>':'';

  if(!myGoals.length){
    el.innerHTML=addBtn+
      '<div style="text-align:center;padding:48px 20px">'+
        '<div style="font-size:48px;margin-bottom:12px">🎯</div>'+
        '<div style="font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:6px">'+(isAdmin?'Hali maqsad qo\'shilmagan':'Sizga hali maqsad belgilanmagan')+'</div>'+
        '<div style="font-size:13px;color:#999">'+(isAdmin?'Har bir ishchiga KPI maqsad belgilang':'Admin maqsad belgilaydi')+'</div>'+
      '</div>';
    return;
  }

  var html=addBtn;

  if(isAdmin){
    var sellers=D.sellers.filter(function(s){return s.login&&s.role;});
    sellers.forEach(function(sel){
      var selGoals=myGoals.filter(function(g){return String(g.sid)===String(sel.id);});
      if(!selGoals.length) return;
      html+='<div style="font-size:12px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.06em;margin:12px 0 6px">'+sel.name+'</div>';
      html+=selGoals.map(function(g){return renderKpiCard(g,true);}).join('');
    });
  } else {
    html+=myGoals.map(function(g){return renderKpiCard(g,false);}).join('');
  }

  el.innerHTML=html;
}

function openAddKpi(){
  _kpiEdit=null;
  var m=document.getElementById('kpiModalW');if(!m)return;
  document.getElementById('kpiModalTitle').textContent='+ Maqsad qo\'shish';
  document.getElementById('kpiTitle').value='';
  document.getElementById('kpiTarget').value='';
  document.getElementById('kpiUnit').value='ta';
  document.getElementById('kpiPeriod').value='Oylik';
  document.getElementById('kpiAutoType').value='manual';
  var sel=document.getElementById('kpiSeller');
  var sellers=(D.sellers||[]).filter(function(s){return s.login&&s.role&&s.role!=='admin';});
  sel.innerHTML=sellers.map(function(s){
    var roleNames={sotuvchi:'Sotuvchi',targetolog:'Targetolog',mobilograf:'Mobilograf',omborchi:'Omborchi',yetkazuvchi:'Yetkazuvchi'};
    return '<option value="'+s.id+'">'+s.name+' — '+(roleNames[s.role]||s.role)+'</option>';
  }).join('');
  m.style.display='flex';
}

function setKpiPeriod(val){
  document.getElementById('kpiPeriod').value=val;
}

function openEditKpi(id){
  var goal=(D.kpiGoals||[]).find(function(g){return g.id===id;});
  if(!goal) return;
  _kpiEdit=id;
  document.getElementById('kpiModalTitle').textContent='Maqsadni tahrirlash';
  document.getElementById('kpiTitle').value=goal.title||'';
  document.getElementById('kpiTarget').value=goal.target||'';
  document.getElementById('kpiUnit').value=goal.unit||'ta';
  document.getElementById('kpiPeriod').value=goal.period||'Oylik';
  document.getElementById('kpiAutoType').value=goal.autoType||'manual';
  var manualRow=document.getElementById('kpiManualRow');
  if(manualRow) manualRow.style.display=goal.autoType==='manual'?'block':'none';
  var sel=document.getElementById('kpiSeller');
  var sellers=D.sellers.filter(function(s){return s.login&&s.role;});
  sel.innerHTML=sellers.map(function(s){return '<option value="'+s.id+'"'+(String(s.id)===String(goal.sid)?' selected':'')+'>'+s.name+' ('+s.role+')</option>';}).join('');
  var _m=document.getElementById('kpiModalW');if(_m)_m.style.display='flex';
}

function onKpiAutoTypeChange(val){
  var manualRow=document.getElementById('kpiManualRow');
  if(manualRow) manualRow.style.display=val==='manual'?'block':'none';
  var unitMap={sotuv_soni:'ta',sotuv_daromad:'so\'m',dm_soni:'ta',manual:''};
  if(unitMap[val]) document.getElementById('kpiUnit').value=unitMap[val];
}

function saveKpi(){
  var title=document.getElementById('kpiTitle').value.trim();
  var target=Number(document.getElementById('kpiTarget').value);
  var unit=document.getElementById('kpiUnit').value;
  var period=document.getElementById('kpiPeriod').value;
  var autoType=document.getElementById('kpiAutoType').value;
  var sid=document.getElementById('kpiSeller').value;
  if(!title||!target||!sid){showToast('Barcha maydonlarni to\'ldiring');return;}
  if(_kpiEdit){
    var idx=(D.kpiGoals||[]).findIndex(function(g){return g.id===_kpiEdit;});
    if(idx>=0){D.kpiGoals[idx]=Object.assign(D.kpiGoals[idx],{title,target,unit,period,autoType,sid});}
  } else {
    D.kpiGoals=D.kpiGoals||[];
    D.kpiGoals.push({id:'k'+Date.now(),sid,title,target,unit,period,autoType,manualValue:0,createdAt:today()});
  }
  window.FS&&window.FS.saveKpiGoals&&window.FS.saveKpiGoals(D.kpiGoals);
  closeKpiModal();
  renderKPI();
  showToast('Saqlandi!');
}

function deleteKpi(id){
  if(!confirm('Bu maqsadni o\'chirishni tasdiqlaysizmi?')) return;
  D.kpiGoals=(D.kpiGoals||[]).filter(function(g){return g.id!==id;});
  window.FS&&window.FS.saveKpiGoals&&window.FS.saveKpiGoals(D.kpiGoals);
  renderKPI();
  showToast('O\'chirildi!');
}

function updateKpiManual(id,val){
  var goal=(D.kpiGoals||[]).find(function(g){return g.id===id;});
  if(!goal) return;
  goal.manualValue=Number(val)||0;
  window.FS&&window.FS.saveKpiGoals&&window.FS.saveKpiGoals(D.kpiGoals);
  renderKPI();
}

function closeKpiModal(){
  var m=document.getElementById('kpiModalW');if(m)m.style.display='none';
}


// ===== TELEGRAM XABARNOMA =====
const TG_TOKEN = '7948798966:AAE-FSFuvAmW52abdq3wyISr-DkDn4LY_tg';
const TG_CHAT = '-5256487011';

async function sendTelegramNotification(sale){
  try{
    const p=gP(sale.pid);
    const sel=gS(sale.sid);
    const ig=gI(sale.igId);
    const cust=sale.customer||{};
    const payIcon=cust.payType==='cash'?'💵 Naqd':'💳 Karta';

    const text=
      '🛒 Yangi buyurtma!\n\n'
      +'👤 Sotuvchi: '+(sel?sel.name:'-')+'\n'
      +'📦 Mahsulot: '+(p?p.name:'-')+(cust.qty&&cust.qty>1?' ('+cust.qty+' ta)':'')+'\n'
      +'💰 Narx: '+(p?fmt(p.price)+' so\'m':'-')+'\n'
      +'📱 Instagram: '+(ig?ig.name:'-')+'\n\n'
      +'👤 Mijoz: '+(cust.name||'-')+'\n'
      +'📞 Telefon: '+(cust.phone||'-')+'\n'
      +'📍 Manzil: '+(cust.address||'-')+'\n'
      +payIcon+'\n'
      +(cust.note?'💬 Izoh: '+cust.note+'\n':'')
      +'🕐 Vaqt: '+sale.time+' | '+sale.date;

    const selImg=sale.selectedImg||p.img||'';
    const hasProdImg=selImg&&selImg.startsWith('http');
    const hasReceipt=!!sale.receiptUrl;

    await fetch('https://api.telegram.org/bot'+TG_TOKEN+'/sendMessage',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:TG_CHAT,text:text})
    });

    if(hasProdImg&&hasReceipt){
      await fetch('https://api.telegram.org/bot'+TG_TOKEN+'/sendMediaGroup',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:TG_CHAT,media:[
          {type:'photo',media:selImg,caption:'📦 Mahsulot rasmi'},
          {type:'photo',media:sale.receiptUrl,caption:'🧾 To\'lov cheki'}
        ]})
      });
    } else if(hasProdImg){
      await fetch('https://api.telegram.org/bot'+TG_TOKEN+'/sendPhoto',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:TG_CHAT,photo:selImg,caption:'📦 Mahsulot rasmi'})
      });
    } else if(hasReceipt){
      await fetch('https://api.telegram.org/bot'+TG_TOKEN+'/sendPhoto',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:TG_CHAT,photo:sale.receiptUrl,caption:'🧾 To\'lov cheki'})
      });
    }
  }catch(e){console.error('Telegram error:',e);}
}

function renderActiveAdsPanel(){
  const el=document.getElementById('activeAdsPanel');
  if(!el) return;
  const canEdit=D.user&&D.user.role==='targetolog';
  if(!canEdit){el.style.display='none';return;}
  el.style.display='block';

  const adList=D.activeAds.map(a=>{
    const p=gP(a.prodId);
    const ig=gI(a.igId);
    if(!p||!ig) return '';
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:0.5px solid #f0f0ec">'
      +(p.img?'<img src="'+p.img+'" style="width:36px;height:36px;border-radius:6px;object-fit:contain;background:#f8f8f6;flex-shrink:0">':'<div style="width:36px;height:36px;border-radius:6px;background:#f5f5f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">📦</div>')
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:14px;font-weight:600;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+p.name+'</div>'
      +'<div style="font-size:12px;color:#5b21b6">'+ig.name+'</div>'
      +'</div>'
      +'<button onclick="removeActiveAd(this.dataset.p,this.dataset.i)" data-p="'+a.prodId+'" data-i="'+a.igId+'" style="background:#FEE2E2;color:#dc2626;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap">Olib tashlash</button>'
      +'</div>';
  }).filter(Boolean).join('');

  el.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #f0f0ec">'
    +'<div style="font-size:13px;font-weight:700;color:#1a1a1a">🎯 Reklamadagi mahsulotlar</div>'
    +'<button onclick="openAddActiveAd()" style="background:#185FA5;color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Qo\'shish</button>'
    +'</div>'
    +(adList||'<div style="padding:12px 14px;font-size:13px;color:#999">Hozircha reklama yo\'q. Mahsulot qo\'shing.</div>');
}

function openAddActiveAd(){
  const igOpts=D.ig.map(ig=>'<option value="'+ig.id+'">'+ig.name+'</option>').join('');
  const body='<div class="fg"><label class="fl">Instagram profil</label>'
    +'<select class="inp" id="adIgSel" onchange="renderAdProdList()" style="background:white;border-radius:10px">'+igOpts+'</select></div>'
    +'<div class="fg"><label class="fl">Mahsulot tanlang</label>'
    +'<div id="adProdList" style="max-height:280px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:10px;background:white"></div>'
    +'<input type="hidden" id="adProdSel">'
    +'</div>';
  document.getElementById('addAdBody').innerHTML=body;
  renderAdProdList();
  document.getElementById('addAdW').classList.add('show');
}

function renderAdProdList(){
  const igId=parseInt(document.getElementById('adIgSel')?.value);
  const prods=D.products.filter(p=>p.igId===igId);
  const selected=document.getElementById('adProdSel')?.value;
  const el=document.getElementById('adProdList');
  if(!el) return;
  if(!prods.length){el.innerHTML='<div style="padding:14px;font-size:13px;color:#999;text-align:center">Bu Instagram da mahsulot yo\'q</div>';return;}
  el.innerHTML=prods.map(p=>{
    const isSelected=String(p.id)===String(selected);
    const isAdded=D.activeAds.some(a=>Number(a.prodId)===p.id&&Number(a.igId)===igId);
    return '<div onclick="selectAdProd('+p.id+')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:0.5px solid #f5f5f3;cursor:pointer;background:'+(isSelected?'#EFF6FF':'white')+';transition:background .15s">'
      +(p.img?'<img src="'+p.img+'" onclick="event.stopPropagation();showFullReceipt(this.src)" style="width:40px;height:40px;border-radius:8px;object-fit:contain;background:#f8f8f6;flex-shrink:0;cursor:zoom-in">':'<div style="width:40px;height:40px;border-radius:8px;background:#f5f5f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px">📦</div>')
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:14px;font-weight:600;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+p.name+'</div>'
      +'<div style="font-size:12px;color:#185FA5">'+fmt(p.price)+' so\'m</div>'
      +'</div>'
      +(isSelected?'<div style="width:22px;height:22px;border-radius:50%;background:#185FA5;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>':'')
      +(isAdded&&!isSelected?'<span style="font-size:11px;color:#888;background:#f0f0ec;padding:2px 6px;border-radius:6px">Qo\'shilgan</span>':'')
      +'</div>';
  }).join('');
}

function selectAdProd(prodId){
  document.getElementById('adProdSel').value=prodId;
  renderAdProdList();
}

function saveActiveAd(){
  const igId=parseInt(document.getElementById('adIgSel')?.value);
  const prodId=parseInt(document.getElementById('adProdSel')?.value);
  if(!igId||!prodId){showToast('Mahsulot tanlang!');return;}
  const exists=D.activeAds.some(a=>Number(a.prodId)===prodId&&Number(a.igId)===igId);
  if(exists){showToast('Allaqachon qo\'shilgan!');return;}
  D.activeAds.push({prodId,igId});
  saveActiveAdsSettings();
  document.getElementById('addAdW').classList.remove('show');
  renderTahlil();
  showToast('Qo\'shildi!');
}

function removeActiveAd(prodId,igId){
  const p=gP(prodId);const ig=gI(igId);
  openDelConf(
    "Reklamadan olib tashlash",
    (p?p.name:'Mahsulot')+' - '+(ig?ig.name:'')+' reklamadan olib tashlansinmi?',
    ()=>{
      D.activeAds=D.activeAds.filter(a=>!(String(a.prodId)===String(prodId)&&String(a.igId)===String(igId)));
      saveActiveAdsSettings();
      renderTahlil();
      showToast('Olib tashlandi!');
    }
  );
}

function saveActiveAdsSettings(){
  if(window.FS) window.FS.saveSettings({
    admin:D.admin,nUid:D.nUid,nPid:D.nPid,nSid:D.nSid,nIgId:D.nIgId,
    bonusConfig:D.bonusConfig,igDailyDM:D.igDailyDM,tahlilData:TA,
    expenses:D.expenses,activeAds:D.activeAds,kpiGoals:D.kpiGoals||[]
  });
}
function dedupSellers(){
  const seen=new Set();
  D.sellers=D.sellers.filter(s=>{const k=s.login||String(s.id);if(seen.has(k))return false;seen.add(k);return true;});
}

// ===== XARAJATLAR =====
let eEditId=null;

function updateExpDate(){
  const d=document.getElementById('expDay').value;
  const m=document.getElementById('expMonth').value;
  const y=document.getElementById('expYear').value;
  if(d&&m&&y){
    const dd=String(d).padStart(2,'0');
    const mm=String(m).padStart(2,'0');
    document.getElementById('expDate').value=y+'-'+mm+'-'+dd;
  }
}

function openAddExpense(){
  eEditId=null;
  document.getElementById('expenseTitle').textContent='Xarajat qo\'shish';
  document.getElementById('expName').value='';
  document.getElementById('expAmount').value='';
  const td=today().split('-');
  document.getElementById('expDay').value=parseInt(td[2]);
  document.getElementById('expMonth').value=parseInt(td[1]);
  document.getElementById('expYear').value=td[0];
  document.getElementById('expDate').value=today();
  document.getElementById('expErr').style.display='none';
  document.getElementById('expenseW').classList.add('show');
}

function openEditExpense(id){
  const exp=D.expenses.find(e=>e.id===id);
  if(!exp) return;
  eEditId=id;
  document.getElementById('expenseTitle').textContent='Xarajatni tahrirlash';
  document.getElementById('expName').value=exp.name||'';
  document.getElementById('expAmount').value=exp.amount||'';
  const sd=(exp.startDate||today()).split('-');
  document.getElementById('expDay').value=parseInt(sd[2]);
  document.getElementById('expMonth').value=parseInt(sd[1]);
  document.getElementById('expYear').value=sd[0];
  document.getElementById('expDate').value=exp.startDate||today();
  document.getElementById('expErr').style.display='none';
  document.getElementById('expenseW').classList.add('show');
}

function saveExpense(){
  const name=document.getElementById('expName').value.trim();
  const amount=parseInt(document.getElementById('expAmount').value)||0;
  const startDate=document.getElementById('expDate').value||today();
  if(!name||!amount){document.getElementById('expErr').style.display='block';return;}
  document.getElementById('expErr').style.display='none';
  if(eEditId!==null){
    const exp=D.expenses.find(e=>e.id===eEditId);
    if(exp){exp.name=name;exp.amount=amount;exp.startDate=startDate;}
  } else {
    D.expenses.push({id:Date.now(),name,amount,startDate});
  }
  if(window.FS) window.FS.saveSettings({
    admin:D.admin,nUid:D.nUid,nPid:D.nPid,nSid:D.nSid,nIgId:D.nIgId,
    bonusConfig:D.bonusConfig,igDailyDM:D.igDailyDM,tahlilData:TA,expenses:D.expenses,activeAds:D.activeAds,kpiGoals:D.kpiGoals||[]
  });
  closeSh('expenseW');
  renderExpenses();
  showToast('Xarajat saqlandi!');
}

function delExpense(id){
  openDelConf('Xarajatni o\'chirish','Bu xarajatni o\'chirasizmi?',()=>{
    D.expenses=D.expenses.filter(e=>e.id!==id);
    if(window.FS) window.FS.saveSettings({
      admin:D.admin,nUid:D.nUid,nPid:D.nPid,nSid:D.nSid,nIgId:D.nIgId,
      bonusConfig:D.bonusConfig,igDailyDM:D.igDailyDM,tahlilData:TA,expenses:D.expenses,activeAds:D.activeAds
    });
    renderExpenses();
    showToast('O\'chirildi!');
  });
}

function renderExpenses(){
  const el=document.getElementById('expenseList');
  if(!el) return;
  if(!D.expenses||!D.expenses.length){
    el.innerHTML='<div style="font-size:13px;color:#999;text-align:center;padding:8px">Xarajat yo\'q</div>';
    return;
  }
  el.innerHTML=D.expenses.map(exp=>{
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid #f0f0ec">'
      +'<div><div style="font-size:14px;font-weight:600;color:#1a1a1a">'+exp.name+'</div>'
      +'<div style="font-size:12px;color:#888">Oylik: '+fmt(exp.amount)+' so\'m • '+exp.startDate+' dan</div></div>'
      +'<div style="display:flex;gap:6px">'
      +'<button onclick="openEditExpense('+exp.id+')" style="background:#EDE9FE;color:#5b21b6;border:none;border-radius:6px;padding:5px 10px;font-size:13px;cursor:pointer;font-family:inherit">Tahrir</button>'
      +'<button onclick="delExpense('+exp.id+')" style="background:#FEE2E2;color:#dc2626;border:none;border-radius:6px;padding:5px 10px;font-size:13px;cursor:pointer;font-family:inherit">O\'chirish</button>'
      +'</div></div>';
  }).join('');
}

// ===== SOF FOYDA =====

let SF_CAL={year:0,month:0,from:null,to:null};

function openSFRange(){
  const now=new Date();
  SF_CAL={year:now.getFullYear(),month:now.getMonth(),from:SF_filter.from||null,to:SF_filter.to||null};
  document.getElementById('sfRangeErr').style.display='none';
  updateSFCalDisp();renderSFCal();
  document.getElementById('sfRangeW').style.display='flex';
}
function closeSFRange(){document.getElementById('sfRangeW').style.display='none';}
function sfCalPrev(){SF_CAL.month--;if(SF_CAL.month<0){SF_CAL.month=11;SF_CAL.year--;}renderSFCal();}
function sfCalNext(){SF_CAL.month++;if(SF_CAL.month>11){SF_CAL.month=0;SF_CAL.year++;}renderSFCal();}
function renderSFCal(){
  document.getElementById('sfCalLabel').textContent=MONTHS[SF_CAL.month]+' '+SF_CAL.year;
  const first=new Date(SF_CAL.year,SF_CAL.month,1).getDay();
  const days=new Date(SF_CAL.year,SF_CAL.month+1,0).getDate();
  let cells='';
  for(let i=0;i<first;i++) cells+='<div></div>';
  for(let d=1;d<=days;d++){
    const ds=SF_CAL.year+'-'+String(SF_CAL.month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const isF=SF_CAL.from===ds,isT=SF_CAL.to===ds;
    const inR=SF_CAL.from&&SF_CAL.to&&ds>SF_CAL.from&&ds<SF_CAL.to;
    let bg='transparent',col='#1a1a1a',fw='400',br='50%';
    if(isF||isT){bg='#185FA5';col='#fff';fw='700';}
    else if(inR){bg='#DBEAFE';br='0';}
    cells+=`<div onclick="sfCalClick('${ds}')" style="cursor:pointer;padding:7px 2px;border-radius:${br};background:${bg};color:${col};font-weight:${fw};font-size:13px">${d}</div>`;
  }
  document.getElementById('sfCalGrid').innerHTML=cells;
  document.getElementById('sfRangeHint').textContent=SF_CAL.from&&!SF_CAL.to?'Tugash sanasini tanlang':'Boshlangich sanani tanlang';
}
function sfCalClick(ds){
  if(!SF_CAL.from||SF_CAL.to){SF_CAL.from=ds;SF_CAL.to=null;}
  else if(ds<SF_CAL.from){SF_CAL.to=SF_CAL.from;SF_CAL.from=ds;}
  else{SF_CAL.to=ds;}
  updateSFCalDisp();renderSFCal();
}
function updateSFCalDisp(){
  const f=d=>d?d.split('-').reverse().join('.'):'—';
  document.getElementById('sfFromDisp').textContent=f(SF_CAL.from);
  document.getElementById('sfToDisp').textContent=f(SF_CAL.to);
}
function applySFRangeCalendar(){
  if(!SF_CAL.from||!SF_CAL.to){document.getElementById('sfRangeErr').style.display='block';return;}
  document.getElementById('sfRangeErr').style.display='none';
  SF_filter={mode:'range',from:SF_CAL.from,to:SF_CAL.to};
  closeSFRange();
  renderSofFoyda();
}
function setSFFilter(mode,el){
  document.querySelectorAll('.sf-filter-btn').forEach(b=>b.classList.remove('on'));
  if(el) el.classList.add('on');
  if(mode==='range'){
    SF_filter.mode='range';
    openSFRange();
    return;
  }
  SF_filter={mode,from:'',to:''};
  renderSofFoyda();
}
function sfFilterSales(sales){
  const td=today();
  if(SF_filter.mode==='today') return sales.filter(s=>s.date===td);
  if(SF_filter.mode==='range') return sales.filter(s=>s.date>=SF_filter.from&&s.date<=SF_filter.to);
  return sales;
}
function getSellerDays(sel){
  if(!sel||!sel.startDate) return 30;
  const start=new Date(sel.startDate);
  const now=new Date();
  const days=Math.floor((now-start)/(1000*60*60*24))+1;
  return Math.min(days,30);
}
function renderSofFoyda(){
  const sales=sfFilterSales(D.sales);

  // Daromad
  const revenue=rv(sales);

  // Davr matni
  let periodText='';
  if(SF_filter.mode==='today') periodText='BUGUN — '+today();
  else if(SF_filter.mode==='range') periodText=SF_filter.from+' — '+SF_filter.to;
  else periodText='BARCHA VAQT';

  // Sotuvchi maoshlari (komissiya + asosiy maosh)
  const sellerSalary=D.sellers
    .filter(s=>s.role==='sotuvchi'||!s.role)
    .reduce((acc,s)=>{
      const selSales=sales.filter(sl=>sl.sid===s.id);
      const commission=(s.comm||0)*selSales.length;
      const days=getSellerDays(s);
      const baseSalary=(s.salary||0)*(days/30);
      return acc+commission+baseSalary;
    },0);

  // Targetolog maoshi
  const targetSel=D.sellers.find(s=>s.role==='targetolog');
  const targetSalary=targetSel?(targetSel.comm||0)*(getSellerDays(targetSel)/30):0;

  // Mobilograf maoshi
  const mobSel=D.sellers.find(s=>s.role==='mobilograf');
  const mobilografSalary=mobSel?(mobSel.comm||0)*(getSellerDays(mobSel)/30):0;

  // Omborchi maoshi
  const whSel=D.sellers.find(s=>s.role==='omborchi');
  const omborchiSalary=whSel?((whSel.salary||0)+(whSel.comm||0))*(getSellerDays(whSel)/30):0;

  // Reklama budjeti
  const adBudget=(D.activeAds||[]).reduce((acc,a)=>{
    const k=tahlilDateKey();
    const igD=TA.igData&&TA.igData[a.igId];
    if(!igD||!igD[k]) return acc;
    return acc+(igD[k].budgetSom||0);
  },0);

  // Maxsus xarajatlar
  const customExpTotal=(D.expenses||[]).reduce((acc,exp)=>{
    const days=getSellerDays({startDate:exp.startDate||today()});
    return acc+(exp.amount||0)*(days/30);
  },0);

  // Jami xarajat
  const totalExp=sellerSalary+targetSalary+mobilografSalary+omborchiSalary+adBudget+customExpTotal;
  const netProfit=revenue-totalExp;
  const margin=revenue>0?Math.round((netProfit/revenue)*100):0;

  // UI yangilash
  const sfPL=document.getElementById('sfPeriodLabel');
  if(sfPL) sfPL.textContent=periodText;

  const sfAm=document.getElementById('sfAmount');
  if(sfAm) sfAm.textContent=fmt(Math.abs(netProfit));

  const sfCur=document.getElementById('sfCurrency');
  if(sfCur) sfCur.textContent="so'm";

  const sfSub=document.getElementById('sfSubLabel');
  if(sfSub){
    sfSub.textContent=margin+'% foydalilik';
    sfSub.style.color=netProfit>=0?'#4ADE80':'#F87171';
  }

  const sfRvEl=document.getElementById('sfRev');
  if(sfRvEl) sfRvEl.textContent=fmt(revenue);

  const sfExpEl=document.getElementById('sfExp');
  if(sfExpEl) sfExpEl.textContent=fmt(totalExp);

  const isProfit=netProfit>=0;
  const sfNR=document.getElementById('sfNetRow');
  if(sfNR) sfNR.style.background=isProfit?'#F0FDF4':'#FEF2F2';

  const sfNL=document.getElementById('sfNetLabel');
  if(sfNL){sfNL.textContent=isProfit?'Sof foyda':'Zarar';sfNL.style.color=isProfit?'#15803D':'#DC2626';}

  const sfMP=document.getElementById('sfMarginPill');
  if(sfMP){sfMP.textContent=margin+'%';sfMP.style.background=isProfit?'#DCFCE7':'#FEE2E2';sfMP.style.color=isProfit?'#15803D':'#DC2626';}

  const sfNetEl=document.getElementById('sfNet');
  if(sfNetEl){sfNetEl.textContent=fmt(Math.abs(netProfit));sfNetEl.style.color=isProfit?'#15803D':'#DC2626';}

  const items=[
    {label:'Sotuvchi maoshlari',val:sellerSalary,color:'#EC4899',pct:totalExp>0?Math.round(sellerSalary/totalExp*100):0},
    {label:'Targetolog maoshi',val:targetSalary,color:'#8B5CF6',pct:totalExp>0?Math.round(targetSalary/totalExp*100):0},
    {label:'Mobilograf maoshi',val:mobilografSalary,color:'#EC4899',pct:totalExp>0?Math.round(mobilografSalary/totalExp*100):0},
    {label:'Omborchi maoshi',val:omborchiSalary,color:'#0EA5E9',pct:totalExp>0?Math.round(omborchiSalary/totalExp*100):0},
    {label:'Reklama (budjet)',val:adBudget,color:'#14B8A6',pct:totalExp>0?Math.round(adBudget/totalExp*100):0},
  ...(D.expenses||[]).map(exp=>{
    const expDays=getSellerDays({startDate:exp.startDate||today()});
    const expVal=(exp.amount||0)*(expDays/30);
    return {label:exp.name,val:expVal,color:'#F97316',pct:totalExp>0?Math.round(expVal/totalExp*100):0};
  }),
  ];
  document.getElementById('sfBreakdown').innerHTML=items.map(it=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid #f0f0ec">
      <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
        <div style="width:8px;height:8px;border-radius:50%;background:${it.color};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;color:#666">${it.label}</div>
          <div style="height:3px;background:#f0f0ec;border-radius:2px;margin-top:3px"><div style="height:3px;border-radius:2px;background:${it.color};width:${it.pct}%"></div></div>
        </div>
      </div>
      <div style="font-size:13px;font-weight:600;color:#dc2626;margin-left:10px;white-space:nowrap">-${fmt(it.val)}</div>
    </div>`).join('');
  renderExpenses();
}

function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500);}

buildHints();

window.addEventListener('resize',function(){
  const fb=document.getElementById('tabFilterBar');
  if(fb&&fb.style.display!=='none') _posFilterBar();
});
