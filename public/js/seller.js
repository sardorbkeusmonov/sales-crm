// --- FILTER ---
function setFilter(mode,el){
  D_filter={mode};
  document.querySelectorAll('#tDash .dfilter').forEach(b=>b.classList.remove('on'));
  if(el)el.classList.add('on');
  renderDash();
}
function filterSales(all){
  const td=today();
  if(D_filter.mode==='today') return all.filter(s=>s.date===td);
  if(D_filter.mode==='range') return all.filter(s=>s.date>=D_filter.from&&s.date<=D_filter.to);
  return all;
}
function periodText(){
  if(D_filter.mode==='today') return 'Bugun - '+today();
  if(D_filter.mode==='range') return D_filter.from+' - '+D_filter.to;
  return 'Barcha vaqt';
}

// --- CALENDAR (dashboard) ---
function openRangePicker(){
  const now=new Date();
  CAL={year:now.getFullYear(),month:now.getMonth(),from:D_filter.from||null,to:D_filter.to||null};
  document.getElementById('rangeErr').style.display='none';
  updateCalDisp();renderCal();
  document.getElementById('rangePickerW').style.display='flex';
}
function closeRangePicker(){document.getElementById('rangePickerW').style.display='none';}
function calPrev(){CAL.month--;if(CAL.month<0){CAL.month=11;CAL.year--;}renderCal();}
function calNext(){CAL.month++;if(CAL.month>11){CAL.month=0;CAL.year++;}renderCal();}
function renderCal(){
  document.getElementById('calMonthLabel').textContent=MONTHS[CAL.month]+' '+CAL.year;
  const first=new Date(CAL.year,CAL.month,1).getDay();
  const days=new Date(CAL.year,CAL.month+1,0).getDate();
  let cells='';
  for(let i=0;i<first;i++) cells+='<div></div>';
  for(let d=1;d<=days;d++){
    const ds=CAL.year+'-'+String(CAL.month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const isF=CAL.from===ds,isT=CAL.to===ds;
    const inR=CAL.from&&CAL.to&&ds>CAL.from&&ds<CAL.to;
    let bg='transparent',col='#1a1a1a',fw='400',br='50%';
    if(isF||isT){bg='#185FA5';col='#fff';fw='700';}
    else if(inR){bg='#DBEAFE';br='0';}
    cells+=`<div onclick="calClick('${ds}')" style="cursor:pointer;padding:7px 2px;border-radius:${br};background:${bg};color:${col};font-weight:${fw};font-size:13px">${d}</div>`;
  }
  document.getElementById('calGrid').innerHTML=cells;
  document.getElementById('rangeHint').textContent=CAL.from&&!CAL.to?'Tugash sanasini tanlang':'Boshlangich sanani tanlang';
}
function calClick(ds){
  if(!CAL.from||CAL.to){CAL.from=ds;CAL.to=null;}
  else if(ds<CAL.from){CAL.to=CAL.from;CAL.from=ds;}
  else{CAL.to=ds;}
  updateCalDisp();renderCal();
}
function updateCalDisp(){
  const f=d=>d?d.split('-').reverse().join('.'):'—';
  document.getElementById('fromDisp').textContent=f(CAL.from);
  document.getElementById('toDisp').textContent=f(CAL.to);
}
function applyRange(){
  if(!CAL.from||!CAL.to){document.getElementById('rangeErr').style.display='block';return;}
  document.getElementById('rangeErr').style.display='none';
  D_filter={mode:'range',from:CAL.from,to:CAL.to};
  document.querySelectorAll('#tDash .dfilter').forEach(b=>b.classList.remove('on'));
  document.getElementById('rangeBtn').classList.add('on');
  closeRangePicker();renderDash();
}

// --- RENDER DASH ---
function renderDash(){
  const as=D.sales;
  const filtered=filterSales(as);
  const filtR=rv(filtered);
  const isToday=D_filter.mode==='today';
  document.getElementById('periodLabel').textContent=periodText();
  document.getElementById('dStats').innerHTML=`
    <div class="st" style="border-left:3px solid #185FA5;padding-left:11px">
      <div class="sl" style="color:#185FA5">${isToday?'Bugungi sotuv':'Davr sotuvlari'}</div>
      <div class="sv" style="font-size:36px">${filtered.length}</div>
      <div class="ss">ta sotuv</div>
    </div>
    <div class="st" style="border-left:3px solid #185FA5;padding-left:11px">
      <div class="sl" style="color:#185FA5">${isToday?'Bugungi daromad':'Davr daromadi'}</div>
      <div class="sv" style="font-size:20px">${fmt(filtR)}</div>
      <div class="ss">so'm</div>
    </div>`;
  const days=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().slice(0,10);days.push({l:d.toLocaleDateString('uz-UZ',{weekday:'short'}),c:as.filter(s=>s.date===ds).length,ds});}
  const mx=Math.max(...days.map(d=>d.c),1);
  const td=today();
  document.getElementById('dBars').innerHTML=days.map(d=>{
    const isTd=d.ds===td;
    const inR=D_filter.mode==='range'?(d.ds>=D_filter.from&&d.ds<=D_filter.to):true;
    const h=Math.max(Math.round(d.c/mx*76),d.c?4:3);
    if(isTd) return`<div class="bc"><div class="bv" style="color:#185FA5;font-weight:700;min-height:18px">${d.c}</div><div class="bar" style="height:${h}px;background:linear-gradient(to top,#185FA5,#3B82F6);box-shadow:0 2px 8px rgba(24,95,165,.35)"></div><div class="bl" style="color:#185FA5;font-weight:700">${d.l}</div></div>`;
    return`<div class="bc"><div class="bv" style="min-height:18px">${d.c||''}</div><div class="bar" style="height:${h}px;background:${inR&&D_filter.mode==='range'?'#93C5FD':'#D1D5DB'}"></div><div class="bl">${d.l}</div></div>`;
  }).join('');
  document.getElementById('salesListTitle').textContent=isToday?'Bugungi sotuvlar':'Davr sotuvlari ('+filtered.length+' ta)';
  window._filteredSales=filtered;
  window._salesShowAll=false;
  const igSt=D.ig.map(ig=>{
    const igSels=D.sellers.filter(s=>s.igId===ig.id);
    const igS=filtered.filter(s=>s.igId===ig.id||(s.igId==null&&igSels.find(x=>x.id===s.sid)));
    return{ig,sels:igSels,cnt:igS.length,r:rv(igS)};
  });
  const mx2=Math.max(...igSt.map(x=>x.cnt),1);
  document.getElementById('igDay').innerHTML=igSt.map((x,idx)=>`
    <div style="padding:12px 14px;${idx<igSt.length-1?'border-bottom:1px solid var(--bg5)':''}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div><div style="font-size:14px;font-weight:700;color:#5b21b6">${x.ig.name}</div>
        <div style="font-size:14px;color:var(--c5);margin-top:2px">${x.sels.length?x.sels.map(s=>s.name).join(', '):'Sotuvchi biriktirilmagan'}</div></div>
        <div style="text-align:right"><div style="font-size:18px;font-weight:700">${x.cnt} ta</div><div style="font-size:15px;color:var(--c4)">${fmt(x.r)} so'm</div></div>
      </div>
      <div class="rb"><div class="rf" style="width:${mx2>0?Math.round(x.cnt/mx2*100):0}%;background:#CECBF6"></div></div>
    </div>`).join('');
  const pc={};filtered.forEach(s=>{pc[s.pid]=(pc[s.pid]||0)+1;});
  const sp=Object.entries(pc).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const mx3=sp.length?sp[0][1]:1;
  document.getElementById('topP').innerHTML=sp.length?sp.map(([pid,cnt])=>{const p=gP(+pid);if(!p)return'';return`<div class="lr"><div class="dot" style="background:${p.color}"></div><span style="flex:1;font-size:13px">${p.name}</span><div class="rb" style="width:80px"><div class="rf" style="width:${Math.round(cnt/mx3*100)}%;background:${p.color}"></div></div><span style="font-size:13px;font-weight:600;margin-left:8px">${cnt}</span></div>`}).join(''):'<div style="padding:14px;font-size:13px;color:var(--c5)">Hali sotuv yo\'q</div>';
  renderSalesList(filtered, false);
}

