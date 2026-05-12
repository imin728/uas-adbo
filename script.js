// 1. Inisialisasi Database
// Perhatian: /rest/v1/ dihapus agar SDK bisa bekerja dengan benar
const SUPABASE_URL = "https://sjykqwkdsubugqxyavyr.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqeWtxd2tkc3VidWdxeHlhdnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTMzNDYsImV4cCI6MjA5NDE2OTM0Nn0.NEH3Xq8V_UsnnzFB2zzuLEBkDcV9UrMI6lLQeBoFaJE";

// Pastikan variabel 'supabase' (huruf kecil) dibuat dari objek 'supabase' (library)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Tambahkan ini di baris pertama script.js
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});

// ... baru masukkan kode function bukaModal() dan seterusnya ...

function bukaModal() {
  document.getElementById("modal-peran").classList.add("open");
}
function tutupModal() {
  document.getElementById("modal-peran").classList.remove("open");
}
function pilihPeran(peran) {
  tutupModal();
  if (peran === "pemohon") {
    document.getElementById("pemohon-wrap").style.display = "block";
    document.getElementById("petugas-wrap").style.display = "none";
    showPP("login");
  } else {
    document.getElementById("petugas-wrap").style.display = "block";
    document.getElementById("pemohon-wrap").style.display = "none";
    document.getElementById("pt-login-page").style.display = "block";
    document.getElementById("pt-dashboard-page").style.display = "none";
  }
}

