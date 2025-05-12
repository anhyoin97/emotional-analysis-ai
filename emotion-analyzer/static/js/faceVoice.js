window.onload = function () {
    const video = document.getElementById("video");
    const emotionText = document.getElementById("emotion-text");
    const startBtn = document.getElementById("start-analysis");
    const stopBtn = document.getElementById("stop-analysis");
    const canvas = document.getElementById("overlay");
    const displaySize = { width: 640, height: 480 };

    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    let emotionLog = [];
    let latestEmotion = "neutral";
    let isLogging = false;
    let analysisSeconds = 0;
    let analysisInterval = null;

    const emotionEmoji = {
        happy: "😊",
        sad: "😢",
        angry: "😠",
        surprised: "😲",
        disgusted: "🤢",
        fearful: "😨",
        neutral: "😐"
    };

    // 모델 로드 후 버튼 활성화
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/static/models')
    ]).then(() => {
        startBtn.disabled = false;
    });

    async function startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;

            video.onloadedmetadata = () => {
                video.play();
                startAnalysisLoop(); // 분석 루프 시작
            };
        } catch (err) {
            console.error("웹캠 접근 실패:", err);
        }
    }

    function stopVideo() {
        const stream = video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        clearInterval(analysisInterval);
    }

    function startAnalysisLoop() {
        faceapi.matchDimensions(canvas, displaySize);

        analysisInterval = setInterval(async () => {
            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            const resized = faceapi.resizeResults(detections, displaySize);
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resized);
            faceapi.draw.drawFaceExpressions(canvas, resized);

            if (detections[0]) {
                const expressions = detections[0].expressions;
                const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
                const topEmotion = sorted[0][0];
                const confidence = (sorted[0][1] * 100).toFixed(1);

                latestEmotion = topEmotion;

                emotionText.textContent = `표정 감정: ${emotionEmoji[topEmotion] || ''} ${topEmotion} (${confidence}%)`;

                if (isLogging) {
                    emotionLog.push({ time: analysisSeconds++, emotion: topEmotion });
                }
            }
        }, 500);
    }

    function getCurrentEmotion() {
        return latestEmotion || "neutral";
    }

    function renderEmotionChart(log) {
        const ctx = document.getElementById('emotionChart').getContext('2d');
        const labels = log.map(entry => `${entry.time}s`);
        const data = log.map(entry => entry.emotion);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '감정 변화',
                    data: data,
                    borderColor: 'blue',
                    fill: false,
                    tension: 0.2
                }]
            },
            options: {
                scales: {
                    y: {
                        type: 'category',
                        labels: ['angry', 'disgusted', 'fearful', 'happy', 'neutral', 'sad', 'surprised']
                    }
                }
            }
        });
    }

    // 분석 시작
    startBtn.addEventListener("click", () => {
        isLogging = true;
        analysisSeconds = 0;
        emotionLog = [];

        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        startBtn.style.backgroundColor = "#ccc";
        stopBtn.style.backgroundColor = "#ff6666";

        startVideo();  // 웹캠 시작 + 루프 시작
    });

    // 분석 종료
    stopBtn.addEventListener("click", () => {
        isLogging = false;

        startBtn.style.display = "none";
        stopBtn.style.display = "none";

        stopVideo();  // 웹캠 종료 + 루프 중단
        renderEmotionChart(emotionLog);  // 그래프 출력
        sendEmotionLogToGPT(emotionLog);

        // 화면 전환
        document.getElementById("face-wrapper").style.display = "none";
        document.getElementById("result-card").style.display = "none";
        document.getElementById("gpt-comment").style.display = "block";
    });

    async function sendEmotionLogToGPT(log) {
        const commentDiv = document.getElementById("gpt-comment");
        commentDiv.textContent = "분석 중입니다... 잠시만 기다려주세요.";

        try {
            const res = await fetch("/generate-comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ log })
            });

            const data = await res.json();

            if (data.summary && data.comfort) {
                commentDiv.innerHTML = `
                    <p><strong>🧠 분석 요약:</strong> ${data.summary}</p>
                    <p><strong>💬 지금 당신에게 전하고 싶은 한마디 : </strong> ${data.comfort}</p>
                `;
            } else {
                commentDiv.textContent = "응답 오류: " + (data.error || "결과를 받을 수 없습니다.");
            }
        } catch (err) {
            commentDiv.textContent = "서버 통신 실패: " + err.message;
        }
    }

};
