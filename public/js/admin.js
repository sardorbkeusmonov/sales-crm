// ===== DAVOMAT (ADMIN SIDE) =====
let _davomatDate=today();
async function renderDavomat(){
  const el=document.getElementById('davomatContent');
  if(!el) return;
  el.innerHTML=`<div style="text-align:center;padding:24px;color:var(--c4)">Yuklanmoqda...</div>`;
  const att=await window.FS.loadAttendanceByDate(_davomatDate);
  const sellers=D.sellers.filter(s=>s.role==='sotuvchi'&&s.name);
  const cards=sellers.map(sel=>{
    const keldi=att.find(a=>String(a.sellerId)===String(sel.id)&&a.type==='keldi');
    const ketdi=att.find(a=>String(a.sellerId)===String(sel.id)&&a.type==='ketdi');
    const ROLE_LABELS={sotuvchi:'Sotuvchi',targetolog:'Targetolog',omborchi:'Omborchi',yetkazuvchi:'Yetkazuvchi'};
    const keldiHtml=keldi
      ?`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px">
          <span style="background:#DCFCE7;color:#16a34a;padding:3px 10px;border-radius:8px;font-size:13px;font-weight:700">&#10003; Keldi: ${keldi.time}</span>
          ${keldi.photoUrl?`<img src="${keldi.photoUrl}" onclick="this.style.width=this.style.width==='100%'?'80px':'100%'" style="width:80px;height:80px;object-fit:cover;border-radius:10px;cursor:pointer" onerror="this.style.display='none'">`:''}</div>`
      :`<div style="margin-top:8px"><span style="background:#FEF2F2;color:#dc2626;padding:3px 10px;border-radius:8px;font-size:13px;font-weight:700">&#10007; Kelmagan</span></div>`;
    const ketdiHtml=ketdi
      ?`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px">
          <span style="background:#FEF2F2;color:#dc2626;padding:3px 10px;border-radius:8px;font-size:13px;font-weight:700">&#10003; Ketdi: ${ketdi.time}</span>
          ${ketdi.photoUrl?`<img src="${ketdi.photoUrl}" onclick="this.style.width=this.style.width==='100%'?'80px':'100%'" style="width:80px;height:80px;object-fit:cover;border-radius:10px;cursor:pointer" onerror="this.style.display='none'">`:''}</div>`
      :(keldi?`<div style="margin-top:6px"><span style="background:#FEF3C7;color:#92400e;padding:3px 10px;border-radius:8px;font-size:13px;font-weight:700">&#8212; Hali ketmagan</span></div>`:'');
    return`<div style="background:var(--bg1);border-radius:14px;padding:14px;border:0.5px solid var(--bd);margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="av" style="${avSt(sel.ai||0)};width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;flex-shrink:0">${ini(sel.name)}</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--c1)">${sel.name}</div>
          <div style="font-size:12px;color:var(--c4)">${ROLE_LABELS[sel.role]||sel.role||''}</div>
        </div>
      </div>
      ${keldiHtml}${ketdiHtml}
    </div>`;
  }).join('');
  const datePick=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
    <input type="date" class="inp" id="davomatDateInp" value="${_davomatDate}" style="flex:1;padding:8px 10px;font-size:14px" onchange="_davomatDate=this.value;renderDavomat()">
  </div>`;
  const keldCount=sellers.filter(sel=>att.find(a=>String(a.sellerId)===String(sel.id)&&a.type==='keldi')).length;
  const summary=`<div style="display:flex;gap:8px;margin-bottom:12px">
    <div style="flex:1;background:#DCFCE7;border-radius:10px;padding:10px;text-align:center">
      <div style="font-size:20px;font-weight:800;color:#16a34a">${keldCount}</div>
      <div style="font-size:12px;color:#16a34a">Keldi</div>
    </div>
    <div style="flex:1;background:#FEF2F2;border-radius:10px;padding:10px;text-align:center">
      <div style="font-size:20px;font-weight:800;color:#dc2626">${sellers.length-keldCount}</div>
      <div style="font-size:12px;color:#dc2626">Kelmagan</div>
    </div>
    <div style="flex:1;background:var(--bg2);border-radius:10px;padding:10px;text-align:center">
      <div style="font-size:20px;font-weight:800;color:var(--c1)">${sellers.length}</div>
      <div style="font-size:12px;color:var(--c4)">Jami</div>
    </div>
  </div>`;
  el.innerHTML=datePick+summary+cards;
}

function renderProdAdm(){
  const searchEl=document.getElementById('prodAdmSearch');
  const q=searchEl?searchEl.value.trim().toLowerCase():'';
  const allProds=q?D.products.filter(p=>p.name.toLowerCase().includes(q)):D.products;
  const _PAGE=20,_page=window._prodAdmPage||1,_total=allProds.length,_start=(_page-1)*_PAGE;
  const prods=allProds.slice(_start,_start+_PAGE);
  const _h=_total?'<div style="font-size:13px;font-weight:700;color:var(--c5);padding:8px 4px 6px">Mahsulotlar '+(_start+1)+'–'+Math.min(_start+_PAGE,_total)+' / '+_total+'</div>':'';
  let _pagin='';
  if(Math.ceil(_total/_PAGE)>1){const _tp=Math.ceil(_total/_PAGE);let _bt='';for(let i=1;i<=_tp;i++){const on=i===_page;_bt+='<button onclick="window._prodAdmPage='+i+';renderProdAdm()" style="min-width:34px;height:34px;border-radius:8px;border:'+(on?'2px solid var(--p)':'1px solid var(--bd)')+';background:'+(on?'var(--pbg)':'var(--bg1)')+';color:'+(on?'var(--p)':'var(--c2)')+';font-size:14px;cursor:pointer;font-family:inherit">'+i+'</button>';}_pagin='<div style="padding:14px 0;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><button onclick="if(window._prodAdmPage>1){window._prodAdmPage--;renderProdAdm()}" '+(_page===1?'disabled':'')+' style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;opacity:'+(_page===1?'.4':'1')+'">&#8249;</button>'+_bt+'<button onclick="if(window._prodAdmPage<'+_tp+'){window._prodAdmPage++;renderProdAdm()}" '+(_page===_tp?'disabled':'')+' style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;opacity:'+(_page===_tp?'.4':'1')+'">&#8250;</button></div>';}
  const _prodHtml=prods.map(p=>{
    const tot=D.sales.filter(s=>s.pid===p.id).length;
    const left=getStockLeft(p);
    const status=getStockStatus(left);
    const stockBadge=left===null?'':left===0
      ?'<div style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:700;background:#FEE2E2;color:#991b1b;margin-bottom:3px">Tugagan</div>'
      :left<=2
      ?'<div style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:700;background:#FEF3C7;color:#92400e;margin-bottom:3px">'+left+' ta qoldi</div>'
      :'<div style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:700;background:#DCFCE7;color:#14532d;margin-bottom:3px">'+left+' ta bor</div>';
    const ih=p.img?`<img src="${p.img}" class="pi">`:`<div class="pib"><div class="pib-inner"><div style="width:60px;height:60px;border-radius:14px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:24px">&#128230;</div></div></div>`;
    return`<div class="pc" style="display:flex;flex-direction:row;align-items:stretch">
  <div style="width:110px;flex-shrink:0;background:var(--bg3);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;border-radius:12px 0 0 12px;position:relative" onclick="showProdImg(${p.id})" style="cursor:pointer">
    ${(()=>{const imgs=p.imgs&&p.imgs.length?p.imgs:(p.img?[p.img]:[]);if(!imgs.length) return '<div style="width:60px;height:60px;border-radius:10px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:24px">&#128230;</div>';return '<img src="'+imgs[0]+'" style="width:110px;height:110px;object-fit:contain;padding:8px">'+(imgs.length>1?'<div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,.5);color:white;font-size:10px;padding:2px 5px;border-radius:6px">+'+imgs.length+'</div>':'');})()}
  </div>
  <div style="flex:1;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;min-width:0">
    <div>
      <div style="font-size:14px;font-weight:700;margin-bottom:3px">${p.name}</div>${stockBadge}
      <div style="font-size:14px;color:#5b21b6;font-weight:600;margin-bottom:3px">${gI(p.igId)?gI(p.igId).name:'Instagram biriktirilmagan'}</div>
      <div style="font-size:13px;color:#185FA5;font-weight:600;margin-bottom:2px">${fmt(p.price)} so'm</div>
      <div style="font-size:14px;color:var(--c4)">Sotildi: ${tot} ta</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn" style="flex:1;padding:8px;font-size:15px" onclick="openEditProd(${p.id})">Tahrirlash</button>
      <button class="btn btnd" style="flex:1;padding:8px;font-size:15px" onclick="delProd(${p.id})">O'chirish</button>
    </div>
  </div>
</div>`;
  }).join('');
  document.getElementById('prodAdm').innerHTML=_h+_prodHtml+_pagin;
}