/* ══ PEMOHON ══ */
const dokumen = {
  permintaan_data: [
    "Surat permohonan (PDF)",
    "KTP pemohon (PDF)",
    "Surat keterangan instansi (PDF)",
  ],
  rohaniawan: [
    "Surat permohonan (PDF)",
    "KTP pemohon (PDF)",
    "Surat undangan kegiatan (PDF)",
  ],
  permintaan_kesediaan: [
    "Surat permohonan (PDF)",
    "KTP pemohon (PDF)",
    "Proposal kegiatan (PDF)",
  ],
  perubahan_sirup: [
    "Surat permohonan (PDF)",
    "KTP pemohon (PDF)",
    "Dokumen SIRUP lama (PDF)",
  ],
  permohonan_rekomendasi: [
    "Surat permohonan (PDF)",
    "KTP pemohon (PDF)",
    "Dokumen pendukung (PDF)",
  ],
};
function showPP(p) {
  document
    .querySelectorAll("#pemohon-wrap .page")
    .forEach((x) => x.classList.remove("active"));
  document.getElementById("pp-" + p).classList.add("active");
}
async function doLoginPemohon() {
  const email = document.querySelector("#pp-login input[type='email']").value;
  const password = document.querySelector(
    "#pp-login input[type='password']",
  ).value;
  const btn = event.target;

  if (!email || !password) {
    alert("Email dan password harus diisi!");
    return;
  }

  const teksAsli = btn.innerText;
  btn.innerText = "Memverifikasi...";
  btn.disabled = true;

  // LOGIN KE SUPABASE
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert("Login Gagal: " + error.message);
    btn.innerText = teksAsli;
    btn.disabled = false;
  } else {
    // AMBIL NAMA DARI METADATA
    const userNama = data.user.user_metadata.full_name || "Pemohon";

    const navUser = document.getElementById("nav-user-p");
    navUser.textContent = userNama;
    navUser.style.display = "inline";

    const navBtn = document.getElementById("nav-action-p");
    navBtn.textContent = "Logout";
    navBtn.onclick = async () => {
      await supabaseClient.auth.signOut(); // Logout dari Supabase juga
      navUser.style.display = "none";
      navBtn.textContent = "Login";
      navBtn.onclick = bukaModal;
      showPP("landing");
    };

    showPP("dashboard");
    switchTabP("buat", document.querySelectorAll("#pemohon-wrap .nav-tab")[0]);
  }
}
function switchTabP(tab, el) {
  document
    .querySelectorAll("#pemohon-wrap .nav-tab")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("ptab-buat").style.display =
    tab === "buat" ? "block" : "none";
  document.getElementById("ptab-riwayat").style.display =
    tab === "riwayat" ? "block" : "none";
}
function pilihJenis(val) {
  const wrap = document.getElementById("syarat-wrap");
  const list = document.getElementById("dok-list");
  if (!val) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "block";
  list.innerHTML = (dokumen[val] || [])
    .map(
      (d) =>
        `<div class="dok-item-form"><span>${d}</span><small>Pilih file</small></div>`,
    )
    .join("");
}
function kirimPermohonan() {
  // 1. Ambil checkbox berdasarkan ID yang ada di HTML kamu (captcha)
  const cek = document.getElementById("captcha");

  // 2. Logika pengecekan
  if (!cek || !cek.checked) {
    alert("Silakan centang 'Saya bukan robot' terlebih dahulu!");
    return;
  }

  // 3. Ambil tombol secara spesifik agar tidak error (pilih salah satu cara)
  // Kita cari tombol yang sedang diklik
  const btn = document.querySelector(
    ".btn-primary[onclick='kirimPermohonan()']",
  );
  const teksAsli = btn.innerText;

  // 4. Jalankan efek loading
  btn.disabled = true;
  btn.innerText = "Sedang mengirim... Mohon tunggu";

  // 5. Delay 2 detik sebelum pindah halaman
  setTimeout(function () {
    btn.disabled = false;
    btn.innerText = teksAsli;

    // Pindah ke layar sukses
    showPP("sukses");

    // Reset captcha agar kalau balik lagi sudah kosong
    cek.checked = false;
  }, 2000);
}
function keRiwayatP() {
  showPP("dashboard");
  switchTabP("riwayat", document.querySelectorAll("#pemohon-wrap .nav-tab")[1]);
}
function bukaDetailP(status) {
  const el = document.getElementById("detail-card-p");
  if (status === "selesai") {
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:0.5px solid var(--border)">
        <div><div style="font-size:15px;font-weight:500">Permohonan Rekomendasi</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">No: PTSP/2026/004 &nbsp;|&nbsp; 01 Mei 2026</div></div>
        <span class="badge selesai">Selesai</span>
      </div>
      <div class="detail-info">
        <div class="detail-row"><span>Nama</span><span>Siti Rahma</span></div>
        <div class="detail-row"><span>NIK</span><span>7471234567890001</span></div>
        <div class="detail-row"><span>Jenis</span><span>Permohonan Rekomendasi</span></div>
        <div class="detail-row"><span>Status</span><span style="color:#085041">Selesai</span></div>
      </div>
      <div style="font-size:12px;color:var(--text-2);font-weight:500;margin-bottom:8px">Dokumen hasil</div>
      <div class="dok-unduh"><span>Surat rekomendasi.pdf</span><button class="btn-unduh">Unduh</button></div>`;
  } else if (status === "menunggu") {
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:0.5px solid var(--border)">
        <div><div style="font-size:15px;font-weight:500">Rohaniawan</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">No: PTSP/2026/007 &nbsp;|&nbsp; 03 Mei 2026</div></div>
        <span class="badge menunggu">Menunggu verifikasi</span>
      </div>
      <div class="detail-info">
        <div class="detail-row"><span>Nama</span><span>Siti Rahma</span></div>
        <div class="detail-row"><span>NIK</span><span>7471234567890001</span></div>
        <div class="detail-row"><span>Jenis</span><span>Rohaniawan</span></div>
        <div class="detail-row"><span>Status</span><span style="color:#633806">Menunggu verifikasi petugas</span></div>
      </div>
      <div style="font-size:13px;color:var(--text-2);text-align:center;padding:10px 0">Dokumen hasil akan tersedia setelah permohonan disetujui.</div>`;
  } else if (status === "tolak-dok") {
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:0.5px solid var(--border)">
        <div><div style="font-size:15px;font-weight:500">Permintaan Data</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">No: PTSP/2026/002 &nbsp;|&nbsp; 28 Apr 2026</div></div>
        <span class="badge ditolak">Ditolak</span>
      </div>
      <div class="tolak-notif">
        <p>Alasan penolakan:</p>
        <small>"KTP yang diupload tidak jelas/buram, mohon upload ulang dengan kualitas yang lebih baik."</small>
      </div>
      <div class="detail-info">
        <div class="detail-row"><span>Nama</span><span>Siti Rahma</span></div>
        <div class="detail-row"><span>Jenis</span><span>Permintaan Data</span></div>
        <div class="detail-row"><span>Kategori penolakan</span><span style="color:#712B13">Dokumen bermasalah</span></div>
      </div>
      <div style="font-size:12px;color:var(--text-2);font-weight:500;margin-bottom:8px">Ajukan ulang dengan memperbaiki dokumen yang bermasalah?</div>
      <div class="btn-row">
        <button class="btn-ulang" onclick="showPP('ulang')">Ya, ajukan ulang</button>
        <button class="btn-secondary" onclick="keRiwayatP()">Tidak</button>
      </div>`;
  } else if (status === "tolak-non") {
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:0.5px solid var(--border)">
        <div><div style="font-size:15px;font-weight:500">Permintaan Kesediaan</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">No: PTSP/2026/001 &nbsp;|&nbsp; 25 Apr 2026</div></div>
        <span class="badge ditolak">Ditolak</span>
      </div>
      <div class="tolak-notif">
        <p>Alasan penolakan:</p>
        <small>"Pemohon tidak memenuhi kriteria penerima beasiswa yang ditetapkan pada periode ini."</small>
      </div>
      <div class="detail-info">
        <div class="detail-row"><span>Nama</span><span>Siti Rahma</span></div>
        <div class="detail-row"><span>Jenis</span><span>Permintaan Kesediaan</span></div>
        <div class="detail-row"><span>Kategori penolakan</span><span style="color:#712B13">Persyaratan tidak terpenuhi</span></div>
      </div>
      <div style="font-size:12px;color:var(--coral);background:#fff3ee;border:0.5px solid var(--red-border);border-radius:var(--radius-sm);padding:8px 10px;margin-bottom:14px">
        Permohonan ini tidak dapat diajukan ulang. Anda dapat mengajukan permohonan baru jika sudah memenuhi persyaratan.
      </div>
      <div class="btn-row">
        <button class="btn-primary" onclick="showPP('dashboard');switchTabP('buat',document.querySelectorAll('#pemohon-wrap .nav-tab')[0])">Buat permohonan baru</button>
        <button class="btn-secondary" onclick="keRiwayatP()">Kembali</button>
      </div>`;
  }
  showPP("detail");
}

