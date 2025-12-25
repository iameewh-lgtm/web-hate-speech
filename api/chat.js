// File: api/chat.js
export default async function handler(req, res) {
    // 👇👇👇 DÁN TOKEN MỚI (Write) VÀO ĐÂY (Đừng dùng cái cũ nữa!) 👇👇👇
    const TOKEN = "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"; 
    
    // Tên model chính xác của bạn
    const MODEL_ID = "iameewh/vihsd-hate-speech-pro";

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { inputs } = req.body;

        // Dùng lại link api-inference (vì router đang kén token)
        // Kèm theo User-Agent để không bị chặn lỗi 410
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "false"
                },
                method: "POST",
                body: JSON.stringify({ inputs }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("HF Error:", errorText);
            
            // Nếu vẫn lỗi 410/404 -> Chắc chắn do Token hoặc Model chưa load kịp
            if (response.status === 503) {
                 return res.status(503).json({ error: "Model đang khởi động... Đợi 20s nhé!" });
            }
            return res.status(response.status).json({ 
                error: `Lỗi kết nối (${response.status}): ${errorText}` 
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Lỗi Server Vercel: " + error.message });
    }
}