// --- SELLERS ---
function renderSellers(){
  // D.sellers dedup by login
  const _seen=new Set();
  D.sellers=D.sellers.filter(s=>{if(!s.login||!_seen.has(s.login)){_seen.add(s.login);return true;}return false;});
  renderExpenses();
  const BC=D.bonusConfig||{bonusConv:21,bonusAmt:30000,fineConv:10,fineAmt:20000};
  const bci=document.getElementById('bonusConvInp');
  const bai=document.getElementById('bonusAmtInp');
  const fci=document.getElementById('fineConvInp');
  const fai=document.getElementById('fineAmtInp');
  if(bci) bci.value=BC.bonusConv||21;
  if(bai) bai.value=BC.bonusAmt||30000;
  if(fci) fci.value=BC.fineConv||10;
  if(fai) fai.value=BC.fineAmt||20000;
  const ROLE_COLORS={sotuvchi:'#DBEAFE|#1e40af',targetolog:'#EDE9FE|#5b21b6',mobilograf:'#FCE7F3|#9d174d',omborchi:'#D1FAE5|#065f46',yetkazuvchi:'#FEF3C7|#92400e'};
  const ROLE_LABELS={sotuvchi:'Sotuvchi',targetolog:'Targetolog',mobilograf:'Mobilograf',omborchi:'Omborchi',yetkazuvchi:'Yetkazuvchi'};
  function rb(role){const[bg,c]=(ROLE_COLORS[role]||'#F1F5F9|#475569').split('|');return`<span style="background:${bg};color:${c};font-size:13px;padding:2px 8px;border-radius:10px;font-weight:600">${ROLE_LABELS[role]||role}</span>`;}
  document.getElementById('sellerAdm').innerHTML=D.sellers.map(sel=>{
    const ig=gI(sel.igId);
    const tot=D.sales.filter(s=>s.sid===sel.id).length;
    const isTarj=sel.role==='targetolog'||sel.role==='mobilograf';
    return`<div class="sc-card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div class="av" style="${avSt(sel.ai)}">${ini(sel.name)}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <div style="font-size:14px;font-weight:600">${sel.name}</div>
            ${rb(sel.role||'sotuvchi')}
          </div>
          <div style="font-size:15px;color:var(--c4)">@${sel.login}${!isTarj&&ig?' - <span style="color:#5b21b6">'+ig.name+'</span>':''}</div>
        </div>
        <div style="font-size:13px;color:var(--c4);white-space:nowrap">${isTarj?(sel.comm?fmt(sel.comm)+" so'm/oy":'Targetolog'):(sel.salary?fmt(sel.salary)+" so'm/oy + ":'')+tot+' sotuv'}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;padding:9px" onclick="openEditSeller(${sel.id})">Tahrirlash</button>
        <button class="btn btnd" style="flex:1;padding:9px" onclick="delSeller(${sel.id})">O'chirish</button>
      </div>
    </div>`;
  }).join('')||"<div style='font-size:13px;color:var(--c5)'>Ishchi yo\u02bcq</div>";
}
function renderIgAdm(){
  document.getElementById('igAdm').innerHTML=D.ig.map(ig=>{
    const sels=D.sellers.filter(s=>s.igId===ig.id);
    const tot=D.sales.filter(s=>sels.find(x=>x.id===s.sid)).length;
    return`<div class="sc-card"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="width:40px;height:40px;border-radius:50%;background:#f5f5f5;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ig_g" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FFDC80"/>
      <stop offset="25%" style="stop-color:#FCAF45"/>
      <stop offset="50%" style="stop-color:#F77737"/>
      <stop offset="75%" style="stop-color:#C13584"/>
      <stop offset="100%" style="stop-color:#833AB4"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="24" height="24" rx="6" fill="url(#ig_g)"/>
  <circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="1.8"/>
  <circle cx="17" cy="7" r="1.2" fill="#fff"/>
</svg></div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#5b21b6">${ig.name}</div><div style="font-size:15px;color:var(--c4)">${sels.map(s=>s.name).join(', ')||'Sotuvchi biriktirilmagan'}</div></div><div style="font-size:13px;color:var(--c4);white-space:nowrap">${tot} sotuv</div></div><div style="display:flex;gap:8px"><button class="btn" style="flex:1;padding:9px" onclick="openEditIg(${ig.id})">Nomini o\'zgartir</button><button class="btn btnd" style="flex:1;padding:9px" onclick="delIg(${ig.id})">O\'chirish</button></div></div>`;
  }).join('')||'<div style="font-size:13px;color:var(--c5)">Instagram profil yo\'q</div>';
}