/* ══ PETUGAS ══ */
const akunPetugas = {
  "ahmad.fauzi": { pass: "ptsp1234", nama: "Ahmad Fauzi, S.Ag" },
};
function doLoginPetugas() {
  const user = document.getElementById("pt-input-user").value.trim();
  const pass = document.getElementById("pt-input-pass").value;
  const err = document.getElementById("pt-login-err");
  const btn = event.target; // Ambil tombol yang diklik

  btn.innerText = "Mengecek...";
  btn.disabled = true;

  setTimeout(() => {
    if (akunPetugas[user] && akunPetugas[user].pass === pass) {
      err.classList.remove("show");
      document.getElementById("pt-nav-nama").textContent =
        akunPetugas[user].nama;
      document.getElementById("pt-login-page").style.display = "none";
      document.getElementById("pt-dashboard-page").style.display = "block";
    } else {
      err.classList.add("show");
      btn.innerText = "Login sebagai Petugas";
      btn.disabled = false;
    }
  }, 1000); // Delay 1 detik biar keren
}

async function doRegister() {
  // Ambil semua elemen input di dalam modal register
  const inputs = document.querySelectorAll("#pp-register input");

  const nama = inputs[0].value; // Input Nama
  const nik = inputs[1].value; // Input NIK
  const email = inputs[2].value; // Input Email
  const password = inputs[3].value; // Input Password
  const confirm = inputs[4].value; // Input Konfirmasi

  // Validasi sederhana
  if (!nama || !email || !password) {
    alert("Nama, Email, dan Password wajib diisi ya min!");
    return;
  }

  if (password !== confirm) {
    alert("Password dan Konfirmasi Password nggak sama nih!");
    return;
  }

  // Eksekusi ke Supabase
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: nama,
        nik: nik,
      },
    },
  });

  if (error) {
    alert("Gagal daftar: " + error.message);
  } else {
    alert("Alhamdulillah, Berhasil Daftar! Silakan masuk.");
    showPP("login");
  }
}

