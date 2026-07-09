import os
from PIL import Image, ImageDraw

def create_icon(size, filename):
    img = Image.new('RGB', (size, size), color='#0f1115')
    draw = ImageDraw.Draw(img)
    # Draw a simple purple square
    margin = size // 5
    draw.rounded_rectangle([margin, margin, size-margin, size-margin], radius=size//10, fill='#a855f7')
    # Save
    out_path = os.path.join(r"d:\Korea Industry\InsightDashboard\public", filename)
    img.save(out_path)

create_icon(192, "pwa-192x192.png")
create_icon(512, "pwa-512x512.png")
print("Icons generated")
