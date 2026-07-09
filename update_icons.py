import os
from PIL import Image

src_img = r"C:\Users\infomax\.gemini\antigravity\brain\96b3e5b8-d6bd-452d-b2e3-fb5b469ddb70\insight_app_icon_1783587332389.png"
dest_dir = r"d:\Korea Industry\InsightDashboard\public"

img = Image.open(src_img)

# Ensure it's a square by cropping the center if needed
width, height = img.size
new_size = min(width, height)
left = (width - new_size) / 2
top = (height - new_size) / 2
right = (width + new_size) / 2
bottom = (height + new_size) / 2
img_cropped = img.crop((left, top, right, bottom))

# Resize to 512x512
img_512 = img_cropped.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save(os.path.join(dest_dir, "pwa-512x512.png"), "PNG")

# Resize to 192x192
img_192 = img_cropped.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save(os.path.join(dest_dir, "pwa-192x192.png"), "PNG")

print("App icons updated successfully!")
