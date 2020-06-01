const form = document.querySelector('form');
let gallery = document.getElementById("gallery")
let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");
let logElement = document.getElementById("log");
let upload = document.getElementById("uploadButton");

let recordingTimeMS = 10000;

function log(msg) {
  logElement.innerHTML += msg + "\n";
}
 
function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let data = [];
 
  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();
  log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");
 
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state == "recording" && recorder.stop()
  );
 
  return Promise.all([
    stopped,
    recorded
  ])
  .then(() => data);
}

function stop(stream) {
  stream.getTracks().forEach(track => track.stop());
}

startButton.addEventListener("click", function() {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    preview.srcObject = stream;
    downloadButton.href = stream;
    preview.captureStream = preview.captureStream;
    return new Promise(resolve => preview.onplaying = resolve);
  }).then(() => startRecording(preview.captureStream(), recordingTimeMS))
  .then (recordedChunks => {
    let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    recording.src = URL.createObjectURL(recordedBlob);
    downloadButton.href = recording.src;
    downloadButton.download = "RecordedVideo.webm";
    
    log("Successfully recorded \n" + recordedBlob.size + " bytes of \n" +
        recordedBlob.type + " media.");
  })
  .catch(log);
}, false);

stopButton.addEventListener("click", function() {
  stop(preview.srcObject);
}, false);

downloadButton.addEventListener("click", function() {
  log("Successfully downloaded. \n");
}, false);

form.addEventListener('submit', e => {
  e.preventDefault();
  
  const files = document.querySelector('[type=file]').files;
  const formData = new FormData();
  
  for (let i = 0; i < data.length; i++) {
    let data = files[i];
    formData.append('files[]', data);
  }

  gallery.src = data;

})