const hari = document.getElementById("hari");
const jumlah = document.getElementById("jumlah");
const minimal = document.getElementById("minimal");
const daftarAnggota = document.getElementById("daftarAnggota");
const hasil = document.getElementById("hasil");
const isiHasil = document.getElementById("isiHasil");

document.getElementById("buatForm").addEventListener("click", buatForm);

document.getElementById("hitung").addEventListener("click", cariJadwal);

function buatForm() {
  const n = Number(jumlah.value);
  const m = Number(minimal.value);

  if (!Number.isInteger(n) || n < 2 || n > 30) {
    alert("Jumlah anggota harus antara 2 sampai 30.");
    return;
  }

  if (!Number.isInteger(m) || m < 2 || m > n) {
    alert("Minimal anggota harus antara 2 sampai jumlah anggota.");
    return;
  }

  daftarAnggota.innerHTML = "";

  for (let i = 1; i <= n; i++) {
    daftarAnggota.innerHTML += `
      <div class="anggota">
        <h3>Anggota ${i}</h3>

        <label for="nama${i}">Nama anggota</label>
        <input id="nama${i}" type="text"
          placeholder="Contoh: Andi" value="Anggota ${i}">

        <div class="jam">
          <div>
            <label for="mulai${i}">Mulai sibuk</label>
            <input id="mulai${i}" type="time">
          </div>

          <div>
            <label for="selesai${i}">Selesai sibuk</label>
            <input id="selesai${i}" type="time">
          </div>
        </div>
      </div>
    `;
  }

  hasil.hidden = true;
}

function keMenit(jam) {
  const bagian = jam.split(":");
  return Number(bagian[0]) * 60 + Number(bagian[1]);
}

function formatJam(menit) {
  const jam = String(Math.floor(menit / 60)).padStart(2, "0");
  const sisa = String(menit % 60).padStart(2, "0");
  return `${jam}.${sisa}`;
}

function cariJadwal() {
  const n = Number(jumlah.value);
  const m = Number(minimal.value);

  if (!Number.isInteger(n) || n < 2 || n > 30 ||
      !Number.isInteger(m) || m < 2 || m > n) {
    alert("Periksa jumlah anggota dan batas minimal.");
    return;
  }

  const anggota = [];

  for (let i = 1; i <= n; i++) {
    const nama = document.getElementById(`nama${i}`).value.trim();
    const mulai = document.getElementById(`mulai${i}`).value;
    const selesai = document.getElementById(`selesai${i}`).value;

    if (!nama) {
      alert(`Nama anggota ${i} belum diisi.`);
      return;
    }

    if (Boolean(mulai) !== Boolean(selesai)) {
      alert(`Lengkapi jam sibuk anggota ${i}.`);
      return;
    }

    if (mulai && selesai) {
      const awal = keMenit(mulai);
      const akhir = keMenit(selesai);

      if (awal >= akhir) {
        alert(`Jam sibuk anggota ${i} tidak valid.`);
        return;
      }

      anggota.push({ nama, awal, akhir });
    } else {
      anggota.push({ nama, awal: null, akhir: null });
    }
  }

  const slot = [];

  // Cari waktu pertemuan berdurasi 1 jam.
  // Pemeriksaan dilakukan setiap 30 menit.
  for (let awal = 6 * 60; awal + 60 <= 23 * 60; awal += 30) {
    const akhir = awal + 60;

    const tersedia = anggota.filter(a =>
      a.awal === null ||
      akhir <= a.awal ||
      awal >= a.akhir
    );

    if (tersedia.length >= m) {
      slot.push({
        awal,
        akhir,
        jumlah: tersedia.length,
        nama: tersedia.map(a => a.nama)
      });
    }
  }

  hasil.hidden = false;

  if (slot.length === 0) {
    isiHasil.innerHTML = `
      <p class="sukses">
    Ditemukan ${slot.length} pilihan waktu yang memenuhi syarat.
  </p>

  <p>Hari: <strong>${hari.value}</strong></p>
  <p>Minimal kehadiran: <strong>${m} dari ${n} anggota</strong></p>

  <div class="tabel-container">
    <table class="tabel-hasil">
      <thead>
        <tr>
          <th>No.</th>
          <th>Waktu</th>
          <th>Anggota Hadir</th>
          <th>Status</th>
          <th>Nama Anggota</th>
        </tr>
      </thead>
      <tbody>
        ${terbaik.map((s, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${formatJam(s.awal)}–${formatJam(s.akhir)}</td>
            <td>${s.jumlah}/${n}</td>
            <td>${i === 0 ? "Terbaik" : "Memenuhi syarat"}</td>
            <td>${s.nama.join(", ")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>
`;
    return;
  }

  // Urutkan dari jumlah anggota terbanyak.
  slot.sort((a, b) =>
    b.jumlah - a.jumlah || a.awal - b.awal
  );

  // Tampilkan maksimal lima rekomendasi.
  const terbaik = slot.slice(0, 5);

  isiHasil.innerHTML = `
    <p>Hari: <b>${hari.value}</b></p>
    <p>Minimal anggota hadir: <b>${m} dari ${n}</b></p>

    <div style="overflow-x:auto">
      <table border="1" cellpadding="10"
        cellspacing="0" width="100%"
        style="border-collapse:collapse;text-align:left">
        <thead>
          <tr>
            <th>No</th>
            <th>Waktu</th>
            <th>Anggota Hadir</th>
            <th>Nama Anggota</th>
          </tr>
        </thead>
        <tbody>
          ${terbaik.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${formatJam(s.awal)} - ${formatJam(s.akhir)}</td>
              <td>${s.jumlah}/${n}</td>
              <td>${s.nama.join(", ")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// Otomatis buat formulir untuk 8 anggota saat halaman dibuka.
buatForm();