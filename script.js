// ─── SUPABASE ───────────────────────────────────────────
var SURL = "https://sjykqwkdsubugqxyavyr.supabase.co";
var SKEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqeWtxd2tkc3VidWdxeHlhdnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTMzNDYsImV4cCI6MjA5NDE2OTM0Nn0.NEH3Xq8V_UsnnzFB2zzuLEBkDcV9UrMI6lLQeBoFaJE";
var _db = null;
function db() {
  if (!_db) _db = supabase.createClient(SURL, SKEY);
  return _db;
}

// ─── MODAL PERAN ─────────────────────────────────────────
function bukaModal() {
  document.getElementById("modal-peran").style.display = "flex";
}
function tutupModal() {
  document.getElementById("modal-peran").style.display = "none";
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
document.getElementById("modal-peran").addEventListener("click", function (e) {
  if (e.target === this) tutupModal();
});

// ─── NAVIGASI PEMOHON ────────────────────────────────────
function showPP(nama) {
  document.querySelectorAll("#pemohon-wrap .page").forEach(function (el) {
    el.style.display = "none";
  });
  var t = document.getElementById("pp-" + nama);
  if (t) t.style.display = "block";
}

// ─── TAB ─────────────────────────────────────────────────
function switchTabP(tab, elTab) {
  document.querySelectorAll("#pemohon-wrap .nav-tab").forEach(function (t) {
    t.classList.remove("active");
  });
  elTab.classList.add("active");
  document.getElementById("ptab-buat").style.display =
    tab === "buat" ? "block" : "none";
  document.getElementById("ptab-riwayat").style.display =
    tab === "riwayat" ? "block" : "none";
  if (tab === "riwayat") loadRiwayat();
}

// ─── LOGIN PEMOHON ───────────────────────────────────────
async function doLoginPemohon() {
  var email = document.getElementById("login-email").value.trim();
  var pass = document.getElementById("login-pass").value;
  if (!email || !pass) {
    alert("Email dan password harus diisi!");
    return;
  }
  var btn = document.querySelector("#pp-login .btn-primary");
  btn.disabled = true;
  btn.innerText = "Memverifikasi...";
  var r = await db().auth.signInWithPassword({ email: email, password: pass });
  btn.disabled = false;
  btn.innerText = "Masuk";
  if (r.error) {
    alert("Login gagal: " + r.error.message);
    return;
  }
  var nama = r.data.user.user_metadata.full_name || "Pemohon";
  var nu = document.getElementById("nav-user-p");
  nu.textContent = nama;
  nu.style.display = "inline";
  var nb = document.getElementById("nav-action-p");
  nb.textContent = "Logout";
  nb.onclick = async function () {
    await db().auth.signOut();
    nu.style.display = "none";
    nb.textContent = "Login";
    nb.onclick = bukaModal;
    showPP("landing");
  };
  showPP("dashboard");
  switchTabP("buat", document.getElementById("tab-buat"));
}

// ─── REGISTER ────────────────────────────────────────────
async function doRegister() {
  var nama = document.getElementById("reg-nama").value.trim();
  var nik = document.getElementById("reg-nik").value.trim();
  var email = document.getElementById("reg-email").value.trim();
  var pass = document.getElementById("reg-pass").value;
  var confirm = document.getElementById("reg-confirm").value;
  if (!nama || !email || !pass) {
    alert("Nama, Email, dan Password wajib diisi!");
    return;
  }
  if (pass !== confirm) {
    alert("Password tidak sama!");
    return;
  }
  var btn = document.querySelector("#pp-register .btn-primary");
  btn.disabled = true;
  btn.innerText = "Mendaftarkan...";
  var r = await db().auth.signUp({
    email: email,
    password: pass,
    options: { data: { full_name: nama, nik: nik } },
  });
  btn.disabled = false;
  btn.innerText = "Daftar sekarang";
  if (r.error) {
    alert("Gagal daftar: " + r.error.message);
    return;
  }
  alert("Berhasil daftar! Silakan masuk.");
  showPP("login");
}

// ─── FORM PERMOHONAN ─────────────────────────────────────
var dokumen = {
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
function pilihJenis(val) {
  var wrap = document.getElementById("syarat-wrap");
  var list = document.getElementById("dok-list");
  if (!val) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "block";
  list.innerHTML = (dokumen[val] || [])
    .map(function (d) {
      return (
        '<div class="dok-item-form"><span>' +
        d +
        "</span><small>Pilih file</small></div>"
      );
    })
    .join("");
}

async function kirimPermohonan() {
  var cek = document.getElementById("captcha");
  var sel = document.getElementById("pilih-layanan");
  if (!cek || !cek.checked) {
    alert("Silakan centang 'Saya bukan robot' terlebih dahulu!");
    return;
  }
  var jenis = sel ? sel.value : "";
  if (!jenis) {
    alert("Harap pilih jenis layanan terlebih dahulu!");
    return;
  }
  var btn = document.getElementById("btn-kirim-permohonan");
  btn.disabled = true;
  btn.innerText = "Sedang Mengirim...";
  try {
    var ur = await db().auth.getUser();
    var user = ur.data.user;
    if (!user) {
      alert("Sesi berakhir, silakan login kembali.");
      showPP("login");
      return;
    }
    var ins = await db()
      .from("permohonan")
      .insert([
        {
          user_id: user.id,
          nama_pemohon: user.user_metadata.full_name,
          nik: user.user_metadata.nik,
          email: user.email,
          jenis_layanan: jenis,
          alasan: "-",
          status: "Pending",
        },
      ]);
    if (ins.error) {
      alert("Gagal mengirim: " + ins.error.message);
      return;
    }
    cek.checked = false;
    sel.value = "";
    document.getElementById("syarat-wrap").style.display = "none";
    document.getElementById("dok-list").innerHTML = "";
    showPP("sukses");
  } catch (e) {
    alert("Kesalahan: " + e.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Kirim permohonan";
  }
}

// ─── RIWAYAT PEMOHON ─────────────────────────────────────
async function loadRiwayat() {
  var c = document.getElementById("list-riwayat-supabase");
  c.innerHTML =
    '<p style="text-align:center;padding:20px;color:#888">Memuat data...</p>';
  try {
    var ur = await db().auth.getUser();
    var user = ur.data.user;
    if (!user) return;
    var r = await db()
      .from("permohonan")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (r.error) throw r.error;
    var data = r.data;
    if (!data || data.length === 0) {
      c.innerHTML =
        '<p style="text-align:center;padding:20px;color:#888">Belum ada permohonan.</p>';
      return;
    }
    c.innerHTML = data
      .map(function (row) {
        var sc = "menunggu",
          sl = "Menunggu verifikasi";
        var s = (row.status || "").toLowerCase();
        if (s === "pending") {
          sc = "menunggu";
          sl = "Menunggu verifikasi";
        }
        if (s === "diproses") {
          sc = "diproses";
          sl = "Sedang diproses";
        }
        if (s === "selesai") {
          sc = "selesai";
          sl = "Selesai";
        }
        if (s === "ditolak") {
          sc = "ditolak";
          sl = "Ditolak";
        }
        var tgl = new Date(row.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        var judul = (row.jenis_layanan || "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, function (x) {
            return x.toUpperCase();
          });
        return (
          '<div class="riwayat-item" onclick="bukaDetailP(\'' +
          sc +
          "','" +
          row.id +
          "')\">" +
          '<div class="riwayat-head"><span class="riwayat-title">' +
          judul +
          "</span>" +
          '<span class="badge ' +
          sc +
          '">' +
          sl +
          "</span></div>" +
          '<div class="riwayat-date">Diajukan: ' +
          tgl +
          " &nbsp;|&nbsp; No: PTSP/2026/" +
          String(row.id).padStart(3, "0") +
          "</div></div>"
        );
      })
      .join("");
  } catch (e) {
    c.innerHTML =
      '<p style="text-align:center;padding:20px;color:#c0392b">Gagal memuat data.</p>';
  }
}

// ─── DETAIL PEMOHON ──────────────────────────────────────
async function bukaDetailP(status, rowId) {
  showPP("detail");
  var el = document.getElementById("detail-card-p");
  el.innerHTML =
    '<p style="text-align:center;padding:20px;color:#888">Memuat...</p>';
  var row = null;
  if (rowId) {
    var r = await db().from("permohonan").select("*").eq("id", rowId).single();
    if (!r.error) row = r.data;
  }
  var judul = row
    ? (row.jenis_layanan || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, function (x) {
          return x.toUpperCase();
        })
    : "Permohonan";
  var no = row ? "PTSP/2026/" + String(row.id).padStart(3, "0") : "—";
  var tgl = row
    ? new Date(row.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";
  var head =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:0.5px solid var(--border)"><div><div style="font-size:15px;font-weight:500">' +
    judul +
    '</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">No: ' +
    no +
    " | " +
    tgl +
    "</div></div>";

  if (status === "selesai") {
    el.innerHTML =
      head +
      '<span class="badge selesai">Selesai</span></div><div style="font-size:12px;color:var(--text-2);font-weight:500;margin-bottom:8px">Dokumen hasil</div><div class="dok-unduh"><span>Surat hasil.pdf</span><button class="btn-unduh">Unduh</button></div>';
  } else if (status === "menunggu" || status === "diproses") {
    el.innerHTML =
      head +
      '<span class="badge ' +
      status +
      '">' +
      (status === "menunggu" ? "Menunggu verifikasi" : "Sedang diproses") +
      '</span></div><div style="font-size:13px;color:var(--text-2);text-align:center;padding:10px 0">Dokumen hasil akan tersedia setelah disetujui.</div>';
  } else if (status === "ditolak") {
    var ket = "Silakan hubungi petugas.";
    if (row && (row.alasan_tolak || row.kategori_tolak)) {
      var bagian = [];
      if (row.kategori_tolak)
        bagian.push("<b>Kategori:</b> " + row.kategori_tolak);
      if (row.dokumen_tolak)
        bagian.push("<b>Dokumen bermasalah:</b> " + row.dokumen_tolak);
      if (row.alasan_tolak) bagian.push("<b>Alasan:</b> " + row.alasan_tolak);
      ket = bagian.join("<br>");
    }
    var isDocError =
      row &&
      row.kategori_tolak &&
      row.kategori_tolak.toLowerCase().indexOf("dokumen") !== -1;
    var btnAksi = isDocError
      ? '<button class="btn-ulang" onclick="showPP(\'ulang\')" >Ajukan Ulang</button>'
      : '<button class="btn-ulang" onclick="buatPermohonanBaru()">Buat permohonan baru</button>';
    el.innerHTML =
      head +
      '<span class="badge ditolak">Ditolak</span></div><div class="tolak-notif"><p>Alasan penolakan:</p><small>' +
      ket +
      '</small></div><div class="btn-row">' +
      btnAksi +
      '<button class="btn-secondary" onclick="keRiwayatP()">Kembali</button></div>';
  }
}

function keRiwayatP() {
  showPP("dashboard");
  switchTabP("riwayat", document.getElementById("tab-riwayat"));
}

// ─── LOGIN PETUGAS ───────────────────────────────────────
var akunPetugas = {
  "ahmad.fauzi": { pass: "ptsp1234", nama: "Ahmad Fauzi, S.Ag" },
};
var ptCurrentId = null;

function doLoginPetugas() {
  var user = document.getElementById("pt-input-user").value.trim();
  var pass = document.getElementById("pt-input-pass").value;
  var err = document.getElementById("pt-login-err");
  var btn = document.getElementById("btn-login-petugas");
  btn.disabled = true;
  btn.innerText = "Mengecek...";
  setTimeout(function () {
    if (akunPetugas[user] && akunPetugas[user].pass === pass) {
      err.classList.remove("show");
      document.getElementById("pt-nav-nama").textContent =
        akunPetugas[user].nama;
      document.getElementById("pt-login-page").style.display = "none";
      document.getElementById("pt-dashboard-page").style.display = "block";
      loadTabelPetugas();
    } else {
      err.classList.add("show");
      btn.disabled = false;
      btn.innerText = "Masuk";
    }
  }, 600);
}

function doLogoutPetugas() {
  document.getElementById("pt-input-user").value = "";
  document.getElementById("pt-input-pass").value = "";
  document.getElementById("pt-dashboard-page").style.display = "none";
  document.getElementById("pt-login-page").style.display = "block";
  kembaliPT();
  document.getElementById("petugas-wrap").style.display = "none";
  document.getElementById("pemohon-wrap").style.display = "block";
  showPP("landing");
}

// ─── TABEL PETUGAS DARI SUPABASE ─────────────────────────
async function loadTabelPetugas() {
  var tbody = document.getElementById("pt-tabel-body");
  tbody.innerHTML =
    '<tr><td colspan="6" style="text-align:center;padding:20px;color:#888">Memuat data...</td></tr>';
  try {
    var r = await db()
      .from("permohonan")
      .select("*")
      .order("created_at", { ascending: false });
    if (r.error) throw r.error;
    var data = r.data || [];
    var sm = {
      pending: "menunggu",
      menunggu: "menunggu",
      diproses: "diproses",
      selesai: "selesai",
      ditolak: "ditolak",
    };
    var sl = {
      menunggu: "Menunggu verifikasi",
      diproses: "Sedang diproses",
      selesai: "Selesai",
      ditolak: "Ditolak",
    };
    document.getElementById("stat-total").textContent = data.length;
    document.getElementById("stat-menunggu").textContent = data.filter(
      function (x) {
        return sm[(x.status || "").toLowerCase()] === "menunggu";
      },
    ).length;
    document.getElementById("stat-selesai").textContent = data.filter(
      function (x) {
        return (x.status || "").toLowerCase() === "selesai";
      },
    ).length;
    document.getElementById("stat-ditolak").textContent = data.filter(
      function (x) {
        return (x.status || "").toLowerCase() === "ditolak";
      },
    ).length;
    if (!data.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;padding:20px;color:#888">Belum ada permohonan.</td></tr>';
      return;
    }
    tbody.innerHTML = data
      .map(function (row, i) {
        var s = sm[(row.status || "pending").toLowerCase()] || "menunggu";
        var tgl = new Date(row.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        var judul = (row.jenis_layanan || "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, function (x) {
            return x.toUpperCase();
          });
        return (
          '<tr data-status="' +
          s +
          '"><td>' +
          String(i + 1).padStart(3, "0") +
          "</td><td>" +
          (row.nama_pemohon || "—") +
          "</td><td>" +
          judul +
          "</td><td>" +
          tgl +
          '</td><td><span class="badge ' +
          s +
          '">' +
          sl[s] +
          '</span></td><td><button class="btn-buka" onclick="bukaDetailPTById(' +
          row.id +
          ')">Buka</button></td></tr>'
        );
      })
      .join("");
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:20px;color:#c0392b">Gagal memuat: ' +
      e.message +
      "</td></tr>";
  }
}

function filterTable(status, btn) {
  document.querySelectorAll(".filter button").forEach(function (b) {
    b.classList.remove("active");
  });
  btn.classList.add("active");
  document.querySelectorAll("#pt-tabel-body tr").forEach(function (tr) {
    tr.style.display =
      status === "semua" || tr.dataset.status === status ? "" : "none";
  });
}

// ─── DETAIL PETUGAS DARI SUPABASE ────────────────────────
async function bukaDetailPTById(id) {
  ptCurrentId = id;
  document.getElementById("pt-table-card").style.display = "none";
  document.getElementById("pt-detail-card").classList.add("show");
  document.getElementById("pt-detail-nama").textContent = "Memuat...";
  document.getElementById("pt-detail-jenis").textContent = "";
  document.getElementById("pt-action-area").style.display = "none";
  document.getElementById("pt-riwayat-box").style.display = "none";
  document.getElementById("pt-acc-form").classList.remove("show");
  resetTolakForm();
  try {
    var r = await db().from("permohonan").select("*").eq("id", id).single();
    if (r.error) throw r.error;
    var row = r.data;
    var s = (row.status || "pending").toLowerCase();
    var sm = {
      pending: "menunggu",
      menunggu: "menunggu",
      diproses: "diproses",
      selesai: "selesai",
      ditolak: "ditolak",
    };
    var sl = {
      menunggu: "Menunggu verifikasi",
      diproses: "Sedang diproses",
      selesai: "Selesai",
      ditolak: "Ditolak",
    };
    var sc = sm[s] || "menunggu";
    var judul = (row.jenis_layanan || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (x) {
        return x.toUpperCase();
      });
    var tgl = new Date(row.created_at).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    document.getElementById("pt-detail-nama").textContent =
      row.nama_pemohon || "—";
    document.getElementById("pt-detail-jenis").textContent = judul;
    var badge = document.getElementById("pt-detail-badge");
    badge.className = "badge " + sc;
    badge.textContent = sl[sc];
    document.getElementById("pt-info-nik").textContent = row.nik || "—";
    document.getElementById("pt-info-email").textContent = row.email || "—";
    document.getElementById("pt-info-tgl").textContent = tgl;
    document.getElementById("pt-info-no").textContent =
      "PTSP/2026/" + String(row.id).padStart(3, "0");
    document.getElementById("pt-action-area").style.display =
      sc === "menunggu" || sc === "diproses" ? "block" : "none";
    if (sc === "ditolak" && (row.alasan_tolak || row.kategori_tolak)) {
      var rb = document.getElementById("pt-riwayat-box");
      rb.style.display = "block";
      var isi = [];
      if (row.kategori_tolak)
        isi.push("<b>Kategori:</b> " + row.kategori_tolak);
      if (row.dokumen_tolak) isi.push("<b>Dokumen:</b> " + row.dokumen_tolak);
      if (row.alasan_tolak) isi.push("<b>Alasan:</b> " + row.alasan_tolak);
      document.getElementById("pt-riwayat-isi").innerHTML = isi.join("<br>");
    }
  } catch (e) {
    document.getElementById("pt-detail-nama").textContent =
      "Gagal: " + e.message;
  }
}

// Fallback fungsi lama (tidak dipakai, jaga kompatibilitas)
function bukaDetailPT() {}

function kembaliPT() {
  document.getElementById("pt-table-card").style.display = "block";
  document.getElementById("pt-detail-card").classList.remove("show");
  ptCurrentId = null;
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
  ["pt-type-dokumen", "pt-type-nondokumen"].forEach(function (id) {
    document.getElementById(id).classList.remove("active");
  });
  ["pt-panel-dokumen", "pt-panel-nondokumen"].forEach(function (id) {
    document.getElementById(id).classList.remove("show");
  });
  document
    .querySelectorAll("#pt-cek-list input[type=checkbox]")
    .forEach(function (cb) {
      cb.checked = false;
    });
  document.getElementById("pt-alasan-dok").value = "";
  document.getElementById("pt-kategori-nondok").value = "";
  document.getElementById("pt-alasan-nondok").value = "";
  ["pt-hint-dok-cek", "pt-hint-dok-alasan", "pt-hint-nondok"].forEach(
    function (id) {
      document.getElementById(id).classList.remove("show");
    },
  );
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
  var adaCek = Array.from(
    document.querySelectorAll("#pt-cek-list input[type=checkbox]"),
  ).some(function (cb) {
    return cb.checked;
  });
  var adaAlasan =
    document.getElementById("pt-alasan-dok").value.trim().length > 0;
  document.getElementById("pt-hint-dok-cek").classList.toggle("show", !adaCek);
  document
    .getElementById("pt-hint-dok-alasan")
    .classList.toggle("show", adaCek && !adaAlasan);
  document.getElementById("pt-btn-kirim-dok").disabled = !(adaCek && adaAlasan);
}
function cekValidasiNonDok() {
  var kat = document.getElementById("pt-kategori-nondok").value.trim();
  var val = document.getElementById("pt-alasan-nondok").value.trim();
  var ok = kat.length > 0 && val.length > 0;
  document.getElementById("pt-btn-kirim-nondok").disabled = !ok;
  document.getElementById("pt-hint-nondok").classList.toggle("show", !ok);
}

// ─── SETUJUI ─────────────────────────────────────────────
async function kirimSetujui() {
  if (!ptCurrentId) return;
  var btn = document.querySelector(".btn-kirim-acc");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";
  try {
    var r = await db()
      .from("permohonan")
      .update({ status: "selesai" })
      .eq("id", ptCurrentId);
    if (r.error) throw r.error;
    alert("Permohonan berhasil disetujui.");
    kembaliPT();
    loadTabelPetugas();
  } catch (e) {
    alert("Gagal: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Kirim persetujuan";
  }
}

// ─── TOLAK ───────────────────────────────────────────────
async function kirimTolak(type) {
  if (!ptCurrentId) return;
  var alasan = "",
    dokumen = "",
    kategori = "";
  if (type === "dokumen") {
    dokumen = Array.from(
      document.querySelectorAll("#pt-cek-list input[type=checkbox]"),
    )
      .filter(function (cb) {
        return cb.checked;
      })
      .map(function (cb) {
        return cb.parentElement.textContent.trim();
      })
      .join(", ");
    alasan = document.getElementById("pt-alasan-dok").value.trim();
    kategori = "Dokumen bermasalah";
  } else {
    kategori = document.getElementById("pt-kategori-nondok").value.trim();
    alasan = document.getElementById("pt-alasan-nondok").value.trim();
  }
  var btn =
    type === "dokumen"
      ? document.getElementById("pt-btn-kirim-dok")
      : document.getElementById("pt-btn-kirim-nondok");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";
  try {
    var r = await db()
      .from("permohonan")
      .update({
        status: "ditolak",
        alasan_tolak: alasan,
        dokumen_tolak: dokumen || null,
        kategori_tolak: kategori,
      })
      .eq("id", ptCurrentId);
    if (r.error) throw r.error;
    alert("Permohonan ditolak dan alasan tersimpan.");
    kembaliPT();
    loadTabelPetugas();
  } catch (e) {
    alert("Gagal: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Kirim penolakan";
  }
}

// ─── BUAT PERMOHONAN BARU (dari halaman ditolak non-dokumen) ────
function buatPermohonanBaru() {
  showPP("dashboard");
  switchTabP("buat", document.getElementById("tab-buat"));
}

// ─── KIRIM ULANG (halaman ajukan ulang, pakai captcha2) ──────────
async function kirimUlang() {
  var cek = document.getElementById("captcha2");
  var sel = document.getElementById("pilih-layanan");
  if (!cek || !cek.checked) {
    alert("Silakan centang 'Saya bukan robot' terlebih dahulu!");
    return;
  }
  var btn = document.getElementById("btn-kirim-ulang");
  btn.disabled = true;
  btn.innerText = "Sedang Mengirim...";
  try {
    var ur = await db().auth.getUser();
    var user = ur.data.user;
    if (!user) {
      alert("Sesi berakhir, silakan login kembali.");
      showPP("login");
      return;
    }
    var jenis = sel ? sel.value : "";
    var ins = await db()
      .from("permohonan")
      .insert([
        {
          user_id: user.id,
          nama_pemohon: user.user_metadata.full_name,
          nik: user.user_metadata.nik,
          email: user.email,
          jenis_layanan: jenis || "upload_ulang",
          alasan: "-",
          status: "Pending",
        },
      ]);
    if (ins.error) {
      alert("Gagal mengirim: " + ins.error.message);
      return;
    }
    cek.checked = false;
    showPP("sukses");
  } catch (e) {
    alert("Kesalahan: " + e.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Kirim ulang permohonan";
  }
}