// --- JAMOA ---
function renderJamoa(){
  const td=today();
  const curMon=td.slice(0,7);
  // D.sellers dedup
  const _jSeen=new Set();
  
  const sStats=D.sellers.filter(sel=>sel.role==='sotuvchi').map(sel=>{const ss=D.sales.filter(s=>s.sid===sel.id);return{sel,total:ss.length,today:ss.filter(s=>s.date===td).length,month:ss.filter(s=>s.date.startsWith(curMon)).length,r:rv(ss)};});
  const srtd=[...sStats].sort((a,b)=>b.today-a.today||b.month-a.month);const mx=Math.max(...srtd.map(s=>s.today),1);
  const igSt=D.ig.map(ig=>{const igSels=D.sellers.filter(s=>s.igId===ig.id);const ss=D.sales.filter(s=>s.igId===ig.id||(s.igId==null&&igSels.find(x=>x.id===s.sid)));return{ig,igSels,total:ss.length,today:ss.filter(s=>s.date===td).length,month:ss.filter(s=>s.date.startsWith(curMon)).length,r:rv(ss)};});
  const srtdIg=[...igSt].sort((a,b)=>b.today-a.today||b.month-a.month);const mxI=Math.max(...srtdIg.map(s=>s.today),1);
  document.getElementById('jS').innerHTML=`
    <div class="sg" style="margin-bottom:12px">
      <div class="st"><div class="sl">Bugungi sotuv</div><div class="sv">${sStats.reduce((a,s)=>a+s.today,0)}<span style="font-size:14px;font-weight:400;color:var(--c5);margin-left:3px">ta</span></div></div>
      <div class="st"><div class="sl">Oylik sotuv</div><div class="sv">${sStats.reduce((a,s)=>a+s.month,0)}<span style="font-size:14px;font-weight:400;color:var(--c5);margin-left:3px">ta</span></div><div class="ss">${curMon}</div></div>
    </div>
    ${srtd.map((s,i)=>{
      const isTop=i===0&&s.today>0;
      const pct=mx>0?Math.round(s.today/mx*100):0;
      const medal=i===0?'<span style="font-size:22px">&#127942;</span>':i===1?'<span style="font-size:22px">&#129352;</span>':i===2?'<span style="font-size:22px">&#129353;</span>':`<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:var(--bg5);color:var(--c4);font-size:12px;font-weight:700">${i+1}</span>`;
      return`<div style="background:var(--bg1);border:1px solid var(--bd3);border-radius:12px;padding:14px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:${s.today>0?10:0}px">
          <div style="width:28px;text-align:center;font-size:18px">${medal}</div>
          <div class="av" style="${avSt(s.sel.ai||0)}">${ini(s.sel.name)}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:14px;font-weight:600">${s.sel.name}</span>
              ${isTop?'<span style="background:#FEF3C7;color:#92400e;font-size:13px;padding:2px 7px;border-radius:10px;font-weight:600">Lider</span>':''}
            </div>
            <div style="font-size:14px;color:#5b21b6;margin-top:1px">${gI(s.sel.igId)?gI(s.sel.igId).name:''}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:26px;font-weight:700;color:${isTop?'#f59e0b':'#1a1a1a'}">${s.today}<span style="font-size:13px;font-weight:400;color:var(--c5);margin-left:2px">ta</span></div>
            <div style="font-size:14px;color:var(--c4);margin-top:2px">bu oy: ${s.month} ta</div>
          </div>
        </div>
        ${s.today>0?`<div style="background:var(--bg5);border-radius:4px;height:6px;overflow:hidden"><div style="height:6px;border-radius:4px;background:${isTop?'#f59e0b':'#93C5FD'};width:${pct}%"></div></div>`:''}
      </div>`;
    }).join('')}
  `;
  document.getElementById('jI').innerHTML=`
    <div class="sg" style="margin-bottom:12px">
      <div class="st"><div class="sl">Bugungi sotuv</div><div class="sv">${igSt.reduce((a,s)=>a+s.today,0)}<span style="font-size:14px;font-weight:400;color:var(--c5);margin-left:3px">ta</span></div></div>
      <div class="st"><div class="sl">Oylik sotuv</div><div class="sv">${igSt.reduce((a,s)=>a+s.month,0)}<span style="font-size:14px;font-weight:400;color:var(--c5);margin-left:3px">ta</span></div><div class="ss">${curMon}</div></div>
    </div>
    <div class="card"><div class="ch">Instagram profil reytingi</div>${srtdIg.map((s,i)=>{
      const isTop=i===0&&s.today>0;
      const pct=mxI>0?Math.round(s.today/mxI*100):0;
      const medal=i===0?'<span style="font-size:22px">&#127942;</span>':i===1?'<span style="font-size:22px">&#129352;</span>':i===2?'<span style="font-size:22px">&#129353;</span>':`<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:var(--bg5);color:var(--c4);font-size:12px;font-weight:700">${i+1}</span>`;
      return`<div style="background:var(--bg1);border:1px solid var(--bd3);border-radius:12px;padding:14px;margin:0 14px 8px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:${s.today>0?10:0}px">
          <div style="width:28px;text-align:center;font-size:18px">${medal}</div>
          <div style="width:36px;height:36px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ig_g" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FFDC80"/>
      <stop offset="25%" style="stop-color:#FCAF45"/>
      <stop offset="50%" style="stop-color:#F77737"/>
      <stop offset="75%" style="stop-color:#C13584"/>
      <stop offset="100%" style="stop-color:#833AB4"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig_g)"/>
  <circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="1.8"/>
  <circle cx="17" cy="7" r="1.2" fill="#fff"/>
</svg></div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:14px;font-weight:700;color:#5b21b6">${s.ig.name}</span>
              ${isTop?'<span style="background:#FEF3C7;color:#92400e;font-size:13px;padding:2px 7px;border-radius:10px;font-weight:600">Lider</span>':''}
            </div>
            <div style="font-size:14px;color:var(--c4);margin-top:1px">${s.igSels.map(x=>x.name).join(', ')||'-'}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:26px;font-weight:700;color:${isTop?'#f59e0b':'#1a1a1a'}">${s.today}<span style="font-size:13px;font-weight:400;color:var(--c5);margin-left:2px">ta</span></div>
            <div style="font-size:14px;color:var(--c4);margin-top:2px">bu oy: ${s.month} ta</div>
          </div>
        </div>
        ${s.today>0?`<div style="background:var(--bg5);border-radius:4px;height:6px;overflow:hidden"><div style="height:6px;border-radius:4px;background:${isTop?'#f59e0b':'#CECBF6'};width:${pct}%"></div></div>`:''}
      </div>`;
    }).join('')}</div>`;
}
function jView(v,el){document.querySelectorAll('#jSeg .sb').forEach(b=>b.classList.remove('on'));if(el)el.classList.add('on');document.getElementById('jS').style.display=v==='s'?'block':'none';document.getElementById('jI').style.display=v==='i'?'block':'none';}
function sView(v,el){
  document.querySelectorAll('#sSeg .sb').forEach(b=>b.classList.remove('on'));
  if(el)el.classList.add('on');
  document.getElementById('sViewSellers').style.display=v==='sellers'?'block':'none';
  document.getElementById('sViewInstagram').style.display=v==='instagram'?'block':'none';
  document.getElementById('sViewDavomat').style.display=v==='davomat'?'block':'none';
  if(v==='davomat') renderDavomat();
}

// ===== DAVOMAT (SELLER SIDE) =====
function renderSellerProf(){
  const el=document.getElementById('sellerProfContent');
  if(!el) return;
  const uid=D.user?D.user.id:null;
  const td=today();
  const att=(D.attendance||[]).filter(a=>String(a.sellerId)===String(uid)&&a.date===td);
  const keldi=att.find(a=>a.type==='keldi');
  const ketdi=att.find(a=>a.type==='ketdi');
  const sel=D.user||{};
  const av=`<div class="av" style="${avSt(sel.ai||0)};width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;flex-shrink:0">${ini(sel.name||'?')}</div>`;
  const photoCard=(rec,label)=>rec&&rec.photoUrl?`<div style="margin-top:8px"><img src="${rec.photoUrl}" style="width:100%;max-width:260px;border-radius:12px;display:block" onerror="this.style.display='none'"><div style="font-size:12px;color:var(--c4);margin-top:4px">${label}: ${rec.time}</div></div>`
    :rec?`<div style="font-size:13px;color:#16a34a;margin-top:6px">&#10003; ${label}: ${rec.time}</div>`:'';
  let actionHtml='';
  if(!keldi){
    actionHtml=`<button onclick="openAttCam('keldi')" style="width:100%;padding:16px;background:#185FA5;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px">&#128247; Keldim</button>`;
  } else if(!ketdi){
    actionHtml=`<div style="background:#DCFCE7;color:#16a34a;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:700;margin-top:8px">&#10003; Keldingiz: ${keldi.time}</div>
    ${keldi.photoUrl?`<img src="${keldi.photoUrl}" style="width:100%;max-width:260px;border-radius:12px;margin-top:8px;display:block" onerror="this.style.display='none'">`:'' }
    <button onclick="openAttCam('ketdi')" style="width:100%;padding:14px;background:#dc2626;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px">&#128247; Ketdim</button>`;
  } else {
    actionHtml=`<div style="background:#DCFCE7;color:#16a34a;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:700;margin-top:8px">&#10003; Keldingiz: ${keldi.time}</div>
    ${keldi.photoUrl?`<img src="${keldi.photoUrl}" style="width:100%;max-width:260px;border-radius:12px;margin-top:8px;display:block" onerror="this.style.display='none'">`:'' }
    <div style="background:#FEF2F2;color:#dc2626;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:700;margin-top:8px">&#10003; Ketdingiz: ${ketdi.time}</div>
    ${ketdi.photoUrl?`<img src="${ketdi.photoUrl}" style="width:100%;max-width:260px;border-radius:12px;margin-top:8px;display:block" onerror="this.style.display='none'">`:'' }`;
  }
  el.innerHTML=`
    <div class="sc-card" style="margin-top:8px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
        ${av}
        <div>
          <div style="font-size:18px;font-weight:700;color:var(--c1)">${sel.name||''}</div>
          <div style="font-size:14px;color:var(--c4);margin-top:2px">${sel.role==='sotuvchi'?'Sotuvchi':sel.role||''}</div>
        </div>
      </div>
      <div style="border-top:1px solid var(--bd);padding-top:14px">
        <div style="font-size:14px;font-weight:700;color:var(--c1);margin-bottom:8px">&#128197; Bugungi davomat — ${td}</div>
        ${actionHtml}
      </div>
    </div>`;
}

