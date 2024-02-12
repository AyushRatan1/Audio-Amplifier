let mediaRecorder;
let recordedChunks = [];
let amplifiedUrl; // Store amplified audio URL

document.getElementById('startRecording').addEventListener('click', startRecording);
document.getElementById('stopRecording').addEventListener('click', stopRecording);
document.getElementById('playAmplified').addEventListener('click', playAmplified);

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

                // Amplified output
                amplifyAudio(audioBlob, amplifiedBlob => {
                    amplifiedUrl = URL.createObjectURL(amplifiedBlob);
                    const amplifiedOutput = document.getElementById('amplifiedOutput');
                    amplifiedOutput.controls = true; // Ensure controls are shown
                });

                // Normal output
                const audioUrl = URL.createObjectURL(audioBlob);
                document.getElementById('normalAudioOutput').src = audioUrl;

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

function amplifyAudio(inputBlob, callback) {
    const audioContext = new AudioContext();
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
        audioContext.decodeAudioData(fileReader.result, buffer => {
            const audioBuffer = audioContext.createBufferSource();
            audioBuffer.buffer = buffer;
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 30; // Adjust the gain value as needed for amplification
            audioBuffer.connect(gainNode);
            gainNode.connect(audioContext.destination);
            audioBuffer.start();
            audioContext.startRendering().then(renderedBuffer => {
                const audioBlob = new Blob([renderedBuffer.getChannelData(0)], { type: 'audio/wav' });
                callback(audioBlob);
            });
        });
    };
    fileReader.readAsArrayBuffer(inputBlob);
}



