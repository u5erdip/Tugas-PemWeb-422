const root = document.documentElement;
try {
  const tersimpan = localStorage.getItem("tema");
  if (tersimpan) root.dataset.tema = tersimpan;
} catch (e) {}

document.getElementById("tema").addEventListener("click", () => {
  const baru = root.dataset.tema === "gelap" ? "terang" : "gelap";
  root.dataset.tema = baru;
  try { localStorage.setItem("tema", baru); } catch (e) {}
});

const formTugas = document.getElementById("form-tugas");
if (formTugas) {
  const input = document.getElementById("input-tugas");
  const daftar = document.getElementById("daftar");
  const ringkasan = document.getElementById("ringkasan");
  let tugas = [];
  try { tugas = JSON.parse(localStorage.getItem("tugas")) || []; } catch (e) {}

  function simpan() {
    try { localStorage.setItem("tugas", JSON.stringify(tugas)); } catch (e) {}
  }

  function tampilkan() {
    daftar.innerHTML = "";
    tugas.forEach((t, i) => {
      const li = document.createElement("li");
      if (t.selesai) li.classList.add("selesai");

      const cek = document.createElement("input");
      cek.type = "checkbox";
      cek.checked = t.selesai;
      cek.setAttribute("aria-label", "Tandai selesai: " + t.teks);
      cek.addEventListener("change", () => { t.selesai = cek.checked; simpan(); tampilkan(); });

      const teks = document.createElement("span");
      teks.textContent = t.teks;

      const hapus = document.createElement("button");
      hapus.className = "hapus";
      hapus.textContent = "Hapus";
      hapus.addEventListener("click", () => { tugas.splice(i, 1); simpan(); tampilkan(); });

      li.append(cek, teks, hapus);
      daftar.appendChild(li);
    });

    const selesai = tugas.filter(t => t.selesai).length;
    ringkasan.textContent = tugas.length
      ? selesai + " dari " + tugas.length + " tugas selesai."
      : "Belum ada tugas. Tambahkan yang pertama di atas.";
  }

  formTugas.addEventListener("submit", (e) => {
    e.preventDefault();
    const teks = input.value.trim();
    if (!teks) return;
    tugas.push({ teks, selesai: false });
    input.value = "";
    simpan();
    tampilkan();
  });

  const btnApi = document.getElementById("btn-api");
  const statusApi = document.getElementById("status-api");

  btnApi.addEventListener("click", async () => {
    btnApi.disabled = true;
    statusApi.textContent = "Mengambil data dari API...";
    try {
      const respon = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
      if (!respon.ok) throw new Error("Status " + respon.status);
      const data = await respon.json();
      data.forEach(d => tugas.push({ teks: d.title, selesai: d.completed }));
      simpan();
      tampilkan();
      statusApi.textContent = data.length + " tugas berhasil diambil dari API.";
    } catch (err) {
      statusApi.textContent = "Gagal mengambil data. Periksa koneksi internet lalu coba lagi.";
    } finally {
      btnApi.disabled = false;
    }
  });

  tampilkan();
}

const formKontak = document.getElementById("form-kontak");
if (formKontak) {
  const bidang = [
    { id: "nama",  cek: v => v.trim().length >= 2, pesan: "Nama minimal 2 karakter." },
    { id: "email", cek: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), pesan: "Masukkan alamat email yang valid, misalnya nama@email.com." },
    { id: "pesan", cek: v => v.trim().length >= 10, pesan: "Pesan minimal 10 karakter." }
  ];
  const sukses = document.getElementById("sukses");

  formKontak.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;
    bidang.forEach(b => {
      const el = document.getElementById(b.id);
      const err = document.getElementById("err-" + b.id);
      const ok = b.cek(el.value);
      el.classList.toggle("invalid", !ok);
      err.textContent = ok ? "" : b.pesan;
      if (!ok) valid = false;
    });

    if (!valid) {
      sukses.hidden = true;
      return;
    }

    const tombol = formKontak.querySelector("button[type=submit]");
    const nama = document.getElementById("nama").value.trim();
    tombol.disabled = true;
    tombol.textContent = "Mengirim...";
    sukses.classList.remove("error");
    try {
      const respon = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: nama,
          body: document.getElementById("pesan").value.trim(),
          email: document.getElementById("email").value.trim()
        })
      });
      if (!respon.ok) throw new Error("Status " + respon.status);
      const hasil = await respon.json();
      sukses.textContent = "Terima kasih, " + nama + ". Pesan terkirim (ID: " + hasil.id + ").";
      formKontak.reset();
    } catch (err) {
      sukses.textContent = "Pesan gagal dikirim. Periksa koneksi internet lalu coba lagi.";
      sukses.classList.add("error");
    } finally {
      sukses.hidden = false;
      tombol.disabled = false;
      tombol.textContent = "Kirim pesan";
    }
  });
}
