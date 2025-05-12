# 🧠 감정 분석 웹앱 (Emotion-Analyzer)
OpenAI API, face-api.js 활용 프로토타입

## 🛠 기술 스택
| 분류 | 기술 |
|------|------|
| Frontend | HTML5, CSS3, JavaScript (ES6), Chart.js |
| 얼굴 분석 | face-api.js (WebGL 기반 실시간 추론) |
| Backend | Flask (Python), OpenAI API 연동 |
| 기타 | 웹캠 스트리밍, 감정 로그 수집, JSON 기반 API 통신 |

## ✨ 주요 기능
### ✍️ 감정일기 분석
- 사용자가 작성한 일기를 기반으로 GPT가 감정을 분석
- 점수 해석 안내, 공감 선택 버튼, 추가 GPT 응답까지 포함

### 🎥 실시간 얼굴 감정 분석
- 웹캠을 통해 실시간으로 표정을 인식하고 `happy`, `sad`, `angry` 등 감정 분석
- face-api.js 기반 표정 추론
- 감정 1초 간격으로 로그로 저장

### 📊 감정 변화 시각화
- Chart.js 기반 감정 변화 라인 차트 출력
- 시간(x축) 대비 감정(y축)을 시각적으로 확인 가능


---





