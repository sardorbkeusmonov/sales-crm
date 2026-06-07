// ===== KPI TIZIMI =====
let _kpiViewMonth = '';
let _kpiSelFilter = 'all';
let _kpiEditId = null;

function _kpiMonth() {
  if (!_kpiViewMonth) _kpiViewMonth = today().slice(0, 7);
  return _kpiViewMonth;
}

function _kpiWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}

function _kpiActual(type, sid, period, month) {
  const t = today(), ws = _kpiWeekStart();
  const inR = date => {
    if (!date) return false;
    if (period === 'day') return date === t;
    if (period === 'week') return date >= ws && date <= t;
    return date.startsWith(month);
  };
  if (type === 'sotuv_soni')
    return (D.sales||[]).filter(s => String(s.sid)===String(sid) && inR(s.date)).length;
  if (type === 'konversiya') {
    const sales = (D.sales||[]).filter(s => String(s.sid)===String(sid) && s.date && s.date.startsWith(month)).length;
    const seller = gS(Number(sid));
    const igId = seller && seller.igId;
    if (!igId) return 0;
    const ig = (TA.igData||{})[igId]||{};
    let dm = 0;
    Object.keys(ig).forEach(d => { if (d.startsWith(month)) dm += Number(ig[d].dm||0); });
    return dm > 0 ? Math.round(sales / dm * 1000) / 10 : 0;
  }
  if (type === 'dm_soni') {
    let total = 0;
    Object.values(TA.igData||{}).forEach(ig => {
      Object.keys(ig||{}).forEach(d => { if (inR(d)) total += Number(ig[d].dm||0); });
    });
    return total;
  }
  if (type === 'budjet') {
    let total = 0;
    Object.values(TA.igData||{}).forEach(ig => {
      Object.keys(ig||{}).forEach(d => { if (inR(d)) total += Number(ig[d].budget||0); });
    });
    return total;
  }
  if (type === 'dm_narxi') {
    const dm = _kpiActual('dm_soni', sid, period, month);
    const bj = _kpiActual('budjet', sid, period, month);
    return dm > 0 ? Math.round(bj / dm) : 0;
  }
  if (type === 'video_soni') {
    const goal = (D.kpiGoals||[]).find(g => g.type==='video_soni' && String(g.sid)===String(sid) && g.month===month);
    return goal ? (goal.manualActual||0) : 0;
  }
  return 0;
}

function _kpiPT(monthly, period) {
  if (period === 'day') return Math.round(monthly / 22);
  if (period === 'week') return Math.round(monthly / 4);
  return monthly;
}

function _kpiColor(pct) {
  if (pct >= 80) return { bar:'#22C55E', text:'#15803D', bg:'#F0FDF4' };
  if (pct >= 50) return { bar:'#F59E0B', text:'#B45309', bg:'#FFFBEB' };
  return { bar:'#EF4444', text:'#DC2626', bg:'#FEF2F2' };
}

function _kpiSave() {
  if (window.FS) window.FS.saveSettings({
    admin:D.admin, nUid:D.nUid, nPid:D.nPid, nSid:D.nSid, nIgId:D.nIgId,
    bonusConfig:D.bonusConfig, igDailyDM:D.igDailyDM, tahlilData:TA,
    expenses:D.expenses, activeAds:D.activeAds, kpiGoals:D.kpiGoals||[]
  });
}

