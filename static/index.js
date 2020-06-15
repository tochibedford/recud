const record = document.querySelector('.buttonRec');
// const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.app');
var recording = false;
const textRec = document.querySelector('.textRec');

let audioCtx;
const canvasCtx = canvas.getContext("2d");

// var flashInt = setInterval(() => {
//     if (flashes){
//         setTimeout(() => {
//             flashes.style.display = "false";
//         }, 5000);
//     }
// }, 5000);

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    var timee = 9;
    console.log('getUserMedia supported.');
    const constraints = { audio: true };
    let chunks = [];
    let onSuccess = function(stream) {
        const mediaRecorder = new MediaRecorder(stream);
    
        visualize(stream);
    
        record.onclick = function() {
            if (recording === false){
                
                mediaRecorder.start();
                console.log(mediaRecorder.state);
                // console.log("recorder started");
                record.style.background = "rgb(97, 13, 30)";
                var timeOut = setTimeout(function(){
                    recording = false
                    mediaRecorder.stop()
                    textRec.textContent = "REC";
                    record.style.background = "#B33951";
                    timee = 9;
                    clearInterval(timeee)
                }, 10000)
                var timeee = setInterval(function(){
                    textRec.textContent = "STOP: " + timee.toString(10)
                    console.log(timee)
                    timee -= 1
                }, 1000)
                
                recording = true;
            
            }else{
                recording = false
                mediaRecorder.stop();
                // console.log(mediaRecorder.state);
                textRec.textContent = "REC";
                record.style.background = "#B33951";
                
                // console.log("recorder stopped");

            }
        }

        mediaRecorder.onstop = function(e) {
            // console.log("data available after MediaRecorder.stop() called.");

            // audio.setAttribute('controls', '');
      
            // audio.controls = true;
            const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
            chunks = [];
            const audioURL = window.URL.createObjectURL(blob);
            // audio.src = audioURL;
            // console.log(chunks)
            console.log("recorder stopped");
            var filename = new Date().toISOString();
            var xhr = new XMLHttpRequest();
            xhr.onload = function(e) {
                if (this.readyState === 4) {
                    console.log("Server returned: ", e.target.responseText);
                }
            };
            var fd = new FormData();
            fd.append("audio_data", blob, filename);
            xhr.open("POST", "/", true);
            xhr.send(fd);
          }
      
          mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
            
          }
    }
      
        let onError = function(err) {
          console.log('The following error occured: ' + err);
        }
      
        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    } else {
        console.log('getUserMedia not supported on your browser!');
    }

function visualize(stream) {
if(!audioCtx) {
    audioCtx = new AudioContext();
}

const source = audioCtx.createMediaStreamSource(stream);

const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

source.connect(analyser);
//analyser.connect(audioCtx.destination);

draw()

function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = '#E3D081';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 3;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

    let v = dataArray[i] / 128.0;
    let y = v * HEIGHT/2;

    if(i === 0) {
        canvasCtx.moveTo(x, y);
    } else {
        canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

}
}

window.onresize = function() {
canvas.width = mainSection.offsetWidth;
}

window.onresize();