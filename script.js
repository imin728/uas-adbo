// ─── TOAST & NOTIFIKASI ───────────────────────────────────
function toast(pesan, tipe) {
  var wrap = document.getElementById("toast-wrap");
  var icon = tipe === "sukses" ? "✓" : tipe === "gagal" ? "✕" : "ℹ";
  var el = document.createElement("div");
  el.className = "toast " + (tipe || "info");
  el.innerHTML =
    '<span class="toast-icon">' +
    icon +
    '</span><span class="toast-msg">' +
    pesan +
    "</span>";
  el.onclick = function () {
    hapusToast(el);
  };
  wrap.appendChild(el);
  setTimeout(function () {
    hapusToast(el);
  }, 3000);
}
function hapusToast(el) {
  el.style.animation = "fadeOut 0.25s ease forwards";
  setTimeout(function () {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 250);
}

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
  document.getElementById("modal-peran").style.display = "none";
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
    toast("Email dan password harus diisi!", "gagal");
    return;
  }
  var btn = document.querySelector("#pp-login .btn-primary");
  btn.disabled = true;
  btn.innerText = "Memverifikasi...";
  var r = await db().auth.signInWithPassword({ email: email, password: pass });
  btn.disabled = false;
  btn.innerText = "Masuk";
  if (r.error) {
    toast("Login gagal, periksa email dan password!", "gagal");
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
    toast("nama, Email dan password harus diisi!", "gagal");
    return;
  }
  if (pass !== confirm) {
    toast("Password tidak sama!");
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
    toast("Gagal mendaftar: " + r.error.message, "gagal");
    return;
  }
  toast("Berhasil daftar! Silakan masuk.", "sukses");
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
        '</span><input type="file" accept=".pdf" data-label="' +
        d +
        '" style="font-size:11px;color:var(--blue);cursor:pointer;border:none;background:none"/></div>'
      );
    })
    .join("");
}

