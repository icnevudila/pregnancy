# MOMORA 3D Mesh Generator (TripoSR / Stability AI)
# 2D Görseli 15 saniyede ücretsiz olarak .GLB 3D modele dönüştürür.
# Kullanım: py scripts/convert_to_3d.py assets/fetus_w20.png

import sys
import os
import shutil

# Windows konsolunda UTF-8 çıktıyı garantiye al
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from gradio_client import Client, handle_file

def convert_image_to_3d(image_path, output_glb=None):
    if not os.path.exists(image_path):
        print(f"HATA: Dosya bulunamadi: {image_path}")
        sys.exit(1)
        
    if not output_glb:
        base, _ = os.path.splitext(image_path)
        output_glb = base + ".glb"

    print(f"\n[MOMORA 3D] Donusum Basliyor: {os.path.basename(image_path)} -> {os.path.basename(output_glb)}")
    print("Stability AI / TripoSR 3D API'sine baglaniliyor...")
    
    try:
        client = Client("stabilityai/TripoSR", httpx_kwargs={"timeout": 180.0})
        
        print("Adim 1: Arka plan temizleme ve on isleme...")
        preprocessed = client.predict(
            handle_file(image_path),
            True,  # remove_background
            0.85,  # foreground_ratio
            api_name="/preprocess"
        )
        
        print("Adim 2: 3D Poligon Orgusu & Doku Cikariliyor (Marching Cubes 160)...")
        result = client.predict(
            handle_file(preprocessed),
            160,   # resolution (daha hizli ve kasmadan calisir)
            api_name="/generate"
        )
        
        obj_path, glb_path = result
        shutil.copyfile(glb_path, output_glb)
        
        size_kb = os.path.getsize(output_glb) / 1024
        print(f"\n[BASARILI] 3D Model hazirlandi: {output_glb} ({size_kb:.1f} KB)\n")
        return output_glb
        
    except Exception as e:
        print(f"HATA olustu: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Kullanim: py scripts/convert_to_3d.py <gorsel_yolu> [cikti_glb_yolu]")
        sys.exit(1)
        
    img = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else None
    convert_image_to_3d(img, out)
