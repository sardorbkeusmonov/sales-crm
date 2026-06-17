const AVC=['#DBEAFE|#1e40af','#DCFCE7|#166534','#FEF3C7|#92400e','#EDE9FE|#5b21b6','#FFE4E6|#9f1239','#D1FAE5|#065f46','#FCE7F3|#831843','#F1F5F9|#475569'];
const MONTHS=['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const avSt=i=>{const[bg,c]=AVC[i%AVC.length].split('|');return`background:${bg};color:${c}`;};
const ini=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
const today=()=>new Date().toISOString().slice(0,10);
const yesterday=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);};
const fmt=n=>Number(n).toLocaleString('uz-UZ');

let D={
  nUid:10,nPid:13,nSid:20,nIgId:5,
  sellers:[
    {id:1,name:'Roziya',login:'roziya',pass:'1234',igId:1,ai:0,role:'sotuvchi',comm:10000},
    {id:2,name:'Madina',login:'madina',pass:'1234',igId:2,ai:1,role:'sotuvchi',comm:10000},
    {id:3,name:'Marhabo',login:'marhabo',pass:'1234',igId:3,ai:2,role:'sotuvchi',comm:10000},
    {id:4,name:'Shahzoda',login:'shahzoda',pass:'1234',igId:4,ai:3,role:'sotuvchi',comm:10000},
    {id:5,name:'Sardorbek Usmonov',login:'target',pass:'1234',igId:null,ai:4,role:'targetolog'},
    {id:6,name:'Omborchi',login:'omborchi',pass:'1234',igId:null,ai:5,role:'omborchi'},
    {id:7,name:'Mobilograf',login:'mob_init',pass:'',igId:null,ai:6,role:'mobilograf',comm:0,salary:0},
  ],
  ig:[
    {id:1,name:'@takbir.shop'},
    {id:2,name:'@tabrikhouse_'},
    {id:3,name:'@farruh_co'},
    {id:4,name:'@farruhco'},
  ],
  products:[
    {id:1,name:'Tomford',price:99000,color:'#B5D4F4',img:'',igId:1},
    {id:2,name:'Tony Stark',price:99000,color:'#C0DD97',img:'',igId:1},
    {id:3,name:"To'plam 250",price:250000,color:'#F4C0D1',img:'',igId:1},
    {id:4,name:'Tomford',price:99000,color:'#B5D4F4',img:'',igId:2},
    {id:5,name:'Tony Stark',price:99000,color:'#C0DD97',img:'',igId:2},
    {id:6,name:"To'plam 250",price:250000,color:'#F4C0D1',img:'',igId:2},
    {id:7,name:'Tissot',price:350000,color:'#FAC775',img:'',igId:3},
    {id:8,name:'Rolex',price:290000,color:'#CECBF6',img:'',igId:3},
    {id:9,name:'Casio',price:150000,color:'#9FE1CB',img:'',igId:3},
    {id:10,name:'Tissot',price:350000,color:'#FAC775',img:'',igId:4},
    {id:11,name:'Rolex',price:290000,color:'#CECBF6',img:'',igId:4},
    {id:12,name:'Casio',price:150000,color:'#9FE1CB',img:'',igId:4},
  ],
  sales:[
    {id:1,sid:1,igId:1,pid:1,date:'2026-04-09',time:'09:14'},
    {id:2,sid:1,igId:1,pid:2,date:'2026-04-10',time:'11:30'},
    {id:3,sid:2,igId:2,pid:1,date:'2026-04-10',time:'10:05'},
    {id:4,sid:3,igId:3,pid:3,date:'2026-04-11',time:'14:22'},
    {id:5,sid:1,igId:1,pid:3,date:'2026-04-12',time:'16:00'},
    {id:6,sid:2,igId:2,pid:2,date:'2026-04-12',time:'12:45'},
    {id:7,sid:4,igId:4,pid:1,date:'2026-04-13',time:'09:55'},
    {id:8,sid:3,igId:3,pid:2,date:'2026-04-13',time:'13:10'},
    {id:9,sid:1,igId:1,pid:1,date:'2026-04-14',time:'10:20'},
    {id:10,sid:2,igId:2,pid:3,date:'2026-04-14',time:'15:30'},
    {id:11,sid:4,igId:4,pid:2,date:'2026-04-14',time:'11:00'},
    {id:12,sid:3,igId:3,pid:1,date:'2026-04-15',time:'09:05'},
    {id:13,sid:1,igId:1,pid:2,date:'2026-04-15',time:'10:45'},
    {id:14,sid:2,igId:2,pid:1,date:'2026-04-15',time:'08:50'},
    {id:15,sid:4,igId:4,pid:3,date:'2026-04-15',time:'11:20'},
  ],
  admin:{name:'Farruh Asqarov',login:'farruh',pass:'1234'},
  user:null,selC:'#B5D4F4',imgD:'',ePid:null,eSid:null,eIgId:null,pPid:null,saleSelectedImg:'',igDailyDM:{},bonusConfig:{bonusConv:21,bonusAmt:30000,fineConv:10,fineAmt:20000},dollarRate:12500,expenses:[],activeAds:[],kpiGoals:[],tasks:[],announcements:[],bizKpi:[],bizPlans:[],bizDecisions:[],attendance:[]
};

let TA={igData:{},prodData:{}};
let editingRow=null;
let D_filter={mode:'today'};
let CAL={year:0,month:0,from:null,to:null};
let T_filter={mode:'today'};
let SF_filter={mode:'today',from:'',to:''};
let T_CAL={year:0,month:0,from:null,to:null};

