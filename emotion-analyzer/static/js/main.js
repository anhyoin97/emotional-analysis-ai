
const emotionIcons = {
    우울: "😢",
    불안: "😟",
    분노: "😠",
    기쁨: "😄",
    슬픔: "😭",
    안정: "😊",
    피로: "😩",
    무기력: "😞",
    절망: "😔",
    희망: "🌈",
};

const resultDiv = document.getElementById("result");
const form = document.getElementById("diary-form");

const analyzeButton = document.querySelector('#analyze-button');

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 로딩 표시
    resultDiv.innerHTML = `<p style="color: #0078D7;">🧠 감정 분석 중입니다...</p>`;
    analyzeButton.disabled = true;
    analyzeButton.textContent = "분석 중...";

    const formData = new FormData(e.target);
    const res = await fetch("/analyze", {
        method: "POST",
        body: formData,
    });

    analyzeButton.disabled = false;
    analyzeButton.textContent = "분석하기";

    const data = await res.json();

    if (data.error) {
        resultDiv.innerHTML = `<p style="color:red;">⚠️ 분석 실패: ${data.raw || data.detail
            }</p>`;
        return;
    }

    const color =
        data.score >= 81
            ? "#d9534f"
            : data.score >= 61
                ? "#f0ad4e"
                : data.score >= 31
                    ? "#f9e79f"
                    : "#5cb85c";
    const icon = emotionIcons[data.emotion] || "🧠";

    resultDiv.innerHTML = `
      <div class="result-box" style="border-color: ${color};">
        <div class="result-item"><span class="result-label">감정:</span> ${icon} ${data.emotion
        }</div>
        <div class="result-item"><span class="result-label">점수:</span> ${data.score
        }점</div>
        <div class="result-item">
        <div style="width: 180px; margin: 12px auto;">
            <canvas id="scoreChart"></canvas>
        </div>
        </div>
        <div class="result-item"><span class="result-label">이유:</span> ${data.reason
        }</div>
        <div class="result-item"><span class="result-label">응원의 한마디:</span> ${data.message
        }</div>
        <div class="encouragement">💬 오늘의 위로: “${data.comfort || "오늘도 잘 버텼어요. 수고했어요 :)"
        }”</div>
        <div class="score-guide">
          <strong>점수 해석 안내:</strong><br>
          ✅ 0~30: 감정 안정 상태<br>
          ⚠️ 31~60: 가벼운 감정 변화<br>
          ❗ 61~80: 부정 감정 강함<br>
          🔥 81~100: 감정적으로 매우 힘든 상태
        </div>
        ${getComfortCard(data.score)}
        ${renderComfortChoiceCard(data.score)}
      </div>
    `;
    setTimeout(() => {
        renderScoreChart(data.score);
    }, 50);
    renderComfortChoiceCard(data.score)
    if (data.score >= 81) {
        document.body.classList.add("danger-bg");
    } else {
        document.body.classList.remove("danger-bg");
    }
});

const startBtn = document.getElementById("start-record");
const stopBtn = document.getElementById("stop-record");
const statusText = document.getElementById("recording-status");
const diary = document.getElementById("diary");
let recognition = null;

function setupRecognition() {
    const recog = new webkitSpeechRecognition();
    recog.lang = "ko-KR";
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onstart = () => {
        statusText.textContent = "🎙️ 듣고 있어요...";
        startBtn.style.display = "none";
        stopBtn.style.display = "inline-block";
    };

    recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        diary.value += (diary.value ? " " : "") + transcript;
    };

    recog.onerror = (event) => {
        statusText.textContent = "⚠️ 오류: " + event.error;
    };

    recog.onend = () => {
        statusText.textContent = "";
        startBtn.style.display = "inline-block";
        stopBtn.style.display = "none";
    };

    return recog;
}

startBtn.addEventListener("click", () => {
    recognition = setupRecognition();
    recognition.start();
});

stopBtn.addEventListener("click", () => {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
});

function renderScoreChart(score) {
    const canvas = document.getElementById("scoreChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (window.scoreChart instanceof Chart) {
        window.scoreChart.destroy();
    }

    let color = "#4caf50";
    if (score >= 31 && score <= 60) color = "#ffc107";
    else if (score >= 61 && score <= 80) color = "#ff9800";
    else if (score > 80) color = "#f44336";

    window.scoreChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: [color, "#e0e0e0"],
                borderWidth: 0
            }]
        },
        options: {
            cutout: "70%",
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                title: {
                    display: true,
                    text: `${score}점`,
                    color: color,
                    font: {
                        size: 22,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

function getComfortCard(score) {
    if (score <= 60) return ""; // 안정 또는 가벼운 감정 변화일 때는 위로 카드 생략

    let message = "";
    let icon = "💙";
    let bg = "#fef3f3";
    let border = "#f44336";

    if (score > 80) {
        message = "지금 너무 힘드시죠? 모든 감정은 지나가요. 지금 이 순간도 언젠간 추억이 될 거예요.";
        icon = "🌧️";
        bg = "#fff0f0";
        border = "#e53935";
    } else if (score > 60) {
        message = "조금 지쳤을 뿐이에요. 내일의 나는 오늘보다 나을 거예요. 진심으로 응원해요.";
        icon = "🌥️";
        bg = "#fdf6ed";
        border = "#fb8c00";
    }

    return `
    <div class="comfort-card" style="margin-top: 20px; padding: 16px; background-color: ${bg}; border-left: 6px solid ${border}; border-radius: 10px;">
      <div style="font-size: 1.1em;">${icon} <strong>지금 당신에게 전하고 싶은 한마디</strong></div>
      <p style="margin-top: 8px; font-style: italic;">“${message}”</p>
    </div>
  `;
}

function renderComfortChoiceCard(score) {
    if (score < 61) return "";

    const choices = [
        { id: "tired", label: "지쳤어요" },
        { id: "lost", label: "길을 잃은 기분이에요" },
        { id: "alone", label: "혼자인 것 같아요" }
    ];

    const buttons = choices.map(c => `
    <button class="comfort-choice" data-id="${c.id}">${c.label}</button>
    `).join("");

    return `
    <div class="comfort-card" style="margin-top: 20px; padding: 16px; background-color: #f6faff; border-left: 6px solid #2196f3; border-radius: 10px;">
      <div style="font-size: 1.1em;">🎧 <strong>지금 내가 듣고 싶은 말은?</strong></div>
      <div style="margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap;">
        ${buttons}
      </div>
      <div id="comfort-reply" style="margin-top: 12px; font-style: italic;"></div>
    </div>
     `;
}

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("comfort-choice")) {
        const id = e.target.dataset.id;
        const replyBox = document.getElementById("comfort-reply");
        replyBox.textContent = "🧠 위로의 말을 찾고 있어요...";

        const feelings = {
            tired: "지쳤어요",
            lost: "길을 잃은 기분이에요",
            alone: "혼자인 것 같아요"
        };

        try {
            const res = await fetch("/comfort-gpt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feeling: feelings[id] })
            });

            const data = await res.json();
            if (data.reply) {
                replyBox.textContent = `“${data.reply}”`;
            } else {
                replyBox.textContent = "⚠️ 응답에 문제가 있어요: " + data.error;
            }
        } catch (err) {
            replyBox.textContent = "⚠️ 네트워크 오류가 발생했어요.";
        }
    }
});