function renderKPI() {
  const el = document.getElementById('kpiContent');
  if (!el) return;
  const month = _kpiMonth();
  const isAdmin = D.user && D.user.isAdmin;
  const uid = D.user ? D.user.id : null;
  const role = D.user ? D.user.role : null;
  const [yr, mo] = month.split('-');
  const monthName = MONTHS[parseInt(mo)-1] + ' ' + yr;
  const navHtml = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;margin-top:8px">
      <button onclick="_kpiNavMonth(-1)" style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:7px 14px;font-size:18px;cursor:pointer;font-family:inherit">&#8249;</button>
      <span style="font-size:15px;font-weight:700;color:#1a1a1a">${monthName}</span>
      <button onclick="_kpiNavMonth(1)" style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:7px 14px;font-size:18px;cursor:pointer;font-family:inherit">&#8250;</button>
    </div>`;
  if (isAdmin) _renderKpiAdmin(el, month, navHtml);
  else _renderKpiWorker(el, month, navHtml, uid, role);
}

function _kpiNavMonth(dir) {
  const d = new Date(_kpiMonth() + '-01');
  d.setMonth(d.getMonth() + dir);
  _kpiViewMonth = d.toISOString().slice(0, 7);
  renderKPI();
}

function _renderKpiAdmin(el, month, navHtml) {
  const sellers = (D.sellers||[]).filter(s => s.login && ['sotuvchi','targetolog','mobilograf'].includes(s.role));
  const chipSt = on => `flex-shrink:0;padding:6px 14px;border-radius:10px;border:2px solid ${on?'#185FA5':'#e5e7eb'};background:${on?'#EFF6FF':'white'};color:${on?'#185FA5':'#888'};font-size:13px;font-weight:700;cursor:pointer;font-family:inherit`;
  const filterHtml = [
    `<button onclick="_kpiSetFilter('all')" style="${chipSt(_kpiSelFilter==='all')}">Hammasi</button>`,
    ...sellers.map(s => `<button onclick="_kpiSetFilter('${s.id}')" style="${chipSt(String(_kpiSelFilter)===String(s.id))}">${s.name}</button>`)
  ].join('');
  const shown = _kpiSelFilter === 'all' ? sellers : sellers.filter(s => String(s.id)===String(_kpiSelFilter));
  let cards = '';
  shown.forEach(sel => {
    const goals = (D.kpiGoals||[]).filter(g => String(g.sid)===String(sel.id) && g.month===month && g.type);
    cards += _kpiSelSection(sel, goals, month, true);
  });
  el.innerHTML = `
    <button onclick="openAddKpi()" style="width:100%;padding:12px;background:#185FA5;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:8px;margin-bottom:12px">+ Maqsad belgilash</button>
    ${navHtml}
    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:14px">${filterHtml}</div>
    ${cards || '<div style="text-align:center;padding:32px;color:#aaa;font-size:14px">Bu oy uchun maqsad belgilanmagan</div>'}`;
}

function _kpiSetFilter(val) { _kpiSelFilter = val; renderKPI(); }

function _kpiSelSection(sel, goals, month, isAdmin) {
  const rl = {sotuvchi:'Sotuvchi', targetolog:'Targetolog', mobilograf:'Mobilograf'}[sel.role]||sel.role;
  return `
    <div style="margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:4px 0">
        <div style="width:34px;height:34px;border-radius:50%;${avSt(sel.ai||0)};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">${ini(sel.name)}</div>
        <div><div style="font-size:14px;font-weight:700;color:#1a1a1a">${sel.name}</div><div style="font-size:11px;color:#aaa">${rl}</div></div>
      </div>
      ${goals.length ? goals.map(g => _kpiGoalCard(g, month, isAdmin)).join('') : '<div style="background:#f9fafb;border-radius:12px;padding:12px;text-align:center;color:#aaa;font-size:13px;margin-bottom:12px">Maqsad yo\'q</div>'}
    </div>`;
}

function _renderKpiWorker(el, month, navHtml, uid, role) {
  const myGoals = (D.kpiGoals||[]).filter(g => String(g.sid)===String(uid) && g.month===month && g.type);
  const mainGoals = myGoals.filter(g => g.type!=='konversiya' && g.type!=='dm_narxi');
  let sumPct = 0;
  mainGoals.forEach(g => {
    const act = _kpiActual(g.type, uid, 'month', month);
    sumPct += g.monthlyTarget > 0 ? Math.min(100, Math.round(act/g.monthlyTarget*100)) : 0;
  });
  const avgPct = mainGoals.length > 0 ? Math.round(sumPct / mainGoals.length) : 0;
  const col = _kpiColor(avgPct);
  const summary = myGoals.length ? `
    <div style="background:${col.bg};border-radius:14px;padding:14px;margin-bottom:14px;display:flex;align-items:center;gap:14px">
      <div style="width:56px;height:56px;border-radius:50%;background:${col.bar};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span style="font-size:15px;font-weight:800;color:#fff">${avgPct}%</span>
      </div>
      <div>
        <div style="font-size:14px;font-weight:700;color:${col.text}">Oylik umumiy progress</div>
        <div style="font-size:13px;color:#555;margin-top:2px">${avgPct>=80?"Ajoyib natija! Davom eting 💪":avgPct>=50?"Yaxshi ketmoqda, kuchaytiring ⚡":"Kuch bering, oldinga! 🎯"}</div>
      </div>
    </div>` : '';
  const empty = `
    <div style="text-align:center;padding:48px 20px;color:#aaa">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
      <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-top:12px">Maqsad belgilanmagan</div>
      <div style="font-size:13px;color:#aaa;margin-top:4px">Admin siz uchun KPI maqsad belgilaydi</div>
    </div>`;
  el.innerHTML = navHtml + summary + (myGoals.length ? myGoals.map(g => _kpiGoalCard(g, month, false)).join('') : empty);
}

function _kpiGoalCard(goal, month, isAdmin) {
  const gid = goal.id;
  const isCurrent = month === today().slice(0, 7);
  const LABELS = { sotuv_soni:'Sotuvlar soni', konversiya:'Konversiya %', dm_soni:'DM soni', budjet:'Oylik budjet', dm_narxi:'DM narxi', video_soni:'Video soni' };
  const UNITS = { sotuv_soni:'ta', konversiya:'%', dm_soni:'ta', budjet:"so'm", dm_narxi:"so'm", video_soni:'ta' };
  const title = LABELS[goal.type]||goal.type;
  const unit = UNITS[goal.type]||'';
  const isMoney = goal.type==='budjet' || goal.type==='dm_narxi';
  const fmtV = v => isMoney ? fmt(Math.round(v)) : (Number.isInteger(v)?String(v):String(Math.round(v*10)/10));
  const adminBtns = isAdmin ? `
    <div style="display:flex;gap:6px">
      <button onclick="openEditKpi('${gid}')" style="background:#EFF6FF;color:#185FA5;border:none;border-radius:8px;padding:5px 10px;font-size:12px;cursor:pointer;font-family:inherit">&#9998;</button>
      <button onclick="deleteKpi('${gid}')" style="background:#FEF2F2;color:#dc2626;border:none;border-radius:8px;padding:5px 10px;font-size:12px;cursor:pointer;font-family:inherit">&#128465;</button>
    </div>` : '';

  if (goal.type === 'konversiya' || goal.type === 'dm_narxi') {
    const actual = _kpiActual(goal.type, goal.sid, 'month', month);
    const target = goal.monthlyTarget;
    const isLower = goal.type === 'dm_narxi';
    const displayPct = target > 0
      ? (isLower ? Math.min(100, Math.round(target/Math.max(actual,1)*100)) : Math.min(100, Math.round(actual/target*100)))
      : 0;
    const col = _kpiColor(displayPct);
    return `
      <div style="background:white;border-radius:14px;border:1px solid #e5e7eb;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-size:14px;font-weight:700;color:#1a1a1a">${title}</span>${adminBtns}
        </div>
        <div style="font-size:22px;font-weight:700;color:${col.text}">${fmtV(actual)} <span style="font-size:13px;color:#aaa;font-weight:400">${unit}</span></div>
        <div style="font-size:12px;color:#aaa;margin-top:2px">${isLower?'Maqsad (maksimum)':'Maqsad'}: ${fmtV(target)} ${unit}</div>
        <div style="background:#f3f4f6;border-radius:8px;height:7px;margin-top:8px;overflow:hidden">
          <div style="width:${displayPct}%;background:${col.bar};height:100%;border-radius:8px;transition:width .4s"></div>
        </div>
        <div style="font-size:12px;color:${col.text};font-weight:700;margin-top:4px">${displayPct}%${isLower?' (past = yaxshi)':''}</div>
      </div>`;
  }

  const isManual = goal.type === 'video_soni';
  const periodsToShow = (isCurrent && !isManual)
    ? [
        { key:'day',   label:'Kunlik',   target:_kpiPT(goal.monthlyTarget,'day'),  actual:_kpiActual(goal.type,goal.sid,'day',month) },
        { key:'week',  label:'Haftalik', target:_kpiPT(goal.monthlyTarget,'week'), actual:_kpiActual(goal.type,goal.sid,'week',month) },
        { key:'month', label:'Oylik',    target:goal.monthlyTarget,                actual:_kpiActual(goal.type,goal.sid,'month',month) },
      ]
    : [{ key:'month', label:isCurrent?'Oylik':'Oylik natija', target:goal.monthlyTarget, actual:_kpiActual(goal.type,goal.sid,'month',month) }];

  const rows = periodsToShow.map((p,i) => {
    const pct = p.target > 0 ? Math.min(100, Math.round(p.actual/p.target*100)) : 0;
    const col = _kpiColor(pct);
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:7px 0;${i<periodsToShow.length-1?'border-bottom:1px solid #f5f5f3':''}">
        <div style="width:72px;font-size:12px;color:#888;font-weight:600;flex-shrink:0">${p.label}</div>
        <div style="flex:1;background:#f3f4f6;border-radius:6px;height:7px;overflow:hidden">
          <div style="width:${pct}%;background:${col.bar};height:100%;border-radius:6px;transition:width .4s"></div>
        </div>
        <div style="font-size:11px;font-weight:700;color:${col.text};white-space:nowrap;flex-shrink:0">${fmtV(p.actual)}/${fmtV(p.target)} ${unit}</div>
        <div style="width:32px;font-size:11px;font-weight:700;color:${col.text};text-align:right;flex-shrink:0">${pct}%</div>
      </div>`;
  }).join('');

  const manualInput = isManual && !isAdmin ? `
    <div style="display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid #f3f4f6">
      <span style="font-size:13px;color:#888">Oylik holat:</span>
      <input type="number" value="${_kpiActual('video_soni',goal.sid,'month',month)}"
        onchange="updateKpiManual('${gid}',this.value)"
        style="width:80px;padding:6px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;font-family:inherit" min="0">
      <span style="font-size:13px;color:#888">${unit}</span>
    </div>` : '';

  return `
    <div style="background:white;border-radius:14px;border:1px solid #e5e7eb;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:14px;font-weight:700;color:#1a1a1a">${title}</span>${adminBtns}
      </div>
      ${rows}${manualInput}
    </div>`;
}

