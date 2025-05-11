window.onload = function () {
    const video = document.getElementById("video");
    const emotionText = document.getElementById("emotion-text");

    // 모델 로드
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/static/models')
    ]).then(startVideo);

    // 웹캠 실행
    async function startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (err) {
            console.error("웹캠 접근 실패:", err);
        }
    }

    // 분석 결과 처리
    video.addEventListener("play", () => {
        const canvas = document.getElementById("overlay");
        const displaySize = { width: video.videoWidth, height: video.videoHeight };

        canvas.width = displaySize.width;
        canvas.height = displaySize.height;

        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            const resized = faceapi.resizeResults(detections, displaySize);
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

            faceapi.draw.drawDetections(canvas, resized);
            faceapi.draw.drawFaceExpressions(canvas, resized);

            if (detections[0]) {
                const expressions = detections[0].expressions;
                const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);

                const emotionEmoji = {
                    happy: "😊",
                    sad: "😢",
                    angry: "😠",
                    surprised: "😲",
                    disgusted: "🤢",
                    fearful: "😨",
                    neutral: "😐"
                };

                const topEmotion = sorted[0][0];
                const confidence = (sorted[0][1] * 100).toFixed(1);

                emotionText.textContent = `표정 감정: ${emotionEmoji[topEmotion] || ''} ${topEmotion} (${confidence}%)`;
            }
        }, 500);
    });
};
