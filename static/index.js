const record = document.querySelector('.recButton');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.app');
var recording = false;

let audioCtx;
const canvasCtx = canvas.getContext("2d");

//check for IOS
function isIos() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

starter = document.querySelector(".instruct");

setTimeout(()=>{
    posTop = starter.scrollIntoView({behavior: "smooth", block: "start"});

}, 2000)
    

if(!isIos()){
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia ){
        var timee = 10;
        console.log('getUserMedia supported.');
        const constraints = { audio: true };
        let chunks = [];
        let onSuccess = function(stream) {
            const mediaRecorder = new MediaRecorder(stream);
            visualize(stream);
            var timeee;
            var timeOut;
            record.onclick = ()=>{
                if (recording == false){
                    recording = true
                    mediaRecorder.start();
                    console.log(mediaRecorder.state);
                    // console.log("recorder started");
                    record.style.background = "var(--success)";
                    record.textContent = "STOP: " + timee.toString(10)
                    console.log(timee)
                    timee -= 1
                    timeee = setInterval(function(){
                        record.textContent = "STOP: " + timee.toString(10)
                        console.log(timee)
                        timee -= 1
                    }, 1000)
                    timeOut = setTimeout(function(){
                        recording = false
                        mediaRecorder.stop();
                        record.textContent = "REC";
                        record.style.background = "var(--secondary)";
                        clearInterval(timeee)
                        timee = 10;
                    }, 10000)
                    recording = true
                
                }else if(recording == true){
                    clearInterval(timeee);
                    clearTimeout(timeOut);
                    mediaRecorder.stop();
                    record.textContent = "REC";
                    record.style.background = "#B33951";
                    timee = 10;
                    recording = false

                }
            
            }
            mediaRecorder.onstop = function(e) {
                const blob = new Blob(chunks, { 'type' : 'audio/wav; codecs=opus' });
                chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                console.log("recorder stopped");
                var filename = new Date().toISOString();
                var xhr = new XMLHttpRequest();
                // xhr.overrideMimeType('application/json');
                xhr.onload = function(e) {
                    if (this.readyState === 4) {
                        console.log("Server returned: ", e.target.responseText);
                        var resp = JSON.parse(e.target.responseText)
                        var liLeft = document.querySelectorAll(".card-title")[0]
                        var liRight = document.querySelectorAll(".card-title")[1]
                        liLeft.childNodes[0].textContent = resp["unsure"]
                        liRight.childNodes[0].textContent = resp["sure"]
                        liLeft.classList.remove("thirdFade");
                        liRight.classList.remove("thirdFade");
                        liLeft.classList.add("thirdFade");
                        liRight.classList.add("thirdFade");

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
            alert('The following error occured: ' + err + "\n Please allow access to your microphone");
        }
          
        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    } else {
        alert('getUserMedia not supported on your browser! No worries, switching to your devices native recorder');
        var audioIn = document.createElement("input");
        audioIn.type="file"
        audioIn.accept = "audio/*";
        audioIn.capture= true;
        audioIn.id = "#recorderIn";
        
        audioIn.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            // Do something with the audio file.
            var filename = new Date().toISOString();
            var xhr = new XMLHttpRequest();
            xhr.onload = function(e) {
                if (this.readyState === 4) {
                    console.log("Server returned: ", e.target.responseText);
                    var resp = JSON.parse(e.target.responseText)
                    var liLeft = document.querySelectorAll(".card-title")[0]
                    var liRight = document.querySelectorAll(".card-title")[1]
                    liLeft.childNodes[0].textContent = resp["unsure"]
                    liRight.childNodes[0].textContent = resp["sure"]
                    liLeft.classList.remove("thirdFade");
                    liRight.classList.remove("thirdFade");
                    liLeft.classList.add("thirdFade");
                    liRight.classList.add("thirdFade");
                    
                }
            };
            var fd = new FormData();
            fd.append("audio_data", file, filename);
            xhr.open("POST", "/", true);
            xhr.send(fd);
        });
        record.addEventListener("click", (e)=>{
            audioIn.click();
        })
    }
}else{
    var audioIn = document.createElement("input");
    audioIn.type="file"
    audioIn.accept = "audio/*";
    audioIn.capture= true;
    audioIn.id = "#recorderIn";
    
    audioIn.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        // Do something with the audio file.
        var filename = new Date().toISOString();
        var xhr = new XMLHttpRequest();
        xhr.onload = function(e) {
            if (this.readyState === 4) {
                console.log("Server returned: ", e.target.responseText);
                var resp = JSON.parse(e.target.responseText)
                var liLeft = document.querySelectorAll(".card-title")[0]
                var liRight = document.querySelectorAll(".card-title")[1]
                liLeft.childNodes[0].textContent = resp["unsure"]
                liRight.childNodes[0].textContent = resp["sure"]
                liLeft.classList.remove("thirdFade");
                liRight.classList.remove("thirdFade");
                liLeft.classList.add("thirdFade");
                liRight.classList.add("thirdFade");
                
            }
        };
        var fd = new FormData();
        fd.append("audio_data", file, filename);
        xhr.open("POST", "/", true);
        xhr.send(fd);
    });
    record.addEventListener("click", (e)=>{
        audioIn.click();
    })
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
setInterval(()=>{
    canvasCtx.clearRect(0,0,canvas.width, canvas.height);
}, 25)

function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);
    // canvasCtx.fillStyle = "#80A1C100";
    // canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

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