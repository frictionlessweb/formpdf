# Usage: python render [image] [json]
# This file can be used to visualise the tokens in a PDF file.

import cv2
import json
import sys

sectiontypes = ["Section","TextBlock","TextRun","Field","Widget","ChoiceGroup","ChoiceField","ChoiceGroupTitle","SectionTitle","Header","HeaderTitle","Image","Footer"]
sectiontype = "ChoiceGroup"
img = cv2.imread(sys.argv[1])
color = (255, 0, 0)
json_data = json.loads(open(sys.argv[2]).read())
for j in json_data[sectiontype]:
    print(j)
    x =int(j["x"])
    y =int(j["y"])
    w =int(j["w"])
    h =int(j["h"])
    cv2.rectangle(img, pt1=(x,y),pt2=(x+w, y+h),color=color,thickness=2)
cv2.namedWindow("name",0)
cv2.imshow("name",img)
cv2.waitKey()