let _attType=null;
function openAttCam(type){
  _attType=type;
  const inp=document.getElementById('attCamInput');
  if(inp){inp.value='';inp.click();}
}
async function handleAttPhoto(input){
  const file=input.files[0];
  if(!file||!_attType) return;
  const uid=D.user?D.user.id:null;
  if(!uid) return;
  const td=today();
  const att=(D.attendance||[]).filter(a=>String(a.sellerId)===String(uid)&&a.date===td);
  if(_attType==='keldi'&&att.find(a=>a.type==='keldi')){showToast('Bugun allaqachon kelganingiz qayd etilgan');return;}
  if(_attType==='ketdi'&&att.find(a=>a.type==='ketdi')){showToast('Bugun allaqachon ketganingiz qayd etilgan');return;}
  if(_attType==='ketdi'&&!att.find(a=>a.type==='keldi')){showToast("Avval 'Keldim' bosing");return;}
  const reader=new FileReader();
  reader.onload=async function(e){
    const base64=e.target.result;
    const now=new Date();
    const time=now.toTimeString().slice(0,5);
    const path=`attendance/${td}_${uid}_${_attType}_${Date.now()}.jpg`;
    showLoader(true);
    try{
      const url=await window.FS.uploadImage(base64,path);
      const record={sellerId:uid,sellerName:D.user.name||'',type:_attType,date:td,time,photoUrl:url||'',timestamp:now.toISOString()};
      await window.FS.saveAttendance(record);
      D.attendance.push(record);
      renderSellerProf();
      showToast(_attType==='keldi'?'Kelish qayd etildi ✓':'Ketish qayd etildi ✓');
    }catch(ex){showToast('Xatolik: '+ex.message);}
    showLoader(false);
  };
  reader.readAsDataURL(file);
}