// --- CRUD: IG ---
function fillIg(selectedId){document.getElementById('sIg').innerHTML='<option value="">- Tanlang -</option>'+D.ig.map(ig=>`<option value="${ig.id}"${ig.id===selectedId?' selected':''}>${ig.name}</option>`).join('');}
function openAddIg(){D.eIgId=null;document.getElementById('igShT').textContent="Instagram profil qo'shish";document.getElementById('igNm').value='';document.getElementById('igErr').style.display='none';document.getElementById('igSh').classList.add('show');}
function openEditIg(id){const ig=gI(id);if(!ig)return;D.eIgId=id;document.getElementById('igShT').textContent="Instagram nomini ozgartirish";document.getElementById('igNm').value=ig.name;document.getElementById('igErr').style.display='none';document.getElementById('igSh').classList.add('show');}

window.saveIg = function(){let name=document.getElementById('igNm').value.trim();if(!name){document.getElementById('igErr').style.display='block';return;}if(!name.startsWith('@'))name='@'+name;if(D.eIgId){const ig=gI(D.eIgId);if(ig)ig.name=name;}else{D.ig.push({id:D.nIgId++,name});}if(window.FS){const saved=D.eIgId?gI(D.eIgId):D.ig[D.ig.length-1];window.FS.saveIg(saved);}closeSh('igSh');renderIgAdm();}
function delIg(id){openDelConf("Instagram profilni o'chirish","Bu profilni o'chirasizmi? Biriktirilgan sotuvchilardan profil olib tashlanadi.",()=>{const ig=gI(id);D.ig=D.ig.filter(x=>x.id!==id);D.sellers.forEach(s=>{if(s.igId===id)s.igId=null;});if(window.FS&&ig&&ig._id)window.FS.deleteIg(ig._id);renderIgAdm();renderSellers();});}

// --- CRUD: SELLER ---

