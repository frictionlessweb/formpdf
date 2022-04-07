#!/usr/bin/env python3
import pytesseract
from pdf2image import convert_from_path
import json

# A quick script to extract the relevant tokens out of a PDF file. You won't
# need to run this unless you change the PDF file. If you do, then you will
# have to install:
#
# - python3
# - tesseract
#
# Then you'll need to run:
#
# pip install -r requirements.txt
#
# After you've finished that, you'll want to make a copy of the PDF file you
# want to analyze and place the copy into this directory. Then, rename the
# copy to "plumb.pdf" and run:
#
# python plumb.py
#
# That will emit a JSON with the relevant token information which you can
# copy paste with the relevant UI code.

DPI = 450
images = convert_from_path("form.pdf", DPI)
all_tokens = []
ocr_scale_factor = 0.16

for i, image in enumerate(images):
    image
    details = pytesseract.image_to_data(image, output_type="dict")
    num_details = len(details["top"])
    tokens = [
        {
            "top": details["top"][i] * ocr_scale_factor,
            "left": details["left"][i] * ocr_scale_factor,
            "width": details["width"][i] * ocr_scale_factor,
            "height": details["height"][i] * ocr_scale_factor,
            "text": details["text"][i],
            "class": "text",
        }
        for i in range(num_details)
        if details["text"][i].strip() != ""
    ]
    all_tokens.append(tokens)

form_data = json.load(open("form.json"))
form_scale_factor = 0.36

# FIXME: Here we don't take into account the page number. We need to fix this!
all_predictions=[]
for token_class in form_data.keys():
    for token in form_data[token_class]:
        if(token["jsonClass"] == "Widget"):
            all_predictions.append({
                "top": token["y"] * form_scale_factor,
                "left": token["x"] * form_scale_factor,
                "width": token["w"] * form_scale_factor,
                "height": token["h"] * form_scale_factor,
                "class": token["jsonClass"],
            })

with open("../src/app/tokens.json", "w", encoding="utf-8") as f:
    json.dump(all_tokens, f, ensure_ascii=False, indent=4)
    
with open("../src/app/predictions.json", "w", encoding="utf-8") as f:
    json.dump(all_predictions, f, ensure_ascii=False, indent=4)