const gP=id=>D.products.find(p=>p.id==id||Number(p.id)===Number(id));
const gS=id=>D.sellers.find(s=>s.id===id);
const gI=id=>D.ig.find(a=>a.id===id);
const myS=()=>D.sales.filter(s=>s.sid===D.user.id);
const getSaleItems=s=>s.items&&s.items.length?s.items:[{pid:s.pid,qty:(s.customer&&s.customer.qty)||1,price:gP(s.pid)?gP(s.pid).price:0}];
const rv=arr=>arr.reduce((a,s)=>{if(s.items&&s.items.length)return a+s.items.reduce((b,it)=>b+(it.price||0)*it.qty,0);const p=gP(s.pid);const q=(s.customer&&s.customer.qty)||1;return a+(p?p.price*q:0);},0);
function buildHints(){
  document.getElementById('lhints').innerHTML='';
}

// === DARK MODE ===
function isDark(){return document.documentElement.getAttribute('data-theme')==='dark';}
function dc(l,d){return isDark()?d:l;}

function applyDarkMode(dark){
  document.documentElement.setAttribute('data-theme', dark?'dark':'light');
  try{localStorage.setItem('crm_theme', dark?'dark':'light');}catch(e){}
  _updateDmIcons(dark);
}

function toggleDarkMode(){
  applyDarkMode(!isDark());
  _rerenderCurrentView();
}

function _updateDmIcons(dark){
  const sunSvg='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const moonSvg='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const icon=dark?sunSvg:moonSvg;
  const label=dark?'Light mode':'Dark mode';
  ['dmToggle','mobileDmToggle'].forEach(function(id){
    const el=document.getElementById(id);
    if(el){el.innerHTML=icon+'<span>'+label+'</span>';}
  });
}

function _rerenderCurrentView(){
  if(!D.user) return;
  const tabs=['tDash','tJamoa','tProd','tSellers','tTahlil','tProfile','tSofFoyda','tMyD','tTarix','tMyJ','tWarehouse','tDelivery','tMyOrders','tMob','tKPI','tTasks','tStrategy','tVideo'];
  const active=tabs.find(id=>{const el=document.getElementById(id);return el&&el.style.display!=='none';});
  if(active) goTab(active,document.getElementById('ttitle').textContent,null);
}

// Init dark mode from localStorage
(function(){
  try{
    const saved=localStorage.getItem('crm_theme');
    if(saved==='dark'){document.documentElement.setAttribute('data-theme','dark');}
  }catch(e){}
})();

function togglePass(inputId,btn){
  const inp=document.getElementById(inputId);
  if(inp.type==='password'){
    inp.type='text';
    btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  } else {
    inp.type='password';
    btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }
}

function doLogin(){
  const l=document.getElementById('li').value.trim();
  const p=document.getElementById('lp').value.trim();
  if(l===D.admin.login&&p===D.admin.pass){
    D.user={id:0,name:D.admin.name,isAdmin:true};
    start(D.admin.name+' - Admin');buildAdminTabs();goT('tDash','Umumiy statistika');renderDash();return;
  }
  const u=D.sellers.find(x=>x.login===l&&x.pass===p);
  if(!u){document.getElementById('lerr').style.display='block';return;}
  document.getElementById('lerr').style.display='none';
  D.user=u;
  const ig=gI(u.igId);
  const isTarj=(u.role==='targetolog');
  start(u.name+(isTarj?' - Targetolog':ig?' - '+ig.name:''));
  if(u.role==='omborchi'){buildWarehouseTabs();WH_FILTER='all';DELIVERY_FILTER='new';
  goT('tWarehouse','Ombor');
  const _fb=document.getElementById('tabFilterBar');const _wf=document.getElementById('whFilters');const _df=document.getElementById('delFilters');
  if(_fb)_fb.style.display='block';if(_wf)_wf.style.display='flex';if(_df)_df.style.display='none';
  setWarehouseFilter('all');
}
  else if(u.role==='yetkazuvchi'){buildDeliveryTabs();goT('tDelivery','Buyurtmalar');renderDelivery();}
  else if(u.role==='mobilograf'){buildMobilografTabs();goT('tKPI','KPI Maqsadlar');renderKPI();}
  else if(isTarj){buildTargetologTabs();goT('tTahlil','Tahlil');renderTahlil();}
  else{buildSellerTabs();goT('tMyD','Dashboard');renderMyD();}
}

function start(sub){
  document.getElementById('pgL').classList.remove('show');
  document.getElementById('pgM').classList.add('show');
  document.getElementById('tsub').textContent=sub;
  updateSidebarUser(D.user.name||D.admin.name, sub);
  // Login holatini saqlash
  try{ localStorage.setItem('crm_user', JSON.stringify({id:D.user.id,login:D.user.login||D.admin.login})); }catch(e){}
}

function doLogout(){
  D.user=null;
  try{ localStorage.removeItem('crm_user'); }catch(e){}
  document.getElementById('pgM').classList.remove('show');
  document.getElementById('pgL').classList.add('show');
  document.getElementById('li').value='';
  document.getElementById('lp').value='';
  buildHints();

window.addEventListener('resize',function(){
  const fb=document.getElementById('tabFilterBar');
  if(fb&&fb.style.display!=='none') _posFilterBar();
});
}