// ===== ADMIN MODAL =====
const _KPI_TYPES = {
  sotuvchi:   [{ value:'sotuv_soni', label:'Sotuvlar soni', unit:'ta' }, { value:'konversiya', label:'Konversiya % (maqsad)', unit:'%' }],
  targetolog: [{ value:'dm_soni', label:'DM soni', unit:'ta' }, { value:'budjet', label:'Oylik budjet', unit:"so'm" }, { value:'dm_narxi', label:'DM narxi (maqsad)', unit:"so'm" }],
  mobilograf: [{ value:'video_soni', label:'Video soni', unit:'ta' }],
};

function openAddKpi() {
  _kpiEditId = null;
  document.getElementById('kpiModalTitle').textContent = 'Maqsad belgilash';
  document.getElementById('kpiMonth').value = _kpiMonth();
  document.getElementById('kpiTarget').value = '';
  _buildKpiSelOpts(null);
  document.getElementById('kpiModalW').classList.add('show');
}

function openEditKpi(id) {
  const goal = (D.kpiGoals||[]).find(g => g.id === id);
  if (!goal) return;
  _kpiEditId = id;
  document.getElementById('kpiModalTitle').textContent = 'Maqsadni tahrirlash';
  document.getElementById('kpiMonth').value = goal.month || _kpiMonth();
  _buildKpiSelOpts(goal.sid);
  setTimeout(() => {
    const t = document.getElementById('kpiType');
    if (t) { t.value = goal.type||''; _onKpiTypeChange(); }
    document.getElementById('kpiTarget').value = goal.monthlyTarget||'';
  }, 30);
  document.getElementById('kpiModalW').classList.add('show');
}

