import subprocess
import os
import numpy as np
from librosa import load
from librosa.util import fix_length
from librosa.feature import melspectrogram

def convertFile(audioChunk):
    newFile = audioChunk[:-4]+".wav"
    arger = "ffmpeg/bin/ffmpeg.exe -hide_banner -loglevel panic"
    args = ["ffmpeg/bin/ffmpeg.exe", "-i", audioChunk, newFile]
    subprocess.call(arger.split(" "))
    subprocess.call(args)
    os.remove(audioChunk)
    return newFile

def loadTransform(audioChunk):
    if audioChunk.endswith(".wav"):
        windowNum = 2
        sound = load(audioChunk, sr=16000)
        window = windowNum*16000
        X = []
        a, b = 0, 80000
        while len(sound[0])-b >= 0:
            X.append(sound[0][a:b])
            a += window
            b += window
        X.append(sound[0][a:b])
        X[-1] = fix_length(X[-1], 80000)
        os.remove(audioChunk)
        X = np.array(X)
        return X
    else:
        newFile = convertFile(audioChunk)
        try:
            X = loadTransform(newFile)
            return X
        except FileNotFoundError:
            return "Error with processing your request"

def convertToSpec(xBible):
    X_img = []
    for sou in xBible:
        soundSpec = melspectrogram(sou, sr=16000)
        X_img.append(soundSpec)
    X_img = np.array(X_img)
    X_img = X_img.reshape((X_img.shape[0], X_img.shape[1], X_img.shape[2], 1))
    X_img = X_img/255
    return X_img


# def predict(model, X_img):
#     model.predict

# X = loadTransform("uploads/2020-06-13T173154.003Z.ogg")
# X_img = convertToSpec(X)
# model = load_modela("./models", latest=True)
# print(model.predict(X_img))