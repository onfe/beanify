const player = document.getElementById('player');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const preview = document.getElementById('preview');
const prevctx = preview.getContext('2d');
const captureButton = document.getElementById('beam');
const result = document.getElementById('result');

const cv = require('opencv.js')

const labels = [
  "Probably not a bean, merhaps.",
  "MINTSORBET",
  "CRANBERRYANDAPPLE",
  "STRAWBERRY",
  "MANGO",
  "MARSHMALLOW",
  "PINKGRAPEFRUIT",
  "LIQUORICE",
  "PINACOLADA",
  "PEACHYPIE",
  "TROPICALPUNCH",
  "WILDCHERRY",
  "BLUEBERRYPIE",
  "BUTTERSCOTCH",
  "GRANNYSMITHAPPLE",
  "SOUTHSEASKIWI",
  "CARAMEL",
  "GRAPE",
  "SOURLEMON",
  "COLA",
  "TANGERINE",
  "BANANASPLIT",
  "COFFEE",
  "STRAWBERRYSMOOTHIE",
  "FRENCHVANILLA",
  "CANDYFLOSS",
  "WATERMELON",
  "PEAR",
  "LEMONANDLIME"
]

canvas.width = 100;
canvas.height = 100;


var model;

tf.loadLayersModel(`${window.location.origin}/model/model.json`).then((a) => { model = a });

const portrait = window.matchMedia("(orientation: portrait)").matches

const constraints = {
  video: {
    width: 400,
    height: 400,
    facingMode: 'environment'
  },
};

captureButton.addEventListener('click', prepareConsent);

var consent;

// get webcam consent
function prepareConsent() {
  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      player.srcObject = stream;
      captureButton.innerHTML = "Beam your bean";
      captureButton.removeEventListener('click', prepareConsent);
      captureButton.addEventListener('click', capture);
      setInterval(beanPreview, 1000);
    });
}

function beanPreview() {
  prevctx.drawImage(player, 0, 0, preview.width, preview.height);
  analyse();
}

function analyse() {
  var hsv = new cv.Mat();
  var out = new cv.MatVector()
  const image = cv.imread('preview');
  cv.cvtColor(image, hsv, cv.COLOR_BGR2HSV, 0);
  cv.split(hsv, out);

  var thresholded = new cv.Mat();
  cv.threshold(out.get(1), thresholded, 0, 255, cv.THRESH_OTSU);

  var preprocess = new cv.MatVector();
  var hi = new cv.Mat();
  cv.medianBlur(thresholded, thresholded, 5);
  cv.findContours(thresholded, preprocess, hi, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

  c = preprocess.get(0)
  var a = cv.contourArea(c);
  if (a > 10) {
    var det = new cv.Mat();
    var rect = cv.boundingRect(c);
    var side = (rect.width < rect.height ? rect.width : rect.height);
    let r = new cv.Rect(rect.x -1, rect.y -1, side + 2, side + 2);
    det = image.roi(r);
    let resized = new cv.Mat();
    cv.resize(det, resized, new cv.Size(100, 100))
    cv.imshow('canvas', resized);
  }
}

function capture() {
  // captureButton.removeEventListener('click', capture);
  const data = tf.browser.fromPixels(context.getImageData(0, 0, canvas.width, canvas.height));
  const prediction = model.predict(data.as4D(1, 100, 100, 3)).as1D().argMax().dataSync()[0];
  const lbl = labels[prediction]
  console.log({lbl, prediction})
  result.innerHTML = labels[prediction]
}

// on button click, capture, rebind the button then hide the player

// export the image to tensorflowjs

// recieve the classification and display it.

// change the button to 'beam another bean', which reloads the page.
