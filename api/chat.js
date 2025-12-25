// File: api/chat.js
export default async function handler(req, res) {
    // 1. Cấu hình
    const TOKEN = "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"; // Token của bạn
    const MODEL_ID = "iameewh/vihsd-hate-speech-pro";
    
    // 2. Chỉ chấp nhận phương thức POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { inputs } = req.body;

        // 3. Server Vercel gọi trực tiếp sang Hugging Face (Không bị chặn)
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs }),
            }
        );

        // 4. Xử lý kết quả trả về
        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