function updateStartDate(){
  const d=document.getElementById('sStartDay').value;
  const m=document.getElementById('sStartMonth').value;
  const y=document.getElementById('sStartYear').value;
  if(d&&m&&y){
    const dd=String(d).padStart(2,'0');
    const mm=String(m).padStart(2,'0');
    document.getElementById('sStartDate').value=y+'-'+mm+'-'+dd;
  }
}
function onRoleChange(){
  const role=document.getElementById('sRole').value;
  const lbl=document.getElementById('commLabel');
  const fg=document.getElementById('commFg');
  const sfg=document.getElementById('salaryFg');
  if(lbl&&fg){
    if(role==='targetolog'||role==='mobilograf'){
      lbl.textContent="Oylik maosh (so'm)";
      document.getElementById('sComm').placeholder="Masalan: 500000";
      fg.style.display='';
      if(sfg) sfg.style.display='none';
      const sdf=document.getElementById('startDateFg');if(sdf)sdf.style.display='';
      const _lgFg=document.getElementById('loginFg');const _psFg=document.getElementById('passFg');
      if(_lgFg)_lgFg.style.display='';if(_psFg)_psFg.style.display='';
    } else if(role==='sotuvchi'){
      lbl.textContent="1 sotuv uchun haq (so'm)";
      document.getElementById('sComm').placeholder="Masalan: 10000";
      fg.style.display='';
      if(sfg) sfg.style.display='';
      const sdfS=document.getElementById('startDateFg');if(sdfS)sdfS.style.display='none';
      const _lgFgS=document.getElementById('loginFg');const _psFgS=document.getElementById('passFg');
      if(_lgFgS)_lgFgS.style.display='';if(_psFgS)_psFgS.style.display='';
    } else if(role==='omborchi'||role==='yetkazuvchi'){
      fg.style.display='none';
      if(sfg) sfg.style.display='';
      const sdfO=document.getElementById('startDateFg');if(sdfO)sdfO.style.display='';
      const _lgFgO=document.getElementById('loginFg');const _psFgO=document.getElementById('passFg');
      if(_lgFgO)_lgFgO.style.display='';if(_psFgO)_psFgO.style.display='';
    } else {
      fg.style.display='none';
      if(sfg) sfg.style.display='none';
    }
  }
  document.getElementById('igField').style.display=(role==='sotuvchi')?'block':'none';
}
function openAddSeller(){
  D.eSid=null;
  document.getElementById('selShT').textContent="Ishchi qo'shish";
  ['sNm','sLg','sPw'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('sComm').value='10000';document.getElementById('sSalary').value='1000000';document.getElementById('sRole').value='sotuvchi';const _td=today().split('-');
  const sdY=document.getElementById('sStartYear');
  const sdM=document.getElementById('sStartMonth');
  const sdD=document.getElementById('sStartDay');
  if(sdY)sdY.value=_td[0];
  if(sdM)sdM.value=parseInt(_td[1]);
  if(sdD)sdD.value=parseInt(_td[2]);
  document.getElementById('sStartDate').value=today();onRoleChange();
  document.getElementById('sRole').value='sotuvchi';
  document.getElementById('igField').style.display='block';
  fillIg(null);
  document.getElementById('selErr').style.display='none';
  document.getElementById('selSh').classList.add('show');
}
function openEditSeller(id){
  const sel=gS(id);if(!sel)return;D.eSid=id;
  document.getElementById('selShT').textContent="Ishchini tahrirlash";
  document.getElementById('sNm').value=sel.name;
  document.getElementById('sLg').value=sel.login;
  document.getElementById('sPw').value=sel.pass;
  document.getElementById('sRole').value=sel.role||'sotuvchi';
  document.getElementById('sComm').value=sel.comm||(sel.role==='targetolog'?0:10000);
  document.getElementById('sSalary').value=sel.salary||0;
  const _sd=(sel.startDate||today()).split('-');
  const edY=document.getElementById('sStartYear');
  const edM=document.getElementById('sStartMonth');
  const edD=document.getElementById('sStartDay');
  if(edY)edY.value=_sd[0];
  if(edM)edM.value=parseInt(_sd[1]);
  if(edD)edD.value=parseInt(_sd[2]);
  document.getElementById('sStartDate').value=sel.startDate||today();
  onRoleChange();
  fillIg(sel.igId);
  document.getElementById('selErr').style.display='none';
  document.getElementById('selSh').classList.add('show');
}

window.saveSeller = function(){
  const name=document.getElementById('sNm').value.trim();
  const role=document.getElementById('sRole').value;
  const login=document.getElementById('sLg').value.trim();
  const pass=document.getElementById('sPw').value.trim();
  const igId=role==='targetolog'?null:(role==='sotuvchi'?(parseInt(document.getElementById('sIg').value)||null):null);
  const commVal=document.getElementById('sComm').value;
  const comm=role==='targetolog'?(parseInt(commVal)||0):(parseInt(commVal)||10000);
  const salary=(role==='sotuvchi'||role==='omborchi'||role==='yetkazuvchi')?(parseInt(document.getElementById('sSalary').value)||0):0;
  if(!name||!login||!pass){document.getElementById('selErr').style.display='block';return;}
  document.getElementById('selErr').style.display='none';
  if(D.eSid){const sel=gS(D.eSid);if(sel){sel.name=name;sel.login=login;sel.pass=pass;sel.igId=igId;sel.role=role;sel.comm=comm;sel.salary=salary;sel.startDate=document.getElementById('sStartDate').value||today();}}
  else{const sd=document.getElementById('sStartDate').value||today();
  D.sellers.push({id:D.nUid++,name,login,pass,igId,role,comm,salary,startDate:sd,ai:D.sellers.length%AVC.length});}
  if(window.FS) window.FS.saveSeller(D.eSid?gS(D.eSid):D.sellers[D.sellers.length-1]);
  closeSh('selSh');renderSellers();buildHints();

window.addEventListener('resize',function(){
  const fb=document.getElementById('tabFilterBar');
  if(fb&&fb.style.display!=='none') _posFilterBar();
});
}
function delSeller(id){openDelConf("O'chirishni tasdiqlang","Bu ishchini o\'chirasizmi? Sotuvlari ham o\'chadi.",()=>{const sel=gS(id);D.sellers=D.sellers.filter(s=>s.id!==id);D.sales.forEach(s=>{if(s.sid===id)s.sid=null;});if(window.FS&&sel&&sel._id)window.FS.deleteSeller(sel._id);renderSellers();buildHints();});}

// --- CRUD: PROD ---

let D_receiptImg = '';


function setPayType(type){
  document.getElementById('custPayType').value=type;
  const cardBtn=document.getElementById('payCardBtn');
  const cashBtn=document.getElementById('payCashBtn');
  if(type==='card'){
    cardBtn.style.borderColor='#185FA5';cardBtn.style.background='#EFF6FF';cardBtn.style.color='#185FA5';
    cashBtn.style.borderColor='#e5e7eb';cashBtn.style.background='white';cashBtn.style.color='#888';
  } else {
    cashBtn.style.borderColor='#16a34a';cashBtn.style.background='#F0FDF4';cashBtn.style.color='#16a34a';
    cardBtn.style.borderColor='#e5e7eb';cardBtn.style.background='white';cardBtn.style.color='#888';
    const errEl=document.getElementById('confReceiptErr');
    const areaEl=document.getElementById('receiptUploadArea');
    if(errEl) errEl.style.display='none';
    if(areaEl) areaEl.style.borderColor='#e5e7eb';
  }
}
function handleReceiptImg(inp){
  const f=inp.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      const MAX=800;
      let w=img.width, h=img.height;
      if(w>h){if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}}
      else{if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}}
      canvas.width=w; canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      D_receiptImg=canvas.toDataURL('image/jpeg',0.8);
      document.getElementById('receiptImg').src=D_receiptImg;
      document.getElementById('receiptPreview').style.display='block';
      document.getElementById('receiptPlaceholder').style.display='none';
      const errEl=document.getElementById('confReceiptErr');
      const areaEl=document.getElementById('receiptUploadArea');
      if(errEl) errEl.style.display='none';
      if(areaEl) areaEl.style.borderColor='#e5e7eb';
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(f);
}
function compressImg(file, cb){
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      const MAX=600;
      let w=img.width, h=img.height;
      if(w>h){if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}}
      else{if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}}
      canvas.width=w;canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      cb(canvas.toDataURL('image/jpeg',0.7));
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleImgMulti(inp){
  const files=[...inp.files];
  if(!files.length) return;
  files.forEach(f=>{
    compressImg(f, compressed=>{
      if(!D.imgList) D.imgList=[];
      D.imgList.push(compressed);
      renderImgPreviews();
    });
  });
  inp.value='';
}

function renderImgPreviews(){
  const el=document.getElementById('imgPreviewList');
  if(!el) return;
  el.innerHTML=(D.imgList||[]).map((url,i)=>
    '<div style="position:relative;flex-shrink:0">'
    +'<img src="'+url+'" style="width:72px;height:72px;border-radius:10px;object-fit:cover;border:1.5px solid #e5e7eb;cursor:pointer" onclick="showFullReceipt(this.src)">'
    +'<button onclick="removeImgAt('+i+')" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#dc2626;border:none;color:white;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;padding:0">×</button>'
    +'</div>'
  ).join('');
}

function removeImgAt(i){
  D.imgList.splice(i,1);
  renderImgPreviews();
}

function removeImg(){D.imgD='';D.imgList=[];document.getElementById('imgF').value='';renderImgPreviews();}

