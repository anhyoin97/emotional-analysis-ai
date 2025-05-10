from flask import Blueprint, request, jsonify
from services.emotion_service import analyze_diary

emotion_bp = Blueprint("emotion", __name__)


@emotion_bp.route("/analyze", methods=["POST"])
def analyze():
    diary = request.form.get("diary", "")
    try:
        result = analyze_diary(diary)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "서버 오류 발생", "detail": str(e)})
