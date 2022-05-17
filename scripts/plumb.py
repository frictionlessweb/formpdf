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

all_predictions = []
# here we can define which of the token classes we want to include such as TextRun, Widget, ChoiceGroups.
included_token_classes = ["Widget"]
for page_data in form_data:
    mapped_page_data = []
    for token_class in included_token_classes:
        for token in page_data[token_class]:
            mapped_page_data.append({
                "top": token["y"] * form_scale_factor,
                "left": token["x"] * form_scale_factor,
                "width": token["w"] * form_scale_factor,
                "height": token["h"] * form_scale_factor,
                "class": token["jsonClass"],
            })
    all_predictions.append(mapped_page_data)

with open("../ui/src/app/tokens.json", "w", encoding="utf-8") as f:
    json.dump(all_tokens, f, ensure_ascii=False, indent=4)

with open("../ui/src/app/predictions.json", "w", encoding="utf-8") as f:
    json.dump(all_predictions, f, ensure_ascii=False, indent=4)
