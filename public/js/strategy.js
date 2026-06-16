// ===== BIZNES STRATEGIYASI (Admin only) =====
let _stratView = 'kpi';
let _planType = 'monthly';
let _decFilter = 'all';
let _decEdit = null;
let _stratKpiMonth = '';

function renderStrategy() {
  if (!_stratKpiMonth) _stratKpiMonth = today().slice(0, 7);
  const el = document.getElementById('tStrategy');
  if (!el) return;
  el.innerHTML = `
    <div style="padding-top:8px">
      <div class="seg" id="stratSeg">
        <button class="sb ${_stratView==='kpi'?'on':''}" onclick="stratViewSwitch('kpi',this)">KPI Maqsadlar</button>
        <button class="sb ${_stratView==='plans'?'on':''}" onclick="stratViewSwitch('plans',this)">Reja daftari</button>
        <button class="sb ${_stratView==='decisions'?'on':''}" onclick="stratViewSwitch('decisions',this)">Qarorlar jurnali</button>
      </div>
      <div id="stratBody" style="margin-top:12px"></div>
    </div>`;
  _renderStratBody();
}

function stratViewSwitch(view, btn) {
  _stratView = view;
  document.querySelectorAll('#stratSeg .sb').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  _renderStratBody();
}

function _renderStratBody() {
  const el = document.getElementById('stratBody');
  if (!el) return;
  if (_stratView === 'kpi') _renderStratKpi(el);
  else if (_stratView === 'plans') _renderStratPlans(el);
  else _renderStratDecisions(el);
}

// ===== KPI MAQSADLAR =====

function _getStratKpi(month) {
  return (D.bizKpi || []).find(k => k.month === month) || { month, salesTarget: 0, revenueTarget: 0, activeTarget: 0 };
}

