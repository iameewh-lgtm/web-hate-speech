// File: api/chat.js
export default async function handler(req, res) {
    // 👇👇👇 DÁN TOKEN MỚI CỦA BẠN VÀO ĐÂY 👇👇👇
    const TOKEN = "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"; 
    
    // Model ID
    const MODEL_ID = "iameewh/vihsd-hate-speech-pro";

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { inputs } = req.body;

        // MẸO: Quay lại link cũ nhưng thêm User-Agent để giả làm trình duyệt
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                method: "POST",
                body: JSON.stringify({ inputs }),
            }
        );

        // --- BỘ BẮT LỖI THÔNG MINH ---
        // Nếu server trả về lỗi, ta đọc nội dung lỗi đó ra
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Hugging Face Error:", errorText);
            return res.status(response.status).json({ 
                error: `Lỗi từ AI (${response.status}): ${errorText.substring(0, 200)}` 
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Lỗi Server: " + error.message });
    }
}
