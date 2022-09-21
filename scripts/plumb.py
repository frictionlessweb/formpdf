#!/usr/bin/env python3
import pytesseract
from pdf2image import convert_from_path
import json
import shutil

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
# copy to "form.pdf" and run:
#
# python plumb.py
#
# That will emit a JSON with the relevant token information which you can
# copy paste with the relevant UI code.

# TEXT_TOKENS
DPI = 450
# Size of 1700,2200 is used because field_token dataset's dimensions are based on 1700 X 2200 resolution PNG form image.
images = convert_from_path("form.pdf", DPI, size=(1700, 2200))
all_tokens = []

for i, image in enumerate(images):
    details = pytesseract.image_to_data(image, output_type="dict")
    num_details = len(details["top"])
    tokens = [
        {
            "top": details["top"][i],
            "left": details["left"][i],
            "width": details["width"][i],
            "height": details["height"][i],
            "text": details["text"][i],
            "class": "text",
        }
        for i in range(num_details)
        if details["text"][i].strip() != ""
    ]
    all_tokens.append(tokens)

with open("../ui/src/app/tokens.json", "w", encoding="utf-8") as f:
    json.dump(all_tokens, f, ensure_ascii=False, indent=4)

# FIELD_TOKENS
# The dimensions in this form.json file from the flamingo dataset are based on 1700 X 2200 resolution PNG form image
form_data = json.load(open("form.json"))

all_predictions = []
# Here we can define which of the token classes we want to include such as TextRun, Widget, ChoiceGroups.
included_token_classes = ["Widget"]
for page_data in form_data:
    mapped_page_data = []
    for token_class in included_token_classes:
        for token in page_data[token_class]:
            mapped_page_data.append(
                {
                    "top": token["y"],
                    "left": token["x"],
                    "width": token["w"],
                    "height": token["h"],
                    "class": token["jsonClass"],
                }
            )
    all_predictions.append(mapped_page_data)

with open("../ui/src/app/predictions.json", "w", encoding="utf-8") as f:
    json.dump(all_predictions, f, ensure_ascii=False, indent=4)

# This copies form.pdf in the ui/public folder as sample_form.pdf, which is used in UI for rendering.
shutil.copyfile("form.pdf", "../ui/public/sample_form.pdf")
