"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ---------- SAFE SERIALIZE (fix BigInt issue) ---------- */
function safeSerialize(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

export default function HealthChatbot({ latestData }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `## 👋 Health Assistant Ready
      
Ask me anything about the patient's condition.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef(null);

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ---------- SEND MESSAGE ---------- */
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!latestData) return alert("Patient data not loaded yet");

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/health-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          patient: safeSerialize(latestData)
        })
      });

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: data.reply }
      ]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "⚠ Unable to get response." }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700
        text-white px-5 py-3 rounded-full shadow-xl z-50 font-medium"
      >
        💬 Health AI
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div className="
        fixed bottom-24 right-8
        w-160 h-140
        bg-gray-900/95 backdrop-blur-md
        border border-gray-700
        rounded-2xl flex flex-col
        shadow-2xl z-50
        ">

          {/* HEADER */}
          <div className="p-4 border-b border-gray-700 text-lg font-semibold tracking-wide">
            🩺 Patient Assistant
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm scrollbar-hide">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`px-4 py-2 rounded-2xl max-w-[80%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 ml-auto text-white"
                    : "bg-gray-800 text-gray-100"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => (
                      <h1 className="text-lg font-bold mb-2">{children}</h1>
                    ),
                    h2: ({children}) => (
                      <h2 className="text-base font-semibold mt-3 mb-1 text-indigo-300">
                        {children}
                      </h2>
                    ),
                    p: ({children}) => (
                      <p className="leading-relaxed mb-2">{children}</p>
                    ),
                    li: ({children}) => (
                      <li className="ml-4 list-disc">{children}</li>
                    ),
                    strong: ({children}) => (
                      <strong className="text-indigo-300">{children}</strong>
                    )
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            ))}

            {loading && (
              <div className="text-gray-400 animate-pulse">
                AI is analyzing patient data...
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask about vitals..."
              className="
              flex-1 bg-gray-800 px-3 py-2 rounded-lg text-sm
              outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 rounded-lg font-medium"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}