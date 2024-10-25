const URL = "https://teachablemachine.withgoogle.com/models/UL5tzzD3B/";
let recognizer;
let canvas, context;
let mouseX = 0, mouseY = 0;
let defaultColor = "#080708"; // Default color for circles
let currentColor = defaultColor; // Current color for the circles
let isDrawing = false; // Flag to track when mouse is held down

// Create the model
async function createModel() {
    const checkpointURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    const recognizer = speechCommands.create(
        "BROWSER_FFT",
        undefined,
        checkpointURL,
        metadataURL
    );

    await recognizer.ensureModelLoaded();
    return recognizer;
}

// Draw a circle at specified coordinates with a specified color
function drawCircle(x, y, color) {
    context.beginPath();
    context.arc(x, y, 20, 0, Math.PI * 2); // radius of 20
    context.fillStyle = color; // Set the color
    context.fill();
    context.closePath();
}

// Update mouse position
function updateMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
}

// Initialize the app
async function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    // When mouse is pressed down, start drawing
    canvas.addEventListener('mousedown', function(event) {
        isDrawing = true;
        updateMousePosition(event);
        drawCircle(mouseX, mouseY, currentColor); // Draw initial circle on mousedown
    });

    // When mouse is released, stop drawing
    canvas.addEventListener('mouseup', function() {
        isDrawing = false;
    });

    // When mouse is moved, keep drawing if the mouse button is pressed down
    canvas.addEventListener('mousemove', function(event) {
        if (isDrawing) {
            updateMousePosition(event);
            drawCircle(mouseX, mouseY, currentColor);
        }
    });

    recognizer = await createModel();
    const classLabels = recognizer.wordLabels();
    const labelContainer = document.getElementById("label-container");
    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    recognizer.listen(result => {
        const scores = result.scores;
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;

            // Change the color based on detected commands
            if (i !== 0 && result.scores[i] > 0.75) { // Check for class other than background noise
                switch (i) {
                    case 1: currentColor = "#3772ff"; break;    // Second class
                    case 2: currentColor = "#fdca40"; break; // Third class
                    case 3: currentColor = "#df2935"; break;    // Fourth class
                    case 4: currentColor = "#080708"; break;  // Fifth class
                }
            }
        }
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50
    });
}

// Start the application
init();