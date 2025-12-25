import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 👇👇👇 DÁN KEY GOOGLE VÀO ĐÂY 👇👇👇
    const API_KEY = "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; 

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { inputs } = req.body;
        
        // --- PHẦN 1: BỘ DỊCH TEENCODE (JAVASCRIPT VERSION) ---
        let cleanText = inputs.toLowerCase();

        // 1. Xóa dấu chấm (c.d.m.m -> cdmm)
        cleanText = cleanText.replace(/\./g, '');

        // 2. Leetspeak (0 -> o, 3 -> e...)
        const leet = {'0':'o', '1':'i', '3':'e', '4':'a', '5':'s', '@':'a', '$':'s', '(':'c'};
        for (const [key, val] of Object.entries(leet)) {
            cleanText = cleanText.split(key).join(val);
        }

        // 3. Gộp chữ rời (c o n -> con)
        // Regex này tìm ký tự đơn lẻ đứng cạnh nhau
        cleanText = cleanText.replace(/(?<=\b[a-z])\s+(?=[a-z]\b)/g, '');

        // 4. Từ điển Viết tắt (Thêm tùy thích)
        const dict = {
            "cc": "cục cứt", "cmm": "con mẹ mày", "dcm": "địt con mẹ",
            "dm": "địt mẹ", "đm": "địt mẹ", "vcl": "vãi cả lồn",
            "vl": "vãi lồn", "clm": "cái lờ má", "cdmm": "con đĩ mẹ mày",
            "cdcmm": "con đĩ cái mẹ mày", "cmn": "con mẹ nó", 
            "dell": "đéo", "đell": "đéo"
        };
        
        // Dịch từng từ
        cleanText = cleanText.split(' ').map(w => dict[w] || w).join(' ');
        
        console.log(`Dịch: ${inputs} -> ${cleanText}`); // Xem log trong Vercel

        // --- PHẦN 2: GỌI GOOGLE GEMINI ---
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Phân tích câu này: "${cleanText}" (Câu gốc: "${inputs}")
        Trả về JSON chính xác:
        - Nếu an toàn: {"label": "LABEL_0", "score": 0.99}
        - Nếu xúc phạm: {"label": "LABEL_1", "score": 0.95}
        - Nếu thù ghét/nguy hiểm: {"label": "LABEL_2", "score": 0.99}
        Chỉ trả về JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();
        
        const data = JSON.parse(text);

        return res.status(200).json([data]);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
