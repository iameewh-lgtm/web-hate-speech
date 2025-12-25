// File: api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 👇👇👇 DÁN API KEY CỦA GOOGLE VÀO ĐÂY 👇👇👇
    const API_KEY = "AIzaSyDz-WxEJjP84yzecNi8_J_I6LTZx_UKDME"; 

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { inputs } = req.body;
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getModel({ model: "gemini-pro" });

        // Ra lệnh cho Gemini đóng vai là máy kiểm duyệt
        const prompt = `
        Bạn là một hệ thống kiểm duyệt nội dung tiếng Việt (AI Content Moderator).
        Hãy phân tích câu sau: "${inputs}"
        
        Nhiệm vụ:
        1. Xác định xem câu này có độc hại (toxic), chửi bậy, hay thù ghét không.
        2. Trả về kết quả CHÍNH XÁC ở định dạng JSON như sau (không thêm chữ gì khác):
        
        Nếu an toàn: {"label": "LABEL_0", "score": 0.99}
        Nếu xúc phạm nhẹ/thô tục: {"label": "LABEL_1", "score": 0.95}
        Nếu thù ghét/nguy hiểm: {"label": "LABEL_2", "score": 0.99}
        
        Chỉ trả về JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Lọc lấy phần JSON sạch (đề phòng Gemini nói nhảm)
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0];
        const data = JSON.parse(jsonStr || '{"label": "LABEL_0", "score": 0.5}');

        // Trả về định dạng y hệt cái cũ để web không bị lỗi
        return res.status(200).json([data]);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Lỗi Google: " + error.message });
    }
}