async function kirimPermohonan() {
  var cek = document.getElementById("captcha");
  var sel = document.getElementById("pilih-layanan");
  if (!cek || !cek.checked) {
    toast("Silakan centang 'Saya bukan robot' terlebih dahulu!", "info");
    return;
  }
  var jenis = sel ? sel.value : "";
  if (!jenis) {
    toast("Harap pilih jenis layanan terlebih dahulu!", "info");
    return;
  }
  var btn = document.getElementById("btn-kirim-permohonan");
  btn.disabled = true;
  btn.innerText = "Sedang Mengirim...";
  try {
    var ur = await db().auth.getUser();
    var user = ur.data.user;
    if (!user) {
      toast("Sesi berakhir, silakan login kembali.", "gagal");
      showPP("login");
      return;
    }
    var fileInputs = document.querySelectorAll("#dok-list input[type=file]");
    var urlDokumen = [];
    var uploadTasks = [];
    for (var i = 0; i < fileInputs.length; i++) {
      if (fileInputs[i].files[0]) {
        uploadTasks.push({
          file: fileInputs[i].files[0],
          label:
            fileInputs[i].getAttribute("data-label") ||
            fileInputs[i].files[0].name,
          index: i,
        });
      }
    }
    if (uploadTasks.length === 0) {
      toast("Harap upload semua dokumen yang diperlukan!", "gagal");
      return;
    }
    try {
      urlDokumen = await Promise.all(
        uploadTasks.map(async function (task) {
          var path =
            "pemohon/" +
            user.id +
            "/" +
            Date.now() +
            "_" +
            task.index +
            "_" +
            task.file.name;
          var up = await db()
            .storage.from("dokumen-ptsp")
            .upload(path, task.file);
          if (up.error) throw new Error("Gagal upload: " + task.label);
          var url = db().storage.from("dokumen-ptsp").getPublicUrl(path)
            .data.publicUrl;
          return { nama: task.label, url: url };
        }),
      );
    } catch (eUp) {
      toast(eUp.message, "gagal");
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
          dokumen_upload: JSON.stringify(urlDokumen),
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
        var tagRevisi = row.is_revisi
          ? '<span class="tag-revisi">Revisi</span>'
          : "";
        return (
          '<div class="riwayat-item" onclick="bukaDetailP(\'' +
          sc +
          "','" +
          row.id +
          "')\">" +
          '<div class="riwayat-head"><span class="riwayat-title">' +
          judul +
          (row.is_revisi ? '<span class="tag-revisi">Revisi</span>' : "") +
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
    var urlHasil = row && row.url_hasil ? row.url_hasil : null;
    var tombolUnduh = urlHasil
      ? '<div class="dok-unduh"><span>Dokumen hasil.pdf</span><button class="btn-unduh" onclick="window.open(\'' +
        urlHasil +
        "','_blank')\">Unduh</button></div>"
      : '<div style="font-size:13px;color:var(--text-2);padding:10px 0">Dokumen hasil belum tersedia.</div>';
    el.innerHTML =
      head +
      '<span class="badge selesai">Selesai</span></div><div style="font-size:12px;color:var(--text-2);font-weight:500;margin-bottom:8px">Dokumen hasil</div>' +
      tombolUnduh;
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
      ? '<button class="btn-ulang" onclick="bukaHalamanUlang(\'' +
        rowId +
        "')\">Ajukan Ulang</button>"
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

async function bukaHalamanUlang(id) {
  idPermohonanDitolak = id;
  showPP("ulang");

  document.getElementById("ulang-dok-list").innerHTML = "";
  document.getElementById("ulang-notif-tolak").innerHTML = "";
  document.getElementById("captcha2").checked = false;

  var r = await db().from("permohonan").select("*").eq("id", id).single();
  if (r.error || !r.data) return;
  var row = r.data;

  // Tampilkan catatan penolakan
  if (row.alasan_tolak || row.dokumen_tolak) {
    var notif = [];
    if (row.dokumen_tolak)
      notif.push("<b>Dokumen bermasalah:</b> " + row.dokumen_tolak);
    if (row.alasan_tolak) notif.push("<b>Alasan:</b> " + row.alasan_tolak);
    document.getElementById("ulang-notif-tolak").innerHTML =
      '<div class="tolak-notif"><p>Catatan penolakan:</p><small>' +
      notif.join("<br>") +
      "</small></div>";
  }

  // Ambil daftar dokumen bermasalah (nama file asli)
  var dokBermasalah = row.dokumen_tolak
    ? row.dokumen_tolak.split(",").map(function (x) {
        return x.trim();
      })
    : [];

  // Ambil semua dokumen yang pernah diupload pemohon
  var semuaDok = [];
  if (row.dokumen_upload) {
    try {
      semuaDok = JSON.parse(row.dokumen_upload);
    } catch (e) {}
  }

  var html = "";

  // Dokumen bermasalah → input upload
  if (dokBermasalah.length > 0) {
    dokBermasalah.forEach(function (nama) {
      html +=
        '<div class="dok-item-err" style="flex-direction:column;align-items:flex-start;gap:6px">' +
        "<span>📄 " +
        nama +
        " — perlu diperbaiki</span>" +
        '<input type="file" accept=".pdf" data-nama="' +
        nama +
        '" style="font-size:11px;width:100%"/>' +
        "</div>";
    });
  }

  // Dokumen tidak bermasalah → centang hijau
  semuaDok.forEach(function (d) {
    var isBermasalah = dokBermasalah.some(function (nama) {
      return nama.toLowerCase() === d.nama.toLowerCase();
    });
    if (!isBermasalah) {
      html +=
        '<div class="dok-item-ok"><span>' +
        d.nama +
        '</span><span class="ok-badge">✓ Sudah diterima</span></div>';
    }
  });

  // Kalau tidak ada data sama sekali
  if (html === "") {
    html =
      '<div style="font-size:13px;color:var(--text-2);padding:8px 0">Upload dokumen ulang sesuai catatan penolakan.</div>' +
      '<input type="file" accept=".pdf" style="font-size:11px;width:100%;margin-top:8px"/>';
  }

  document.getElementById("ulang-dok-list").innerHTML = html;
}

// ─── LOGIN PETUGAS ───────────────────────────────────────
var akunPetugas = {
  "ahmad.fauzi": { pass: "ptsp1234", nama: "Ahmad Fauzi, S.Ag" },
};
var ptCurrentId = null;
var idPermohonanDitolak = null;

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
        var tagRevisi = row.is_revisi
          ? '<span class="tag-revisi">Revisi</span>'
          : "";
        return (
          '<tr data-status="' +
          s +
          '"><td>' +
          String(i + 1).padStart(3, "0") +
          "</td><td>" +
          (row.nama_pemohon || "—") +
          "</td><td>" +
          judul +
          tagRevisi +
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
    var dokEl = document.getElementById("pt-dok-list-isi");
    if (row.dokumen_upload) {
      try {
        var dokArr = JSON.parse(row.dokumen_upload);
        if (dokArr.length > 0) {
          dokEl.innerHTML = dokArr
            .map(function (d) {
              return (
                '<div class="dok-item"><span class="dok-name">' +
                d.nama +
                '</span><span class="dok-link" onclick="window.open(\'' +
                d.url +
                "','_blank')\">Lihat dokumen</span></div>"
              );
            })
            .join("");
        } else {
          dokEl.innerHTML =
            '<div style="font-size:13px;color:var(--text-2);padding:8px 0">Tidak ada dokumen diupload.</div>';
        }
      } catch (e) {
        dokEl.innerHTML =
          '<div style="font-size:13px;color:var(--text-2);padding:8px 0">Gagal memuat dokumen.</div>';
      }
    } else {
      dokEl.innerHTML =
        '<div style="font-size:13px;color:var(--text-2);padding:8px 0">Tidak ada dokumen diupload.</div>';
    }
    // Sinkronkan checkbox dokumen bermasalah dengan dokumen yang diupload pemohon
    var cekList = document.getElementById("pt-cek-list");
    if (row.dokumen_upload) {
      try {
        var dokArr = JSON.parse(row.dokumen_upload);
        if (dokArr.length > 0) {
          cekList.innerHTML = dokArr
            .map(function (d) {
              return (
                '<label class="cek-item"><input type="checkbox" onchange="cekValidasiDok()"/> ' +
                d.nama +
                "</label>"
              );
            })
            .join("");
        }
      } catch (e) {}
    } else {
      // Fallback pakai daftar dokumen sesuai jenis permohonan
      var daftarDokPT = {
        permintaan_data: [
          "Surat permohonan.pdf",
          "KTP pemohon.pdf",
          "Surat keterangan instansi.pdf",
        ],
        rohaniawan: [
          "Surat permohonan.pdf",
          "KTP pemohon.pdf",
          "Surat undangan kegiatan.pdf",
        ],
        permintaan_kesediaan: [
          "Surat permohonan.pdf",
          "KTP pemohon.pdf",
          "Proposal kegiatan.pdf",
        ],
        perubahan_sirup: [
          "Surat permohonan.pdf",
          "KTP pemohon.pdf",
          "Dokumen SIRUP lama.pdf",
        ],
        permohonan_rekomendasi: [
          "Surat permohonan.pdf",
          "KTP pemohon.pdf",
          "Dokumen pendukung.pdf",
        ],
      };
      var listDok = daftarDokPT[row.jenis_layanan] || [];
      if (listDok.length > 0) {
        cekList.innerHTML = listDok
          .map(function (d) {
            return (
              '<label class="cek-item"><input type="checkbox" onchange="cekValidasiDok()"/> ' +
              d +
              "</label>"
            );
          })
          .join("");
      }
    }

    document.getElementById("pt-action-area").style.display =
      sc === "menunggu" || sc === "diproses" ? "block" : "none";
    if (sc === "selesai" && row.url_hasil) {
      var dokEl2 = document.getElementById("pt-dok-list-isi");
      if (dokEl2) {
        dokEl2.innerHTML +=
          '<div class="dok-item" style="margin-top:10px;border-color:#b6dfc8;background:#f0faf5">' +
          '<span class="dok-name" style="color:#085041">📄 Dokumen hasil</span>' +
          '<span class="dok-link" onclick="window.open(\'' +
          row.url_hasil +
          "','_blank')\">Lihat dokumen hasil</span>" +
          "</div>";
      }
    }
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
    if (
      (row.jenis_layanan || "").toLowerCase() === "upload_ulang" &&
      row.user_id
    ) {
      var riwayat = await db()
        .from("permohonan")
        .select("*")
        .eq("user_id", row.user_id)
        .eq("status", "ditolak")
        .order("created_at", { ascending: false })
        .limit(1);
      if (!riwayat.error && riwayat.data && riwayat.data.length > 0) {
        var rw = riwayat.data[0];
        var rb3 = document.getElementById("pt-riwayat-box");
        rb3.style.display = "block";
        var label = document.querySelector(".riwayat-box-label");
        if (label) label.textContent = "Alasan penolakan sebelumnya";
        var isi2 = [];
        if (rw.kategori_tolak)
          isi2.push("<b>Kategori:</b> " + rw.kategori_tolak);
        if (rw.dokumen_tolak)
          isi2.push("<b>Dokumen bermasalah:</b> " + rw.dokumen_tolak);
        if (rw.alasan_tolak) isi2.push("<b>Alasan:</b> " + rw.alasan_tolak);
        document.getElementById("pt-riwayat-isi").innerHTML = isi2.join("<br>");
      }
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
  var fileInput = document.getElementById("input-hasil-dok");
  if (!fileInput || !fileInput.files[0]) {
    toast("Harap pilih file dokumen hasil terlebih dahulu!", "info");
    return;
  }
  var file = fileInput.files[0];
  var btn = document.querySelector(".btn-kirim-acc");
  btn.disabled = true;
  btn.textContent = "Mengupload...";
  try {
    var path = "hasil/" + ptCurrentId + "/" + Date.now() + "_" + file.name;
    var up = await db().storage.from("dokumen-ptsp").upload(path, file);
    if (up.error) throw up.error;
    var url = db().storage.from("dokumen-ptsp").getPublicUrl(path)
      .data.publicUrl;
    var r = await db()
      .from("permohonan")
      .update({ status: "selesai", url_hasil: url })
      .eq("id", ptCurrentId);
    if (r.error) throw r.error;
    alert("Permohonan berhasil disetujui dan dokumen hasil tersimpan.");
    kembaliPT();
    loadTabelPetugas();
  } catch (e) {
    toast("Gagal: " + e.message, "gagal");
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
    toast("Permohonan berhasil ditolak.", "sukses");
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
  if (!cek || !cek.checked) {
    toast("Silakan centang 'Saya bukan robot' terlebih dahulu!", "info");
    return;
  }
  if (!idPermohonanDitolak) {
    toast("Terjadi kesalahan, silakan kembali dan coba lagi.", "gagal");
    return;
  }
  var btn = document.getElementById("btn-kirim-ulang");
  btn.disabled = true;
  btn.innerText = "Sedang Mengirim...";
  try {
    var ur = await db().auth.getUser();
    var user = ur.data.user;
    if (!user) {
      toast("Sesi berakhir, silakan login kembali.", "gagal");
      showPP("login");
      return;
    }
    // Upload file baru jika ada
    var fileInputs = document.querySelectorAll(
      "#ulang-dok-list input[type=file]",
    );
    var urlDokumen = [];
    var uploadTasks2 = [];
    for (var i = 0; i < fileInputs.length; i++) {
      if (fileInputs[i].files[0]) {
        uploadTasks2.push({
          file: fileInputs[i].files[0],
          label:
            fileInputs[i].getAttribute("data-nama") ||
            fileInputs[i].files[0].name,
          index: i,
        });
      }
    }
    if (uploadTasks2.length === 0) {
      toast("Harap upload semua dokumen yang bermasalah!", "gagal");
      return;
    }
    try {
      urlDokumen = await Promise.all(
        uploadTasks2.map(async function (task) {
          var path =
            "pemohon/" +
            user.id +
            "/" +
            Date.now() +
            "_" +
            task.index +
            "_" +
            task.file.name;
          var up = await db()
            .storage.from("dokumen-ptsp")
            .upload(path, task.file);
          if (up.error) throw new Error("Gagal upload: " + task.label);
          var url = db().storage.from("dokumen-ptsp").getPublicUrl(path)
            .data.publicUrl;
          return { nama: task.label, url: url };
        }),
      );
    } catch (eUp) {
      toast(eUp.message, "gagal");
      return;
    }
    // Update permohonan lama bukan buat baru
    var updateData = {
      status: "Pending",
      alasan_tolak: null,
      dokumen_tolak: null,
      kategori_tolak: null,
      is_revisi: true,
    };
    if (urlDokumen.length > 0) {
      updateData.dokumen_upload = JSON.stringify(urlDokumen);
    }
    var r = await db()
      .from("permohonan")
      .update(updateData)
      .eq("id", idPermohonanDitolak);
    if (r.error) {
      toast("Gagal mengirim: " + r.error.message, "gagal");
      return;
    }
    cek.checked = false;
    idPermohonanDitolak = null;
    showPP("sukses");
    toast("Permohonan berhasil diajukan ulang!", "sukses");
  } catch (e) {
    toast("Kesalahan: " + e.message, "gagal");
  } finally {
    btn.disabled = false;
    btn.innerText = "Kirim ulang permohonan";
  }
}
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("modal-peran")
    .addEventListener("click", function (e) {
      if (e.target === this) tutupModal();
    });

  (async function () {
    var { data } = await db().auth.getSession();
    if (data && data.session && data.session.user) {
      var user = data.session.user;
      var nama = user.user_metadata.full_name || "Pemohon";
      document.getElementById("pemohon-wrap").style.display = "block";
      document.getElementById("petugas-wrap").style.display = "none";
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
  })();
});

// ─── CHATBOT AI (GEMINI) ──────────────────────────────────
function toggleChat() {
  const chat = document.getElementById("chat-container");
  const isVisible = chat.style.display === "flex";
  chat.style.display = isVisible ? "none" : "flex";
}

function checkEnterChat(e) {
  if (e.key === "Enter") kirimPesanAI();
}

async function kirimPesanAI() {
  const input = document.getElementById("chat-input");
  const body = document.getElementById("chat-body");
  const pesan = input.value.trim();

  if (!pesan) return;

  // Tampilkan pesan user
  body.innerHTML += `<div class="user-msg">${pesan}</div>`;
  input.value = "";
  body.scrollTop = body.scrollHeight;

  // Loading bot
  const loadingId = "bot-load-" + Date.now();
  body.innerHTML += `<div class="bot-msg" id="${loadingId}">...</div>`;
  body.scrollTop = body.scrollHeight;
  try {
    const response = await db().functions.invoke("tanya-gemini", {
      body: { prompt: pesan },
    });

    console.log("Respon Full dari Supabase:", response); // Cek di F12 Console

    const data = response.data;
    const error = response.error;

    if (error) throw error;

    let jawabanAI = "";

    // Logika pengecekan data yang lebih kuat
    if (data) {
      if (typeof data === "string") {
        // Jika data yang balik ternyata string, kita coba parsing
        try {
          const parsed = JSON.parse(data);
          jawabanAI = parsed.answer || data;
        } catch (e) {
          jawabanAI = data;
        }
      } else {
        // Jika data sudah berupa objek
        jawabanAI = data.answer || data.message || JSON.stringify(data);
      }
    }

    if (!jawabanAI || jawabanAI === "{}") {
      jawabanAI =
        "Maaf, AI memberikan respon kosong. Coba cek Logs di Dashboard Supabase.";
    }

    document.getElementById(loadingId).innerText = jawabanAI;
  } catch (err) {
    console.error("Detail Error:", err);
    document.getElementById(loadingId).innerText =
      "Terjadi kesalahan: " + err.message;
  }
  body.scrollTop = body.scrollHeight;
}
