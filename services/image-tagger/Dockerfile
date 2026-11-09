FROM python:3.12-slim

RUN pip install --no-cache-dir onnxruntime==1.20.1 pillow numpy pandas huggingface_hub opencv-python-headless

# モデルはイメージに入れておく（起動のたびにダウンロードしない）
RUN python -c "from huggingface_hub import hf_hub_download as d; [d('SmilingWolf/wd-vit-tagger-v3', f, local_dir='/model') for f in ('model.onnx', 'selected_tags.csv')]"
COPY app.py /app/app.py

ENV MODEL_DIR=/model PORT=8510 THREADS=2
EXPOSE 8510
CMD ["python", "/app/app.py"]
