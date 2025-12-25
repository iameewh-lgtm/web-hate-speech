// File: api/chat.js
export default async function handler(req, res) {
    // 👇👇👇 DÁN TOKEN MỚI (Write) VÀO ĐÂY (Token cũ chết rồi) 👇👇👇
    const TOKEN = "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"; 
    
    const MODEL_ID = "iameewh/vihsd-hate-speech-pro";

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { inputs } = req.body;

        // BẮT BUỘC DÙNG LINK ROUTER (Vì link cũ đã báo 410)
        const response = await fetch(
            `https://router.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ inputs }),
            }
        );

        // BẮT LỖI 404/503
        if (!response.ok) {
            const errorText = await response.text();
            
            // Nếu lỗi 503: Model đang khởi động
            if (response.status === 503) {
                return res.status(503).json({ error: "Model đang khởi động (Cold Boot)... Đợi 20s bấm lại nhé!" });
            }
            
            // Nếu lỗi 404: Token sai hoặc Model chưa Public
            if (response.status === 404) {
                 return res.status(404).json({ error: "Lỗi 404: Token sai hoặc Model chưa Public. Hãy kiểm tra lại Token!" });
            }

            return res.status(response.status).json({ 
                error: `Lỗi HuggingFace (${response.status}): ${errorText}` 
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Lỗi Server Vercel: " + error.message });
    }
}
