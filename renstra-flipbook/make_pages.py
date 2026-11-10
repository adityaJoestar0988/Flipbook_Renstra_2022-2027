import glob, json, pathlib
import fitz                      # PyMuPDF
from PIL import Image

PDF = glob.glob("*.pdf")[0]
OUT = pathlib.Path("public/pages")
OUT.mkdir(parents=True, exist_ok=True)

W, H = 892, 1275                 # rasio 595:850, ukuran gambar akhir
doc = fitz.open(PDF)
paths = []

def letterbox(im):
    im = im.copy()
    im.thumbnail((W, H))
    canvas = Image.new("RGB", (W, H), "white")
    canvas.paste(im, ((W - im.width) // 2, (H - im.height) // 2))
    return canvas

def save(im, name):
    letterbox(im).save(OUT / name, "JPEG", quality=78, optimize=True)
    paths.append(f"/pages/{name}")

for i, page in enumerate(doc, start=1):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    save(im, f"p{i:03d}.jpg")
    print("lembar", i, "selesai")

if len(paths) % 2:               # genapkan agar sampul belakang pas
    Image.new("RGB", (W, H), "white").save(OUT / "blank.jpg")
    paths.append("/pages/blank.jpg")

pathlib.Path("src/pages.json").write_text(json.dumps(paths, indent=1))
print("total halaman:", len(paths))