// --- MY JAMOA ---
function renderMyJ(){
  const td=today();
  const curMonth=td.slice(0,7);
  const sStats=D.sellers.filter(s=>s.role==='sotuvchi'||!s.role).map(sel=>{
    const ss=D.sales.filter(s=>s.sid===sel.id);
    const todaySales=ss.filter(s=>s.date===td);
    const monthSales=ss.filter(s=>s.date.startsWith(curMonth));
    return{sel,total:ss.length,today:todaySales.length,month:monthSales.length,r:rv(ss)};
  });
  const srtd=[...sStats].sort((a,b)=>b.today-a.today||b.month-a.month);
  const mx=Math.max(...srtd.map(s=>s.today),1);
  const isMe=id=>D.user.id===id;
  const topId=srtd.length&&srtd[0].today>0?srtd[0].sel.id:null;

  const igStats=D.ig.map(ig=>{
    const igSels=D.sellers.filter(s=>s.igId===ig.id);
    const ss=D.sales.filter(s=>igSels.find(x=>x.id===s.sid));
    return{ig,igSels,total:ss.length,today:ss.filter(s=>s.date===td).length};
  }).sort((a,b)=>b.total-a.total);
  const mxI=Math.max(...igStats.map(s=>s.total),1);

  // My position
  const myPos=srtd.findIndex(s=>isMe(s.sel.id));
  const myData=srtd.find(s=>isMe(s.sel.id));

  document.getElementById('mjS').innerHTML=`
    <!-- Hero motivatsiya -->
    <div style="background:linear-gradient(135deg,#185FA5,#1e40af);border-radius:16px;padding:20px;margin-bottom:14px;color:#fff">
      <div style="font-size:15px;opacity:.8;margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em">Sizning natijangiz</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:48px;font-weight:700;line-height:1">${myData?myData.today:0}<span style="font-size:18px;font-weight:400;opacity:.8;margin-left:4px">ta</span></div>
          <div style="font-size:13px;opacity:.8;margin-top:6px">bugungi sotuv</div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,.25);height:60px;flex-shrink:0"></div>
        <div style="text-align:right">
          <div style="font-size:14px;opacity:.7;text-transform:uppercase;letter-spacing:.06em">Oylik</div>
          <div style="font-size:32px;font-weight:700;line-height:1.1">${myData?myData.month:0}</div>
          <div style="font-size:15px;opacity:.8">ta sotuv</div>
        </div>
      </div>
      ${(()=>{
      if(myPos===0) return '<div style="margin-top:12px;background:rgba(255,255,255,.2);border-radius:8px;padding:8px 12px;font-size:13px;font-weight:600">&#127942; Siz lider sotuvchisiz! Davom eting!</div>';
      if(myPos===1) return '<div style="margin-top:12px;background:rgba(255,255,255,.15);border-radius:8px;padding:8px 12px;font-size:13px">&#128293; Juda yaxshi! Biroz ko\'proq sotsangiz 1-o\'rin sizniki!</div>';
      if(myPos>=0) return '<div style="margin-top:12px;background:rgba(255,255,255,.15);border-radius:8px;padding:8px 12px;font-size:13px">&#128170; '+(myPos+1)+'-o\'rin. Yuqorilamoq mumkin!</div>';
      return '';
    })()}
    </div>
    <!-- Reyting -->
    <div style="font-size:13px;font-weight:700;color:var(--c1);margin-bottom:10px">&#127942; Sotuvchilar reytingi</div>
    ${srtd.map((s,i)=>{
      const isTop=i===0&&s.today>0;
      const isMyRow=isMe(s.sel.id);
      const pct=Math.round(s.today/mx*100);
      const medal=i===0?'<span style="font-size:22px">&#127942;</span>':i===1?'<span style="font-size:22px">&#129352;</span>':i===2?'<span style="font-size:22px">&#129353;</span>':`<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:var(--bg5);color:var(--c4);font-size:12px;font-weight:700">${i+1}</span>`;
      return`<div style="background:${isMyRow?'var(--pbg)':'var(--bg1)'};border:${isMyRow?'1.5px solid var(--p)':'1px solid var(--bd3)'};border-radius:12px;padding:14px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:${s.total>0?10:0}px">
          <div style="width:28px;text-align:center;font-size:18px">${medal}</div>
          <div class="av" style="${avSt(s.sel.ai||0)}">${ini(s.sel.name)}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:14px;font-weight:600">${s.sel.name}</span>
              ${isTop?'<span style="background:#FEF3C7;color:#92400e;font-size:13px;padding:2px 7px;border-radius:10px;font-weight:600">Lider</span>':''}
              ${isMyRow?'<span style="background:#DBEAFE;color:#1e40af;font-size:13px;padding:2px 7px;border-radius:10px;font-weight:600">Men</span>':''}
            </div>
            <div style="font-size:14px;color:#5b21b6;margin-top:1px">${gI(s.sel.igId)?gI(s.sel.igId).name:''}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:26px;font-weight:700;color:${isTop?'#f59e0b':isMyRow?'#185FA5':'#1a1a1a'}">${s.today}<span style="font-size:13px;font-weight:400;color:var(--c5);margin-left:2px">ta</span></div>
            <div style="font-size:14px;color:var(--c4);margin-top:2px">bu oy: ${s.month} ta</div>
          </div>
        </div>
        ${s.total>0?`<div style="background:var(--bg5);border-radius:4px;height:6px;overflow:hidden"><div style="height:6px;border-radius:4px;background:${isMyRow?'#185FA5':isTop?'#f59e0b':'#93C5FD'};width:${pct}%"></div></div>`:''}
      </div>`;
    }).join('')}
  `;

  document.getElementById('mjI').innerHTML=`
    <div style="font-size:13px;font-weight:700;color:var(--c1);margin-bottom:10px"><span style="display:inline-flex;align-items:center;gap:6px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e1306c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>Instagram profil reytingi</span></div>
    ${igStats.map((s,i)=>{
      const myIg=D.user.igId===s.ig.id;
      const pct=Math.round(s.total/mxI*100);
      return`<div style="background:${myIg?'var(--pbg)':'var(--bg1)'};border:${myIg?'1.5px solid var(--p)':'1px solid var(--bd3)'};border-radius:12px;padding:14px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:${s.total>0?10:0}px">
          <div style="width:28px;text-align:center;font-size:16px">${i===0?'&#127942;':i===1?'&#129352;':i===2?'&#129353;':i+1}</div>
          <div style="width:36px;height:36px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ig_g" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FFDC80"/>
      <stop offset="25%" style="stop-color:#FCAF45"/>
      <stop offset="50%" style="stop-color:#F77737"/>
      <stop offset="75%" style="stop-color:#C13584"/>
      <stop offset="100%" style="stop-color:#833AB4"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig_g)"/>
  <circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="1.8"/>
  <circle cx="17" cy="7" r="1.2" fill="#fff"/>
</svg></div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700;color:#5b21b6">${s.ig.name}${myIg?' <span style="background:#DBEAFE;color:#1e40af;font-size:13px;padding:2px 7px;border-radius:10px;font-weight:600">Mening</span>':''}</div>
            <div style="font-size:14px;color:var(--c4);margin-top:1px">${s.igSels.map(x=>x.name).join(', ')||'-'}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:20px;font-weight:700">${s.total}</div>
            <div style="font-size:14px;color:var(--c4)">bugun: ${s.today} ta</div>
          </div>
        </div>
        ${s.total>0?`<div style="background:var(--bg5);border-radius:4px;height:6px;overflow:hidden"><div style="height:6px;border-radius:4px;background:${myIg?'#185FA5':'#CECBF6'};width:${pct}%"></div></div>`:''}
      </div>`;
    }).join('')}
  `;
}
function mjView(v,el){document.querySelectorAll('#tMyJ .sb').forEach(b=>b.classList.remove('on'));if(el)el.classList.add('on');document.getElementById('mjS').style.display=v==='s'?'block':'none';document.getElementById('mjI').style.display=v==='i'?'block':'none';}

// --- MY DASH ---
function renderMyD(){
  const ms=myS();const td=today();
  const todS=ms.filter(s=>s.date===td);
  const totR=rv(ms);const todR=rv(todS);
  const ig=gI(D.user.igId);
  document.getElementById('myStats').innerHTML=(()=>{
    const comm=D.user.comm||10000;
    const todayEarned=todS.length*comm;
    return `
    <div class="st" style="border-left:3px solid #185FA5;padding-left:11px">
      <div class="sl" style="color:#185FA5">Bugungi sotuv</div>
      <div class="sv" style="font-size:36px">${todS.length}<span style="font-size:16px;font-weight:400;color:var(--c4);margin-left:4px">ta</span></div>
      ${ig?'<div class="ss" style="color:#5b21b6">'+ig.name+'</div>':''}
    </div>
    <div class="st" style="border-left:3px solid #22c55e;padding-left:11px">
      <div class="sl" style="color:#22c55e">Bugun topdim</div>
      <div class="sv" style="font-size:20px;color:#15803d">${fmt(todayEarned)}</div>
      <div class="ss">so'm</div>
    </div>
    <div style="grid-column:1/-1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:0">
      <div>
        <div style="font-size:14px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:.04em">1 sotuvdan olaman</div>
        <div style="font-size:28px;font-weight:700;color:#15803d;line-height:1.1">${fmt(comm)}</div>
        <div style="font-size:15px;color:#166534">so'm</div>
      </div>
      <div style="font-size:36px">&#128176;</div>
    </div>
    ${renderYesterdayBonus(D.user.id)}
    `;
  })();
  renderSotuv();
}

// --- SOTUV ---
function renderSotuv(){
  const searchEl=document.getElementById('sotuvSearch');
  const q=searchEl?searchEl.value.trim().toLowerCase():'';
  const allSP=q?D.products.filter(p=>p.name.toLowerCase().includes(q)):D.products;
  if(!allSP.length){document.getElementById('prodList').innerHTML='<div style="text-align:center;padding:30px;color:var(--c5);font-size:13px">Mahsulotlar yuklanmoqda...</div>';renderCartBar();return;}
  const _SP=20,_spg=window._sotuvPage||1,_st=allSP.length,_ss=(_spg-1)*_SP;
  const myProds=allSP.slice(_ss,_ss+_SP);
  const _sh='<div style="font-size:13px;font-weight:700;color:var(--c5);padding:4px 2px 8px">Mahsulotlar '+(_ss+1)+'–'+Math.min(_ss+_SP,_st)+' / '+_st+'</div>';
  let _spn='';
  if(Math.ceil(_st/_SP)>1){
    const _tp=Math.ceil(_st/_SP);let _bt='';
    for(let i=1;i<=_tp;i++){const on=i===_spg;_bt+='<button onclick="window._sotuvPage='+i+';renderSotuv()" style="min-width:34px;height:34px;border-radius:8px;border:'+(on?'2px solid var(--p)':'1px solid var(--bd)')+';background:'+(on?'var(--pbg)':'var(--bg1)')+';color:'+(on?'var(--p)':'var(--c2)')+';font-size:14px;cursor:pointer;font-family:inherit">'+i+'</button>';}
    _spn='<div style="padding:12px 0;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><button onclick="if(window._sotuvPage>1){window._sotuvPage--;renderSotuv()}" '+((_spg===1)?'disabled':'')+' style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;opacity:'+((_spg===1)?'.4':'1')+'">&#8249;</button>'+_bt+'<button onclick="if(window._sotuvPage<'+_tp+'){window._sotuvPage++;renderSotuv()}" '+((_spg===_tp)?'disabled':'')+' style="min-width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg1);color:var(--c2);font-size:16px;cursor:pointer;opacity:'+((_spg===_tp)?'.4':'1')+'">&#8250;</button></div>';
  }
  document.getElementById('prodList').innerHTML=(_st?_sh:'')+myProds.map(p=>{
    if(!D.cart) D.cart=[];
    const cnt=D.sales.filter(s=>String(s.sid)===String(D.user.id)&&String(s.pid)===String(p.id)).length;
    const cartQty=(D.cart||[]).filter(c=>String(c.pid)===String(p.id)).reduce((a,c)=>a+c.qty,0);
    const _left=getStockLeft(p);
    const _st=getStockStatus(_left);
    const _badge=_left===null?'':_left===0
      ?'<span style="background:#FEE2E2;color:#991b1b;padding:2px 7px;border-radius:6px;font-size:11px;font-weight:700">Tugagan</span>'
      :_left<=2
      ?'<span style="background:#FEF3C7;color:#92400e;padding:2px 7px;border-radius:6px;font-size:11px;font-weight:700">'+_left+' ta qoldi</span>'
      :'<span style="background:#DCFCE7;color:#14532d;padding:2px 7px;border-radius:6px;font-size:11px;font-weight:700">'+_left+' ta bor</span>';
    const ih=p.img?`<img src="${p.img}" class="pi">`:`<div class="pib"><div class="pib-inner"><div style="width:60px;height:60px;border-radius:14px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:24px">&#128230;</div></div></div>`;
    return`<div class="pc" style="display:flex;flex-direction:row;align-items:stretch">
  <div style="width:110px;flex-shrink:0;background:var(--bg3);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;border-radius:12px 0 0 12px;position:relative;cursor:pointer" onclick="showProdImg(${p.id})">
    ${(()=>{const imgs=p.imgs&&p.imgs.length?p.imgs:(p.img?[p.img]:[]);if(!imgs.length) return '<div style="width:60px;height:60px;border-radius:10px;background:var(--bg5);display:flex;align-items:center;justify-content:center;font-size:24px">&#128230;</div>';return '<img src="'+imgs[0]+'" style="width:110px;height:110px;object-fit:contain;padding:8px">'+(imgs.length>1?'<div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,.5);color:white;font-size:10px;padding:2px 5px;border-radius:6px">+'+imgs.length+'</div>':'');})()}
  </div>
  <div style="flex:1;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;min-width:0;background:var(--bg1)">
    <div>
      <div style="font-size:14px;font-weight:700;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--c1)">${p.name}</div>
      ${_badge?`<div style="margin-bottom:3px">${_badge}</div>`:''}
      <div style="font-size:13px;color:var(--p);font-weight:600;margin-bottom:3px">${fmt(p.price)} so'm</div>
      <div style="font-size:14px;color:var(--c4)">Men sotdim: ${cnt} ta</div>
    </div>
    <button style="width:100%;${cartQty?'background:var(--pbg);color:var(--p);border:2px solid var(--p)':'background:#185FA5;color:#fff;border:none'};border-radius:8px;padding:11px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:10px" onclick="addToCart(${p.id})">${cartQty?'&#128722; Savatchada ('+cartQty+' ta) +':'&#128722; Savatchaga +'}</button>
  </div>
</div>`;
  }).join('')+_spn+(()=>{
    if(!D.cart) D.cart=[];
    const _cq=D.cart.reduce((a,it)=>a+it.qty,0);
    const _ct=D.cart.reduce((a,it)=>a+(it.price*it.qty),0);
    if(!_cq) return '';
    return '<div style="margin:16px 0 8px;background:var(--pbg);border-radius:14px;padding:16px;border:2px solid var(--p)">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
      +'<div style="font-size:14px;font-weight:700;color:var(--p)">&#128722; Savatcha: '+_cq+' ta mahsulot</div>'
      +'<div style="font-size:15px;font-weight:800;color:var(--p)">'+fmt(_ct)+' so\'m</div>'
      +'</div>'
      +'<button onclick="openOrderForm()" style="width:100%;background:#185FA5;color:white;border:none;border-radius:10px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">Sotuv qilish &#8594;</button>'
      +'</div>';
  })();
  renderCartBar();
}
function askSell(id){addToCart(id);}

