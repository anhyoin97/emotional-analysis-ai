import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def analyze_diary(diary: str):
    prompt = f"""
    당신은 감정 분석 전문가입니다. 아래 일기를 감정적으로 분석해 주세요.

    💡 감정 점수는 **부정적인 감정의 강도(우울, 불안, 무기력 등)**를 기준으로 0~100 사이의 숫자로 판단해 주세요.  
    📉 그리고 일기의 전반적인 분위기가 긍정적으로 마무리되었다면, 점수를 더 낮게 평가해도 괜찮습니다.  
    📦 반드시 아래 형식의 JSON으로만 응답해 주세요.

    {{
    "emotion": "감정 (한 단어)",
    "score": 숫자 (0~100)",
    "reason": "감정의 원인 요약",
    "message": "응원 메시지",
    "comfort": "사용자에게 따뜻한 위로 한마디 (짧고 진심을 담아)"
    }}

    일기:
    \"\"\"{diary}\"\"\"
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    text = response.choices[0].message.content
    print("[응답 내용]:\n", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise Exception("응답 파싱 실패")


def ask_comfort_gpt(feeling: str):
    prompt = f"""사용자가 '{feeling}'라고 표현했어. 짧고 진심 어린 한 문장으로 위로해줘."""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "너는 감정적으로 따뜻한 공감 상담사야."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.9,
        max_tokens=60
    )
    return response.choices[0].message.content.strip()

def analyze_emotion_log(log: list):
    """
    감정 로그 배열을 받아서 현재 감정 흐름 요약 + 응원 멘트를 생성
    """
    emotion_sequence = [entry["emotion"] for entry in log]
    
    prompt = f"""
    다음은 사용자의 감정 변화 로그입니다 (1초 단위 기록):

    {emotion_sequence}

    당신은 감정 분석 전문가입니다.
    이 감정 흐름을 분석하여 현재 나의 감정 상태를 간단히 요약하고,
    이 사람에게 따뜻한 위로나 응원의 한마디를 전해주세요. 문장은 반드시 한국어로 해주세요.
    
    💡 출력은 반드시 아래 형식의 JSON으로만 해주세요.

    {{
      "summary": "감정 흐름 요약",
      "comfort": "사용자에게 따뜻한 위로나 응원 한마디 (짧고 진심을 담아)"
    }}
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
    )

    text = response.choices[0].message.content
    print("[감정 로그 응답]:\n", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise Exception("응답 파싱 실패")