from flask import Blueprint, request, jsonify
from services.emotion_service import analyze_emotion_log

comment_bp = Blueprint('comment', __name__)

@comment_bp.route('/generate-comment', methods=['POST'])
def generate_comment():
    data = request.get_json()
    log = data.get("log", [])

    if not log:
        return jsonify({"error": "감정 로그가 없습니다."}), 400

    try:
        result = analyze_emotion_log(log)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500