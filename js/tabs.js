function buildTargetologTabs(){
  const icT=s=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
  const chartIc=icT('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>');
  const kpiIcT=icT('<circle cx="12" cy="12" r="1"/><path d="M12 7a5 5 0 1 0 5 5"/><path d="M13 3.055a9 9 0 1 0 7.941 7.945"/><path d="M15 6v3h3l3 -3h-3v-3z"/><path d="M15 9l-3 3"/>');
  const taskIcT=icT('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6"/><path d="M9 16h4"/>');
  const videoIcT=icT('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>');
  document.getElementById('tabbar').innerHTML=`
    <button class="tab on" onclick="goTab('tTahlil','Tahlil',this)">${chartIc}<span style="font-size:13px">Tahlil</span></button>
    <button class="tab" onclick="goTab('tKPI','KPI',this)">${kpiIcT}<span style="font-size:13px">KPI</span></button>
    <button class="tab" onclick="goTab('tTasks','Topshiriqlar',this)">${taskIcT}<span style="font-size:13px">Topshiriq</span></button>
    <button class="tab" onclick="goTab('tVideo','Video muloqot',this)">${videoIcT}<span style="font-size:13px">Video</span></button>`;
  buildSidebar([{id:'tTahlil',label:'Tahlil',icon:chartIc},{id:'tKPI',label:'KPI Maqsadlar',icon:kpiIcT},{id:'tTasks',label:'Topshiriqlar',icon:taskIcT},{id:'tVideo',label:'Video muloqot',icon:videoIcT}]);
  setSidebarActive('tTahlil');
}
function buildSellerTabs(){
  const ic2=s=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
  const I2={
    dash:ic2('<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>'),
    sale:ic2('<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>'),
    history:ic2('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    team:ic2('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>'),
    chart:ic2('<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/>'),
    income:ic2('<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 000 4h4a2 2 0 010 4H8"/><line x1="12" y1="6" x2="12" y2="18"/>'),
  };
  const taskIc2=ic2('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6"/><path d="M9 16h4"/>');
  const profIc2=ic2('<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/>');
  document.getElementById('tabbar').innerHTML=`
    <button id="sotuvTab" class="tab on" style="position:relative" onclick="goTab('tMyD','Sotuv',this)">${I2.dash}<span style="font-size:13px">Sotuv</span><span id="cartBadge" style="display:none;position:absolute;top:4px;right:4px;background:#dc2626;color:white;border-radius:50%;min-width:17px;height:17px;font-size:10px;font-weight:800;line-height:17px;text-align:center;padding:0 3px;pointer-events:none">0</span></button>
    <button class="tab" onclick="goTab('tMyJ','Jamoa',this)">${I2.team}<span style="font-size:13px">Jamoa</span></button>
    <button class="tab" onclick="goTab('tTarix','Daromadim',this)">${I2.income}<span style="font-size:13px">Daromadim</span></button>
    <button class="tab" onclick="goTab('tMyOrders','Buyurtmalar',this)">${ic2('<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>')}<span style="font-size:13px">Buyurtmalar</span></button>
    <button class="tab" onclick="goTab('tTahlil','Tahlil',this)">${I2.chart}<span style="font-size:13px">Tahlil</span></button>
    <button class="tab" onclick="goTab('tKPI','KPI',this)">${ic2('<circle cx="12" cy="12" r="1"/><path d="M12 7a5 5 0 1 0 5 5"/><path d="M13 3.055a9 9 0 1 0 7.941 7.945"/><path d="M15 6v3h3l3 -3h-3v-3z"/><path d="M15 9l-3 3"/>')}<span style="font-size:13px">KPI</span></button>
    <button class="tab" onclick="goTab('tTasks','Topshiriqlar',this)">${taskIc2}<span style="font-size:13px">Topshiriq</span></button>
    <button class="tab" onclick="goTab('tVideo','Video muloqot',this)">${ic2('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>')}<span style="font-size:13px">Video</span></button>
    <button class="tab" onclick="goTab('tSellerProf','Profil',this)">${profIc2}<span style="font-size:13px">Profil</span></button>`;
  buildSidebar([
    {id:'tMyD',label:'Sotuv',icon:I2.dash},
    {id:'tMyJ',label:'Jamoa',icon:I2.team},
    {id:'tTarix',label:'Daromadim',icon:I2.income},
    {id:'tMyOrders',label:'Buyurtmalar',icon:ic2('<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>')},
    {id:'tTahlil',label:'Tahlil',icon:I2.chart},
    {id:'tKPI',label:'KPI Maqsadlar',icon:ic2('<circle cx="12" cy="12" r="1"/><path d="M12 7a5 5 0 1 0 5 5"/><path d="M13 3.055a9 9 0 1 0 7.941 7.945"/><path d="M15 6v3h3l3 -3h-3v-3z"/><path d="M15 9l-3 3"/>')},
    {id:'tTasks',label:'Topshiriqlar',icon:taskIc2},
    {id:'tVideo',label:'Video muloqot',icon:ic2('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>')},
    {id:'tSellerProf',label:'Profil',icon:profIc2},
  ]);
  setSidebarActive('tMyD');
}

const ALL_TABS=['tDash','tJamoa','tProd','tSellers','tTahlil','tProfile','tSofFoyda','tMyD','tTarix','tMyJ','tWarehouse','tDelivery','tMyOrders','tMob','tKPI','tTasks','tStrategy','tVideo','tSellerProf'];
function hideAll(){ALL_TABS.forEach(id=>{const el=document.getElementById(id);if(el){el.style.display='none';el.style.paddingTop='';}});const fb=document.getElementById('tabFilterBar');if(fb)fb.style.display='none';}
function goT(id,title){hideAll();document.getElementById(id).style.display='block';document.getElementById('ttitle').textContent=title;}
function goTab(id,title,el){
  hideAll();
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  if(el)el.classList.add('on');
  setSidebarActive(id);
  const tabEl=document.getElementById(id);
  tabEl.style.display='block';
  tabEl.scrollTop=0;
  window.scrollTo(0,0);
  document.body.scrollTop=0;
  document.documentElement.scrollTop=0;
  setTimeout(()=>{
    tabEl.scrollTop=0;
    window.scrollTo(0,0);
  },10);
  document.getElementById('ttitle').textContent=title;
  if(id==='tDash')renderDash();
  if(id==='tJamoa'){dedupSellers();renderJamoa();jView('s',document.querySelector('#jSeg .sb'));}
  if(id==='tProd')renderProdAdm();
  if(id==='tSellers'){sView('sellers',document.querySelector('#sSeg .sb'));renderSellers();renderIgAdm();}
  if(id==='tTahlil')renderTahlil();
  if(id==='tProfile')renderAdminProfile();
  if(id==='tKPI')renderKPI();
  if(id==='tTasks')renderTasks();
  if(id==='tStrategy')renderStrategy();
  if(id==='tSofFoyda')renderSofFoyda();
  if(id==='tVideo')renderVideo();
  if(id==='tSellerProf')renderSellerProf();
  if(id==='tMyD')renderMyD();
  if(id==='tTarix')renderTarix();
  if(id==='tMyJ'){renderMyJ();mjView('s',document.querySelector('#tMyJ .sb'));}
  if(id==='tMyOrders'){
    const fb=document.getElementById('tabFilterBar');
    const wf=document.getElementById('whFilters');
    const df=document.getElementById('delFilters');
    if(fb)fb.style.display='block';
    if(wf)wf.style.display='none';
    if(df)df.style.display='flex';
    setTimeout(function(){
      _posFilterBar();
      const fb=document.getElementById('tabFilterBar');
      const isMob=window.innerWidth<=767;
      const tb=document.querySelector('#contentArea .topbar');
      const tbH=isMob?(tb?tb.getBoundingClientRect().height:56):0;
      const fbH=fb?fb.getBoundingClientRect().height:46;
      tabEl.style.paddingTop=(tbH+fbH+12)+'px';
    },50);
    DELIVERY_FILTER=DELIVERY_FILTER||'new';
    renderMyOrders();
  }
  if(id==='tWarehouse'){
    const fb=document.getElementById('tabFilterBar');
    const wf=document.getElementById('whFilters');
    const df=document.getElementById('delFilters');
    if(fb){fb.style.display='block';}
    if(wf){wf.style.display='flex';}
    if(df){df.style.display='none';}
    setTimeout(function(){
      _posFilterBar();
      if(window.innerWidth<=767){
        tabEl.style.paddingTop='120px';
      } else {
        const fb=document.getElementById('tabFilterBar');
        const fbH=fb?fb.getBoundingClientRect().height:46;
        tabEl.style.paddingTop=(fbH+8)+'px';
      }
    },100);
    WH_FILTER=WH_FILTER||'all';setWarehouseFilter(WH_FILTER);
  }
  if(id==='tDelivery'){
    const fb=document.getElementById('tabFilterBar');
    const wf=document.getElementById('whFilters');
    const df=document.getElementById('delFilters');
    if(fb){fb.style.display='block';}
    if(wf){wf.style.display='none';}
    if(df){df.style.display='flex';}
    setTimeout(function(){
      _posFilterBar();
      const fb=document.getElementById('tabFilterBar');
      const isMob=window.innerWidth<=767;
      const tb=document.querySelector('#contentArea .topbar');
      const tbH=isMob?(tb?tb.getBoundingClientRect().height:56):0;
      const fbH=fb?fb.getBoundingClientRect().height:46;
      tabEl.style.paddingTop=(tbH+fbH+12)+'px';
    },50);
    DELIVERY_FILTER=DELIVERY_FILTER||'new';setDeliveryFilter(DELIVERY_FILTER);
  }
}
function buildAdminTabs(){
  const ic=s=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
  const sofIc=ic('<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>');
  const taskIc=ic('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6"/><path d="M9 16h4"/>');
  const stratIc=ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>');
  const ICONS={
    dash:ic('<path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M3 14h7v7H3z"/><path d="M14 14h7v7h-7z"/>'),
    team:ic('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    prod:ic('<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>'),
    staff:ic('<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="11" x2="12" y2="21"/><line x1="8" y1="16" x2="16" y2="16"/>'),
    chart:ic('<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/>'),
    profile:ic('<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/>'),
  };
  document.getElementById('tabbar').innerHTML=`
    <button class="tab on" onclick="goTab('tDash','Umumiy statistika',this)">${ICONS.dash}<span style="font-size:13px">Umumiy</span></button>
    <button class="tab" onclick="goTab('tJamoa','Jamoa natijalari',this)">${ICONS.team}<span style="font-size:13px">Jamoa</span></button>
    <button class="tab" onclick="goTab('tProd','Mahsulotlar',this)">${ICONS.prod}<span style="font-size:13px">Mahsulot</span></button>
    <button class="tab" onclick="goTab('tSellers','Ishchilar',this)">${ICONS.staff}<span style="font-size:13px">Ishchilar</span></button>
    <button class="tab" onclick="goTab('tTahlil','Tahlil',this)">${ICONS.chart}<span style="font-size:13px">Tahlil</span></button>
    <button class="tab" onclick="goTab('tTasks','Topshiriqlar',this)">${taskIc}<span style="font-size:13px">Topshiriq</span></button>
    <button class="tab" onclick="goTab('tStrategy','Biznes strategiyasi',this)">${stratIc}<span style="font-size:13px">Strategiya</span></button>
    <button class="tab" onclick="goTab('tSofFoyda','Sof foyda',this)">${sofIc}<span style="font-size:13px">Foyda</span></button>
    <button class="tab" onclick="goTab('tVideo','Video muloqot',this)">${ic('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>')}<span style="font-size:13px">Video</span></button>
    <button class="tab" onclick="goTab('tProfile','Profilim',this)">${ICONS.profile}<span style="font-size:13px">Profil</span></button>`;
  buildSidebar([
    {id:'tDash',label:'Umumiy',icon:ICONS.dash},
    {id:'tJamoa',label:'Jamoa',icon:ICONS.team},
    {id:'tProd',label:'Mahsulotlar',icon:ICONS.prod},
    {id:'tSellers',label:'Ishchilar',icon:ICONS.staff},
    {id:'tTahlil',label:'Tahlil',icon:ICONS.chart},
    {id:'tKPI',label:'KPI Maqsadlar',icon:ic('<circle cx="12" cy="12" r="1"/><path d="M12 7a5 5 0 1 0 5 5"/><path d="M13 3.055a9 9 0 1 0 7.941 7.945"/><path d="M15 6v3h3l3 -3h-3v-3z"/><path d="M15 9l-3 3"/>')},
    {id:'tTasks',label:'Topshiriqlar',icon:taskIc},
    {id:'tStrategy',label:'Biznes strategiyasi',icon:stratIc},
    {id:'tSofFoyda',label:'Sof foyda',icon:sofIc},
    {id:'tVideo',label:'Video muloqot',icon:ic('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>')},
    {id:'tProfile',label:'Profil',icon:ICONS.profile},
  ]);
  setSidebarActive('tDash');
}
function buildSidebar(tabs){
  // tabs = [{id, label, icon}]
  const ds=document.getElementById('sidebarTabs');
  const ms=document.getElementById('mobileSidebarTabs');
  if(!ds||!ms) return;
  const html=tabs.map(t=>`
    <button class="s-tab" data-tid="${t.id}" onclick="goTabSidebar('${t.id}','${t.label}',this)">
      ${t.icon}
      <span>${t.label}</span>
    </button>`).join('');
  ds.innerHTML=html;
  ms.innerHTML=html;
  if(typeof updateTasksBadge==='function') updateTasksBadge();
}

function goTabSidebar(id,title,el){
  closeMobileSidebar();
  // tabbar da ham active qilamiz
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  // sidebar active
  document.querySelectorAll('.s-tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll(`[data-tid="${id}"]`).forEach(t=>t.classList.add('on'));
  goTab(id,title,null);
}

function setSidebarActive(id){
  document.querySelectorAll('.s-tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll(`[data-tid="${id}"]`).forEach(t=>t.classList.add('on'));
}

function openMobileSidebar(){
  document.getElementById('mobileSidebar').classList.add('open');
  document.getElementById('sbOverlay').classList.add('show');
}
function closeMobileSidebar(){
  document.getElementById('mobileSidebar').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('show');
}

function updateSidebarUser(name,sub){
  const t1=document.getElementById('sideTitle');
  const s1=document.getElementById('sideSub');
  const t2=document.getElementById('mobSideTitle');
  const s2=document.getElementById('mobSideSub');
  if(t1)t1.textContent=name;
  if(s1)s1.textContent=sub;
  if(t2)t2.textContent=name;
  if(s2)s2.textContent=sub;
}
