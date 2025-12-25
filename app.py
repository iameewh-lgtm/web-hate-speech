import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generative_ai as genai

# 👇👇👇 DÁN API KEY GOOGLE CỦA BẠN VÀO ĐÂY 👇👇👇
API_KEY = "AIzaSyDz-WxEJjP84yzecNi8_J_I6LTZx_UKDME" 
genai.configure(api_key=API_KEY)

app = Flask(__name__)
CORS(app) # Cho phép mọi web kết nối vào

# --- 1. BỘ TỪ ĐIỂN DỊCH TEENCODE ---
teencode_dict = {
    "cc": "cục cứt", "cmm": "con mẹ mày", "dcm": "địt con mẹ", 
    "dm": "địt mẹ", "đm": "địt mẹ", "vcl": "vãi cả lồn", 
    "vl": "vãi lồn", "clm": "cái lờ má", 
    "cdmm": "con đĩ mẹ mày", "cdcmm": "con đĩ cái mẹ mày",
    "cmn": "con mẹ nó", "ml": "mặt lồn", 
    "dell": "đéo", "đell": "đéo", "m": "mày", "t": "tao"
}

# --- 2. HÀM DỊCH (Làm sạch văn bản) ---
def clean_text(text):
    original = text
    text = text.lower()

    # Xử lý số thay chữ (0 -> o)
    leetspeak = {'0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '@': 'a', '$': 's', '(': 'c'}
    for k, v in leetspeak.items():
        text = text.replace(k, v)

    # Xóa dấu chấm (c.m.m -> cmm)
    text = text.replace('.', '')

    # Gộp chữ cái rời rạc (c o n -> con)
    text = re.sub(r'(?<=\b[a-z])\s+(?=[a-z]\b)', '', text)

    # Dịch từ viết tắt
    words = text.split()
    new_words = [teencode_dict.get(w, w) for w in words]
    return " ".join(new_words)

# --- 3. API XỬ LÝ ---
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        raw_text = data.get('inputs', '')
        
        # Bước 1: Dịch Teencode
        cleaned_text = clean_text(raw_text)
        print(f"Dịch: {raw_text} -> {cleaned_text}")

        # Bước 2: Hỏi Google Gemini
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Phân tích câu: "{cleaned_text}" (Câu gốc là: "{raw_text}")
        Yêu cầu trả về JSON chính xác:
        - Nếu an toàn: {{"label": "LABEL_0", "score": 0.99}}
        - Nếu xúc phạm/thô tục: {{"label": "LABEL_1", "score": 0.95}}
        - Nếu thù ghét/nguy hiểm: {{"label": "LABEL_2", "score": 0.99}}
        Chỉ trả về JSON, không giải thích.
        """
        response = model.generate_content(prompt)
        
        # Lọc lấy JSON
        import json
        json_str = response.text.strip()
        if '```json' in json_str:
            json_str = json_str.split('```json')[1].split('```')[0]
        elif '```' in json_str:
            json_str = json_str.split('```')[1].split('```')[0]
            
        result = json.loads(json_str)
        return jsonify([result])

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chạy Server trên cổng mà Render yêu cầu
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
