// File: api/chat.js
export default async function handler(req, res) {
    // 👇👇👇 DÁN TOKEN MỚI (Write) CỦA BẠN VÀO ĐÂY 👇👇👇
    const TOKEN = "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"; 
    
    const MODEL_ID = "iameewh/vihsd-hate-speech-pro";

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { inputs } = req.body;

        // CHUYỂN SANG LINK ROUTER (Theo yêu cầu của lỗi 410)
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

        // BỘ BẮT LỖI CHI TIẾT
        if (!response.ok) {
            const errorText = await response.text();
            console.error("HF Error:", errorText);
            // Trả về nguyên văn lỗi để xem nó báo gì (404 hay 401...)
            return res.status(response.status).json({ 
                error: `Lỗi Router (${response.status}): ${errorText}` 
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Lỗi Server: " + error.message });
    }
}