// Legacy - eski kod uchun
function handleImg(inp){handleImgMulti(inp);}
function fillProdIg(selId){
  const firstId=selId!=null?selId:(D.ig.length?D.ig[0].id:null);
  const hid=document.getElementById('pIgVal');
  if(hid) hid.value=firstId!=null?firstId:'';
  const btnText=document.getElementById('pIgBtnText');
  if(btnText){
    const sel=D.ig.find(ig=>ig.id==firstId);
    btnText.textContent=sel?sel.name:'Tanlang';
  }
  const drop=document.getElementById('pIgDrop');
  if(!drop) return;
  drop.innerHTML=D.ig.map(ig=>{
    const on=ig.id==firstId;
    return`<div onclick="selectProdIg(${ig.id})" style="padding:10px 14px;font-size:14px;cursor:pointer;background:${on?'var(--pbg)':'transparent'};color:${on?'var(--p)':'var(--c1)'};font-weight:${on?'600':'400'};border-bottom:1px solid var(--bd);transition:background .15s" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background='${on?'var(--pbg)':'transparent'}'">${ig.name}</div>`;
  }).join('');
}
function selectProdIg(id){
  const hid=document.getElementById('pIgVal');
  if(hid) hid.value=id;
  const sel=D.ig.find(ig=>ig.id==id);
  const btnText=document.getElementById('pIgBtnText');
  if(btnText) btnText.textContent=sel?sel.name:'Tanlang';
  const drop=document.getElementById('pIgDrop');
  if(drop){
    drop.style.display='none';
    drop.querySelectorAll('div').forEach(d=>{
      const on=d.getAttribute('onclick')==='selectProdIg('+id+')';
      d.style.background=on?'var(--pbg)':'transparent';
      d.style.color=on?'var(--p)':'var(--c1)';
      d.style.fontWeight=on?'600':'400';
    });
  }
}
function toggleProdIgDrop(){
  const drop=document.getElementById('pIgDrop');
  if(!drop) return;
  const open=drop.style.display==='none';
  drop.style.display=open?'block':'none';
  if(open){
    const close=e=>{if(!document.getElementById('pIg').contains(e.target)){drop.style.display='none';document.removeEventListener('click',close);}};
    setTimeout(()=>document.addEventListener('click',close),0);
  }
}
function openAddProd(){
  D.ePid=null;D.imgD='';D.imgList=[];
  document.getElementById('pShT').textContent="Mahsulot qo'shish";
  document.getElementById('pN').value='';
  document.getElementById('pPr').value='';
  document.getElementById('pCost').value='';
  document.getElementById('pStock').value='';
  fillProdIg(D.ig.length?D.ig[0].id:null);
  D.imgList=[];renderImgPreviews();
  document.getElementById('prodSh').classList.add('show');
}
function openEditProd(id){
  const p=gP(id);if(!p)return;D.ePid=id;D.imgD=p.img||'';
  D.imgList=p.imgs?[...p.imgs]:(p.img?[p.img]:[]);
  document.getElementById('pShT').textContent="Tahrirlash";
  document.getElementById('pN').value=p.name;
  document.getElementById('pPr').value=p.price;
  document.getElementById('pCost').value=p.cost||0;
  document.getElementById('pStock').value=p.stock!==undefined?p.stock:'';
  fillProdIg(p.igId||null);
  renderImgPreviews();
  document.getElementById('prodSh').classList.add('show');
}
function pickC(c){D.selC=c;updCP();}
function updCP(){document.querySelectorAll('.cd').forEach(d=>d.classList.toggle('sel',d.dataset.c===D.selC));}


async function migrateImagesToStorage(){
  if(!window.FS){showToast('Firebase ulanmagan!');return;}
  const prods=D.products.filter(p=>p.img&&p.img.startsWith('data:'));
  if(!prods.length){showToast('Barcha rasmlar allaqachon Storage da!');return;}
  
  showToast('Rasmlar ko\'chirilmoqda ('+prods.length+' ta)...');
  let done=0;
  for(const p of prods){
    const path='products/'+p.id+'.jpg';
    const url=await window.FS.uploadImage(p.img, path);
    if(url){
      p.img=url;
      window.FS.saveProduct(p);
      done++;
      showToast(done+'/'+prods.length+' ta ko\'chirildi...');
    }
  }
  renderProdAdm();
  showToast('Tayyor! '+done+' ta rasm Storage ga ko\'chirildi!');
}
window.saveProd = async function(){
  const name=document.getElementById('pN').value.trim();
  const price=Math.max(0,parseInt(document.getElementById('pPr').value)||0);
  const costRaw=document.getElementById('pCost').value.trim();
  const cost=Math.max(0,parseInt(costRaw)||0);
  const stockVal=document.getElementById('pStock').value.trim();
  const stock=stockVal!==''?parseInt(stockVal):null;
  const igId=parseInt(document.getElementById('pIgVal').value)||null;
  const errEl=document.getElementById('pErr');
  const missing=[];
  if(!name) missing.push('Mahsulot nomi');
  if(!price) missing.push('Narx');
  if(!costRaw) missing.push('Tannarx');
  if(stockVal==='') missing.push('Boshlang\'ich soni');
  if(!(D.imgList&&D.imgList.length)) missing.push('Rasm');
  if(missing.length){
    if(errEl){errEl.style.display='block';errEl.innerHTML='&#9888; To\'ldirilmagan: <b>'+missing.join(', ')+'</b>';}
    return;
  }
  if(errEl) errEl.style.display='none';

  // Rasmlarni Storage ga yuklash
  const imgs=D.imgList||[];
  const uploadedUrls=[];
  for(let i=0;i<imgs.length;i++){
    const imgData=imgs[i];
    if(imgData.startsWith('data:')&&window.FS){
      if(i===0) showToast('Rasmlar yuklanmoqda...');
      const prodId=D.ePid||('new_'+Date.now());
      const path='products/'+prodId+'_'+i+'.jpg';
      const url=await window.FS.uploadImage(imgData,path);
      uploadedUrls.push(url||imgData);
    } else {
      uploadedUrls.push(imgData);
    }
  }
  const firstImg=uploadedUrls[0]||'';

  if(D.ePid){
    const p=gP(D.ePid);
    if(p){p.name=name;p.price=price;p.cost=cost;p.img=firstImg;p.imgs=uploadedUrls;p.igId=igId;if(stock!==null)p.stock=stock;}
  } else {
    D.products.push({id:D.nPid++,name,price,cost,stock:stock!==null?stock:null,color:'#B5D4F4',img:firstImg,imgs:uploadedUrls,igId});
  }
  if(window.FS){const saved=D.ePid?gP(D.ePid):D.products[D.products.length-1];await window.FS.saveProduct(saved);}
  closeSh('prodSh');renderProdAdm();
}

function delProd(id){openDelConf("Mahsulotni o'chirish","Bu mahsulotni o'chirasizmi?",()=>{const pr=gP(id);D.products=D.products.filter(p=>p.id!==id);if(window.FS&&pr&&pr._id)window.FS.deleteProduct(pr._id);renderProdAdm();});}

