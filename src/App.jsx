import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 

function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [flashcards, setFlashcards] = useState([]); 
  const [showCards, setShowCards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const generateNotes = async () => {
    if (!topic) return alert("Enter a topic first! ✨");
    setLoading(true);
    setNotes(''); 
    setSummary('');
    setShowSummary(false);
    setShowCards(false);
    setCurrentCardIndex(0);
    try {
      const response = await fetch('https://thinkly-ai-sukt.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic })
      });
      const data = await response.json();
      if (data.notes) setNotes(data.notes);
    } catch (error) {
      alert("Connection Error! Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://thinkly-ai-sukt.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: notes }),
      });
      const data = await response.json();
      setSummary(data.summary);
      setShowSummary(true);
      setShowCards(false); 
    } catch (err) {
      alert("Couldn't generate summary.");
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://thinkly-ai-sukt.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: notes }),
      });
      const data = await response.json();
      
      if (data.flashcards && Array.isArray(data.flashcards)) {
        const formatted = data.flashcards.map(card => ({
          ...card,
          flipped: false
        }));
        setFlashcards(formatted);
        setShowCards(true);
        setShowSummary(false);
        setCurrentCardIndex(0);
      } else {
        throw new Error("Invalid format from server");
      }
    } catch (err) {
      console.error("Flashcard Error:", err);
      alert("Flashcard generation failed. Check server logs!");
    } finally {
      setLoading(false);
    }
  };

  // Fixed the function names and state variables here
  const handleNext = (e) => {
    e.stopPropagation();
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  return (
    <div style={{ 
      background: 'radial-gradient(at 0% 0%, #E0E7FF 0px, transparent 50%), radial-gradient(at 100% 0%, #FAE8FF 0px, transparent 50%), radial-gradient(at 100% 100%, #FCE7F3 0px, transparent 50%), radial-gradient(at 0% 100%, #E0F2FE 0px, transparent 50%), #F8FAFC',
      minHeight: '100vh', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
    }}>
      
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '56px', fontWeight: '700', color: '#1E1B4B', margin: '0' }}>
          Thinkly<span style={{ color: '#C084FC' }}>.</span>
        </h1>
      </header>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(25px)', padding: '50px', borderRadius: '50px', 
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.05)', width: '100%', maxWidth: '700px', border: '1px solid rgba(255, 255, 255, 0.7)'
      }}>
        
        {!notes ? (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '32px', color: '#1E293B' }}>
              {loading ? "AI is weaving its magic..." : "What are we mastering today?"}
            </h2>
            <input 
              type="text" placeholder="E.g. Electrochemistry, Organic Compounds..." 
              style={{ width: '100%', padding: '24px', borderRadius: '24px', border: 'none', backgroundColor: 'rgba(255,255,255,0.8)', marginBottom: '32px', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
              value={topic} onChange={(e) => setTopic(e.target.value)} disabled={loading}
            />
            <button onClick={generateNotes} disabled={loading} style={{ width: '100%', padding: '22px', borderRadius: '24px', border: 'none', background: loading ? '#94A3B8' : 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', color: 'white', fontWeight: '700', fontSize: '18px', cursor: 'pointer' }}>
              {loading ? "Thinking... ⏳" : "Generate Study Flow 🪄"}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
               <h3 style={{ background: 'linear-gradient(to right, #6366F1, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', margin: 0 }}>
                  Study Guide ✨
               </h3>
               <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleSummarize} style={{ padding: '8px 15px', borderRadius: '12px', border: '1px solid #A855F7', background: 'transparent', color: '#A855F7', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                    Summary ⚡
                  </button>
                  <button onClick={generateFlashcards} style={{ padding: '8px 15px', borderRadius: '12px', border: '1px solid #6366F1', background: 'transparent', color: '#6366F1', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                    Flashcards 🗂️
                  </button>
               </div>
            </div>
            
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '30px', color: '#1E293B', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
              
              {showCards && flashcards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                  
                  <div 
                    onClick={() => {
                      const newCards = [...flashcards];
                      newCards[currentCardIndex].flipped = !newCards[currentCardIndex].flipped;
                      setFlashcards(newCards);
                    }}
                    style={{ perspective: '1000px', width: '100%', maxWidth: '400px', height: '220px', cursor: 'pointer' }}
                  >
                    <div style={{
                      position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      transformStyle: 'preserve-3d', transform: flashcards[currentCardIndex].flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}>
                      {/* Front Side */}
                      <div style={{
                        position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                        backgroundColor: 'white', borderRadius: '30px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', padding: '25px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                        border: '1px solid #EEF2FF', textAlign: 'center'
                      }}>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {flashcards[currentCardIndex].front}
                        </ReactMarkdown>
                      </div>

                      {/* Back Side */}
                      <div style={{
                        position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                        backgroundColor: '#F5F3FF', borderRadius: '30px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', padding: '25px', transform: 'rotateY(180deg)',
                        boxShadow: '0 15px 35px rgba(99, 102, 241, 0.1)', border: '1px solid #E0E7FF', textAlign: 'center'
                      }}>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {flashcards[currentCardIndex].back}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button 
                      disabled={currentCardIndex === 0}
                      onClick={handlePrev}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: currentCardIndex === 0 ? 0.2 : 1 }}
                    > ⬅️ </button>
                    <span style={{ fontWeight: '700', color: '#94A3B8', fontSize: '14px' }}>{currentCardIndex + 1} / {flashcards.length}</span>
                    <button 
                      disabled={currentCardIndex === flashcards.length - 1}
                      onClick={handleNext}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: currentCardIndex === flashcards.length - 1 ? 0.2 : 1 }}
                    > ➡️ </button>
                  </div>

                  <button onClick={() => setShowCards(false)} style={{ color: '#A855F7', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Back to Notes</button>
                </div>
              ) : (
                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {showSummary ? `### ⚡ Quick Summary\n${summary}\n\n---\n\n${notes}` : notes}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <button onClick={() => {setNotes(''); setTopic(''); setShowSummary(false); setShowCards(false)}} style={{ marginTop: '24px', background: 'none', border: 'none', color: '#6366F1', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
              ← New Topic
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
