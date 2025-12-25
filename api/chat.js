import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export default async function handler(req, res) {
    // 👇👇👇 DÁN KEY GOOGLE VÀO ĐÂY 👇👇👇
    const API_KEY = "AIzaSyDz-WxEJjP84yzecNi8_J_I6LTZx_UKDME"; 

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { inputs } = req.body;

        // --- 1. DỊCH TEENCODE ---
        let cleanText = inputs.toLowerCase();
        
        // Dịch Teencode cơ bản
        cleanText = cleanText.replace(/\./g, ''); // Xóa dấu chấm
        const leet = {'0':'o', '1':'i', '3':'e', '4':'a', '5':'s', '@':'a', '$':'s', '(':'c'};
        for (const [key, val] of Object.entries(leet)) {
            cleanText = cleanText.split(key).join(val);
        }
        cleanText = cleanText.replace(/(?<=\b[a-z])\s+(?=[a-z]\b)/g, ''); // Gộp chữ rời

        // Từ điển viết tắt
        const dict = {
            "cc": "cục cứt", "cmm": "con mẹ mày", "dcm": "địt con mẹ",
            "dm": "địt mẹ", "đm": "địt mẹ", "vcl": "vãi cả lồn",
            "vl": "vãi lồn", "clm": "cái lờ má", "cdmm": "con đĩ mẹ mày",
            "cdcmm": "con đĩ cái mẹ mày", "cmn": "con mẹ nó", 
            "dell": "đéo", "đell": "đéo"
        };
        cleanText = cleanText.split(' ').map(w => dict[w] || w).join(' ');

        // --- 2. CẤU HÌNH BẺ KHÓA AN TOÀN (QUAN TRỌNG) ---
        // Ép Gemini không được chặn câu chửi bậy, phải đọc để phân tích
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        // --- 3. GỌI GEMINI ---
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Dùng model 1.5-flash cho nhanh và ít bị lỗi vặt
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            safetySettings: safetySettings 
        });

        const prompt = `
        Bạn là AI kiểm duyệt. Nhiệm vụ duy nhất là phân loại câu sau: "${cleanText}" (Câu gốc: "${inputs}")
        
        BẮT BUỘC trả về đúng 1 JSON duy nhất theo định dạng này (không giải thích thêm):
        - Nếu an toàn/tích cực: {"label": "LABEL_0", "score": 0.1}
        - Nếu thô tục/chửi thề nhẹ: {"label": "LABEL_1", "score": 0.8}
        - Nếu xúc phạm nặng/thù ghét/nguy hiểm: {"label": "LABEL_2", "score": 0.99}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Lọc sạch JSON (đề phòng Gemini nói nhảm)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);

        return res.status(200).json([data]);

    } catch (error) {
        console.error("Lỗi:", error);
        // Trả về kết quả mặc định nếu AI bị lỗi để web không sập
        return res.status(200).json([{ label: "LABEL_1", score: 0.99, error: "AI từ chối trả lời nhưng chắc chắn là Toxic" }]);
    }
}
