from flask import Flask, render_template
from routes.emotion import emotion_bp
from routes.comfort import comfort_bp

app = Flask(__name__)

# HTML 렌더링 라우트 (index.html)
@app.route("/")
def index():
    return render_template("index.html")

@app.route('/face-voice')
def face_voice():
    return render_template("face-voice.html")

# 라우터 등록
app.register_blueprint(emotion_bp)
app.register_blueprint(comfort_bp)

if __name__ == "__main__":
    app.run(debug=True)
