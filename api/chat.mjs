// File: api/chat.mjs
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export default async function handler(req, res) {
    // 👇👇👇 DÁN API KEY CỦA BẠN VÀO ĐÂY 👇👇👇
    const API_KEY = "AIzaSyDz-WxEJjP84yzecNi8_J_I6LTZx_UKDME"; 

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { inputs } = req.body;

        // 1. Dịch Teencode (Python chuyển sang JS)
        let cleanText = inputs.toLowerCase()
            .replace(/\./g, '') // Xóa dấu chấm
            .replace(/(?<=\b[a-z])\s+(?=[a-z]\b)/g, ''); // Gộp chữ rời

        // Từ điển Teencode
        const dict = {
            "cc": "cục cứt", "cmm": "con mẹ mày", "dcm": "địt con mẹ",
            "dm": "địt mẹ", "đm": "địt mẹ", "vcl": "vãi cả lồn",
            "vl": "vãi lồn", "clm": "cái lờ má", "cdmm": "con đĩ mẹ mày",
            "cdcmm": "con đĩ cái mẹ mày", "cmn": "con mẹ nó", 
            "dell": "đéo", "đell": "đéo"
        };
        cleanText = cleanText.split(' ').map(w => dict[w] || w).join(' ');

        // 2. Cấu hình tắt Safety (Để không bị lỗi khi check câu chửi)
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        // 3. Gọi Gemini 1.5 Flash (Nhanh + Rẻ)
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            safetySettings: safetySettings
        });

        const prompt = `Phân loại câu này: "${cleanText}" (Gốc: "${inputs}"). 
        Chỉ trả về JSON: {"label": "LABEL_0" (sạch) hoặc "LABEL_1" (xúc phạm) hoặc "LABEL_2" (thù ghét), "score": 0.99}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();
        
        const data = JSON.parse(text);
        return res.status(200).json([data]);

    } catch (error) {
        console.error("Lỗi:", error);
        // Trả về kết quả mặc định để Web KHÔNG BAO GIỜ SẬP
        return res.status(200).json([
            { label: "LABEL_1", score: 0.99, debug_info: "AI chặn hoặc lỗi, nhưng coi như Toxic" }
        ]);
    }
}
