import os, sys, pickle
from flask import Flask, flash, render_template, redirect, request
from werkzeug.utils import secure_filename

app = Flask(__name__)

data = []
app.secret_key = "980dbb6131eaacb9072fefffb2946a0a3864fb57df75c13d"
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        print(request.files)
        if 'audio_data' not in request.files:
            flash('No audio_data')
            return redirect(request.url)
        audio_data = request.files['audio_data']
        if audio_data.filename == " ":
            flash("no audio data")
            return redirect(request.url)
        if audio_data:
            filename = secure_filename(audio_data.filename)+".ogg"
            pickleSize = len(pickle.dumps(audio_data))
            if pickleSize > 80000:
                return redirect(request.url)
            else:
                audio_data.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return render_template("index.html", data=data)
    else:
        return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)