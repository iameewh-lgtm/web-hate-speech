// File: api/chat.js
import { HfInference } from "@huggingface/inference";

export default async function handler(req, res) {
    // 👇 Thay Token MỚI (Write) vào đây
    const HF_TOKEN = "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"; 
    const MODEL_NAME = "iameewh/vihsd-hate-speech-pro";

    // Khởi tạo thư viện chính hãng
    const hf = new HfInference(HF_TOKEN);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { inputs } = req.body;
        
        // Gọi AI bằng hàm của thư viện (Nó sẽ tự tìm link sống để kết nối)
        const result = await hf.textClassification({
            model: MODEL_NAME,
            inputs: inputs
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error("Lỗi:", error);
        return res.status(500).json({ 
            error: "Lỗi xử lý AI: " + error.message 
        });
    }
}
