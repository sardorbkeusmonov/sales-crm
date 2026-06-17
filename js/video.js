// ===== VIDEO MULOQOT (Jitsi Meet) =====
let _jitsiApi = null;

function renderVideo() {
  const el = document.getElementById('videoContent');
  if (!el) return;
  const name = (D.user && D.user.name) || (D.admin && D.admin.name) || 'team';
  const defaultRoom = 'salescrm-' + name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + today().replace(/-/g, '');
  el.innerHTML = `
    <div style="padding-top:8px">
      <div style="background:var(--bg1);border-radius:16px;padding:20px;border:1px solid var(--bd);margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
          <div style="width:48px;height:48px;background:var(--pbg);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--p)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          </div>
          <div>
            <div style="font-size:16px;font-weight:700;color:var(--c1)">Video muloqot</div>
            <div style="font-size:13px;color:var(--c4)">Jitsi Meet — bepul, ro'yxatdan o'tishsiz</div>
          </div>
        </div>
        <label style="font-size:13px;font-weight:600;color:var(--c2);display:block;margin-bottom:6px">Xona nomi</label>
        <input class="inp" id="videoRoomInp" value="${defaultRoom}" placeholder="xona-nomi" style="margin-bottom:14px;border-radius:10px">
        <button onclick="startVideoMeeting()" style="width:100%;padding:14px;background:var(--p);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">
          &#128249; Muloqotni boshlash
        </button>
        <div style="margin-top:12px;padding:12px;background:var(--pbg);border-radius:10px;border:1px solid var(--pbd)">
          <div style="font-size:12px;color:var(--c2);line-height:1.6">
            &#128161; <b>Eslatma:</b> Xona nomini yozib ulashsangiz, boshqalar ham shu nomni kiritib qo'shila oladi. Brauzer kamera va mikrofon ruxsatini so'raydi.
          </div>
        </div>
      </div>
      <div id="jitsiWrap" style="display:none">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-size:14px;font-weight:700;color:var(--c1)">&#128308; Muloqot davom etmoqda</div>
          <button onclick="endVideoMeeting()" style="background:#FEF2F2;color:#dc2626;border:1px solid #fecaca;border-radius:8px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Yakunlash &#10005;</button>
        </div>
        <div id="jitsiContainer" style="border-radius:16px;overflow:hidden;min-height:480px;background:#111"></div>
      </div>
    </div>`;
}

function startVideoMeeting() {
  if (typeof JitsiMeetExternalAPI === 'undefined') {
    showToast('Jitsi yuklanmoqda, bir oz kuting...');
    return;
  }
  const inp = document.getElementById('videoRoomInp');
  const raw = (inp ? inp.value.trim() : '') || 'salescrm-team';
  const room = raw.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  endVideoMeeting();

  const wrap = document.getElementById('jitsiWrap');
  if (wrap) wrap.style.display = 'block';

  const uName = (D.user && D.user.name) || (D.admin && D.admin.name) || 'Foydalanuvchi';

  _jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
    roomName: room,
    width: '100%',
    height: 480,
    parentNode: document.getElementById('jitsiContainer'),
    userInfo: { displayName: uName },
    configOverwrite: {
      prejoinPageEnabled: false,
      startWithAudioMuted: true,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      disableDeepLinking: true,
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'chat', 'fullscreen', 'tileview', 'participants-pane'],
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DEFAULT_REMOTE_DISPLAY_NAME: 'Ishtirokchi',
    },
  });

  _jitsiApi.addEventListener('readyToClose', endVideoMeeting);
}

function endVideoMeeting() {
  if (_jitsiApi) {
    try { _jitsiApi.dispose(); } catch (e) {}
    _jitsiApi = null;
  }
  const wrap = document.getElementById('jitsiWrap');
  if (wrap) wrap.style.display = 'none';
  const con = document.getElementById('jitsiContainer');
  if (con) con.innerHTML = '';
}