function _buildKpiSelOpts(selectedSid) {
  const sellers = (D.sellers||[]).filter(s => s.login && _KPI_TYPES[s.role]);
  const sel = document.getElementById('kpiSeller');
  if (!sel) return;
  sel.innerHTML = sellers.map(s => {
    const rl = {sotuvchi:'Sotuvchi', targetolog:'Targetolog', mobilograf:'Mobilograf'}[s.role]||s.role;
    return `<option value="${s.id}" data-role="${s.role}" ${String(s.id)===String(selectedSid)?'selected':''}>${s.name} — ${rl}</option>`;
  }).join('');
  _onKpiSellerChange();
}

function _onKpiSellerChange() {
  const sel = document.getElementById('kpiSeller');
  if (!sel) return;
  const opt = sel.options[sel.selectedIndex];
  const role = opt ? opt.getAttribute('data-role') : null;
  const types = _KPI_TYPES[role]||[];
  const typeEl = document.getElementById('kpiType');
  if (!typeEl) return;
  typeEl.innerHTML = types.map(t => `<option value="${t.value}">${t.label}</option>`).join('');
  _onKpiTypeChange();
}

function _onKpiTypeChange() {
  const typeEl = document.getElementById('kpiType');
  const sel = document.getElementById('kpiSeller');
  if (!typeEl || !sel) return;
  const opt = sel.options[sel.selectedIndex];
  const role = opt ? opt.getAttribute('data-role') : null;
  const found = (_KPI_TYPES[role]||[]).find(t => t.value === typeEl.value);
  const lbl = document.getElementById('kpiUnitLabel');
  if (lbl) lbl.textContent = found ? found.unit : '';
}