function addToCart(id){
  if(!D.cart) D.cart=[];
  D.cartAddMode=true;
  D.pPid=id;
  const p=gP(id);
  D.saleSelectedImg=p.img||'';
  const rawImgs=(Array.isArray(p.imgs)?p.imgs:[]).filter(Boolean);
  const imgs=rawImgs.length>1?rawImgs:(p.img?[p.img]:[]);
  if(imgs.length>1){
    showProdImg(id,'select');
    return;
  }
  addToCartContinue();
}

function addToCartContinue(){
  if(!D.cart) D.cart=[];
  const pid=D.pPid;
  const p=gP(pid);
  if(!p) return;
  const si=D.saleSelectedImg||p.img||'';
  const existing=D.cart.find(c=>String(c.pid)===String(pid)&&c.selectedImg===si);
  if(existing){existing.qty++;}
  else{D.cart.push({pid:p.id,qty:1,selectedImg:si,price:p.price});}
  D.cartAddMode=false;
  showToast(p.name+' savatchaga qo\'shildi!');
  renderSotuv();
}

function selectSaleImg(url,idx){
  D.saleSelectedImg=url;
  const bi=document.getElementById('imgSelBig');
  if(bi) bi.src=url;
  document.querySelectorAll('[id^="imgOpt_"]').forEach(function(el,i){
    el.style.borderColor=i===idx?'#185FA5':'#e5e7eb';
    el.style.background=i===idx?'#EFF6FF':'#f8f8f6';
  });
}

function closeImgSel(){
  document.getElementById('imgSelW').classList.remove('show');
  D.pPid=null;D.saleSelectedImg='';
}

function confirmImgSel_img(){
  document.getElementById('imgSelW').classList.remove('show');
  if(D.cartAddMode){addToCartContinue();}else{askSellContinue();}
}

function askSellContinue(){
  const p=gP(D.pPid);if(!p)return;
  // D.ig dedup by numeric id
  const seenIds=new Set();
  const uniqIg=D.ig.filter(function(ig){const k=Number(ig.id);if(isNaN(k)||seenIds.has(k))return false;seenIds.add(k);return true;});
  D.saleIgId=D.user.igId?Number(D.user.igId):(uniqIg[0]?uniqIg[0].id:null);
  const igList=uniqIg.map(function(ig){return '<div onclick="selectSaleIg('+ig.id+')" id="sig_'+ig.id+'" style="padding:10px 14px;border-radius:10px;border:2px solid #eee;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f09433,#dc2743,#bc1888);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div><span style="font-size:14px;font-weight:600">'+ig.name+'</span></div>';}).join('');
  document.getElementById('igSelBody').innerHTML=`<div style="font-size:15px;font-weight:700;margin-bottom:4px">${p.name}</div><div style="font-size:13px;color:#185FA5;margin-bottom:16px">${fmt(p.price)} so'm</div><div style="font-size:13px;color:#666;margin-bottom:10px">Qaysi Instagram orqali sotuv?</div>${igList}`;
  updateIgSel();
  document.getElementById('igSelW').classList.add('show');
}

function selectSaleIg(igId){D.saleIgId=Number(igId);updateIgSel();}
function updateIgSel(){
  const _seen=new Set();
  const _uniq=D.ig.filter(ig=>{const k=Number(ig.id);if(isNaN(k)||_seen.has(k))return false;_seen.add(k);return true;});
  _uniq.forEach(ig=>{
    const el=document.getElementById('sig_'+ig.id);
    if(el){
      el.style.borderColor=Number(ig.id)===Number(D.saleIgId)?'#185FA5':'#eee';
      el.style.background=Number(ig.id)===Number(D.saleIgId)?'#EFF6FF':'white';
    }
  });
}
function confirmIgSel(){
  document.getElementById('igSelW').classList.remove('show');
  if(!D.cart||!D.cart.length) return;
  renderCartItems();
  document.getElementById('custName').value='';
  document.getElementById('custPhone').value='';
  document.getElementById('custAddress').value='';
  const noteEl=document.getElementById('custNote');if(noteEl)noteEl.value='';
  document.getElementById('custPayType').value='card';
  setPayType('card');
  document.getElementById('confErr').style.display='none';
  const prevEl=document.getElementById('receiptPreview');
  const placEl=document.getElementById('receiptPlaceholder');
  if(prevEl)prevEl.style.display='none';
  if(placEl)placEl.style.display='block';
  D_receiptImg=null;
  document.getElementById('confW').classList.add('show');
}
function closeIgSel(){document.getElementById('igSelW').classList.remove('show');D.saleIgId=null;}

