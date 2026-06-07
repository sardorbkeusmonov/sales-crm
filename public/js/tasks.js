// ===== TOPSHIRIQLAR VA E'LONLAR =====
let _taskEdit = null;
let _annEdit = null;
let _taskFilter = 'all';
let _tskView = 't';

function renderTasks() {
  const el = document.getElementById('tTasks');
  if (!el) return;
  const uid = D.user ? D.user.id : null;
  const isAdmin = D.user && D.user.isAdmin;
  const _badge = n => n > 0 ? `<span style="background:#dc2626;color:#fff;border-radius:10px;padding:1px 6px;font-size:11px;font-weight:700;margin-left:4px">${n>9?'9+':n}</span>` : '';
  let incompleteTasks = 0, unreadAnns = 0;
  if (!isAdmin) {
    const myT = (D.tasks||[]).filter(t=>{const to=t.assignedTo||[];return to.includes('all')||to.includes(uid)||to.map(String).includes(String(uid));});
    incompleteTasks = myT.filter(t=>(t.completedBy||{})[String(uid)]!==true).length;
    unreadAnns = (D.announcements||[]).filter(a=>!(a.readBy||[]).includes(uid)).length;
  }
  el.innerHTML = `
    <div style="padding-top:8px">
      <div class="seg" id="tskSeg">
        <button class="sb ${_tskView==='t'?'on':''}" onclick="tskViewSwitch('t',this)">Topshiriqlar${_badge(incompleteTasks)}</button>
        <button class="sb ${_tskView==='e'?'on':''}" onclick="tskViewSwitch('e',this)">E\'lonlar${_badge(unreadAnns)}</button>
      </div>
      <div id="tskBody" style="margin-top:12px"></div>
    </div>`;
  _renderTskBody();
  updateTasksBadge();
}

function tskViewSwitch(view, el) {
  _tskView = view;
  document.querySelectorAll('#tskSeg .sb').forEach(b => b.classList.remove('on'));
  if (el) el.classList.add('on');
  _renderTskBody();
}

function _renderTskBody() {
  const el = document.getElementById('tskBody');
  if (!el) return;
  if (_tskView === 't') _renderTasksPanel(el);
  else _renderAnnsPanel(el);
}

function _findTask(id) {
  return (D.tasks||[]).find(x => (x._id && x._id === id) || String(x.id) === String(id));
}
function _findAnn(id) {
  return (D.announcements||[]).find(x => (x._id && x._id === id) || String(x.id) === String(id));
}

