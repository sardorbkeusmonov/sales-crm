    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
    import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCNmMZ-7HUkn3geqPO7YMMAT83LtiPu-Bo",
      authDomain: "sales-crm-82b62.firebaseapp.com",
      projectId: "sales-crm-82b62",
      storageBucket: "sales-crm-82b62.firebasestorage.app",
      messagingSenderId: "999829133514",
      appId: "1:999829133514:web:bb5a036656274b3614fc33"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const storage = getStorage(app);

    // Collections
    const COLS = {
      sellers: 'sellers',
      ig: 'instagram',
      products: 'products',
      sales: 'sales',
      settings: 'settings',
      tasks: 'tasks',
      announcements: 'announcements',
      attendance: 'attendance',
      biz_kpi: 'biz_kpi',
      biz_plans: 'biz_plans',
      biz_decisions: 'biz_decisions'
    };

    // ====== LOAD ALL DATA FROM FIRESTORE ======
    async function loadAllData() {
      showLoader(true);
      try {
        const [sellersSnap, igSnap, prodsSnap, salesSnap, settingsSnap, tasksSnap, annsSnap, bizKpiSnap, bizPlansSnap, bizDecsSnap, attSnap] = await Promise.all([
          getDocs(collection(db, COLS.sellers)),
          getDocs(collection(db, COLS.ig)),
          getDocs(collection(db, COLS.products)),
          getDocs(collection(db, COLS.sales)),
          getDocs(collection(db, COLS.settings)),
          getDocs(collection(db, COLS.tasks)),
          getDocs(collection(db, COLS.announcements)),
          getDocs(collection(db, COLS.biz_kpi)),
          getDocs(collection(db, COLS.biz_plans)),
          getDocs(collection(db, COLS.biz_decisions)),
          getDocs(query(collection(db, COLS.attendance), where('date','==',today())))
        ]);

        // Sellers
        if (!sellersSnap.empty) {
          const fbSellers = sellersSnap.docs.map(d => ({...d.data(), _id: d.id}));
          // Dedup by login - duplicate doc larni Firebase dan o'chiramiz
          // Faqat ko'rsatishda dedup - Firebase dan o'chirmaymiz
          const selSeen2=new Set();
          D.sellers=fbSellers.filter(s=>{
            const k=s.login||String(s.id);
            if(selSeen2.has(k))return false;
            selSeen2.add(k);return true;
          });
          // Mobilograf yo'q bo'lsa qo'shamiz
          if(!D.sellers.find(s=>s.role==='mobilograf')){
            const mob={id:D.nUid++,name:'Mobilograf',login:'mob_'+Date.now(),pass:'',igId:null,role:'mobilograf',comm:0,salary:0,startDate:today(),ai:D.sellers.length%6};
            D.sellers.push(mob);
            await window.FS.saveSeller(mob);
          }
        }
        // Instagram
        if (!igSnap.empty) {
          const fbIg = igSnap.docs.map(d => ({...d.data(), _id: d.id}));
          // Dedup by name - eski duplicate doc larni o'chiramiz
          // Faqat ko'rsatishda dedup
          const igSeen2=new Set();
          D.ig=fbIg.filter(ig=>{
            const k=String(ig.id||ig.name);
            if(igSeen2.has(k))return false;
            igSeen2.add(k);return true;
          });
        }
        // Products
        if (!prodsSnap.empty) {
          const fbProds = prodsSnap.docs.map(d => ({...d.data(), _id: d.id}));
          // Dedup by id - eski null stock doc larni o'chiramiz
          // Dedup - stock bor versiyani saqlaymiz
          const prodSeen2=new Map();
          fbProds.forEach(p=>{
            const k=String(p.id);
            if(prodSeen2.has(k)){
              const ex=prodSeen2.get(k);
              if(p.stock!==null&&p.stock!==undefined&&(ex.stock===null||ex.stock===undefined)){
                prodSeen2.set(k,p);
              }
            } else {
              prodSeen2.set(k,p);
            }
          });
          D.products=[...prodSeen2.values()];
        }
        // Sales
        if (!salesSnap.empty) {
          D.sales = salesSnap.docs.map(d => ({...d.data(), _id: d.id}));
        }
        // Settings (admin info)
        if (!settingsSnap.empty) {
          const sett = settingsSnap.docs[0].data();
          if (sett.admin) D.admin = sett.admin;
          if (sett.nUid) D.nUid = sett.nUid;
          if (sett.nPid) D.nPid = sett.nPid;
          if (sett.nSid) D.nSid = sett.nSid;
          if (sett.nIgId) D.nIgId = sett.nIgId;
          if (sett.bonusConfig) D.bonusConfig = sett.bonusConfig;
          if (sett.igDailyDM) D.igDailyDM = sett.igDailyDM;
          if (sett.expenses) D.expenses = sett.expenses;
          if (sett.activeAds) D.activeAds = sett.activeAds;
          if (sett.kpiGoals) D.kpiGoals = sett.kpiGoals||[];
          if (sett.tahlilData) { TA = sett.tahlilData; }
        }
        // Tasks & Announcements
        if (!tasksSnap.empty) D.tasks = tasksSnap.docs.map(d=>({...d.data(),_id:d.id}));
        if (!annsSnap.empty) D.announcements = annsSnap.docs.map(d=>({...d.data(),_id:d.id}));
        // Biznes strategiyasi
        if (!bizKpiSnap.empty) D.bizKpi = bizKpiSnap.docs.map(d=>({...d.data(),_id:d.id}));
        if (!bizPlansSnap.empty) D.bizPlans = bizPlansSnap.docs.map(d=>({...d.data(),_id:d.id}));
        if (!bizDecsSnap.empty) D.bizDecisions = bizDecsSnap.docs.map(d=>({...d.data(),_id:d.id}));
        if (!attSnap.empty) D.attendance = attSnap.docs.map(d=>({...d.data(),_id:d.id}));

        // If empty DB - save initial data
        if (sellersSnap.empty) await saveInitialData();

      } catch(e) {
        console.error('Load error:', e);
        showToast('Maʼlumot yuklanmadi: ' + e.message);
      }
      showLoader(false);
      buildHints();

window.addEventListener('resize',function(){
  const fb=document.getElementById('tabFilterBar');
  if(fb&&fb.style.display!=='none') _posFilterBar();
});

// Sahifa yuklanganda auto-login
(function autoLogin(){
  try{
    const saved = localStorage.getItem('crm_user');
    if(!saved) return;
    const u = JSON.parse(saved);
    // Admin?
    if(u.login === D.admin.login){
      D.user={id:0,name:D.admin.name,isAdmin:true};
      start(D.admin.name+' - Admin');
      buildAdminTabs();
      goT('tDash','Umumiy statistika');
      renderDash();
      return;
    }
    // Seller?
    const sel = D.sellers.find(s=>s.login===u.login);
    if(sel){
      D.user=sel;
      const ig=gI(sel.igId);
      const isTarj=(sel.role==='targetolog');
      start(sel.name+(isTarj?' - Targetolog':ig?' - '+ig.name:''));
      if(sel.role==='omborchi'){buildWarehouseTabs();WH_FILTER='all';DELIVERY_FILTER='new';
      goT('tWarehouse','Ombor');
      const fb=document.getElementById('tabFilterBar');const wf=document.getElementById('whFilters');const df=document.getElementById('delFilters');
      if(fb)fb.style.display='block';if(wf)wf.style.display='flex';if(df)df.style.display='none';
      setWarehouseFilter('all');
    }
      else if(sel.role==='yetkazuvchi'){buildDeliveryTabs();goT('tDelivery','Buyurtmalar');renderDelivery();}
      else if(sel.role==='mobilograf'){buildMobilografTabs();goT('tKPI','KPI Maqsadlar');renderKPI();}
      else if(isTarj){buildTargetologTabs();goT('tTahlil','Tahlil');renderTahlil();}
      else{buildSellerTabs();goT('tMyD','Dashboard');renderMyD();}
    }
  }catch(e){}
})();
    }

    // ====== SAVE INITIAL DATA ======
    async function saveInitialData() {
      const batch = writeBatch(db);
      D.sellers.forEach(s => {
        batch.set(doc(collection(db, COLS.sellers)), s);
      });
      D.ig.forEach(ig => {
        batch.set(doc(collection(db, COLS.ig)), ig);
      });
      D.products.forEach(p => {
        batch.set(doc(collection(db, COLS.products)), p);
      });
      D.sales.forEach(s => {
        batch.set(doc(collection(db, COLS.sales)), s);
      });
      // Settings
      batch.set(doc(collection(db, COLS.settings)), {
        admin: D.admin,
        nUid: D.nUid, nPid: D.nPid, nSid: D.nSid, nIgId: D.nIgId,
        bonusConfig: D.bonusConfig,
        igDailyDM: D.igDailyDM,
        tahlilData: TA,
        expenses: D.expenses
      });
      await batch.commit();
    }

    // ====== FIRESTORE SAVE FUNCTIONS (global) ======
    window.FS = {
      // Sotuv qo'shish
      async addSale(sale) {
        try {
          if(sale._id) {
            await updateDoc(doc(db, COLS.sales, sale._id), sale);
          } else {
            const ref = await addDoc(collection(db, COLS.sales), sale);
            sale._id = ref.id;
          }
        } catch(e) { console.error(e); }
      },
      // Seller saqlash
      async saveSeller(seller) {
        try {
          if (seller._id) {
            await updateDoc(doc(db, COLS.sellers, seller._id), seller);
          } else {
            const ref = await addDoc(collection(db, COLS.sellers), seller);
            seller._id = ref.id;
          }
        } catch(e) { console.error(e); }
      },
      // Seller o'chirish
      async deleteSeller(id) {
        try { await deleteDoc(doc(db, COLS.sellers, id)); } catch(e) { console.error(e); }
      },
      // Mahsulot saqlash
      async saveProduct(prod) {
        try {
          if (prod._id) {
            await updateDoc(doc(db, COLS.products, prod._id), prod);
          } else {
            // _id yo'q - Firebase dan prod.id bo'yicha topamiz
            const q = await getDocs(collection(db, COLS.products));
            const existing = q.docs.find(d=>String(d.data().id)===String(prod.id));
            if(existing){
              prod._id = existing.id;
              await updateDoc(doc(db, COLS.products, prod._id), prod);
            } else {
              const ref = await addDoc(collection(db, COLS.products), prod);
              prod._id = ref.id;
            }
          }
        } catch(e) { console.error(e); }
      },
      // Mahsulot o'chirish
      async deleteProduct(id) {
        try { await deleteDoc(doc(db, COLS.products, id)); } catch(e) { console.error(e); }
      },
      // Instagram saqlash
      async saveIg(ig) {
        try {
          if (ig._id) {
            await updateDoc(doc(db, COLS.ig, ig._id), ig);
          } else {
            const ref = await addDoc(collection(db, COLS.ig), ig);
            ig._id = ref.id;
          }
        } catch(e) { console.error(e); }
      },
      // Instagram o'chirish
      async deleteIg(id) {
        try { await deleteDoc(doc(db, COLS.ig, id)); } catch(e) { console.error(e); }
      },
      // Rasm yuklash Storage ga
      async uploadImage(base64Data, path) {
        try {
          const storageRef = ref(storage, path);
          // base64Data dan data:image/jpeg;base64, qismini olib tashlaymiz
          const base64 = base64Data.split(',')[1] || base64Data;
          const format = base64Data.includes('png') ? 'image/png' : 'image/jpeg';
          await uploadString(storageRef, base64, 'base64', {contentType: format});
          const url = await getDownloadURL(storageRef);
          return url;
        } catch(e) { console.error('Upload error:', e); return null; }
      },

      // Rasm o'chirish
      async deleteImage(path) {
        try {
          const storageRef = ref(storage, path);
          await deleteObject(storageRef);
        } catch(e) { console.error('Delete error:', e); }
      },

      // Settings saqlash - data parametr sifatida keladi
      async saveSettings(data) {
        try {
          const snap = await getDocs(collection(db, COLS.settings));
          if (!snap.empty) {
            await updateDoc(doc(db, COLS.settings, snap.docs[0].id), data);
          } else {
            await addDoc(collection(db, COLS.settings), data);
          }
        } catch(e) { console.error(e); }
      },
      // Topshiriq saqlash
      async saveTask(task) {
        try {
          if (task._id) {
            await updateDoc(doc(db, COLS.tasks, task._id), task);
          } else {
            const r = await addDoc(collection(db, COLS.tasks), task);
            task._id = r.id;
          }
        } catch(e) { console.error(e); }
      },
      async deleteTask(id) {
        try { await deleteDoc(doc(db, COLS.tasks, id)); } catch(e) { console.error(e); }
      },
      // E'lon saqlash
      async saveAnnouncement(ann) {
        try {
          if (ann._id) {
            await updateDoc(doc(db, COLS.announcements, ann._id), ann);
          } else {
            const r = await addDoc(collection(db, COLS.announcements), ann);
            ann._id = r.id;
          }
        } catch(e) { console.error(e); }
      },
      async deleteAnnouncement(id) {
        try { await deleteDoc(doc(db, COLS.announcements, id)); } catch(e) { console.error(e); }
      },
      // Biznes strategiyasi — KPI
      async saveBizKpi(kpi) {
        try {
          const docId = kpi._id || kpi.month;
          if (kpi._id) {
            await updateDoc(doc(db, COLS.biz_kpi, kpi._id), kpi);
          } else {
            const r = await addDoc(collection(db, COLS.biz_kpi), kpi);
            kpi._id = r.id;
          }
        } catch(e) { console.error(e); }
      },
      // Reja daftari
      async saveBizPlan(plan) {
        try {
          if (plan._id) {
            await updateDoc(doc(db, COLS.biz_plans, plan._id), plan);
          } else {
            const r = await addDoc(collection(db, COLS.biz_plans), plan);
            plan._id = r.id;
          }
        } catch(e) { console.error(e); }
      },
      // Qarorlar jurnali
      async saveBizDecision(dec) {
        try {
          if (dec._id) {
            await updateDoc(doc(db, COLS.biz_decisions, dec._id), dec);
          } else {
            const r = await addDoc(collection(db, COLS.biz_decisions), dec);
            dec._id = r.id;
          }
        } catch(e) { console.error(e); }
      },
      async deleteBizDecision(id) {
        try { await deleteDoc(doc(db, COLS.biz_decisions, id)); } catch(e) { console.error(e); }
      },
      // Davomat saqlash
      async saveAttendance(record) {
        try {
          const r = await addDoc(collection(db, COLS.attendance), record);
          record._id = r.id;
        } catch(e) { console.error(e); }
      },
      // Sana bo'yicha davomat yuklash
      async loadAttendanceByDate(date) {
        try {
          const snap = await getDocs(query(collection(db, COLS.attendance), where('date','==',date)));
          return snap.docs.map(d=>({...d.data(),_id:d.id}));
        } catch(e) { console.error(e); return []; }
      },
      // Barcha sotuvlarni o'chirish (test tozalash)
      async clearSales() {
        try {
          const snap = await getDocs(collection(db, COLS.sales));
          const batch = writeBatch(db);
          snap.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
          D.sales = [];
        } catch(e) { console.error(e); }
      }
    };

    // Loader
    function showLoader(show) {
      let el = document.getElementById('_fbLoader');
      if (!el) {
        el = document.createElement('div');
        el.id = '_fbLoader';
        el.style.cssText = 'position:fixed;inset:0;background:rgba(245,245,240,.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px';
        el.innerHTML = '<div style="width:44px;height:44px;border:3px solid #e5e7eb;border-top-color:#185FA5;border-radius:50%;animation:spin 0.8s linear infinite"></div><div style="font-size:15px;color:#185FA5;font-weight:600">Ma\'lumotlar yuklanmoqda...</div>';
        document.head.insertAdjacentHTML('beforeend','<style>@keyframes spin{to{transform:rotate(360deg)}}</style>');
        document.body.appendChild(el);
      }
      el.style.display = show ? 'flex' : 'none';
    }

    // Start
    window.addEventListener('DOMContentLoaded', () => {
      loadAllData();
    });
