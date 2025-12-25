// File: api/chat.js
export default async function handler(req, res) {
    const TOKEN = "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"; // Token của bạn
    const MODEL_ID = "iameewh/vihsd-hate-speech-pro";
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { inputs } = req.body;

        // 👇👇👇 QUAN TRỌNG: Đã đổi sang link ROUTER mới nhất 👇👇👇
        const response = await fetch(
            `https://router.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs }),
            }
        );

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