let _sellLock=false;

function renderCartBar(){
  if(!D.cart) D.cart=[];
  // Eski floating bar ni o'chirish
  const oldBar=document.getElementById('cartBar');
  if(oldBar) oldBar.remove();
  // Tab badge yangilash
  const badge=document.getElementById('cartBadge');
  if(!badge) return;
  const totalQty=D.cart.reduce((a,it)=>a+it.qty,0);
  if(totalQty>0){
    badge.textContent=totalQty>9?'9+':String(totalQty);
    badge.style.display='inline-block';
  } else {
    badge.style.display='none';
  }
}

function openOrderForm(){
  if(!D.cart||!D.cart.length){showToast('Savatcha bo\'sh!');return;}
  const seenIds=new Set();
  const uniqIg=D.ig.filter(function(ig){const k=Number(ig.id);if(isNaN(k)||seenIds.has(k))return false;seenIds.add(k);return true;});
  D.saleIgId=D.user.igId?Number(D.user.igId):(uniqIg[0]?uniqIg[0].id:null);
  if(!uniqIg.length){confirmIgSel();return;}
  const totalQty=D.cart.reduce((a,it)=>a+it.qty,0);
  const totalPrice=D.cart.reduce((a,it)=>a+(it.price*it.qty),0);
  const igList=uniqIg.map(function(ig){return '<div onclick="selectSaleIg('+ig.id+')" id="sig_'+ig.id+'" style="padding:10px 14px;border-radius:10px;border:2px solid #eee;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f09433,#dc2743,#bc1888);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div><span style="font-size:14px;font-weight:600">'+ig.name+'</span></div>';}).join('');
  document.getElementById('igSelBody').innerHTML='<div style="font-size:15px;font-weight:700;margin-bottom:4px">Buyurtma: '+totalQty+' ta mahsulot</div><div style="font-size:13px;color:#185FA5;margin-bottom:16px">Jami: '+fmt(totalPrice)+' so\'m</div><div style="font-size:13px;color:#666;margin-bottom:10px">Qaysi Instagram orqali sotuv?</div>'+igList;
  updateIgSel();
  document.getElementById('igSelW').classList.add('show');
}

function renderCartItems(){
  const list=document.getElementById('cartItemsList');
  const totalEl=document.getElementById('cartTotalAmt');
  if(!list) return;
  if(!D.cart||!D.cart.length){list.innerHTML='';if(totalEl)totalEl.textContent='0 so\'m';return;}
  let total=0;
  list.innerHTML=D.cart.map(function(item,i){
    const p=gP(item.pid);
    const name=p?p.name:'Mahsulot';
    const lineTotal=item.price*item.qty;
    total+=lineTotal;
    const imgHtml=item.selectedImg
      ?'<img src="'+item.selectedImg+'" style="width:48px;height:48px;object-fit:contain;border-radius:8px;background:#f8f8f6;flex-shrink:0">'
      :'<div style="width:48px;height:48px;border-radius:8px;background:#f5f5f0;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">&#128230;</div>';
    return '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#f8f9fb;border-radius:12px;margin-bottom:8px">'
      +imgHtml
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+name+'</div>'
      +'<div style="font-size:12px;color:#185FA5;font-weight:600">'+fmt(item.price)+' so\'m &times; '+item.qty+' = '+fmt(lineTotal)+' so\'m</div>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:5px;flex-shrink:0">'
      +'<button onclick="updateCartQty('+i+',-1)" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--bd4);background:var(--bg1);font-size:16px;cursor:pointer;font-family:inherit">&#8722;</button>'
      +'<span style="font-size:14px;font-weight:700;min-width:18px;text-align:center">'+item.qty+'</span>'
      +'<button onclick="updateCartQty('+i+',1)" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--bd4);background:var(--bg1);font-size:16px;cursor:pointer;font-family:inherit">+</button>'
      +'<button onclick="removeFromCart('+i+')" style="width:28px;height:28px;border-radius:8px;border:none;background:#FEE2E2;color:#dc2626;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">&#10005;</button>'
      +'</div></div>';
  }).join('');
  if(totalEl)totalEl.textContent=fmt(total)+' so\'m';
}

function updateCartQty(idx,delta){
  if(!D.cart||!D.cart[idx]) return;
  D.cart[idx].qty=Math.max(1,D.cart[idx].qty+delta);
  renderCartItems();
  renderCartBar();
}

function removeFromCart(idx){
  if(!D.cart) return;
  D.cart.splice(idx,1);
  renderCartItems();
  renderCartBar();
  if(!D.cart.length){closeConf();renderSotuv();}
}

function fmtPhone(inp){
  let v=inp.value.replace(/\D/g,'');
  if(v.length>9) v=v.slice(0,9);
  inp.value=v;
}

window.confirmSell = async function(){
  if(_sellLock) return;
  _sellLock=true;
  if(!D.cart||!D.cart.length){_sellLock=false;return;}
  const name=document.getElementById('custName').value.trim();
  const phone='+998'+document.getElementById('custPhone').value.trim();
  const address=document.getElementById('custAddress').value.trim();
  const note=document.getElementById('custNote').value.trim();
  const payType=document.getElementById('custPayType').value||'card';
  const phoneClean=document.getElementById('custPhone').value.replace(/\D/g,'');
  if(!name||phoneClean.length!==9||!address){
    document.getElementById('confErr').style.display='block';
    _sellLock=false;
    return;
  }
  document.getElementById('confErr').style.display='none';
  if(payType==='card'&&!D_receiptImg){
    const errEl=document.getElementById('confReceiptErr');
    const areaEl=document.getElementById('receiptUploadArea');
    if(errEl) errEl.style.display='block';
    if(areaEl) areaEl.style.borderColor='#dc2626';
    _sellLock=false;
    return;
  }
  const receiptErrEl=document.getElementById('confReceiptErr');
  const receiptAreaEl=document.getElementById('receiptUploadArea');
  if(receiptErrEl) receiptErrEl.style.display='none';
  if(receiptAreaEl) receiptAreaEl.style.borderColor='#e5e7eb';
  const now=new Date();
  const igId=D.saleIgId||D.user.igId||null;
  const orderId='ord_'+Date.now();
  let receiptUrl='';
  if(D_receiptImg && window.FS){
    showToast('Chek yuklanmoqda...');
    receiptUrl=await window.FS.uploadImage(D_receiptImg,'receipts/'+orderId+'.jpg')||'';
  }
  const items=D.cart.map(function(it){return {pid:it.pid,qty:it.qty,price:it.price,selectedImg:it.selectedImg};});
  const firstItem=items[0];
  const total=items.reduce(function(a,it){return a+(it.price*it.qty);},0);
  const sale={
    id:D.nSid++, sid:D.user.id, igId:igId,
    pid:firstItem.pid,
    items:items,
    total:total,
    date:now.toISOString().slice(0,10), time:now.toTimeString().slice(0,5),
    orderId, customer:{name,phone,address,note,payType}, receiptUrl,
    selectedImg:firstItem.selectedImg||'', status:'new'
  };
  D.sales.push(sale);
  if(window.FS) window.FS.addSale(sale);
  D.cart=[];
  closeConf();
  renderCartBar();
  showToast('Buyurtma qabul qilindi! ('+items.length+' ta mahsulot)');
  renderSotuv();
  renderMyD();
  try{sendTelegramNotification(sale);}catch(e){console.error('TG call error:',e);}
  _sellLock=false;
}
function closeConf(){
  document.getElementById('confW').classList.remove('show');
  const prevEl=document.getElementById('receiptPreview');
  const placEl=document.getElementById('receiptPlaceholder');
  if(prevEl)prevEl.style.display='none';
  if(placEl)placEl.style.display='block';
  D_receiptImg=null;
}