// --- ADMIN PROFILE ---
function renderAdminProfile(){
  document.getElementById('adminAvatar').textContent=D.admin.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('adminNameDisp').textContent=D.admin.name;
  document.getElementById('adminName').value=D.admin.name;
  document.getElementById('adminLogin').value=D.admin.login;
  document.getElementById('adminPass').value='';
  document.getElementById('adminPass2').value='';
  document.getElementById('profileErr').style.display='none';
}
function saveAdminProfile(){
  const name=document.getElementById('adminName').value.trim();
  const login=document.getElementById('adminLogin').value.trim();
  const pass=document.getElementById('adminPass').value;
  const pass2=document.getElementById('adminPass2').value;
  const err=document.getElementById('profileErr');
  if(!name||!login){err.textContent='Ism va loginni kiriting';err.style.display='block';return;}
  if(pass&&pass!==pass2){err.textContent='Parollar mos emas';err.style.display='block';return;}
  err.style.display='none';
  D.admin.name=name;D.admin.login=login;
  if(pass)D.admin.pass=pass;
  D.user.name=name;
  document.getElementById('tsub').textContent=name+' - Admin';
  document.getElementById('adminAvatar').textContent=name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('adminNameDisp').textContent=name;
  document.getElementById('adminPass').value='';document.getElementById('adminPass2').value='';
  buildHints();if(window.FS)window.FS.saveSettings({
    admin:D.admin,nUid:D.nUid,nPid:D.nPid,nSid:D.nSid,nIgId:D.nIgId,
    bonusConfig:D.bonusConfig,igDailyDM:D.igDailyDM,tahlilData:TA,expenses:D.expenses,activeAds:D.activeAds,kpiGoals:D.kpiGoals||[]
  });showToast('Profil saqlandi!');
}

// --- TAHLIL ---
function closeSh(id){document.getElementById(id).classList.remove('show');}
let delCallback=null;
function openDelConf(title,text,cb){
  delCallback=cb;
  document.getElementById('delConfTitle').textContent=title;
  document.getElementById('delConfText').textContent=text;
  document.getElementById('delConfW').classList.add('show');
}
function closeDelConf(){document.getElementById('delConfW').classList.remove('show');delCallback=null;}
function execDel(){if(delCallback)delCallback();closeDelConf();}

function showProdImg(prodId,mode){
  const p=gP(prodId);
  if(!p)return;
  const imgs=p.imgs&&p.imgs.length?p.imgs:(p.img?[p.img]:[]);
  if(!imgs.length){showToast("Rasm qo'shilmagan");return;}
  const isSelect=mode==='select';
  D.cartAddMode=isSelect;
  D.pPid=prodId;
  D.saleSelectedImg=imgs[0];
  document.getElementById('imgSelTitle').textContent=p.name;
  document.getElementById('imgSelPrice').textContent=fmt(p.price)+" so'm";
  document.getElementById('imgSelBig').src=imgs[0];
  document.getElementById('imgSelBtns').style.display=isSelect?'flex':'none';
  const grid=document.getElementById('imgSelGrid');
  grid.innerHTML='';
  imgs.forEach(function(url,idx){
    const div=document.createElement('div');
    div.id='imgOpt_'+idx;
    div.style.cssText='width:64px;height:64px;flex-shrink:0;border-radius:10px;border:2px solid #e5e7eb;overflow:hidden;cursor:pointer;background:#f8f8f6;transition:border-color .15s,background .15s';
    div.onclick=(function(u,i){return function(){selectSaleImg(u,i);};})(url,idx);
    const img=document.createElement('img');
    img.src=url;
    img.style.cssText='width:100%;height:100%;object-fit:contain;display:block;padding:4px;pointer-events:none';
    div.appendChild(img);
    grid.appendChild(div);
  });
  selectSaleImg(imgs[0],0);
  document.getElementById('imgSelW').classList.add('show');
}
buildHints();

window.addEventListener('resize',function(){
  const fb=document.getElementById('tabFilterBar');
  if(fb&&fb.style.display!=='none') _posFilterBar();
});



let _tarixPage=1;

function renderTarixPage(page){
  _tarixPage=page||1;
  const s=window._tarixSales||[];
  const el=document.getElementById('tarixW');
  if(!el) return;
  if(!s.length){el.innerHTML='<div style="padding:14px;font-size:13px;color:var(--c5)">Sotuv topilmadi</div>';return;}
  const total=s.length;
  const totalPages=Math.ceil(total/_PAGE_SIZE);
  const start=(_tarixPage-1)*_PAGE_SIZE;
  const shown=s.slice(start,start+_PAGE_SIZE);

  const detailHtml=shown.map(x=>{
    const items=getSaleItems(x);
    const isMulti=items.length>1;
    const p=gP(x.pid);
    const si=x.selectedImg||(items[0]&&items[0].selectedImg)||(p?p.img:'');
    const total=x.total||items.reduce((a,it)=>a+(it.price||(gP(it.pid)?gP(it.pid).price:0))*it.qty,0);
    if(!isMulti){
      return`<div class="lr">`
        +(si?`<img src="${si}" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:var(--bg3);flex-shrink:0">`:`<div class="dot" style="background:${p?p.color:'#ccc'}"></div>`)
        +`<div style="flex:1"><div style="font-size:13px;font-weight:600">${p?p.name:'-'}</div><div style="font-size:12px;color:var(--c4)">${x.date} ${x.time||''}</div></div><span style="font-size:13px;font-weight:600">${fmt(total)} so'm</span></div>`;
    }
    const summary=items.map(it=>{const ip=gP(it.pid);return(ip?ip.name:'-')+(it.qty>1?' \xd7'+it.qty:'');}).join(' + ');
    const previewImgs=items.filter(it=>it.selectedImg).slice(0,3);
    return`<div style="padding:10px 14px;border-bottom:0.5px solid var(--bg4);display:flex;align-items:center;gap:10px">`
      +`<div style="display:flex;gap:3px;flex-shrink:0">`
      +previewImgs.map(it=>`<img src="${it.selectedImg}" style="width:30px;height:30px;border-radius:6px;object-fit:contain;background:var(--bg3)">`).join('')
      +(items.length>previewImgs.length?`<div style="width:30px;height:30px;border-radius:6px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#185FA5">+${items.length-previewImgs.length}</div>`:'')
      +`</div>`
      +`<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${summary}</div><div style="font-size:11px;color:var(--c4)">${x.date} ${x.time||''}</div></div>`
      +`<span style="font-size:13px;font-weight:700;color:#185FA5;flex-shrink:0">${fmt(total)} so'm</span>`
      +`</div>`;
  }).join('');

  let paginHtml='';
  if(totalPages>1){
    let btns='';
    for(let i=1;i<=totalPages;i++){
      const isOn=i===_tarixPage;
      btns+=`<button onclick="renderTarixPage(${i})" style="min-width:34px;height:34px;border-radius:8px;border:${isOn?'2px solid var(--p)':'1px solid var(--bd)'};background:${isOn?'var(--pbg)':'var(--bg1)'};color:${isOn?'var(--p)':'var(--c2)'};font-size:14px;font-weight:${isOn?'700':'400'};cursor:pointer;font-family:inherit">${i}</button>`;
    }
    paginHtml=`<div style="padding:12px 14px;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;border-top:1px solid var(--bg5)">
      <button onclick="renderTarixPage(${Math.max(1,_tarixPage-1)})" ${_tarixPage===1?'disabled':''}  style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;font-family:inherit;opacity:${_tarixPage===1?'.4':'1'}">&#8249;</button>
      ${btns}
      <button onclick="renderTarixPage(${Math.min(totalPages,_tarixPage+1)})" ${_tarixPage===totalPages?'disabled':''} style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;font-family:inherit;opacity:${_tarixPage===totalPages?'.4':'1'}">&#8250;</button>
    </div>`;
  }

  el.innerHTML=`
    <div style="padding:8px 14px;font-size:13px;font-weight:700;color:var(--c5);border-bottom:1px solid var(--bg5)">
      ${start+1}–${Math.min(start+_PAGE_SIZE,total)} / ${total} ta sotuv
    </div>
    ${detailHtml}
    ${paginHtml}`;
}
let _salesPage=1;
const _PAGE_SIZE=15;