function _renderStratKpi(el) {
  const kpi = _getStratKpi(_stratKpiMonth);
  const [yr, mo] = _stratKpiMonth.split('-');
  const monthName = MONTHS[parseInt(mo) - 1] + ' ' + yr;

  const monthSales = (D.sales || []).filter(s => s.date && s.date.startsWith(_stratKpiMonth));
  const actualSales = monthSales.length;
  const actualRevenue = monthSales.reduce((sum, s) => {
    const p = gP(s.pid);
    const qty = (s.customer && s.customer.qty) || 1;
    return sum + (p ? p.price * qty : 0);
  }, 0);
  const actualActive = new Set(monthSales.map(s => s.sid)).size;

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <button onclick="_stratKpiNav(-1)" style="background:var(--bg1);border:1px solid var(--bd);border-radius:8px;padding:6px 14px;font-size:18px;cursor:pointer">&#8249;</button>
      <span style="font-size:15px;font-weight:700;color:var(--c1)">${monthName}</span>
      <button onclick="_stratKpiNav(1)" style="background:var(--bg1);border:1px solid var(--bd);border-radius:8px;padding:6px 14px;font-size:18px;cursor:pointer">&#8250;</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      ${_kpiCard('Sotuvlar soni', actualSales, kpi.salesTarget, 'ta', '#185FA5', '#EFF6FF', false)}
      ${_kpiCard('Daromad', actualRevenue, kpi.revenueTarget, 'so\'m', '#7c3aed', '#EDE9FE', true)}
      ${_kpiCard('Faol sotuvchilar', actualActive, kpi.activeTarget, 'ta', '#059669', '#ECFDF5', false)}
    </div>
    <button onclick="openStratKpiEdit()" style="width:100%;padding:12px;background:#185FA5;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
      ${(kpi.salesTarget || kpi.revenueTarget || kpi.activeTarget) ? '&#9998; Maqsadlarni tahrirlash' : '+ Maqsad belgilash'}
    </button>`;
}

function _kpiCard(label, actual, target, unit, color, bg, isMoney) {
  const pct = target > 0 ? Math.min(100, Math.round(actual / target * 100)) : 0;
  const barColor = pct >= 100 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const fmtVal = n => isMoney ? fmt(n) : String(n);
  return `
    <div style="background:${bg};border-radius:14px;padding:12px;border:1px solid ${color}33">
      <div style="font-size:11px;color:var(--c4);font-weight:600;margin-bottom:4px">${label}</div>
      <div style="font-size:20px;font-weight:700;color:${color}">${fmtVal(actual)}</div>
      <div style="font-size:11px;color:var(--c4);margin-bottom:4px">${unit}</div>
      ${target ? `
        <div style="font-size:11px;color:var(--c4)">Maqsad: ${fmtVal(target)}</div>
        <div style="background:var(--bd);border-radius:6px;height:6px;margin-top:6px;overflow:hidden">
          <div style="width:${pct}%;background:${barColor};height:100%;border-radius:6px;transition:width .4s"></div>
        </div>
        <div style="font-size:11px;color:${barColor};font-weight:700;margin-top:3px">${pct}%</div>`
      : `<div style="font-size:11px;color:#ccc">Maqsad yo'q</div>`}
    </div>`;
}

function _stratKpiNav(dir) {
  const d = new Date(_stratKpiMonth + '-01');
  d.setMonth(d.getMonth() + dir);
  _stratKpiMonth = d.toISOString().slice(0, 7);
  _renderStratBody();
}

function openStratKpiEdit() {
  const kpi = _getStratKpi(_stratKpiMonth);
  const [yr, mo] = _stratKpiMonth.split('-');
  document.getElementById('stratKpiMonthLbl').textContent = MONTHS[parseInt(mo) - 1] + ' ' + yr;
  document.getElementById('stratKpiSales').value = kpi.salesTarget || '';
  document.getElementById('stratKpiRevenue').value = kpi.revenueTarget || '';
  document.getElementById('stratKpiActive').value = kpi.activeTarget || '';
  document.getElementById('stratKpiModalW').classList.add('show');
}

async function saveStratKpi() {
  const kpi = {
    month: _stratKpiMonth,
    salesTarget: parseInt(document.getElementById('stratKpiSales').value) || 0,
    revenueTarget: parseInt(document.getElementById('stratKpiRevenue').value) || 0,
    activeTarget: parseInt(document.getElementById('stratKpiActive').value) || 0,
  };
  D.bizKpi = D.bizKpi || [];
  const idx = D.bizKpi.findIndex(k => k.month === _stratKpiMonth);
  if (idx >= 0) D.bizKpi[idx] = kpi; else D.bizKpi.push(kpi);
  await window.FS.saveBizKpi(kpi);
  document.getElementById('stratKpiModalW').classList.remove('show');
  _renderStratBody();
  showToast('Maqsadlar saqlandi ✓');
}

function closeStratKpiModal() {
  document.getElementById('stratKpiModalW').classList.remove('show');
}

// ===== REJA DAFTARI =====

function _getPlanKey() {
  if (_planType === 'daily') return 'day_' + today();
  if (_planType === 'weekly') {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return 'week_' + d.getFullYear() + '_' + week;
  }
  return 'month_' + today().slice(0, 7);
}

function _getPlanLabel() {
  if (_planType === 'daily') return today();
  if (_planType === 'weekly') {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return d.getFullYear() + ' — ' + week + '-hafta';
  }
  const [yr, mo] = today().slice(0, 7).split('-');
  return MONTHS[parseInt(mo) - 1] + ' ' + yr;
}

function _renderStratPlans(el) {
  const typeBar = ['daily', 'weekly', 'monthly'].map(t => {
    const on = _planType === t;
    const label = t === 'daily' ? 'Kunlik' : t === 'weekly' ? 'Haftalik' : 'Oylik';
    return `<button onclick="setPlanType('${t}')" style="flex:1;padding:8px 4px;border-radius:8px;border:2px solid ${on ? 'var(--p)' : 'var(--bd)'};background:${on ? 'var(--pbg)' : 'var(--bg1)'};color:${on ? 'var(--p)' : 'var(--c4)'};font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">${label}</button>`;
  }).join('');

  const planKey = _getPlanKey();
  const plan = (D.bizPlans || []).find(p => p.key === planKey) || { key: planKey, items: [] };
  const items = plan.items || [];
  const done = items.filter(i => i.done).length;

  const itemsHtml = items.length ? items.map((item, idx) => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bd)">
      <input type="checkbox" ${item.done ? 'checked' : ''} onchange="togglePlanItem('${planKey}',${idx},this.checked)" style="width:18px;height:18px;cursor:pointer;accent-color:#185FA5;flex-shrink:0">
      <span style="flex:1;font-size:14px;color:${item.done ? 'var(--c6)' : 'var(--c1)'};text-decoration:${item.done ? 'line-through' : 'none'};word-break:break-word">${item.text}</span>
      <button onclick="deletePlanItem('${planKey}',${idx})" style="background:none;border:none;color:#dc2626;font-size:16px;cursor:pointer;padding:0 2px;flex-shrink:0">&#128465;</button>
    </div>`).join('')
    : `<div style="text-align:center;padding:28px 16px;color:var(--c4)">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="16" x2="12" y2="16"/></svg>
        <div style="margin-top:8px;font-size:14px">Reja yo'q</div>
      </div>`;

  const progress = items.length
    ? `<div style="font-size:12px;color:var(--c4);margin-bottom:8px">&#10003; ${done} / ${items.length} bajarildi</div>`
    : '';

  el.innerHTML = `
    <div style="display:flex;gap:6px;margin-bottom:14px">${typeBar}</div>
    <div style="background:var(--bg1);border-radius:14px;border:1px solid var(--bd);padding:14px">
      <div style="font-size:13px;font-weight:700;color:#185FA5;margin-bottom:10px">&#128197; ${_getPlanLabel()}</div>
      ${progress}
      <div id="planItemsList">${itemsHtml}</div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <input class="inp" id="planNewItem" placeholder="Yangi reja qo'shish..." style="flex:1;border-radius:8px" onkeydown="if(event.key==='Enter')addPlanItem()">
        <button onclick="addPlanItem()" style="background:#185FA5;color:#fff;border:none;border-radius:8px;padding:0 16px;font-size:20px;cursor:pointer;font-family:inherit">+</button>
      </div>
    </div>`;
}

