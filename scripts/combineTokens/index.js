"use strict";

const fs = require("fs");

// add FORM.json and OCR.json for a form and use `node index.js`
// to create token file which combines input from them.

let rawFormData = fs.readFileSync("FORM.json");
let rawOCRData = fs.readFileSync("OCR.json");
let formData = JSON.parse(rawFormData);
let ocrData = JSON.parse(rawOCRData);

let formA11yTokens = [];
let formDataScaleFactor = 0.36;

Object.keys(formData).forEach((tokenClass) => {
  formData[tokenClass].forEach((token) => {
    // if (token.jsonClass.includes("Field")) {
    if (token.jsonClass === "Field") {
      formA11yTokens.push({
        top: token.y * formDataScaleFactor,
        left: token.x * formDataScaleFactor,
        width: token.w * formDataScaleFactor,
        height: token.h * formDataScaleFactor,
        confidence: 1,
        class: token.jsonClass,
      });
    }
  });
});

// This will be used for the OCR jsons generated using generateOCRToken script.
// ocrData[0].forEach(({ top, left, width, height, text }) => {
//   formA11yTokens.push({
//     top,
//     left,
//     width,
//     height,
//     text,
//     confidence: null,
//     class: "ocrText",
//   });
// });

let data = JSON.stringify([formA11yTokens]);
fs.writeFileSync("../../src/app/tokens.json", data);