// --- TARIX ---
let TX_filter={mode:'today'};
let TX_CAL={year:0,month:0,from:null,to:null};

function setTarixFilter(mode,el){
  TX_filter={mode};
  document.querySelectorAll('#tTarix .dfilter').forEach(b=>b.classList.remove('on'));
  if(el)el.classList.add('on');
  renderTarix();
}
function txFilterSales(sales){
  const td=today();
  if(TX_filter.mode==='today') return sales.filter(s=>s.date===td);
  if(TX_filter.mode==='range') return sales.filter(s=>s.date>=TX_filter.from&&s.date<=TX_filter.to);
  return sales;
}
function openTarixRange(){
  const now=new Date();
  TX_CAL={year:now.getFullYear(),month:now.getMonth(),from:TX_filter.from||null,to:TX_filter.to||null};
  document.getElementById('txRangeErr').style.display='none';
  txUpdateDisp();txRenderCal();
  document.getElementById('tarixRangeW').style.display='flex';
}
function closeTarixRange(){document.getElementById('tarixRangeW').style.display='none';}
function txCalPrev(){TX_CAL.month--;if(TX_CAL.month<0){TX_CAL.month=11;TX_CAL.year--;}txRenderCal();}
function txCalNext(){TX_CAL.month++;if(TX_CAL.month>11){TX_CAL.month=0;TX_CAL.year++;}txRenderCal();}
function txRenderCal(){
  document.getElementById('txCalLabel').textContent=MONTHS[TX_CAL.month]+' '+TX_CAL.year;
  const first=new Date(TX_CAL.year,TX_CAL.month,1).getDay();
  const days2=new Date(TX_CAL.year,TX_CAL.month+1,0).getDate();
  let cells='';
  for(let i=0;i<first;i++) cells+='<div></div>';
  for(let d=1;d<=days2;d++){
    const ds=TX_CAL.year+'-'+String(TX_CAL.month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const isF=TX_CAL.from===ds,isT=TX_CAL.to===ds;
    const inR=TX_CAL.from&&TX_CAL.to&&ds>TX_CAL.from&&ds<TX_CAL.to;
    let bg='transparent',col='#1a1a1a',fw='400',br='50%';
    if(isF||isT){bg='#185FA5';col='#fff';fw='700';}
    else if(inR){bg='#DBEAFE';br='0';}
    cells+=`<div onclick="txCalClick('${ds}')" style="cursor:pointer;padding:7px 2px;border-radius:${br};background:${bg};color:${col};font-weight:${fw};font-size:13px">${d}</div>`;
  }
  document.getElementById('txCalGrid').innerHTML=cells;
  document.getElementById('txRangeHint').textContent=TX_CAL.from&&!TX_CAL.to?'Tugash sanasini tanlang':'Boshlangich sanani tanlang';
}
function txCalClick(ds){
  if(!TX_CAL.from||TX_CAL.to){TX_CAL.from=ds;TX_CAL.to=null;}
  else if(ds<TX_CAL.from){TX_CAL.to=TX_CAL.from;TX_CAL.from=ds;}
  else{TX_CAL.to=ds;}
  txUpdateDisp();txRenderCal();
}
function txUpdateDisp(){
  const f=d=>d?d.split('-').reverse().join('.'):'—';
  document.getElementById('txFromDisp').textContent=f(TX_CAL.from);
  document.getElementById('txToDisp').textContent=f(TX_CAL.to);
}
function applyTarixRange(){
  if(!TX_CAL.from||!TX_CAL.to){document.getElementById('txRangeErr').style.display='block';return;}
  document.getElementById('txRangeErr').style.display='none';
  TX_filter={mode:'range',from:TX_CAL.from,to:TX_CAL.to};
  document.querySelectorAll('#tTarix .dfilter').forEach(b=>b.classList.remove('on'));
  document.getElementById('txRangeBtn').classList.add('on');
  closeTarixRange();renderTarix();
}

function renderMyMonthly(){
  const BC=D.bonusConfig||{bonusConv:21,bonusAmt:30000,fineConv:10,fineAmt:20000};
  const sel=D.user;
  if(!sel||sel.role!=='sotuvchi') return;
  
  const td=today();
  const curMonth=td.slice(0,7);
  const comm=sel.comm||0;
  const salary=sel.salary||0;
  
  // Bu oylik sotuvlar
  const mySales=myS().filter(s=>s.date&&s.date.startsWith(curMonth));
  const salesCount=mySales.length;
  const salesIncome=salesCount*comm;
  
  // Bu oydagi DM kiritilgan kunlar uchun bonus/jarima
  // Barcha iglardan bu oy DM kiritilgan kunlarni yig'amiz
  const allDates=new Set();
  D.ig.forEach(ig=>{
    const dmD=D.igDailyDM[ig.id]||D.igDailyDM[String(ig.id)]||{};
    Object.keys(dmD).filter(d=>d.startsWith(curMonth)).forEach(d=>allDates.add(d));
  });
  const monthDates=[...allDates].sort();
  
  let totalBonus=0, totalFine=0, bonusDays=0, fineDays=0;
  monthDates.forEach(date=>{
    const br=calcSellerBonus(sel.id,date);
    totalBonus+=br.bonus;
    totalFine+=br.fine;
    if(br.bonus>0) bonusDays++;
    if(br.fine>0) fineDays++;
  });
  
  const netTotal=salesIncome+salary+totalBonus-totalFine;
  const isGood=netTotal>0;
  
  // Motivatsion gap
  let motivMsg='';
  if(totalFine>0&&totalBonus===0){
    motivMsg='21%+ konversiya qiling! Har bir kun uchun bonus +'+fmt(BC.bonusAmt)+' so\'m qo\'shiladi';
  } else if(totalBonus>0&&totalFine===0){
    motivMsg='Ajoyib! '+bonusDays+' kun bonus oldingiz. Shunday davom eting!';
  } else if(totalBonus>0&&totalFine>0){
    motivMsg='Bonuslar jarimalardan ko\'p — shu yo\'lda davom eting!';
  } else {
    motivMsg='21%+ konversiya qiling! Har bir kun uchun bonus +'+fmt(BC.bonusAmt)+' so\'m qo\'shiladi';
  }
  
  const html=
    '<div style="background:#0F172A;border-radius:16px;padding:16px 14px 14px;margin-bottom:12px;position:relative;overflow:hidden">'
    +'<div style="position:absolute;right:-20px;top:-20px;width:100px;height:100px;background:#1E293B;border-radius:50%"></div>'
    +'<div style="position:absolute;right:20px;top:14px;width:55px;height:55px;background:#334155;border-radius:50%"></div>'
    +'<div style="position:relative;z-index:1">'
    +'<div style="font-size:11px;color:#94A3B8;font-weight:700;letter-spacing:.6px;margin-bottom:4px">'+MONTHS[new Date().getMonth()].toUpperCase()+' OYLIGI</div>'
    +'<div style="font-size:30px;font-weight:800;color:#fff;line-height:1;margin-bottom:2px">'+fmt(netTotal)+'</div>'
    +'<div style="font-size:13px;color:#64748B;font-weight:500">so\'m</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">'
    +'<div style="background:#1E293B;border-radius:10px;padding:10px 12px">'
    +'<div style="font-size:10px;color:#94A3B8;margin-bottom:1px">Bu oy sotuvlar</div>'
    +'<div style="font-size:16px;font-weight:800;color:#fff">'+salesCount+' ta</div></div>'
    +'<div style="background:#1E293B;border-radius:10px;padding:10px 12px">'
    +'<div style="font-size:10px;color:#94A3B8;margin-bottom:1px">Bonus kunlar</div>'
    +'<div style="font-size:16px;font-weight:800;color:'+(bonusDays>0?'#4ADE80':'#94A3B8')+'">'+bonusDays+' kun</div></div>'
    +'</div></div></div>'
    
    // Taqsimot
    +'<div style="background:var(--bg1);border-radius:16px;border:0.5px solid var(--bd);padding:4px 16px 8px;margin-bottom:12px">'
    +'<div style="font-size:12px;font-weight:700;color:var(--c4);padding:12px 0 8px;letter-spacing:.5px">TAQSIMOT</div>'
    
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:0.5px solid #f0f0ec">'
    +'<div style="font-size:14px;color:#666;display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:#378ADD"></div>Sotuv daromadi'
    +(salesCount>0&&comm>0?' <span style="font-size:12px;color:var(--c5)">('+salesCount+' × '+fmt(comm)+')</span>':'')
    +'</div><div style="font-size:15px;font-weight:700;color:#0C447C">+'+fmt(salesIncome)+'</div></div>'
    
    +(salary>0?'<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:0.5px solid #f0f0ec">'
    +'<div style="font-size:14px;color:#666;display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:#1D9E75"></div>Oylik maosh</div>'
    +'<div style="font-size:15px;font-weight:700;color:#085041">+'+fmt(salary)+'</div></div>':'')
    
    +(totalBonus>0?'<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:0.5px solid #f0f0ec">'
    +'<div style="font-size:14px;color:#666;display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:#639922"></div>Bonus'
    +' <span style="font-size:12px;color:var(--c5)">('+bonusDays+' kun × '+fmt(BC.bonusAmt)+')</span>'
    +'</div><div style="font-size:15px;font-weight:700;color:#27500A">+'+fmt(totalBonus)+'</div></div>':'')
    
    +(totalFine>0?'<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:0.5px solid #f0f0ec">'
    +'<div style="font-size:14px;color:#666;display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:#E24B4A"></div>Jarima'
    +' <span style="font-size:12px;color:var(--c5)">('+fineDays+' kun × '+fmt(BC.fineAmt)+')</span>'
    +'</div><div style="font-size:15px;font-weight:700;color:#A32D2D">−'+fmt(totalFine)+'</div></div>':'')
    
    +'<div style="background:var(--bg2);border-radius:10px;padding:12px 14px;margin:8px 0;display:flex;justify-content:space-between;align-items:center">'
    +'<div style="font-size:14px;font-weight:700;color:var(--c1)">Jami qo\'lga olaman</div>'
    +'<div style="font-size:22px;font-weight:800;color:#15803d">'+fmt(netTotal)+' <span style="font-size:13px;font-weight:500;color:var(--c4)">so\'m</span></div></div>'
    +'</div>'
    
    // Motivatsiya
    +'<div style="background:#F0FDF4;border-radius:14px;border:0.5px solid #86EFAC;padding:14px 16px;display:flex;gap:12px;align-items:flex-start">'
    +'<div style="width:36px;height:36px;border-radius:50%;background:#DCFCE7;display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>'
    +'<div><div style="font-size:14px;font-weight:700;color:#14532d;margin-bottom:2px">'+motivMsg+'</div></div></div>';
  
  const el=document.getElementById('myMonthlyBlock');
  if(el) el.innerHTML=html;
}
function renderTarix(){
  if(D.user&&D.user.role==='sotuvchi') renderMyMonthly();
  const pEl=document.getElementById('tarixPeriod');
  if(pEl){
    const td=today();
    pEl.textContent=TX_filter.mode==='today'?'Bugun - '+td:TX_filter.mode==='range'?TX_filter.from+' - '+TX_filter.to:'Barcha vaqt';
  }
  let s=[...txFilterSales(myS())];s.reverse();
  const r=rv(s);
  const comm=D.user.comm||10000;
  const earned=s.length*comm;
  const bonusTarixHtml=getBonusTarixHtml(s);
  document.getElementById('tarixSt').innerHTML=`
    <div class="st" style="border-left:3px solid #185FA5;padding-left:11px">
      <div class="sl" style="color:#185FA5">Sotuv soni</div>
      <div class="sv" style="font-size:36px">${s.length}<span style="font-size:16px;font-weight:400;color:var(--c4);margin-left:4px">ta</span></div>
    </div>
    <div class="st" style="border-left:3px solid #22c55e;padding-left:11px">
      <div class="sl" style="color:#22c55e">Ishlab topdim</div>
      <div class="sv" style="font-size:20px;color:#15803d">${fmt(earned)}</div>
      <div class="ss">so'm</div>
    </div>
    <div style="grid-column:1/-1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px">
      <div style="font-size:15px;color:#166534;font-weight:600;margin-bottom:4px">&#127881; Ajoyib ishlayapsiz! Har bir sotuv sizni maqsadingizga yaqinlashtiradi.</div>
      <div style="font-size:15px;color:#166534">1 sotuv = ${fmt(comm)} so'm daromad</div>
    </div>
    ${bonusTarixHtml}
  `;
  window._tarixSales=s;
  renderTarixPage(1);
  
}

function renderBonusTarix(sales){getBonusTarixHtml(sales);}
function getBonusTarixHtml(sales){
  const BC=D.bonusConfig||{bonusConv:21,bonusAmt:30000,fineConv:10,fineAmt:20000};
  const igId=D.user.igId;
  if(!igId||!D.igDailyDM[igId]&&!D.igDailyDM[String(igId)]&&!D.igDailyDM[Number(igId)]) return '';
  
  // Barcha DM kiritilgan kunlar
  const dmData=D.igDailyDM[igId]||D.igDailyDM[Number(igId)]||D.igDailyDM[String(igId)]||{};
  const allDates=Object.keys(dmData).sort().reverse();
  if(!allDates.length) return '';
  
  // Filter bo'yicha kunlarni cheklaymiz
  const filtDates=allDates.filter(d=>{
    if(TX_filter.mode==='today') return d===today()||d===yesterday();
    if(TX_filter.mode==='range') return d>=TX_filter.from&&d<=TX_filter.to;
    return true;
  });
  
  if(!filtDates.length) return;
  
  let totalBonus=0, totalFine=0;
  const rows=filtDates.map(d=>{
    const br=calcSellerBonus(D.user.id, d);
    totalBonus+=br.bonus;
    totalFine+=br.fine;
    const isBonus=br.bonus>0, isFine=br.fine>0;
    const conv=parseFloat(br.conv||0);
    const cCol=conv>=(BC.bonusConv||21)?'#15803d':conv<(BC.fineConv||10)?'#dc2626':'#d97706';
    const badge=isBonus
      ?'<span style="background:#DCFCE7;color:#15803d;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:700">+'+fmt(br.bonus)+' bonus</span>'
      :isFine
      ?'<span style="background:#FECACA;color:#dc2626;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:700">-'+fmt(br.fine)+' jarima</span>'
      :'<span style="background:#FEF3C7;color:#92400e;padding:2px 8px;border-radius:8px;font-size:12px">—</span>';
    return '<div class="lr"><div style="flex:1"><div style="font-size:13px;font-weight:600">'+d+'</div>'
      +'<div style="font-size:14px;color:var(--c4)">'+br.sales+' sotuv / '+br.dm+' DM</div></div>'
      +'<div style="display:flex;align-items:center;gap:8px">'
      +'<span style="font-size:14px;font-weight:700;color:'+cCol+'">'+br.conv+'%</span>'
      +badge+'</div></div>';
  }).join('');
  
  const net=totalBonus-totalFine;
  const summary='<div style="background:'+(net>=0?'#f0fdf4':'#fef2f2')+';border-radius:10px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;margin-top:0">'
    +'<span style="font-size:13px;font-weight:700;color:'+(net>=0?'#15803d':'#dc2626')+'">'+(net>=0?'Jami bonus':'Jami jarima')+'</span>'
    +'<span style="font-size:15px;font-weight:800;color:'+(net>=0?'#15803d':'#dc2626')+'">'+(net>=0?'+':'')+fmt(net)+' so\'m</span></div>';
  
  return '<div style="grid-column:1/-1;border-top:1.5px solid #f0f0ec;margin-top:4px;padding-top:12px">'
    +'<div style="font-size:13px;font-weight:700;color:var(--c1);margin-bottom:8px">Bonus / Jarima tarixi</div>'
    +rows+summary+'</div>';
}

// --- PROD ADMIN ---

