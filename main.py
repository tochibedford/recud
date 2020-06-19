import os, sys, json, pickle, threading
import numpy as np
from scipy import stats
from tensorflow.keras.models import load_model
from flask import Flask, flash, render_template, redirect, request, session, url_for
from werkzeug.utils import secure_filename
from handleAudio import convertFile, loadTransform, convertToSpec

model = None

app = Flask(__name__)
#df

app.secret_key = "980dbb6131eaacb9072fefffb2946a0a3864fb57df75c13d"
UPLOAD_FOLDER = './uploads'
models = './models'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['models'] = models
with open("./static/targetss.hno", "rb") as fle:
    targetss = pickle.load(fle)

def load_modela(dirr, version=None, latest=True):
    versions = []
    for filee in os.listdir(dirr):
        versions.append(filee)
    versions.sort()
    if latest:
        modelLoad = os.path.join(dirr, versions[-1], os.listdir(os.path.join(dirr, versions[-1]))[-1])
        mod = load_model(modelLoad)
        return mod
    else:
        modelLoad = os.path.join(dirr, versions[version-1], os.listdir(os.path.join(dirr, versions[version-1]))[-1])
        mod = load_model(modelLoad)
        return mod

def predictionConvert(predictions, top=3):
    #getting top "top" prediction
    k=50
    modes = {}
    preds = []
    for idx, i in enumerate(predictions):
        preds.append([])
        for j in range(top):
            preds[idx].append(int(np.argmax(i)))
            i[np.argmax(i)] = 0
            # i = np.delete(i, np.argmax(i), 0)
    # for idx, i in enumerate(predictions):
    #     preds.append([])
    #     for j in range(top):
    #         preds[idx].append(int(np.argmax(i)))
    #         i = np.delete(i, np.argmax(i), 0)
    #getting the most frequent predictions from the top predictions
    preds = np.array(preds)
    preds = preds.reshape(preds.shape[0]*preds.shape[1])
    modal = stats.mode(preds)[0][0]
    modes["sure"] = targetss[modal]
    preds = np.delete(preds, np.argwhere(preds==modal))
    modal = stats.mode(preds)[0][0]
    modes["unsure"] = targetss[modal]
    print(modes)

    return modes
    

@app.route("/", methods=["GET", "POST"])
def index():
    global model
    if request.method == "POST":
        session["data"] = {"success": False}
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
            print(pickleSize)
            if pickleSize > 300000:
                return redirect(request.url)
            else:
                pass
                audio_data.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                
                X = loadTransform(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                X_img = convertToSpec(X)
                session["data"]["predictions"] = model.predict(X_img)
                session["data"]["predictions"] = predictionConvert(session["data"]["predictions"])
                session["data"]["success"] = True   
        return json.dumps(session["data"]["predictions"])
    else:
        return render_template("index.html")

if __name__ == "__main__":
    try:
        model = load_modela(app.config["models"], version=2)
    except:
        print("Unexpected error:", sys.exc_info()[0])
        model = load_modela(app.config["models"], latest=True)
    app.run(debug=True)