function _renderTasksPanel(el) {
  const isAdmin = D.user && D.user.isAdmin;
  const uid = D.user ? D.user.id : null;

  let tasks = [...(D.tasks||[])];
  if (!isAdmin) {
    tasks = tasks.filter(t => {
      const to = t.assignedTo||[];
      return to.includes('all') || to.includes(uid) || to.map(String).includes(String(uid));
    });
  }
  if (_taskFilter !== 'all') {
    if (!isAdmin) {
      const ws = uid => (t) => (t.completedBy||{})[String(uid)];
      if (_taskFilter === 'bajarildi') tasks = tasks.filter(t => (t.completedBy||{})[String(uid)] === true);
      else if (_taskFilter === 'jarayonda') tasks = tasks.filter(t => (t.completedBy||{})[String(uid)] === 'started');
      else tasks = tasks.filter(t => !(t.completedBy||{})[String(uid)]);
    } else {
      tasks = tasks.filter(t => t.status === _taskFilter);
    }
  }

  const pOrder = {shoshilinch:0, muhim:1, oddiy:2};
  tasks.sort((a, b) => {
    const pa = pOrder[a.priority]??2, pb = pOrder[b.priority]??2;
    if (pa !== pb) return pa - pb;
    return (a.dueDate||'') > (b.dueDate||'') ? 1 : -1;
  });

  const filterHtml = ['all','yangi','jarayonda','bajarildi'].map(f => {
    const active = _taskFilter === f;
    const label = f==='all'?'Hammasi':f==='yangi'?'Yangi':f==='jarayonda'?'Jarayonda':'Bajarildi';
    return `<button onclick="setTskFilter('${f}')" style="flex-shrink:0;padding:6px 14px;border-radius:10px;border:2px solid ${active?'#185FA5':'#e5e7eb'};background:${active?'#EFF6FF':'white'};color:${active?'#185FA5':'#888'};font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">${label}</button>`;
  }).join('');

  const addBtn = isAdmin
    ? `<button onclick="openAddTask()" style="width:100%;padding:12px;background:#185FA5;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:12px">+ Topshiriq qo\'shish</button>`
    : '';

  const filterBar = `<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;margin-bottom:12px">${filterHtml}</div>`;

  if (!tasks.length) {
    el.innerHTML = addBtn + filterBar + `<div style="text-align:center;padding:40px 16px;color:#aaa"><div style="display:flex;justify-content:center;margin-bottom:10px"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6"/><path d="M9 16h4"/></svg></div><div style="font-size:14px">Topshiriq yo\'q</div></div>`;
    return;
  }

  const cards = tasks.map(t => {
    const tid = t._id || String(t.id);
    const pc = t.priority==='shoshilinch'?'#dc2626':t.priority==='muhim'?'#d97706':'#6b7280';
    const pbg = t.priority==='shoshilinch'?'#FEF2F2':t.priority==='muhim'?'#FFFBEB':'#F9FAFB';
    const pLabel = t.priority==='shoshilinch'?'Shoshilinch':t.priority==='muhim'?'Muhim':'Oddiy';
    const sc = t.status==='bajarildi'?'#16a34a':t.status==='jarayonda'?'#7c3aed':'#185FA5';
    const sbg = t.status==='bajarildi'?'#DCFCE7':t.status==='jarayonda'?'#EDE9FE':'#EFF6FF';
    const sLabel = t.status==='bajarildi'?'Bajarildi':t.status==='jarayonda'?'Jarayonda':'Yangi';

    const to = t.assignedTo||[];
    const assignLabel = to.includes('all')
      ? 'Barcha xodimlar'
      : to.map(id => { const s=(D.sellers||[]).find(s=>String(s.id)===String(id)); return s?s.name:'?'; }).join(', ');

    let progressHtml = '';
    if (isAdmin) {
      const comp = t.completedBy||{};
      const done = Object.values(comp).filter(v=>v===true).length;
      const started = Object.values(comp).filter(v=>v==='started').length;
      const total = to.includes('all')
        ? (D.sellers||[]).filter(s=>s.role!=='omborchi'&&s.role!=='yetkazuvchi'&&s.name).length
        : to.length;
      if (total > 0) {
        const parts = [];
        if (done) parts.push(`<span style="color:#16a34a">&#10003; ${done} bajardi</span>`);
        if (started) parts.push(`<span style="color:#7c3aed">&#8635; ${started} jarayonda</span>`);
        parts.push(`<span style="color:#aaa">${total} kishi</span>`);
        progressHtml = `<span style="font-size:12px">${parts.join(' · ')}</span>`;
      }
    }

    let workerBtn = '';
    if (!isAdmin) {
      const ws = (t.completedBy||{})[String(uid)];
      if (ws === true) {
        workerBtn = `<span style="display:inline-flex;align-items:center;gap:4px;background:#DCFCE7;color:#16a34a;padding:5px 12px;border-radius:8px;font-size:13px;font-weight:700">&#10003; Bajarildi</span>`;
      } else if (ws === 'started') {
        workerBtn = `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="background:#EDE9FE;color:#7c3aed;padding:5px 12px;border-radius:8px;font-size:13px;font-weight:700">&#8635; Jarayonda</span>
          <button onclick="markTaskDone('${tid}')" style="background:#16a34a;color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Bajarildi &#10003;</button>
        </div>`;
      } else {
        workerBtn = `<button onclick="markTaskDone('${tid}')" style="background:#185FA5;color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Boshlash &#8594;</button>`;
      }
    }

    const adminBtns = isAdmin ? `
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button onclick="openEditTask('${tid}')" style="background:#EFF6FF;color:#185FA5;border:none;border-radius:8px;padding:6px 10px;font-size:13px;cursor:pointer;font-family:inherit">&#9998;</button>
        <button onclick="deleteTask('${tid}')" style="background:#FEF2F2;color:#dc2626;border:none;border-radius:8px;padding:6px 10px;font-size:13px;cursor:pointer;font-family:inherit">&#128465;</button>
      </div>` : '';

    return `
      <div style="background:white;border-radius:14px;padding:14px;border:0.5px solid #e5e7eb;margin-bottom:10px;border-left:4px solid ${pc}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="background:${pbg};color:${pc};padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">${pLabel}</span>
            <span style="background:${sbg};color:${sc};padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">${sLabel}</span>
          </div>
          ${adminBtns}
        </div>
        <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:${t.desc?'4px':'6px'}">${t.title}</div>
        ${t.desc ? `<div style="font-size:13px;color:#666;margin-bottom:6px;line-height:1.5">${t.desc}</div>` : ''}
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:12px;color:#888">
          ${t.dueDate ? `<span>&#128197; ${t.dueDate}</span>` : ''}
          <span>&#128101; ${assignLabel}</span>
          ${progressHtml}
        </div>
        ${workerBtn ? `<div style="margin-top:10px">${workerBtn}</div>` : ''}
      </div>`;
  }).join('');

  el.innerHTML = addBtn + filterBar + cards;
}

function _renderAnnsPanel(el) {
  const isAdmin = D.user && D.user.isAdmin;
  const uid = D.user ? D.user.id : null;

  const anns = [...(D.announcements||[])].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.createdAt||'') < (a.createdAt||'') ? 1 : -1;
  });

  const addBtn = isAdmin
    ? `<button onclick="openAddAnn()" style="width:100%;padding:12px;background:#185FA5;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:12px">+ E\'lon qo\'shish</button>`
    : '';

  if (!anns.length) {
    el.innerHTML = addBtn + `<div style="text-align:center;padding:40px 16px;color:#aaa"><div style="display:flex;justify-content:center;margin-bottom:10px"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div><div style="font-size:14px">E\'lon yo\'q</div></div>`;
    return;
  }

  const cards = anns.map(a => {
    const aid = a._id || String(a.id);
    const isRead = isAdmin || (a.readBy||[]).includes(uid);
    const unread = !isRead;

    let readCount = '';
    if (isAdmin) {
      const sellers = (D.sellers||[]).filter(s=>s.name);
      const readIds = (a.readBy||[]).map(String);
      const readNames = sellers.filter(s=>readIds.includes(String(s.id))).map(s=>s.name);
      const unreadNames = sellers.filter(s=>!readIds.includes(String(s.id))).map(s=>s.name);
      readCount = `<div style="margin-top:8px;font-size:12px;line-height:1.6">
        ${readNames.length?`<div style="color:#16a34a">&#10003; O'qidi: <span style="font-weight:600">${readNames.join(', ')}</span></div>`:''}
        ${unreadNames.length?`<div style="color:#dc2626">&#10007; O'qimadi: <span style="font-weight:600">${unreadNames.join(', ')}</span></div>`:''}
      </div>`;
    }

    const workerBtn = (!isAdmin && unread)
      ? `<div style="margin-top:10px"><button onclick="markAnnRead('${aid}')" style="background:#185FA5;color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">O\'qidim &#10003;</button></div>`
      : '';

    const adminBtns = isAdmin
      ? `<div style="display:flex;gap:6px;flex-shrink:0">
          <button onclick="openEditAnn('${aid}')" style="background:#EFF6FF;color:#185FA5;border:none;border-radius:8px;padding:6px 10px;font-size:13px;cursor:pointer;font-family:inherit">&#9998;</button>
          <button onclick="deleteAnn('${aid}')" style="background:#FEF2F2;color:#dc2626;border:none;border-radius:8px;padding:6px 10px;font-size:13px;cursor:pointer;font-family:inherit">&#128465;</button>
        </div>`
      : '';

    return `
      <div style="background:${unread?'#FFFBEB':'white'};border-radius:14px;padding:14px;border:0.5px solid ${unread?'#FDE68A':'#e5e7eb'};margin-bottom:10px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${a.pinned ? `<span style="background:#EFF6FF;color:#185FA5;padding:2px 7px;border-radius:6px;font-size:11px;font-weight:700">&#128204; Pin</span>` : ''}
            ${unread ? `<span style="background:#FEF3C7;color:#92400e;padding:2px 7px;border-radius:6px;font-size:11px;font-weight:700">Yangi</span>` : ''}
          </div>
          ${adminBtns}
        </div>
        <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:${a.body?'6px':'4px'}">${a.title}</div>
        ${a.body ? `<div style="font-size:13px;color:#555;line-height:1.5;margin-bottom:6px">${a.body}</div>` : ''}
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span style="font-size:12px;color:#aaa">${a.createdAt||''}</span>
          ${readCount}
        </div>
        ${workerBtn}
      </div>`;
  }).join('');

  el.innerHTML = addBtn + cards;
}

function setTskFilter(f) {
  _taskFilter = f;
  _renderTskBody();
}

function openAddTask() {
  _taskEdit = null;
  document.getElementById('taskModalTitle').textContent = "Topshiriq qo'shish";
  document.getElementById('tskTitleInp').value = '';
  document.getElementById('tskDescInp').value = '';
  document.getElementById('tskPriorityInp').value = 'oddiy';
  document.getElementById('tskDueInp').value = today();
  document.getElementById('tskStatusInp').value = 'yangi';
  _renderTskAssignees([]);
  document.getElementById('taskModalW').classList.add('show');
}

function openEditTask(id) {
  const t = _findTask(id);
  if (!t) return;
  _taskEdit = t;
  document.getElementById('taskModalTitle').textContent = 'Topshiriqni tahrirlash';
  document.getElementById('tskTitleInp').value = t.title||'';
  document.getElementById('tskDescInp').value = t.desc||'';
  document.getElementById('tskPriorityInp').value = t.priority||'oddiy';
  document.getElementById('tskDueInp').value = t.dueDate||today();
  document.getElementById('tskStatusInp').value = t.status||'yangi';
  _renderTskAssignees(t.assignedTo||[]);
  document.getElementById('taskModalW').classList.add('show');
}

function _renderTskAssignees(selected) {
  const el = document.getElementById('tskAssignees');
  if (!el) return;
  const isAll = selected.includes('all');
  const sellers = (D.sellers||[]).filter(s => s.name && s.login);
  el.innerHTML = `
    <label style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0ec;cursor:pointer;font-size:14px;font-weight:600">
      <input type="checkbox" id="tskAll" onchange="_onTskAllChange(this)" ${isAll?'checked':''}>
      Barcha xodimlar
    </label>
    <div id="tskSelChecks" style="${isAll?'opacity:.45;pointer-events:none':''}">
      ${sellers.map(s => `
        <label style="display:flex;align-items:center;gap:8px;padding:7px 0;cursor:pointer;font-size:14px;border-bottom:1px solid #f8f8f6">
          <input type="checkbox" class="tsk-sc" value="${s.id}" ${isAll||selected.map(String).includes(String(s.id))?'checked':''}>
          ${s.name} <span style="font-size:11px;color:#aaa;margin-left:4px">${s.role}</span>
        </label>`).join('')}
    </div>`;
}

function _onTskAllChange(cb) {
  const sc = document.getElementById('tskSelChecks');
  if (sc) { sc.style.opacity = cb.checked?'.45':'1'; sc.style.pointerEvents = cb.checked?'none':''; }
}

async function saveTask() {
  const title = document.getElementById('tskTitleInp').value.trim();
  if (!title) { showToast("Topshiriq nomini kiriting!"); return; }
  const allCb = document.getElementById('tskAll');
  let assignedTo;
  if (allCb && allCb.checked) {
    assignedTo = ['all'];
  } else {
    assignedTo = [...document.querySelectorAll('.tsk-sc:checked')].map(x => Number(x.value));
    if (!assignedTo.length) { showToast("Kamida 1 ishchi tanlang!"); return; }
  }
  const task = {
    ...(_taskEdit||{}),
    title,
    desc: document.getElementById('tskDescInp').value.trim(),
    priority: document.getElementById('tskPriorityInp').value,
    dueDate: document.getElementById('tskDueInp').value,
    status: document.getElementById('tskStatusInp').value,
    assignedTo,
    completedBy: (_taskEdit && _taskEdit.completedBy)||{},
    createdAt: (_taskEdit && _taskEdit.createdAt)||today(),
    createdBy: 'admin',
    id: (_taskEdit && (_taskEdit.id||Number(_taskEdit._id)))||Date.now()
  };
  if (_taskEdit) {
    const idx = (D.tasks||[]).findIndex(x => (x._id && x._id===_taskEdit._id) || String(x.id)===String(_taskEdit.id||_taskEdit._id));
    if (idx >= 0) D.tasks[idx] = task;
  } else {
    D.tasks = D.tasks||[];
    D.tasks.push(task);
  }
  await window.FS.saveTask(task);
  closeTaskModal();
  renderTasks();
  showToast('Saqlandi ✓');
}

function deleteTask(id) {
  const t = _findTask(id);
  if (!t) return;
  openDelConf("Topshiriqni o'chirish", "Bu topshiriqni o'chirasizmi?", async () => {
    D.tasks = (D.tasks||[]).filter(x => !(x._id && x._id===id) && String(x.id)!==String(id));
    if (t._id) await window.FS.deleteTask(t._id);
    renderTasks();
    showToast("O'chirildi");
  });
}

async function markTaskDone(id) {
  const t = _findTask(id);
  if (!t) return;
  const uid = String(D.user.id);
  t.completedBy = t.completedBy||{};
  const ws = t.completedBy[uid];
  if (!ws) {
    // 1-bosqich: Boshlash → Jarayonda
    t.completedBy[uid] = 'started';
    if (t.status === 'yangi') t.status = 'jarayonda';
    await window.FS.saveTask(t);
    renderTasks();
    showToast('Jarayonga qo\'shildi');
  } else if (ws === 'started') {
    // 2-bosqich: Jarayonda → Bajarildi
    t.completedBy[uid] = true;
    const to = t.assignedTo||[];
    if (!to.includes('all')) {
      const allDone = to.every(sid => t.completedBy[String(sid)] === true);
      if (allDone) t.status = 'bajarildi';
    }
    await window.FS.saveTask(t);
    renderTasks();
    showToast('Bajarildi deb belgilandi ✓');
  }
}

function closeTaskModal() {
  document.getElementById('taskModalW').classList.remove('show');
  _taskEdit = null;
}

// ===== E'LONLAR =====
function openAddAnn() {
  _annEdit = null;
  document.getElementById('annModalTitle').textContent = "E'lon qo'shish";
  document.getElementById('annTitleInp').value = '';
  document.getElementById('annBodyInp').value = '';
  document.getElementById('annPinnedInp').checked = false;
  document.getElementById('annModalW').classList.add('show');
}

function openEditAnn(id) {
  const a = _findAnn(id);
  if (!a) return;
  _annEdit = a;
  document.getElementById('annModalTitle').textContent = "E'lonni tahrirlash";
  document.getElementById('annTitleInp').value = a.title||'';
  document.getElementById('annBodyInp').value = a.body||'';
  document.getElementById('annPinnedInp').checked = a.pinned||false;
  document.getElementById('annModalW').classList.add('show');
}

async function saveAnn() {
  const title = document.getElementById('annTitleInp').value.trim();
  if (!title) { showToast('Sarlavha kiriting!'); return; }
  const now = new Date();
  const ts = `${today()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const ann = {
    ...(_annEdit||{}),
    title,
    body: document.getElementById('annBodyInp').value.trim(),
    pinned: document.getElementById('annPinnedInp').checked,
    createdAt: (_annEdit && _annEdit.createdAt)||ts,
    createdBy: 'admin',
    readBy: (_annEdit && _annEdit.readBy)||[],
    id: (_annEdit && (_annEdit.id||Number(_annEdit._id)))||Date.now()
  };
  if (_annEdit) {
    const idx = (D.announcements||[]).findIndex(x => (x._id && x._id===_annEdit._id) || String(x.id)===String(_annEdit.id||_annEdit._id));
    if (idx >= 0) D.announcements[idx] = ann;
  } else {
    D.announcements = D.announcements||[];
    D.announcements.push(ann);
  }
  await window.FS.saveAnnouncement(ann);
  closeAnnModal();
  renderTasks();
  showToast('Saqlandi ✓');
}

function deleteAnn(id) {
  const a = _findAnn(id);
  if (!a) return;
  openDelConf("E'lonni o'chirish", "Bu e'lonni o'chirasizmi?", async () => {
    D.announcements = (D.announcements||[]).filter(x => !(x._id && x._id===id) && String(x.id)!==String(id));
    if (a._id) await window.FS.deleteAnnouncement(a._id);
    renderTasks();
    showToast("O'chirildi");
  });
}

async function markAnnRead(id) {
  const a = _findAnn(id);
  if (!a) return;
  const uid = D.user.id;
  a.readBy = a.readBy||[];
  if (!a.readBy.includes(uid)) a.readBy.push(uid);
  await window.FS.saveAnnouncement(a);
  renderTasks();
}

function closeAnnModal() {
  document.getElementById('annModalW').classList.remove('show');
  _annEdit = null;
}

function updateTasksBadge() {
  if (!D.user) return;
  const uid = D.user.id;
  const isAdmin = D.user.isAdmin;
  let count = 0;
  if (!isAdmin) {
    const myTasks = (D.tasks||[]).filter(t => {
      const to = t.assignedTo||[];
      return to.includes('all') || to.includes(uid) || to.map(String).includes(String(uid));
    });
    count = myTasks.filter(t => (t.completedBy||{})[String(uid)] !== true).length
           + (D.announcements||[]).filter(a => !(a.readBy||[]).includes(uid)).length;
  }
  const badgeCss = 'position:absolute;top:4px;right:4px;background:#dc2626;color:#fff;border-radius:10px;padding:1px 5px;font-size:10px;font-weight:700;min-width:16px;text-align:center;line-height:16px;pointer-events:none';
  document.querySelectorAll('[data-tid="tTasks"]').forEach(btn => {
    btn.querySelector('.tsk-badge')?.remove();
    if (count > 0) {
      btn.style.position = 'relative';
      const b = document.createElement('span');
      b.className = 'tsk-badge';
      b.style.cssText = badgeCss;
      b.textContent = count > 9 ? '9+' : count;
      btn.appendChild(b);
    }
  });
  document.querySelectorAll('.tab').forEach(btn => {
    if ((btn.getAttribute('onclick')||'').includes("'tTasks'")) {
      btn.querySelector('.tsk-badge')?.remove();
      if (count > 0) {
        btn.style.position = 'relative';
        const b = document.createElement('span');
        b.className = 'tsk-badge';
        b.style.cssText = badgeCss;
        b.textContent = count > 9 ? '9+' : count;
        btn.appendChild(b);
      }
    }
  });
}
