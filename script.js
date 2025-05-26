let userNama = "";
let userKelas = "";

function login() {
  const nama = document.getElementById('nama').value.trim();
  const kelas = document.getElementById('kelas').value.trim();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('login-error');

  if (!nama || !kelas || !password) {
    error.textContent = "Semua kolom harus diisi!";
    return;
  }

  if (password !== "123") {
    error.textContent = "Password salah!";
    return;
  }

  userNama = nama;
  userKelas = kelas;

  document.getElementById('login-section').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';

  document.getElementById('user-info').textContent = `Nama: ${userNama}, Kelas: ${userKelas}`;

  mulaiKuis(); // fungsi untuk memuat kuis
}

function mulaiKuis() {
  fetch('soal.txt')
    .then(res => res.text())
    .then(data => {
      const questions = data.trim().split('\n\n').map(block => {
        const lines = block.split('\n');
        const question = lines[0];
        const options = lines.slice(1).map(line => {
          const isCorrect = line.includes('*');
          return {
            text: line.replace('*', '').trim(),
            correct: isCorrect
          };
        });
        return { question, options };
      });

      const container = document.getElementById('quiz-container');

      questions.forEach((q, i) => {
        const div = document.createElement('div');
        div.className = 'question';
        const qText = document.createElement('p');
        qText.textContent = q.question;
        div.appendChild(qText);

        q.options.forEach((opt, j) => {
          const label = document.createElement('label');
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = `q${i}`;
          radio.value = j;
          label.appendChild(radio);
          label.append(` ${opt.text}`);
          div.appendChild(label);
          div.appendChild(document.createElement('br'));
        });

        container.appendChild(div);
      });

      document.getElementById('submit').addEventListener('click', () => {
        let score = 0;
        questions.forEach((q, i) => {
          const selected = document.querySelector(`input[name="q${i}"]:checked`);
          if (selected && q.options[selected.value].correct) {
            score++;
          }
        });

        document.getElementById('result').textContent =
          `Terima kasih ${userNama} dari kelas ${userKelas}! Skor kamu: ${score} dari ${questions.length}`;
      });
    });
}
