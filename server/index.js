const express = require('express');
const cors = require('cors');
const Groq = require("groq-sdk");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- 1. GENERATE NOTES ROUTE (Fixed Math Rendering) ---
app.post('/generate-notes', async (req, res) => {
    const { topic } = req.body;
    console.log(`⚡ Groq is generating high-value notes for: ${topic}...`);
    
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `You are 'Thinkly', a premium CBSE Class XII study assistant. 
                    FORMATTING RULES:
                    - Use '#' for main titles and '##' for subheaders.
                    - MANDATORY: Wrap EVERY mathematical formula, chemical equation, variable, and unit in SINGLE dollar signs.
                      Example: Use '$E = h\nu$' instead of 'E = hv'. Use '$CaCO_3$' instead of 'CaCO3'.
                    - Use '---' for dividers. 
                    - Focus on high-yield points for Board Exams. No conversational filler.` 
                },
                { role: "user", content: `Write structured notes for: ${topic}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2, // Lower temperature = higher formatting accuracy
        });

        res.json({ notes: chatCompletion.choices[0].message.content });
    } catch (error) {
        console.error("❌ Groq Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- 2. SUMMARIZE ROUTE ---
app.post('/api/summarize', async (req, res) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ 
                role: "user", 
                content: `Summarize this into 5 short bullet points. Wrap all math/symbols in $...$: ${req.body.text}` 
            }],
            model: "llama-3.1-8b-instant",
        });
        res.json({ summary: completion.choices[0].message.content });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- 3. FLASHCARD ROUTE (Strict JSON) ---
app.post('/api/flashcards', async (req, res) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Return ONLY a JSON array. Wrap all math in SINGLE dollar signs $...$." },
                { role: "user", content: `Create 4 Class XII flashcards from: ${req.body.text}. Format: [{"front": "Q", "back": "A"}]` }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" } 
        });

        const rawContent = JSON.parse(completion.choices[0].message.content);
        const finalCards = Array.isArray(rawContent) ? rawContent : (rawContent.flashcards || Object.values(rawContent)[0]);
        
        res.json({ flashcards: finalCards });
    } catch (e) {
        res.status(500).json({ error: "Failed to create cards." });
    }
});

const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => console.log(`🚀 Thinkly Engine running on port ${PORT}`));

