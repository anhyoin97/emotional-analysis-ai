from flask import Blueprint, request, jsonify
from services.emotion_service import ask_comfort_gpt

comfort_bp = Blueprint("comfort", __name__)


@comfort_bp.route("/comfort-gpt", methods=["POST"])
def comfort_gpt():
    data = request.get_json()
    feeling = data.get("feeling", "혼란스러운 기분")

    try:
        reply = ask_comfort_gpt(feeling)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
