function tahlilDateKey(){
  if(T_filter.mode==='today') return today();
  if(T_filter.mode==='range') return T_filter.from+'_'+T_filter.to;
  return 'all';
}
function setTahlilFilter(mode,el){
  T_filter={mode};
  document.querySelectorAll('#tTahlil .dfilter').forEach(b=>b.classList.remove('on'));
  if(el)el.classList.add('on');
  renderTahlil();
}
function tahlilFilterSales(sales){
  const td=today();
  if(T_filter.mode==='today') return sales.filter(s=>s.date===td);
  if(T_filter.mode==='range') return sales.filter(s=>s.date>=T_filter.from&&s.date<=T_filter.to);
  return sales;
}
function tahlilPeriodText(){
  if(T_filter.mode==='today') return 'Kecha - '+yesterday();
  if(T_filter.mode==='range') return T_filter.from+' - '+T_filter.to;
  return 'Barcha vaqt';
}
function openTahlilRange(){
  const now=new Date();
  T_CAL={year:now.getFullYear(),month:now.getMonth(),from:T_filter.from||null,to:T_filter.to||null};
  document.getElementById('tahlilRangeErr').style.display='none';
  updateTCalDisp();renderTCal();
  document.getElementById('tahlilRangeW').style.display='flex';
}
function closeTahlilRange(){document.getElementById('tahlilRangeW').style.display='none';}
function tCalPrev(){T_CAL.month--;if(T_CAL.month<0){T_CAL.month=11;T_CAL.year--;}renderTCal();}
function tCalNext(){T_CAL.month++;if(T_CAL.month>11){T_CAL.month=0;T_CAL.year++;}renderTCal();}
function renderTCal(){
  document.getElementById('tCalLabel').textContent=MONTHS[T_CAL.month]+' '+T_CAL.year;
  const first=new Date(T_CAL.year,T_CAL.month,1).getDay();
  const days=new Date(T_CAL.year,T_CAL.month+1,0).getDate();
  let cells='';
  for(let i=0;i<first;i++) cells+='<div></div>';
  for(let d=1;d<=days;d++){
    const ds=T_CAL.year+'-'+String(T_CAL.month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const isF=T_CAL.from===ds,isT=T_CAL.to===ds;
    const inR=T_CAL.from&&T_CAL.to&&ds>T_CAL.from&&ds<T_CAL.to;
    let bg='transparent',col='var(--c1)',fw='400',br='50%';
    if(isF||isT){bg='var(--p)';col='#fff';fw='700';}
    else if(inR){bg='var(--pbd)';br='0';}
    cells+=`<div onclick="tCalClick('${ds}')" style="cursor:pointer;padding:7px 2px;border-radius:${br};background:${bg};color:${col};font-weight:${fw};font-size:13px">${d}</div>`;
  }
  document.getElementById('tCalGrid').innerHTML=cells;
  document.getElementById('tahlilRangeHint').textContent=T_CAL.from&&!T_CAL.to?'Tugash sanasini tanlang':'Boshlangich sanani tanlang';
}
function tCalClick(ds){
  if(!T_CAL.from||T_CAL.to){T_CAL.from=ds;T_CAL.to=null;}
  else if(ds<T_CAL.from){T_CAL.to=T_CAL.from;T_CAL.from=ds;}
  else{T_CAL.to=ds;}
  updateTCalDisp();renderTCal();
}
function updateTCalDisp(){
  const f=d=>d?d.split('-').reverse().join('.'):'—';
  document.getElementById('tFromDisp').textContent=f(T_CAL.from);
  document.getElementById('tToDisp').textContent=f(T_CAL.to);
}
function applyTahlilRange(){
  if(!T_CAL.from||!T_CAL.to){document.getElementById('tahlilRangeErr').style.display='block';return;}
  document.getElementById('tahlilRangeErr').style.display='none';
  T_filter={mode:'range',from:T_CAL.from,to:T_CAL.to};
  document.querySelectorAll('#tTahlil .dfilter').forEach(b=>b.classList.remove('on'));
  document.getElementById('tRangeBtn').classList.add('on');
  closeTahlilRange();renderTahlil();
}
function getIgData(igId){const k=tahlilDateKey();if(!TA.igData[igId])TA.igData[igId]={};if(!TA.igData[igId][k])TA.igData[igId][k]={budget:0,rate:D.dollarRate||12500,dms:0,budgetSom:0};return TA.igData[igId][k];}
function getProdData(igId,prodId){const k=tahlilDateKey();if(!TA.prodData[igId])TA.prodData[igId]={};if(!TA.prodData[igId][prodId])TA.prodData[igId][prodId]={};if(!TA.prodData[igId][prodId][k])TA.prodData[igId][prodId][k]={budget:0,rate:D.dollarRate||12500,dms:0,budgetSom:0};return TA.prodData[igId][prodId][k];}

function renderTahlil(){
  renderActiveAdsPanel();
  renderSellerConvPanel();
  const showExcel=D.user.isAdmin||D.user.role==='targetolog';
  const igBtn=document.getElementById('igExcelBtn');
  const prodBtn=document.getElementById('prodExcelBtn');
  if(igBtn) igBtn.style.display=showExcel?'flex':'none';
  if(prodBtn) prodBtn.style.display=showExcel?'flex':'none';
  const canEdit=D.user&&D.user.role==='targetolog';
  const canViewBudget=D.user&&(D.user.isAdmin||D.user.role==='targetolog'||D.user.role==='sotuvchi');
  // thead larni render qilish
  const THST='padding:10px 8px;text-align:center;font-size:13px;color:var(--c5);font-weight:600;text-transform:uppercase;border-bottom:2px solid var(--bd);white-space:nowrap';
  const THSTL='padding:10px 8px;text-align:left;font-size:13px;color:var(--c5);font-weight:600;text-transform:uppercase;border-bottom:2px solid var(--bd);white-space:nowrap';
  const th1El=document.getElementById('tahlilHead1');
  if(th1El) th1El.innerHTML='<tr style="background:var(--bg5)">'
    +'<th style="'+THSTL+'">Instagram</th>'
    +(canViewBudget?'<th style="'+THST+'">Budjet<br>($)</th>':'')
    +'<th style="'+THST+'">DM<br>soni</th>'
    +(canViewBudget?'<th style="'+THST+'">1 DM<br>($)</th>':'')
    +'<th style="'+THST+'">Sotuv</th>'
    +'<th style="'+THST+'">Konv.<br>%</th>'
    +(canViewBudget?'<th style="'+THST+'">1 sotuv<br>($)</th><th style="'+THST+'">Daromad<br>(so\'m)</th>':'')
    +(canEdit?'<th style="padding:10px 8px;border-bottom:2px solid #eee"></th>':'')
    +'</tr>';
  const th2El=document.getElementById('tahlilHead2');
  if(th2El) th2El.innerHTML='<tr style="background:var(--bg5)">'
    +'<th style="'+THSTL+'">Instagram</th>'
    +'<th style="'+THSTL+'">Mahsulot</th>'
    +(canViewBudget?'<th style="'+THST+'">Budjet<br>($)</th>':'')
    +'<th style="'+THST+'">DM<br>soni</th>'
    +(canViewBudget?'<th style="'+THST+'">1 DM<br>($)</th>':'')
    +'<th style="'+THST+'">Sotuv</th>'
    +'<th style="'+THST+'">Konv.<br>%</th>'
    +(canViewBudget?'<th style="'+THST+'">1 sotuv<br>($)</th><th style="'+THST+'">Daromad<br>(so\'m)</th>':'')
    +(canEdit?'<th style="padding:10px 8px;border-bottom:2px solid #eee"></th>':'')
    +'</tr>';
  document.getElementById('tahlilPeriod').textContent=tahlilPeriodText();
  // Tahlil filtriga mos ig data yig'ish
  function getIgDataForFilter(igId){
    const allData=TA.igData[igId]||{};
    if(T_filter.mode==='today'){
      // Bugun filtri - kechagi kun
      const k=yesterday();
      return allData[k]||{budget:0,dms:0,budgetSom:0,rate:D.dollarRate||12500};
    }
    if(T_filter.mode==='range'){
      // Sana oralig'i
      let budget=0,dms=0,budgetSom=0;
      Object.entries(allData).forEach(([k,v])=>{
        if(k>=T_filter.from&&k<=T_filter.to){
          budget+=(v.budget||0);
          dms+=(v.dms||0);
          budgetSom+=(v.budgetSom||(v.budget||0)*(v.rate||D.dollarRate||12500));
        }
      });
      return {budget,dms,budgetSom,rate:D.dollarRate||12500};
    }
    // 'all' - barcha kunlar
    let budget=0,dms=0,budgetSom=0;
    Object.values(allData).forEach(v=>{
      budget+=(v.budget||0);
      dms+=(v.dms||0);
      budgetSom+=(v.budgetSom||(v.budget||0)*(v.rate||D.dollarRate||12500));
    });
    return {budget,dms,budgetSom,rate:D.dollarRate||12500};
  }

  const rows1=D.ig.map(ig=>{
    const igSels=D.sellers.filter(s=>s.igId===ig.id);
    const igSales=tahlilFilterSales(D.sales.filter(s=>s.igId===ig.id||(s.igId==null&&igSels.find(x=>x.id===s.sid))));
    const d=getIgDataForFilter(ig.id);
    const sales=igSales.length;
    const rev2=rv(igSales);
    const conv=d.dms>0?((sales/d.dms)*100).toFixed(1):'-';
    const cpd=d.dms>0&&d.budget>0?(d.budget/d.dms).toFixed(2):'-';
    const cps=sales>0&&d.budget>0?(d.budget/sales).toFixed(2):'-';
    const igSels2=D.sellers.filter(s=>s.igId===ig.id);
    return{ig,d,sales,conv,cpd,cps,rev:rev2,sels:igSels2};
  });
  document.getElementById('tahlilBody1').innerHTML=rows1.map(r=>`<tr style="border-bottom:1px solid var(--bg5)">
    <td style="padding:10px 8px;white-space:nowrap">
      <div style="font-weight:700;color:var(--purple)">${r.ig.name}</div>
      <div style="font-size:14px;color:var(--c5);margin-top:2px">${r.sels.length?r.sels.map(s=>s.name).join(', '):'Ishchi biriktirilmagan'}</div>
    </td>
    ${canViewBudget?`<td style="padding:10px 8px;text-align:center;font-weight:600">${r.d.budget?(r.d.budget+'$'):'-'}</td>`:''}
    <td style="padding:10px 8px;text-align:center;font-weight:600">${r.d.dms||'-'}</td>
    ${canViewBudget?`<td style="padding:10px 8px;text-align:center;color:${r.cpd!=='-'?'var(--p)':'var(--c6)'};font-weight:600">${r.cpd}</td>`:''}
    <td style="padding:10px 8px;text-align:center"><span style="background:#DBEAFE;color:#1e40af;padding:2px 8px;border-radius:10px;font-weight:600;font-size:15px">${r.sales}</span></td>
    <td style="padding:10px 8px;text-align:center;font-weight:600;color:${r.conv!=='-'?(parseFloat(r.conv)>=10?'var(--grn)':'var(--amber)'):'var(--c6)'}">${r.conv!=='-'?r.conv+'%':'-'}</td>
    ${canViewBudget?`<td style="padding:10px 8px;text-align:center;color:${r.cps!=='-'?'var(--p)':'var(--c6)'};font-weight:600">${r.cps}</td><td style="padding:10px 8px;text-align:center;font-weight:600;color:#166534">${fmt(r.rev)}</td>`:''}
    ${canEdit?`<td style="padding:10px 8px;text-align:center"><button onclick="openIgEdit(${r.ig.id})" style="background:var(--purplebg);color:var(--purple);border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:15px;font-family:inherit;font-weight:500">Kiritish</button></td>`:''}
  </tr>`).join('');
  // Jami row — all totals
  const jamiRev=rows1.reduce((a,r)=>a+r.rev,0);
  const jamiBudjet=rows1.reduce((a,r)=>a+(r.d.budget||0),0);
  const jamiDms=rows1.reduce((a,r)=>a+(r.d.dms||0),0);
  const jamiSales=rows1.reduce((a,r)=>a+r.sales,0);
  const jamiCpd=jamiDms>0&&jamiBudjet>0?(jamiBudjet/jamiDms).toFixed(2):'-';
  const jamiCps=jamiSales>0&&jamiBudjet>0?(jamiBudjet/jamiSales).toFixed(2):'-';
  document.getElementById('tahlilBody1').innerHTML+=`<tr style="background:var(--pbg);font-weight:700;border-top:2px solid var(--pbd)">
    <td style="padding:10px 8px;font-size:13px;color:var(--p);font-weight:700">Jami</td>
    ${canViewBudget?`<td style="padding:10px 8px;text-align:center;color:var(--c1)">${jamiBudjet||'-'}</td>`:''}
    <td style="padding:10px 8px;text-align:center;color:var(--c1)">${jamiDms||'-'}</td>
    ${canViewBudget?`<td style="padding:10px 8px;text-align:center;color:var(--p)">${jamiCpd}</td>`:''}
    <td style="padding:10px 8px;text-align:center"><span style="background:var(--p);color:#fff;padding:2px 8px;border-radius:10px;font-size:15px">${jamiSales}</span></td>
    <td style="padding:10px 8px;text-align:center;color:var(--amber)">${jamiDms>0?((jamiSales/jamiDms)*100).toFixed(1)+'%':'-'}</td>
    ${canViewBudget?`<td style="padding:10px 8px;text-align:center;color:var(--p)">${jamiCps}</td><td style="padding:10px 8px;text-align:center;color:var(--grn);font-size:14px">${fmt(jamiRev)}</td>`:''}
    ${canEdit?'<td></td>':''}
  </tr>`;
  // Mahsulot boyicha: sotuvchiga faqat oz instagram profili
  const myIgIds=D.user.isAdmin?D.ig.map(x=>x.id):(D.user.role==='targetolog'?D.ig.map(x=>x.id):[D.user.igId].filter(Boolean));
  const rows2=[];
  D.ig.filter(ig=>myIgIds.includes(ig.id)).forEach(ig=>{
    const igSels=D.sellers.filter(s=>s.igId===ig.id);
    D.products.filter(prod=>prod.igId===ig.id).forEach(prod=>{
      const allPD=(TA.prodData[ig.id]&&TA.prodData[ig.id][prod.id])||{};
      let d={budget:0,dms:0,budgetSom:0};
      if(T_filter.mode==='today'){
        const k=yesterday();
        d=allPD[k]||d;
      } else if(T_filter.mode==='range'){
        Object.entries(allPD).forEach(([k,v])=>{if(k>=T_filter.from&&k<=T_filter.to){d.budget+=(v.budget||0);d.dms+=(v.dms||0);d.budgetSom+=(v.budgetSom||(v.budget||0)*(v.rate||D.dollarRate||12500));}});
      } else {
        Object.values(allPD).forEach(v=>{d.budget+=(v.budget||0);d.dms+=(v.dms||0);d.budgetSom+=(v.budgetSom||(v.budget||0)*(v.rate||D.dollarRate||12500));});
      }
      const prodSales=tahlilFilterSales(D.sales.filter(s=>(s.igId===ig.id||(s.igId==null&&igSels.find(x=>x.id===s.sid)))&&s.pid===prod.id));
      const sales=prodSales.length;
      const rev3=rv(prodSales);
      const conv=d.dms>0?((sales/d.dms)*100).toFixed(1):'-';
      const cpd=d.dms>0&&d.budget>0?(d.budget/d.dms).toFixed(2):'-';
      const cps=sales>0&&d.budget>0?(d.budget/sales).toFixed(2):'-';
      // Faqat activeAds da bo'lgan mahsulotlarni ko'rsatamiz
      const isActive=D.activeAds.some(a=>String(a.prodId)===String(prod.id)&&String(a.igId)===String(ig.id));
      const hasDmOrBudget=d.dms>0||d.budget>0;
      if(!isActive&&!hasDmOrBudget) return;
      rows2.push({ig,prod,d,sales,conv,cpd,cps,rev:rev3});
    });
  });
  const ig2Colors=isDark()?['#1a1123','#0d2011','#1c1505','#0d2035']:['#F8F4FF','#F0FDF4','#FFF7ED','#EFF6FF'];
  const ig2Ids=[...new Set(rows2.map(r=>r.ig.id))];
  document.getElementById('tahlilBody2').innerHTML=rows2.map(r=>{
    const colorIdx=ig2Ids.indexOf(r.ig.id)%ig2Colors.length;
    const bg=ig2Colors[colorIdx];
    return`<tr style="border-bottom:1px solid var(--bg5);background:${bg}">
    <td style="padding:10px 8px;font-weight:700;color:var(--purple);white-space:nowrap;font-size:14px">${r.ig.name}</td>
    <td style="padding:10px 8px">
      <div style="display:flex;align-items:center;gap:6px;cursor:pointer" onclick="showProdImg(${r.prod.id})">
        ${r.prod.img?`<div style="width:28px;height:28px;border-radius:4px;overflow:hidden;flex-shrink:0;border:1px solid var(--bd)"><img src="${r.prod.img}" style="width:100%;height:100%;object-fit:cover"></div>`:'<div style="width:28px;height:28px;border-radius:4px;background:var(--bg5);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px">&#128230;</div>'}
        <span style="font-size:15px;font-weight:500;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${r.prod.img?'var(--p)':'var(--c1)'}">${r.prod.name}</span>
      </div>
    </td>
    ${canViewBudget?`<td style="padding:10px 8px;text-align:center;font-weight:600">${r.d.budget?(r.d.budget+'$'):'-'}</td>`:''}
    <td style="padding:10px 8px;text-align:center;font-weight:600">${r.d.dms||'-'}</td>
    ${canViewBudget?`<td style="padding:10px 8px;text-align:center;color:${r.cpd!=='-'?'var(--p)':'var(--c6)'};font-weight:600">${r.cpd}</td>`:''}
    <td style="padding:10px 8px;text-align:center"><span style="background:#DBEAFE;color:#1e40af;padding:2px 8px;border-radius:10px;font-weight:600;font-size:15px">${r.sales}</span></td>
    <td style="padding:10px 8px;text-align:center;font-weight:600;color:${r.conv!=='-'?(parseFloat(r.conv)>=10?'#166534':'#92400e'):'#bbb'}">${r.conv!=='-'?r.conv+'%':'-'}</td>
    ${canViewBudget?`<td style="padding:10px 8px;text-align:center;color:${r.cps!=='-'?'var(--p)':'var(--c6)'};font-weight:600">${r.cps}</td><td style="padding:10px 8px;text-align:center;font-weight:600;color:#166534">${fmt(r.rev)}</td>`:''}
    ${canEdit?`<td style="padding:10px 8px;text-align:center"><button onclick="openProdEdit(${r.ig.id},${r.prod.id})" style="background:var(--purplebg);color:var(--purple);border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:15px;font-family:inherit;font-weight:500">Kiritish</button></td>`:''}
  </tr>`;}).join('');
}
function openIgEdit(igId){
  const ig=gI(igId);editingRow={type:'ig',igId};const d=getIgData(igId);
  document.getElementById('tahlilEditTitle').textContent=ig.name;
  document.getElementById('tahlilEditSub').textContent='Kunlik budjet va DM yozganlar soni';
  document.getElementById('tahlilEditFields').innerHTML=`<div class="fg"><label class="fl">Kunlik budjet ($)</label><input class="inp" type="number" id="editBudget" value="${d.budget||''}" placeholder="Masalan: 15"></div><div class="fg"><label class="fl">Dollar kursi (so'm)</label><input class="inp" type="number" id="editRate" value="${d.rate||D.dollarRate||12500}" placeholder="Masalan: 12500"></div><div class="fg"><label class="fl">DM yozganlar soni</label><input class="inp" type="number" id="editDms" value="${d.dms||''}" placeholder="Masalan: 42"></div>`;
  document.getElementById('tahlilEditErr').style.display='none';
  document.getElementById('tahlilEditW').style.display='flex';
}
function openProdEdit(igId,prodId){
  const ig=gI(igId);const prod=gP(prodId);editingRow={type:'prod',igId,prodId};const d=getProdData(igId,prodId);
  document.getElementById('tahlilEditTitle').textContent=ig.name+' - '+prod.name;
  document.getElementById('tahlilEditSub').textContent='Shu mahsulotga sarflangan budjet va DM soni';
  document.getElementById('tahlilEditFields').innerHTML=`<div class="fg"><label class="fl">Budjet ($)</label><input class="inp" type="number" id="editBudget" value="${d.budget||''}" placeholder="Masalan: 8"></div><div class="fg"><label class="fl">Dollar kursi (so'm)</label><input class="inp" type="number" id="editRate" value="${d.rate||D.dollarRate||12500}" placeholder="Masalan: 12500"></div><div class="fg"><label class="fl">DM yozganlar soni</label><input class="inp" type="number" id="editDms" value="${d.dms||''}" placeholder="Masalan: 20"></div>`;
  document.getElementById('tahlilEditErr').style.display='none';
  document.getElementById('tahlilEditW').style.display='flex';
}
function closeTahlilEdit(){document.getElementById('tahlilEditW').style.display='none';}

window.saveTahlilEdit = function(){
  const budget=parseFloat(document.getElementById('editBudget').value)||0;
  const rate=parseFloat(document.getElementById('editRate').value)||D.dollarRate||12500;
  const dms=parseInt(document.getElementById('editDms').value)||0;
  D.dollarRate=rate;
  const k=tahlilDateKey();
  if(editingRow.type==='ig'){if(!TA.igData[editingRow.igId])TA.igData[editingRow.igId]={};TA.igData[editingRow.igId][k]={budget,rate,dms,budgetSom:budget*rate};
    // Kunlik DM ni doim saqlash (filter rejimidan qat'iy nazar)
    {
      const dmKey=Number(editingRow.igId)||editingRow.igId;
      if(!D.igDailyDM[dmKey])D.igDailyDM[dmKey]={};
      // "Bugun" filtri = kecha uchun, "Sana" filtri = o'sha sana uchun
      const dmDate=T_filter.mode==='today'?yesterday():(T_filter.mode==='range'?T_filter.from:yesterday());
      D.igDailyDM[dmKey][dmDate]=dms;
    }
  }
  else{if(!TA.prodData[editingRow.igId])TA.prodData[editingRow.igId]={};if(!TA.prodData[editingRow.igId][editingRow.prodId])TA.prodData[editingRow.igId][editingRow.prodId]={};TA.prodData[editingRow.igId][editingRow.prodId][k]={budget,rate,dms,budgetSom:budget*rate};}
  if(window.FS)window.FS.saveSettings({
    admin:D.admin,nUid:D.nUid,nPid:D.nPid,nSid:D.nSid,nIgId:D.nIgId,
    bonusConfig:D.bonusConfig,igDailyDM:D.igDailyDM,tahlilData:TA,expenses:D.expenses,activeAds:D.activeAds,kpiGoals:D.kpiGoals||[]
  });
  closeTahlilEdit();renderTahlil();showToast('Saqlandi!');
}

// ===== BONUS/JARIMA TIZIMI =====
// Bonus config - D.bonusConfig orqali boshqariladi



function renderYesterdayBonus(sellerId){
  const yd=yesterday();
  const br=calcSellerBonus(sellerId, yd);
  const BC=D.bonusConfig||{bonusConv:21,bonusAmt:30000,fineConv:10,fineAmt:20000};
  
  // Bugungi motivatsiya matni
  let motivText='';
  if(!br.dm){
    motivText='<div style="grid-column:1/-1;background:#EFF6FF;border-radius:12px;padding:12px 14px;color:#1e40af;font-size:13px;font-weight:600;text-align:center">&#128170; Bugun ajoyib sotuv kuni bo\'lsin!</div>';
  } else {
    const conv=parseFloat(br.conv);
    const isBonus=br.bonus>0, isFine=br.fine>0;
    
    // Kecha natijasi
    const cCol=conv>=BC.bonusConv?'#15803d':conv<BC.fineConv?'#dc2626':'#d97706';
    const cBg=conv>=BC.bonusConv?'#f0fdf4':conv<BC.fineConv?'#fef2f2':'#fffbeb';
    const cBorder=conv>=BC.bonusConv?'#bbf7d0':conv<BC.fineConv?'#fecaca':'#fde68a';
    
    let result='<div style="grid-column:1/-1;border-radius:12px;overflow:hidden;border:1px solid '+cBorder+';margin-bottom:8px">';
    result+='<div style="background:'+cBg+';padding:12px 14px">';
    result+='<div style="font-size:15px;color:var(--c4);margin-bottom:6px;font-weight:600">Kechagi natija &nbsp;|&nbsp; '+yd+'</div>';
    result+='<div style="display:flex;align-items:center;justify-content:space-between">';
    result+='<div>';
    result+='<div style="font-size:24px;font-weight:800;color:'+cCol+'">'+br.conv+'% konversiya</div>';
    result+='<div style="font-size:12px;color:var(--c4)">'+br.sales+' sotuv / '+br.dm+' DM</div>';
    result+='</div>';
    result+='<div style="text-align:right">';
    if(isBonus) result+='<div style="background:#15803d;color:white;padding:5px 10px;border-radius:8px;font-size:13px;font-weight:700">+'+fmt(br.bonus)+' so\'m &#127881;<br><span style="font-size:11px;font-weight:400">Bonus!</span></div>';
    else if(isFine) result+='<div style="background:#dc2626;color:white;padding:5px 10px;border-radius:8px;font-size:13px;font-weight:700">-'+fmt(br.fine)+' so\'m &#128683;<br><span style="font-size:11px;font-weight:400">Jarima</span></div>';
    else result+='<div style="color:'+cCol+';font-size:12px;font-weight:600">'+BC.bonusConv+'%+ bonus<br>chegarasiga yaqin!</div>';
    result+='</div></div></div></div>';
    
    // Bugungi motivatsiya
    if(isBonus){
      motivText='<div style="grid-column:1/-1;background:#F0FDF4;border-radius:12px;padding:14px;border:1px solid #bbf7d0">'
        +'<div style="font-size:15px;color:#15803d;font-weight:700;margin-bottom:4px">&#128293; Bugun ham shunday davom eting!</div>'
        +'<div style="font-size:14px;color:#166534">Kecha bonus oldingiz — bugun ham '+BC.bonusConv+'%+ ga yeting!</div></div>';
    } else if(isFine){
      motivText='<div style="grid-column:1/-1;background:#FFF7ED;border-radius:12px;padding:14px;border:1px solid #fde68a">'
        +'<div style="font-size:15px;color:#92400e;font-weight:700;margin-bottom:4px">&#128170; Bugun yaxshiroq natija qiling!</div>'
        +'<div style="font-size:14px;color:#92400e">Kecha '+br.conv+'% edi — jarima bo\'lmasin!</div></div>';
    } else {
      motivText='<div style="background:#EFF6FF;border-radius:12px;padding:12px 14px;border:1px solid #bfdbfe">';
      motivText+='<div style="font-size:12px;color:#1e40af;font-weight:700;margin-bottom:2px">&#127919; Bugun kechagidan yaxshiroq!</div>';
      motivText+='<div style="font-size:12px;color:#1e40af">Kecha '+br.conv+'% edi — bugun '+BC.bonusConv+'%+ ga yetib bonus oling!</div></div>';
    }
    return result + motivText;
  }
  return motivText;
}
function renderBonusBlock(sellerId, date){
  const br=calcSellerBonus(sellerId,date);
  if(!br.dm) return '';
  const conv=parseFloat(br.conv);
  const BC=D.bonusConfig;
  const isBonus=br.bonus>0, isFine=br.fine>0;
  const cCol=conv>=BC.bonusConv?'#15803d':conv<BC.fineConv?'#dc2626':'#d97706';
  const cBg=conv>=BC.bonusConv?'#f0fdf4':conv<BC.fineConv?'#fef2f2':'#fffbeb';
  const cBorder=conv>=BC.bonusConv?'#bbf7d0':conv<BC.fineConv?'#fecaca':'#fde68a';
  let html='<div style="grid-column:1/-1;border-radius:12px;overflow:hidden;border:1px solid '+cBorder+'">';
  html+='<div style="background:'+cBg+';padding:12px 14px;display:flex;align-items:center;justify-content:space-between">';
  html+='<div><div style="font-size:11px;color:var(--c4);margin-bottom:2px">Bugungi konversiya</div>';
  html+='<div style="font-size:26px;font-weight:800;color:'+cCol+'">'+br.conv+'%</div>';
  html+='<div style="font-size:11px;color:var(--c4)">'+br.sales+' sotuv / '+br.dm+' DM</div></div>';
  html+='<div style="text-align:right">';
  if(isBonus) html+='<div style="background:#15803d;color:white;padding:6px 12px;border-radius:10px;font-size:13px;font-weight:700">+'+fmt(br.bonus)+' so\'m &#127881;<br><span style="font-size:11px;font-weight:400">Bonus!</span></div>';
  else if(isFine) html+='<div style="background:#dc2626;color:white;padding:6px 12px;border-radius:10px;font-size:13px;font-weight:700">-'+fmt(br.fine)+' so\'m &#128683;<br><span style="font-size:11px;font-weight:400">Jarima</span></div>';
  else html+='<div style="color:'+cCol+';font-size:12px;font-weight:600">'+BC.bonusConv+'%+ ga yeting<br>+'+fmt(BC.bonusAmt)+' bonus!</div>';
  html+='</div></div></div>';
  return html;
}
function getSellerIgConvsForFilter(sellerId){
  const igList=[];
  D.ig.forEach(ig=>{
    const igId=ig.id;
    const dmData=D.igDailyDM[igId]||D.igDailyDM[String(igId)]||{};
    
    // Filter bo'yicha kunlarni tanlaymiz
    let dates=Object.keys(dmData);
    if(T_filter.mode==='today'){
      const yd=yesterday();
      dates=dates.filter(d=>d===yd);
    } else if(T_filter.mode==='range'){
      dates=dates.filter(d=>d>=T_filter.from&&d<=T_filter.to);
    }
    // 'all' - barcha kunlar
    
    if(!dates.length) return;
    
    // Umumiy DM va sotuv
    const totalDm=dates.reduce((a,d)=>a+(dmData[d]||0),0);
    if(!totalDm) return;
    
    const totalSales=D.sales.filter(s=>
      s.sid===sellerId&&
      dates.includes(s.date)&&
      (s.igId===igId||s.igId===Number(igId)||s.igId===String(igId))
    ).length;
    
    const conv=parseFloat(((totalSales/totalDm)*100).toFixed(1));
    igList.push({igId,igName:ig.name,dm:totalDm,sales:totalSales,conv});
  });
  return igList;
}

function getSellerIgConvs(sellerId, date){
  // Har bir Instagram uchun alohida konversiya
  const igList=[];
  D.ig.forEach(ig=>{
    const igId=ig.id;
    const dm=(D.igDailyDM[igId]&&D.igDailyDM[igId][date])
            ||(D.igDailyDM[String(igId)]&&D.igDailyDM[String(igId)][date])||0;
    if(!dm) return;
    const sales=D.sales.filter(s=>s.sid===sellerId&&s.date===date
      &&(s.igId===igId||s.igId===Number(igId)||s.igId===String(igId))).length;
    const conv=((sales/dm)*100);
    igList.push({igId,igName:ig.name,dm,sales,conv:parseFloat(conv.toFixed(1))});
  });
  return igList;
}

function calcSellerBonus(sellerId, date){
  const sel=gS(sellerId);
  if(!sel||sel.role==='targetolog'||sel.role==='mobilograf') return {bonus:0,fine:0,conv:null,dm:0,sales:0,igConvs:[]};
  const BC=D.bonusConfig||{bonusConv:21,bonusAmt:30000,fineConv:10,fineAmt:20000};
  const igConvs=getSellerIgConvs(sellerId,date);
  if(!igConvs.length) return {bonus:0,fine:0,conv:null,dm:0,sales:0,igConvs:[]};
  // O'rtacha konversiya
  const avgConv=igConvs.reduce((a,x)=>a+x.conv,0)/igConvs.length;
  const totalDm=igConvs.reduce((a,x)=>a+x.dm,0);
  const totalSales=igConvs.reduce((a,x)=>a+x.sales,0);
  let bonus=0,fine=0;
  if(avgConv>=BC.bonusConv) bonus=BC.bonusAmt;
  else if(avgConv<BC.fineConv) fine=BC.fineAmt;
  return {bonus,fine,conv:avgConv.toFixed(1),dm:totalDm,sales:totalSales,igConvs};
}


function renderSellerConvPanel(){
  const BC=D.bonusConfig||{bonusConv:21,bonusAmt:30000,fineConv:10,fineAmt:20000};
  const td=today();
  // Filter: tahlil filter bo'yicha - kecha yoki bugun
  const date=T_filter.mode==='today'?yesterday():null;
  
  // Sotuvchi faqat o'zini ko'radi, admin/targetolog hammani ko'radi
  const isSeller=D.user&&D.user.role==='sotuvchi';
  const sellers=isSeller
    ?D.sellers.filter(s=>s.id===D.user.id)
    :D.sellers.filter(s=>s.role==='sotuvchi'||!s.role);
  if(!sellers.length){document.getElementById('sellerConvList').innerHTML='<div style="font-size:13px;color:var(--c5);text-align:center;padding:8px">Sotuvchi yo\'q</div>';return;}
  
  const AV_COLORS=['#DBEAFE|#1e40af','#DCFCE7|#166534','#EDE9FE|#5b21b6','#FCE7F3|#9d174d'];
  
  const cards=sellers.map((sel,idx)=>{
    const [avBg,avCl]=AV_COLORS[idx%AV_COLORS.length].split('|');
    const initials=sel.name.split(' ').map(x=>x[0]||'').join('').slice(0,2).toUpperCase();
    
    // Filter bo'yicha konversiya
    const igConvs=getSellerIgConvsForFilter(sel.id);
    const avgConv=igConvs.length>0?(igConvs.reduce((a,x)=>a+x.conv,0)/igConvs.length):0;
    const BC2=D.bonusConfig||{bonusConv:21,bonusAmt:30000,fineConv:10,fineAmt:20000};
    let bonus=0,fine=0;
    if(igConvs.length>0){
      if(avgConv>=BC2.bonusConv) bonus=BC2.bonusAmt;
      else if(avgConv<BC2.fineConv) fine=BC2.fineAmt;
    }
    const br={conv:avgConv.toFixed(1),bonus,fine,igConvs,dm:igConvs.reduce((a,x)=>a+x.dm,0),sales:igConvs.reduce((a,x)=>a+x.sales,0)};
    const hasData=igConvs.length>0;
    
    const avgColor=avgConv>=(BC.bonusConv||21)?'#15803d':avgConv<(BC.fineConv||10)&&hasData?'#dc2626':'#d97706';
    const footBg=avgConv>=(BC.bonusConv||21)?'#F0FDF4':avgConv<(BC.fineConv||10)&&hasData?'#FEF2F2':'#FFFBEB';
    const footBorder=avgConv>=(BC.bonusConv||21)?'#bbf7d0':avgConv<(BC.fineConv||10)&&hasData?'#fecaca':'#fde68a';
    
    // Bonus/jarima matni
    let netText='';
    if(!hasData) netText='<span style="font-size:12px;color:#d97706">DM kiritilmagan</span>';
    else if(br.bonus>0) netText='<span style="background:#DCFCE7;color:#14532d;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700">+'+fmt(br.bonus)+' bonus</span>';
    else if(br.fine>0) netText='<span style="background:#FEE2E2;color:#991b1b;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700">-'+fmt(br.fine)+' jarima</span>';
    else netText='<span style="font-size:12px;color:#d97706">'+BC.bonusConv+'%+ ga yeting</span>';
    
    // Har bir Instagram satrlari
    const igRows=igConvs.map(ig=>{
      const igConv=ig.conv;
      const igColor=igConv>=(BC.bonusConv||21)?'#15803d':igConv<(BC.fineConv||10)?'#dc2626':'#d97706';
      const barW=Math.min(igConv,100);
      const badge=igConv>=(BC.bonusConv||21)
        ?'<span style="background:#DCFCE7;color:#14532d;font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px">21%+</span>'
        :igConv<(BC.fineConv||10)
        ?'<span style="background:#FEE2E2;color:#991b1b;font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px">10%-</span>'
        :'<span style="background:#FEF3C7;color:#92400e;font-size:10px;padding:2px 6px;border-radius:6px">—</span>';
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 14px;border-top:0.5px solid #f0f0ec">'
        +'<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#f09433,#dc2743,#bc1888);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
        +'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/></svg></div>'
        +'<span style="font-size:12px;font-weight:600;color:var(--purple);min-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+ig.igName+'</span>'
        +'<span style="font-size:11px;color:var(--c4);white-space:nowrap">'+ig.sales+'/'+ig.dm+'</span>'
        +'<div style="flex:1;height:5px;background:var(--bg5);border-radius:3px"><div style="height:5px;border-radius:3px;background:'+igColor+';width:'+Math.min(barW*4,100)+'%"></div></div>'
        +'<span style="font-size:13px;font-weight:700;color:'+igColor+';min-width:38px;text-align:right">'+ig.conv+'%</span>'
        +badge+'</div>';
    }).join('');
    
    // DM yo'q holat
    const noDataRow=!hasData?'<div style="padding:8px 14px;border-top:0.5px solid #f0f0ec;display:flex;align-items:center;gap:6px">'
      +'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      +'<span style="font-size:12px;color:#92400e">DM soni kiritilmagan</span></div>':'';
    
    return '<div style="background:var(--bg1);border-radius:12px;border:0.5px solid var(--bd);margin-bottom:8px;overflow:hidden">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px">'
      +'<div style="display:flex;align-items:center;gap:10px">'
      +'<div style="width:34px;height:34px;border-radius:50%;background:'+avBg+';color:'+avCl+';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0">'+initials+'</div>'
      +'<div>'
      +'<div style="font-size:14px;font-weight:700;color:var(--c1)">'+sel.name+'</div>'
      +'<div style="font-size:11px;color:var(--c4)">'+igConvs.length+' ta Instagram</div>'
      +'</div></div>'
      +(hasData?'<div style="text-align:right"><div style="font-size:11px;color:var(--c4)">o\'rtacha</div><div style="font-size:20px;font-weight:800;color:'+avgColor+'">'+br.conv+'%</div></div>':'')
      +'</div>'
      +igRows
      +noDataRow
      +'<div style="background:'+footBg+';border-top:0.5px solid '+footBorder+';padding:8px 14px;display:flex;align-items:center;justify-content:space-between">'
      +(hasData?'<span style="font-size:11px;color:'+avgColor+'">'+sel.name.split(' ')[0]+" o\'rtacha: "+br.conv+'%</span>':'<span></span>')
      +netText
      +'</div></div>';
  }).join('');
  
  document.getElementById('sellerConvList').innerHTML=cards;
}
function getSellerMonthBonus(sellerId){
  const td=today();
  const curMonth=td.slice(0,7);
  if(gS(sellerId)?.role==='mobilograf') return {totalBonus:0,totalFine:0,net:0};
  let totalBonus=0, totalFine=0;
  // Bu oydagi barcha kunlar
  const days=Object.keys((D.igDailyDM[gS(sellerId)?.igId]||{})).filter(d=>d.startsWith(curMonth));
  days.forEach(d=>{
    const r=calcSellerBonus(sellerId,d);
    totalBonus+=r.bonus;
    totalFine+=r.fine;
  });
  return {totalBonus,totalFine,net:totalBonus-totalFine};
}