function setPlanType(t) {
  _planType = t;
  _renderStratBody();
}

async function addPlanItem() {
  const inp = document.getElementById('planNewItem');
  const text = (inp && inp.value || '').trim();
  if (!text) return;
  const planKey = _getPlanKey();
  D.bizPlans = D.bizPlans || [];
  let plan = D.bizPlans.find(p => p.key === planKey);
  if (!plan) { plan = { key: planKey, items: [] }; D.bizPlans.push(plan); }
  plan.items.push({ text, done: false });
  inp.value = '';
  await window.FS.saveBizPlan(plan);
  _renderStratBody();
}

async function togglePlanItem(key, idx, done) {
  const plan = (D.bizPlans || []).find(p => p.key === key);
  if (!plan || !plan.items[idx]) return;
  plan.items[idx].done = done;
  await window.FS.saveBizPlan(plan);
  _renderStratBody();
}

async function deletePlanItem(key, idx) {
  const plan = (D.bizPlans || []).find(p => p.key === key);
  if (!plan) return;
  plan.items.splice(idx, 1);
  await window.FS.saveBizPlan(plan);
  _renderStratBody();
}

// ===== QARORLAR JURNALI =====

function _renderStratDecisions(el) {
  const statusColors = { rejalashtirilgan: '#d97706', jarayonda: '#7c3aed', bajarildi: '#16a34a' };
  const statusBgs = { rejalashtirilgan: '#FFFBEB', jarayonda: '#EDE9FE', bajarildi: '#DCFCE7' };
  const statusLabels = { rejalashtirilgan: 'Rejalashtirilgan', jarayonda: 'Jarayonda', bajarildi: 'Bajarildi' };

  const filterBar = ['all', 'rejalashtirilgan', 'jarayonda', 'bajarildi'].map(f => {
    const on = _decFilter === f;
    const label = f === 'all' ? 'Hammasi' : statusLabels[f];
    const c = f === 'all' ? '#185FA5' : statusColors[f];
    const b = f === 'all' ? '#EFF6FF' : statusBgs[f];
    return `<button onclick="setDecFilter('${f}')" style="flex-shrink:0;padding:6px 12px;border-radius:10px;border:2px solid ${on ? c : 'var(--bd)'};background:${on ? b : 'var(--bg1)'};color:${on ? c : 'var(--c4)'};font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">${label}</button>`;
  }).join('');

  let decs = [...(D.bizDecisions || [])];
  if (_decFilter !== 'all') decs = decs.filter(d => d.status === _decFilter);
  decs.sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);

  const cards = decs.map(d => {
    const did = d._id || String(d.id);
    const sc = statusColors[d.status] || 'var(--c4)';
    const sb = statusBgs[d.status] || 'var(--bg2)';
    const sl = statusLabels[d.status] || d.status;
    return `
      <div style="background:var(--bg1);border-radius:14px;padding:14px;border:1px solid var(--bd);margin-bottom:10px;border-left:4px solid ${sc}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
          <span style="background:${sb};color:${sc};padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">${sl}</span>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button onclick="openEditDec('${did}')" style="background:#EFF6FF;color:#185FA5;border:none;border-radius:8px;padding:5px 10px;font-size:13px;cursor:pointer;font-family:inherit">&#9998;</button>
            <button onclick="deleteDec('${did}')" style="background:#FEF2F2;color:#dc2626;border:none;border-radius:8px;padding:5px 10px;font-size:13px;cursor:pointer;font-family:inherit">&#128465;</button>
          </div>
        </div>
        <div style="font-size:15px;font-weight:700;color:var(--c1);margin-bottom:${d.note ? '6px' : '4px'}">${d.text}</div>
        ${d.note ? `<div style="font-size:13px;color:var(--c3);line-height:1.5;margin-bottom:6px">${d.note}</div>` : ''}
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--c4)">
          <span>&#128197; ${d.date}</span>
          ${d.assignee ? `<span>&#128100; ${d.assignee}</span>` : ''}
        </div>
        ${d.status !== 'bajarildi' ? `
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
            ${d.status === 'rejalashtirilgan' ? `<button onclick="updateDecStatus('${did}','jarayonda')" style="background:#EDE9FE;color:#7c3aed;border:none;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">&#8594; Jarayonga o'tkazish</button>` : ''}
            ${d.status === 'jarayonda' ? `<button onclick="updateDecStatus('${did}','bajarildi')" style="background:#DCFCE7;color:#16a34a;border:none;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">&#10003; Bajarildi</button>` : ''}
          </div>` : ''}
      </div>`;
  }).join('');

  const empty = `<div style="text-align:center;padding:40px 16px;color:var(--c4)">
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    <div style="margin-top:8px;font-size:14px">Qaror yo'q</div>
  </div>`;

  el.innerHTML = `
    <button onclick="openAddDec()" style="width:100%;padding:12px;background:#185FA5;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:12px">+ Qaror qo'shish</button>
    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:12px">${filterBar}</div>
    ${decs.length ? cards : empty}`;
}

