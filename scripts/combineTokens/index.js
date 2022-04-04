"use strict";

const fs = require("fs");

// add FORM.json and OCR.json for a form and use node index.js
// to create token file which combines input from them.
let rawFormData = fs.readFileSync("FORM.json");
let rawOCRData = fs.readFileSync("OCR.json");
let formData = JSON.parse(rawFormData);
let ocrData = JSON.parse(rawOCRData);

let formA11yTokens = [];
Object.keys(formData).forEach((tokenClass) => {
  formData[tokenClass].forEach((token) => {
    formA11yTokens.push({
      top: token.x,
      left: token.y,
      width: token.w,
      height: token.h,
      confidence: 1,
      class: token.jsonClass,
    });
  });
});

ocrData.words.forEach((word) => {
  const coordinates = word[0];
  const x1 = coordinates[0][0];
  const y1 = coordinates[0][1];
  const x2 = coordinates[2][0];
  const y2 = coordinates[2][1];
  formA11yTokens.push({
    top: y1,
    left: x1,
    width: x2 - x1,
    height: y2 - y1,
    text: word[1],
    confidence: word[2],
    class: "ocrText",
  });
});

let data = JSON.stringify(formA11yTokens);
fs.writeFileSync("tokens.json", data);
