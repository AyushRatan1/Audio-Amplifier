let mediaRecorder;
let recordedChunks = [];

document.getElementById('startRecording').addEventListener('click', startRecording);
document.getElementById('stopRecording').addEventListener('click', stopRecording);

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                document.getElementById('audioOutput').src = audioUrl;
            });

            mediaRecorder.start();
            document.getElementById('startRecording').disabled = true;
            document.getElementById('stopRecording').disabled = false;
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
}

function stopRecording() {
    if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        document.getElementById('startRecording').disabled = false;
        document.getElementById('stopRecording').disabled = true;
    }
}
function amplifyAudio(audioFile) {
    const audioContext = new AudioContext();

    // Read the recorded audio file
    const reader = new FileReader();
    reader.onload = function(e) {
        audioContext.decodeAudioData(e.target.result, function(buffer) {
            // Create a buffer source node
            const source = audioContext.createBufferSource();
            source.buffer = buffer;

            // Create a gain node for amplification
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 55; // Adjust the gain value for higher amplification

            // Connect the nodes
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Start playback
            source.start(0);
        });
    }
    reader.readAsArrayBuffer(audioFile);
}