function renderSalesList(filtered, page){
  _salesPage=page||1;
  window._filteredSales=filtered;
  const el=document.getElementById('todayAll');
  if(!filtered.length){el.innerHTML='<div style="padding:14px;font-size:14px;color:var(--c5)">Bu davrda sotuv yo\'q</div>';return;}

  // Group by product
  const grouped={};
  filtered.forEach(s=>{
    const p=gP(s.pid);const key=s.pid;
    if(!grouped[key]) grouped[key]={p,sales:[],rev:0};
    grouped[key].sales.push(s);
    grouped[key].rev+=(p?p.price:0);
  });

  const sorted=[...filtered].reverse();
  const totalPages=Math.ceil(sorted.length/_PAGE_SIZE);
  const start=(_salesPage-1)*_PAGE_SIZE;
  const shown=sorted.slice(start,start+_PAGE_SIZE);

  // Summary by product
  const summaryHtml=Object.values(grouped).sort((a,b)=>b.sales.length-a.sales.length).map(g=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #f5f5f0">
      <div class="dot" style="background:${g.p?g.p.color:'#ccc'};width:10px;height:10px;border-radius:3px;flex-shrink:0"></div>
      <div style="flex:1;font-size:14px;font-weight:600">${g.p?g.p.name:'-'}</div>
      <div style="text-align:right">
        <span style="background:#DBEAFE;color:#1e40af;font-size:13px;padding:2px 8px;border-radius:10px;font-weight:600;margin-right:6px">${g.sales.length} ta</span>
        <span style="font-size:14px;font-weight:700">${fmt(g.rev)} so'm</span>
      </div>
    </div>`).join('');

  // Detail list
  const detailHtml=shown.map(s=>{
    const items=getSaleItems(s);
    const isMulti=items.length>1;
    const p=gP(s.pid);const sel=gS(s.sid);const ig=s.igId?gI(s.igId):(sel?gI(sel.igId):null);
    const si=s.selectedImg||(items[0]&&items[0].selectedImg)||(p?p.img:'');
    const total=s.total||items.reduce((a,it)=>a+(it.price||(gP(it.pid)?gP(it.pid).price:0))*it.qty,0);
    const meta=`${sel?sel.name:'<i style="color:#bbb">O\'chirilgan</i>'} ${ig?'· '+ig.name:''} · ${s.date} ${s.time}`;
    if(!isMulti){
      return`<div class="lr">`
        +(si?`<img src="${si}" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:var(--bg3);flex-shrink:0">`:`<div class="dot" style="background:${p?p.color:'#ccc'}"></div>`)
        +`<div style="flex:1"><div style="font-size:14px">${p?p.name:'-'}</div><div style="font-size:13px;color:var(--c4)">${meta}</div></div><span style="font-size:14px;font-weight:600">${fmt(total)} so'm</span></div>`;
    }
    const summary=items.map(it=>{const ip=gP(it.pid);return(ip?ip.name:'-')+(it.qty>1?' \xd7'+it.qty:'');}).join(' + ');
    const previewImgs=items.filter(it=>it.selectedImg).slice(0,2);
    return`<div style="padding:10px 14px;border-bottom:0.5px solid var(--bg4);display:flex;align-items:center;gap:10px">`
      +`<div style="display:flex;gap:3px;flex-shrink:0">`
      +previewImgs.map(it=>`<img src="${it.selectedImg}" style="width:32px;height:32px;border-radius:6px;object-fit:contain;background:var(--bg3)">`).join('')
      +(items.length>previewImgs.length?`<div style="width:32px;height:32px;border-radius:6px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#185FA5">+${items.length-previewImgs.length}</div>`:'')
      +`</div>`
      +`<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${summary}</div><div style="font-size:12px;color:var(--c4)">${meta}</div></div>`
      +`<span style="font-size:14px;font-weight:700;color:#185FA5;flex-shrink:0">${fmt(total)} so'm</span>`
      +`</div>`;
  }).join('');

  // Pagination
  let paginHtml='';
  if(totalPages>1){
    let btns='';
    for(let i=1;i<=totalPages;i++){
      const isOn=i===_salesPage;
      btns+=`<button onclick="renderSalesList(window._filteredSales,${i})" style="min-width:34px;height:34px;border-radius:8px;border:${isOn?'2px solid var(--p)':'1px solid var(--bd)'};background:${isOn?'var(--pbg)':'var(--bg1)'};color:${isOn?'var(--p)':'var(--c2)'};font-size:14px;font-weight:${isOn?'700':'400'};cursor:pointer;font-family:inherit">${i}</button>`;
    }
    paginHtml=`<div style="padding:12px 14px;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;border-top:1px solid var(--bg5)">
      <button onclick="renderSalesList(window._filteredSales,${Math.max(1,_salesPage-1)})" style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;font-family:inherit" ${_salesPage===1?'disabled style="opacity:.4;cursor:default;min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);"':''}>‹</button>
      ${btns}
      <button onclick="renderSalesList(window._filteredSales,${Math.min(totalPages,_salesPage+1)})" style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;font-family:inherit" ${_salesPage===totalPages?'disabled style="opacity:.4;cursor:default;min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);"':''}>›</button>
    </div>`;
  }

  el.innerHTML=`
    <div style="background:#EFF6FF;border-radius:8px;margin:10px 14px 0">
      <div style="padding:8px 14px;font-size:13px;font-weight:700;color:#1e40af;border-bottom:1px solid #DBEAFE">Mahsulot bo'yicha xulosa</div>
      ${summaryHtml}
    </div>
    <div style="margin-top:10px;border-top:1px solid var(--bg5)">
      <div style="padding:8px 14px;font-size:13px;font-weight:700;color:var(--c5)">Batafsil sotuvlar ro'yxati (${start+1}–${Math.min(start+_PAGE_SIZE,sorted.length)} / ${sorted.length})</div>
      ${detailHtml}
    </div>
    ${paginHtml}`;
}