function doLogoutPetugas() {
  document.getElementById("pt-input-user").value = "";
  document.getElementById("pt-input-pass").value = "";
  document.getElementById("pt-dashboard-page").style.display = "none";
  document.getElementById("pt-login-page").style.display = "block";
  kembaliPT();
  // Kembali ke landing pemohon
  document.getElementById("petugas-wrap").style.display = "none";
  document.getElementById("pemohon-wrap").style.display = "block";
  showPP("landing");
}
function filterTable(status, btn) {
  document
    .querySelectorAll(".filter button")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll("#pt-tabel-body tr").forEach((tr) => {
    tr.style.display =
      status === "semua" || tr.dataset.status === status ? "" : "none";
  });
}
function bukaDetailPT(nama, jenis, status, isRevisi) {
  document.getElementById("pt-table-card").style.display = "none";
  const d = document.getElementById("pt-detail-card");
  d.classList.add("show");
  document.getElementById("pt-detail-nama").textContent =
    nama + (isRevisi ? " — Revisi" : "");
  document.getElementById("pt-detail-jenis").textContent = jenis;
  const badge = document.getElementById("pt-detail-badge");
  const map = {
    menunggu: ["menunggu", "Menunggu verifikasi"],
    diproses: ["diproses", "Sedang diproses"],
    selesai: ["selesai", "Selesai"],
    ditolak: ["ditolak", "Ditolak"],
  };
  badge.className = "badge " + map[status][0];
  badge.textContent = map[status][1];
  document.getElementById("pt-action-area").style.display =
    status === "menunggu" || status === "diproses" ? "block" : "none";
  const rb = document.getElementById("pt-riwayat-box");
  if (isRevisi) {
    rb.style.display = "block";
    document.getElementById("pt-riwayat-isi").innerHTML =
      "<b>Tanggal penolakan:</b> 30 Apr 2026<br><b>Dokumen bermasalah:</b> KTP pemohon.pdf<br><b>Alasan:</b> KTP yang diupload tidak jelas/buram, mohon upload ulang.";
  } else {
    rb.style.display = "none";
  }
  document.getElementById("pt-acc-form").classList.remove("show");
  resetTolakForm();
}
function kembaliPT() {
  document.getElementById("pt-table-card").style.display = "block";
  document.getElementById("pt-detail-card").classList.remove("show");
}
function toggleAcc() {
  document.getElementById("pt-acc-form").classList.toggle("show");
  document.getElementById("pt-tolak-form").classList.remove("show");
  resetTolakForm();
}
function toggleTolak() {
  document.getElementById("pt-tolak-form").classList.toggle("show");
  document.getElementById("pt-acc-form").classList.remove("show");
}
function resetTolakForm() {
  document.getElementById("pt-tolak-form").classList.remove("show");
  document.getElementById("pt-type-dokumen").classList.remove("active");
  document.getElementById("pt-type-nondokumen").classList.remove("active");
  document.getElementById("pt-panel-dokumen").classList.remove("show");
  document.getElementById("pt-panel-nondokumen").classList.remove("show");
  document
    .querySelectorAll("#pt-cek-list input[type=checkbox]")
    .forEach((cb) => (cb.checked = false));
  document.getElementById("pt-alasan-dok").value = "";
  document.getElementById("pt-kategori-nondok").value = "";
  document.getElementById("pt-alasan-nondok").value = "";
  document.getElementById("pt-hint-dok-cek").classList.remove("show");
  document.getElementById("pt-hint-dok-alasan").classList.remove("show");
  document.getElementById("pt-hint-nondok").classList.remove("show");
  document.getElementById("pt-btn-kirim-dok").disabled = true;
  document.getElementById("pt-btn-kirim-nondok").disabled = true;
}
function pilihTolakType(type) {
  document
    .getElementById("pt-type-dokumen")
    .classList.toggle("active", type === "dokumen");
  document
    .getElementById("pt-type-nondokumen")
    .classList.toggle("active", type === "nondokumen");
  document
    .getElementById("pt-panel-dokumen")
    .classList.toggle("show", type === "dokumen");
  document
    .getElementById("pt-panel-nondokumen")
    .classList.toggle("show", type === "nondokumen");
}
function cekValidasiDok() {
  const adaCek = [
    ...document.querySelectorAll("#pt-cek-list input[type=checkbox]"),
  ].some((cb) => cb.checked);
  const adaAlasan =
    document.getElementById("pt-alasan-dok").value.trim().length > 0;
  document.getElementById("pt-hint-dok-cek").classList.toggle("show", !adaCek);
  document
    .getElementById("pt-hint-dok-alasan")
    .classList.toggle("show", adaCek && !adaAlasan);
  document.getElementById("pt-btn-kirim-dok").disabled = !(adaCek && adaAlasan);
}
function cekValidasiNonDok() {
  const kat = document.getElementById("pt-kategori-nondok").value.trim();
  const val = document.getElementById("pt-alasan-nondok").value.trim();
  const ok = kat.length > 0 && val.length > 0;
  document.getElementById("pt-btn-kirim-nondok").disabled = !ok;
  document.getElementById("pt-hint-nondok").classList.toggle("show", !ok);
}
function kirimTolak(type) {
  alert(
    "Penolakan berhasil dikirim (" +
      (type === "dokumen" ? "dokumen bermasalah" : "non-dokumen") +
      ").",
  );
  kembaliPT();
}

// Tutup modal klik luar
document.getElementById("modal-peran").addEventListener("click", function (e) {
  if (e.target === this) tutupModal();
});
