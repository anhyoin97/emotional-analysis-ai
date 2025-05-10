from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

# 환경변수 불러오기
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    diary = request.form["diary"]

    prompt = f"""
    당신은 감정 분석 전문가입니다. 아래 일기를 감정적으로 분석해 주세요.

    💡 감정 점수는 **부정적인 감정의 강도(우울, 불안, 무기력 등)**를 기준으로 0~100 사이의 숫자로 판단해 주세요.  
    📉 그리고 일기의 전반적인 분위기가 긍정적으로 마무리되었다면, 점수를 더 낮게 평가해도 괜찮습니다.  
    📦 반드시 아래 형식의 JSON으로만 응답해 주세요.

    {{
    "emotion": "감정 (한 단어)",
    "score": 숫자 (0~100)",
    "reason": "감정의 원인 요약",
    "message": "GPT 응원 메시지",
    "comfort": "사용자에게 따뜻한 위로 한마디 (짧고 진심을 담아)"
    }}

    일기:
    \"\"\"
    {diary}
    \"\"\"
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        text = response.choices[0].message.content
        print("[GPT 응답 내용]:\n", text)

        parsed = json.loads(text)
        return jsonify(parsed)

    except json.JSONDecodeError:
        return jsonify({"error": "GPT 응답 파싱 실패", "raw": text})

    except Exception as e:
        return jsonify({"error": "서버 오류 발생", "detail": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
