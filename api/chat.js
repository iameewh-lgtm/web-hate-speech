// File: api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 👇👇👇 DÁN API KEY CỦA GOOGLE VÀO ĐÂY (Giữ nguyên dấu ngoặc kép) 👇👇👇
    const API_KEY = "AIzaSyDz-WxEJjP84yzecNi8_J_I6LTZx_UKDME"; 

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { inputs } = req.body;
        
        // Khởi tạo Google Gemini
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Dạy Gemini cách đánh giá (Prompt Engineering)
        const prompt = `
        Bạn là AI kiểm duyệt nội dung (Content Moderator) chuyên về tiếng Việt.
        Hãy phân tích câu bình luận sau: "${inputs}"
        
        Yêu cầu trả về kết quả dưới dạng JSON chính xác như sau (không giải thích gì thêm):
        - Nếu câu bình luận an toàn/tích cực: {"label": "LABEL_0", "score": 0.99}
        - Nếu câu bình luận thô tục/xúc phạm nhẹ: {"label": "LABEL_1", "score": 0.95}
        - Nếu câu bình luận thù ghét/nguy hiểm/chửi bới nặng nề: {"label": "LABEL_2", "score": 0.99}
        
        Chỉ trả về đúng chuỗi JSON.
        `;

        // Gửi lệnh cho Google
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Lọc lấy phần JSON sạch từ câu trả lời của Google
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Google trả về sai định dạng");
        
        const data = JSON.parse(jsonMatch[0]);

        // Trả về cho Web (dạng mảng để giống hệt Hugging Face cũ, web không cần sửa giao diện)
        return res.status(200).json([data]);

    } catch (error) {
        console.error("Lỗi Google:", error);
        return res.status(500).json({ error: "Lỗi Server: " + error.message });
    }
}