function saveKpi() {
  const sid = document.getElementById('kpiSeller').value;
  const type = document.getElementById('kpiType').value;
  const month = document.getElementById('kpiMonth').value || _kpiMonth();
  const target = parseFloat(document.getElementById('kpiTarget').value)||0;
  if (!sid || !type) { showToast('Ishchi va metrikni tanlang!'); return; }
  if (!target) { showToast('Maqsad qiymatini kiriting!'); return; }
  D.kpiGoals = D.kpiGoals||[];
  if (_kpiEditId) {
    const idx = D.kpiGoals.findIndex(g => g.id === _kpiEditId);
    if (idx >= 0) D.kpiGoals[idx] = {...D.kpiGoals[idx], sid, type, month, monthlyTarget: target};
  } else {
    D.kpiGoals = D.kpiGoals.filter(g => !(String(g.sid)===String(sid) && g.type===type && g.month===month));
    D.kpiGoals.push({ id:'k'+Date.now(), sid, type, month, monthlyTarget: target, manualActual: 0 });
  }
  _kpiSave();
  closeKpiModal();
  renderKPI();
  showToast('Saqlandi ✓');
}

function deleteKpi(id) {
  if (!confirm("Bu maqsadni o'chirasizmi?")) return;
  D.kpiGoals = (D.kpiGoals||[]).filter(g => g.id !== id);
  _kpiSave();
  renderKPI();
  showToast("O'chirildi");
}

function updateKpiManual(id, val) {
  const goal = (D.kpiGoals||[]).find(g => g.id === id);
  if (!goal) return;
  goal.manualActual = Number(val)||0;
  _kpiSave();
  renderKPI();
}

function closeKpiModal() {
  document.getElementById('kpiModalW').classList.remove('show');
  _kpiEditId = null;
}

// Legacy compat
function kpiColor(pct) { return _kpiColor(pct); }
function getKpiCurrent(g) { return _kpiActual(g.type||g.autoType||'sotuv_soni', g.sid, 'month', _kpiMonth()); }
function renderKpiCard(g, isAdmin) { return _kpiGoalCard(g, _kpiMonth(), isAdmin); }
function buildKPITabs() {}
function onKpiAutoTypeChange() {}
function setKpiPeriod() {}


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