function toXlsxDate(d){return d;}

function downloadIgExcel(){
  const period=document.getElementById('tahlilPeriod')?document.getElementById('tahlilPeriod').textContent:'';
  const headers=['Instagram','Sotuvchi','Budjet ($)','DM soni','1 DM ($)','Sotuv','Konversiya %','1 Sotuv ($)','Daromad (so\'m)'];
  const rows1=D.ig.map(ig=>{
    const igSels=D.sellers.filter(s=>s.igId===ig.id);
    const igSales=tahlilFilterSales(D.sales.filter(s=>s.igId===ig.id||(s.igId==null&&igSels.find(x=>x.id===s.sid))));
    const d=getIgData(ig.id);
    const sales=igSales.length;
    const rev=rv(igSales);
    const conv=d.dms>0?((sales/d.dms)*100).toFixed(1):'-';
    const cpd=d.dms>0&&d.budget>0?(d.budget/d.dms).toFixed(2):'-';
    const cps=sales>0&&d.budget>0?(d.budget/sales).toFixed(2):'-';
    return[ig.name,igSels.map(s=>s.name).join(', '),d.budget||'',d.dms||'',cpd,sales,conv,cps,rev];
  });
  const jamiRev=rows1.reduce((a,r)=>a+(r[8]||0),0);
  const jamiSales=rows1.reduce((a,r)=>a+(r[5]||0),0);
  rows1.push(['JAMI','',rows1.reduce((a,r)=>a+(r[2]||0),0),rows1.reduce((a,r)=>a+(r[3]||0),0),'',jamiSales,'','',jamiRev]);

  let csv='\uFEFF';
  csv+='Instagram profil statistikasi\n';
  csv+='Davr: '+period+'\n\n';
  csv+=headers.join(';')+'\n';
  rows1.forEach(r=>{ csv+=r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')+'\n'; });

  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='Instagram_tahlil_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
  showToast('Instagram tahlili yuklab olindi!');
}

function downloadProdExcel(){
  const period=document.getElementById('tahlilPeriod')?document.getElementById('tahlilPeriod').textContent:'';
  const headers=['Instagram','Mahsulot','Budjet ($)','DM soni','1 DM ($)','Sotuv','Konversiya %','1 Sotuv ($)','Daromad (so\'m)'];
  const myIgIds=D.user.isAdmin?D.ig.map(x=>x.id):(D.user.role==='targetolog'?D.ig.map(x=>x.id):[D.user.igId].filter(Boolean));
  const rows=[];
  D.ig.filter(ig=>myIgIds.includes(ig.id)).forEach(ig=>{
    const igSels=D.sellers.filter(s=>s.igId===ig.id);
    D.products.filter(prod=>prod.igId===ig.id).forEach(prod=>{
      const d=getProdData(ig.id,prod.id);
      const prodSales=tahlilFilterSales(D.sales.filter(s=>(s.igId===ig.id||(s.igId==null&&igSels.find(x=>x.id===s.sid)))&&s.pid===prod.id));
      const sales=prodSales.length;
      const rev=rv(prodSales);
      const conv=d.dms>0?((sales/d.dms)*100).toFixed(1):'-';
      const cpd=d.dms>0&&d.budget>0?(d.budget/d.dms).toFixed(2):'-';
      const cps=sales>0&&d.budget>0?(d.budget/sales).toFixed(2):'-';
      rows.push([ig.name,prod.name,d.budget||'',d.dms||'',cpd,sales,conv,cps,rev]);
    });
  });

  let csv='\uFEFF';
  csv+='Mahsulot bo\'yicha reklama tahlili\n';
  csv+='Davr: '+period+'\n\n';
  csv+=headers.join(';')+'\n';
  rows.forEach(r=>{ csv+=r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')+'\n'; });

  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='Mahsulot_tahlil_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
  showToast('Mahsulot tahlili yuklab olindi!');
}

function saveBonusConfig(){
  D.bonusConfig={
    bonusConv:parseFloat(document.getElementById('bonusConvInp').value)||21,
    bonusAmt:parseInt(document.getElementById('bonusAmtInp').value)||30000,
    fineConv:parseFloat(document.getElementById('fineConvInp').value)||10,
    fineAmt:parseInt(document.getElementById('fineAmtInp').value)||20000
  };
  if(window.FS) window.FS.saveSettings({
    admin:D.admin,nUid:D.nUid,nPid:D.nPid,nSid:D.nSid,nIgId:D.nIgId,
    bonusConfig:D.bonusConfig,igDailyDM:D.igDailyDM,tahlilData:TA,expenses:D.expenses,activeAds:D.activeAds,kpiGoals:D.kpiGoals||[]
  });
  showToast('Bonus sozlamalari saqlandi!');
}
function clearTestSales(){
  openDelConf("Test sotuvlarni tozalash","Barcha sotuvlar va DM ma'lumotlari o'chiriladi.",()=>{
    if(window.FS) window.FS.clearSales();
    else D.sales=[];
    // DM va bonus ma'lumotlarini ham tozalaymiz
    D.igDailyDM={};
    TA={igData:{},prodData:{}};
    if(window.FS) window.FS.saveSettings({
      admin:D.admin,nUid:D.nUid,nPid:D.nPid,nSid:D.nSid,nIgId:D.nIgId,
      bonusConfig:D.bonusConfig,igDailyDM:{},tahlilData:{igData:{},prodData:{}},
      expenses:D.expenses
    });
    showToast("Barcha sotuvlar va DM ma'lumotlari o'chirildi!");
    renderDash&&renderDash();
  });
}