function setDecFilter(f) {
  _decFilter = f;
  _renderStratBody();
}

function openAddDec() {
  _decEdit = null;
  document.getElementById('decModalTitle').textContent = "Qaror qo'shish";
  document.getElementById('decTextInp').value = '';
  document.getElementById('decNoteInp').value = '';
  document.getElementById('decDateInp').value = today();
  document.getElementById('decAssigneeInp').value = '';
  document.getElementById('decStatusInp').value = 'rejalashtirilgan';
  document.getElementById('decModalW').classList.add('show');
}

function openEditDec(id) {
  const d = (D.bizDecisions || []).find(x => (x._id && x._id === id) || String(x.id) === String(id));
  if (!d) return;
  _decEdit = d;
  document.getElementById('decModalTitle').textContent = 'Qarorni tahrirlash';
  document.getElementById('decTextInp').value = d.text || '';
  document.getElementById('decNoteInp').value = d.note || '';
  document.getElementById('decDateInp').value = d.date || today();
  document.getElementById('decAssigneeInp').value = d.assignee || '';
  document.getElementById('decStatusInp').value = d.status || 'rejalashtirilgan';
  document.getElementById('decModalW').classList.add('show');
}

async function saveDec() {
  const text = document.getElementById('decTextInp').value.trim();
  if (!text) { showToast('Qaror matnini kiriting!'); return; }
  const dec = {
    ...(_decEdit || {}),
    text,
    note: document.getElementById('decNoteInp').value.trim(),
    date: document.getElementById('decDateInp').value,
    assignee: document.getElementById('decAssigneeInp').value.trim(),
    status: document.getElementById('decStatusInp').value,
    id: (_decEdit && (_decEdit.id || Number(_decEdit._id))) || Date.now()
  };
  D.bizDecisions = D.bizDecisions || [];
  if (_decEdit) {
    const idx = D.bizDecisions.findIndex(x => (x._id && x._id === _decEdit._id) || String(x.id) === String(_decEdit.id || _decEdit._id));
    if (idx >= 0) D.bizDecisions[idx] = dec;
  } else {
    D.bizDecisions.push(dec);
  }
  await window.FS.saveBizDecision(dec);
  document.getElementById('decModalW').classList.remove('show');
  _decEdit = null;
  _renderStratBody();
  showToast('Saqlandi ✓');
}

async function updateDecStatus(id, newStatus) {
  const d = (D.bizDecisions || []).find(x => (x._id && x._id === id) || String(x.id) === String(id));
  if (!d) return;
  d.status = newStatus;
  await window.FS.saveBizDecision(d);
  _renderStratBody();
  showToast(newStatus === 'bajarildi' ? 'Bajarildi ✓' : "Jarayonga o'tkazildi");
}

async function deleteDec(id) {
  const d = (D.bizDecisions || []).find(x => (x._id && x._id === id) || String(x.id) === String(id));
  if (!d || !confirm("Bu qarorni o'chirasizmi?")) return;
  D.bizDecisions = (D.bizDecisions || []).filter(x => !(x._id && x._id === id) && String(x.id) !== String(id));
  if (d._id) await window.FS.deleteBizDecision(d._id);
  _renderStratBody();
  showToast("O'chirildi");
}

function closeDecModal() {
  document.getElementById('decModalW').classList.remove('show');
  _decEdit = null;
}
