// Variabel global
let penggunaSekarang = '';
let daftarSoal = [];
let indeksSoalSekarang = 0;
let jawabanPengguna = [];
let skor = 0;

// Elemen DOM
const formLogin = document.getElementById('loginForm');
const formKuis = document.getElementById('quizForm');
const tombolSebelumnya = document.getElementById('prev-btn');
const tombolSelanjutnya = document.getElementById('next-btn');
const tombolSelesai = document.getElementById('submit-btn');
const teksSoal = document.getElementById('question-text');
const containerPilihan = document.getElementById('options-container');
const gambarSoal = document.getElementById('question-image');
const progressKuis = document.getElementById('quiz-progress');
const totalSoalSpan = document.getElementById('total-questions');
const containerHasil = document.getElementById('result-container');
const spanSkor = document.getElementById('score');
const spanTotal = document.getElementById('total');
const infoPengguna = document.getElementById('user-info');

// Cek apakah kita di halaman login atau kuis
if (formLogin) {
    // Logika halaman login
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nama = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Validasi sederhana
        if (nama && password) {
            penggunaSekarang = nama;
            localStorage.setItem('penggunaSekarang', penggunaSekarang);
            window.location.href = 'kuis.html';
        } else {
            alert('Silakan isi nama dan password!');
        }
    });
} else if (formKuis) {
    // Logika halaman kuis
    document.addEventListener('DOMContentLoaded', function() {
        // Ambil data pengguna dari localStorage
        penggunaSekarang = localStorage.getItem('penggunaSekarang') || 'Pengguna';
        infoPengguna.textContent = `Halo, ${penggunaSekarang}`;
        
        // Muat soal dari CSV
        muatSoal();
    });

    // Tombol navigasi
    tombolSebelumnya.addEventListener('click', tampilkanSoalSebelumnya);
    tombolSelanjutnya.addEventListener('click', tampilkanSoalSelanjutnya);
    tombolSelesai.addEventListener('click', tampilkanHasil);
}

function muatSoal() {
    fetch('https://raw.githubusercontent.com/NardoTuns/kuis/main/soal.csv')
        .then(response => response.text())
        .then(data => {
            // Parse data CSV
            daftarSoal = parseCSV(data);
            totalSoalSpan.textContent = daftarSoal.length;
            
            // Inisialisasi array jawaban
            jawabanPengguna = new Array(daftarSoal.length).fill(null);
            
            // Tampilkan soal pertama
            tampilkanSoal(indeksSoalSekarang);
        })
        .catch(error => {
            console.error('Gagal memuat soal:', error);
            alert('Gagal memuat soal. Silakan coba lagi.');
        });
}

function parseCSV(dataCSV) {
    const baris = dataCSV.split('\n');
    const soal = [];
    
    // Lewati baris header jika ada
    const barisAwal = baris[0].includes('Pertanyaan') ? 1 : 0;
    
    for (let i = barisAwal; i < baris.length; i++) {
        if (baris[i].trim() === '') continue;
        
        const bagian = baris[i].split(';');
        if (bagian.length >= 6) {
            const soalBaru = {
                pertanyaan: bagian[0].trim(),
                gambar: bagian[1].trim(),
                pilihan: bagian.slice(2, 6).map(opt => opt.trim()),
                kunci: bagian[6].trim()
            };
            soal.push(soalBaru);
        }
    }
    
    return soal;
}

function tampilkanSoal(indeks) {
    if (indeks < 0 || indeks >= daftarSoal.length) return;
    
    const soal = daftarSoal[indeks];
    
    // Update teks soal
    teksSoal.textContent = soal.pertanyaan;
    
    // Update gambar jika ada
    gambarSoal.innerHTML = '';
    if (soal.gambar && soal.gambar !== 'null' && soal.gambar !== '') {
        const img = document.createElement('img');
        img.src = `Gambar/${soal.gambar}`;
        img.alt = 'Gambar soal';
        gambarSoal.appendChild(img);
    }
    
    // Update pilihan jawaban
    containerPilihan.innerHTML = '';
    soal.pilihan.forEach((pilihan, i) => {
        const divPilihan = document.createElement('div');
        divPilihan.className = 'option';
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'jawaban';
        input.id = `pilihan-${i}`;
        input.value = String.fromCharCode(65 + i); // A, B, C, D
        
        // Cek jika pilihan ini sudah dipilih sebelumnya
        if (jawabanPengguna[indeks] === input.value) {
            input.checked = true;
        }
        
        const label = document.createElement('label');
        label.htmlFor = `pilihan-${i}`;
        label.textContent = pilihan;
        
        divPilihan.appendChild(input);
        divPilihan.appendChild(label);
        containerPilihan.appendChild(divPilihan);
    });
    
    // Update tombol navigasi
    tombolSebelumnya.disabled = indeks === 0;
    tombolSelanjutnya.style.display = indeks === daftarSoal.length - 1 ? 'none' : 'block';
    tombolSelesai.style.display = indeks === daftarSoal.length - 1 ? 'block' : 'none';
    
    // Update progress
    document.getElementById('current-question').textContent = indeks + 1;
    
    // Simpan indeks soal sekarang
    indeksSoalSekarang = indeks;
}

function tampilkanSoalSelanjutnya() {
    // Simpan jawaban saat ini
    const pilihanTerpilih = document.querySelector('input[name="jawaban"]:checked');
    if (pilihanTerpilih) {
        jawabanPengguna[indeksSoalSekarang] = pilihanTerpilih.value;
    }
    
    // Tampilkan soal berikutnya
    tampilkanSoal(indeksSoalSekarang + 1);
}

function tampilkanSoalSebelumnya() {
    // Tampilkan soal sebelumnya
    tampilkanSoal(indeksSoalSekarang - 1);
}

function tampilkanHasil() {
    // Simpan jawaban terakhir
    const pilihanTerpilih = document.querySelector('input[name="jawaban"]:checked');
    if (pilihanTerpilih) {
        jawabanPengguna[indeksSoalSekarang] = pilihanTerpilih.value;
    }
    
    // Hitung skor
    skor = 0;
    for (let i = 0; i < daftarSoal.length; i++) {
        if (jawabanPengguna[i] === daftarSoal[i].kunci) {
            skor++;
        }
    }
    
    // Sembunyikan form kuis dan tampilkan hasil
    formKuis.style.display = 'none';
    containerHasil.style.display = 'block';
    spanSkor.textContent = skor;
    spanTotal.textContent = daftarSoal.length;
}
