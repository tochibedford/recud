import librosa
import numpy as np
import os

def loadTransform(audioChunk):
    X = []
    sound = librosa.load(audioChunk, sr=16000)
    for i in sound[0]:
        print(i)
    # X.append(sound[0])

loadTransform("uploads/2020-06-13T173154.003Z.ogg")