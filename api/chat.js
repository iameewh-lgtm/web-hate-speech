// File: api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 👇👇👇 DÁN KEY GOOGLE CỦA BẠN VÀO ĐÂY 👇👇👇
    const API_KEY = "AIzaSyDz-WxEJjP84yzecNi8_J_I6LTZx_UKDME"; 

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { inputs } = req.body;
        
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // 🛠️ QUAY VỀ "GEMINI-PRO" (Bản ổn định nhất, không bao giờ lỗi vặt)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Bạn là AI kiểm duyệt nội dung (Content Moderator) chuyên về tiếng Việt.
        Hãy phân tích câu: "${inputs}"
        
        Yêu cầu trả về JSON chính xác (không thêm markdown, không thêm chữ):
        - Nếu an toàn: {"label": "LABEL_0", "score": 0.99}
        - Nếu xúc phạm: {"label": "LABEL_1", "score": 0.95}
        - Nếu thù ghét: {"label": "LABEL_2", "score": 0.99}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Làm sạch chuỗi JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const data = JSON.parse(text);

        return res.status(200).json([data]);

    } catch (error) {
        console.error("Lỗi Google:", error);
        return res.status(500).json({ error: "Lỗi Server: " + error.message });
    }
}
