import React, { useState, useRef, useEffect } from "react";
import { Input, Button, List, Spin } from "antd";

const ChatInterface = ({ setRefetchAppointments }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "You", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `http://13.201.194.231:3000/chat/${threadId || ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input, threadId: threadId }),
        }
      );

      const data = await response.json();

      let formattedText = data.response
        ? data.response
            .replace(/\*\*/g, "")
            .replace(/FINAL ANSWER:/g, "")
            .trim()
        : "No response";

      if (data.response?.includes("FINAL ANSWER:")) {
        setThreadId(""); // Reset threadId if FINAL ANSWER is found
      } else {
        setThreadId(data.threadId);
      }

      const botMessage = { sender: "Agent", text: formattedText };

      console.log(data);
      setRefetchAppointments(data.ticketCreated);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "Agent",
          text: "Sorry, Not able to respond now due to technical issues",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 10,
        width: 400,
      }}
    >
      <h2>Chat Interface</h2>
      <List
        bordered
        dataSource={messages}
        renderItem={(item) => (
          <List.Item
            style={{ textAlign: item.sender === "You" ? "right" : "left" }}
          >
            <strong>{item.sender}: </strong>{" "}
            <p style={{ whiteSpace: "pre-line" }}>{item.text}</p>
          </List.Item>
        )}
        style={{ height: 700, overflowY: "auto", marginBottom: 10 }}
      />
      <div ref={messagesEndRef} />

      {loading && <Spin style={{ display: "block", marginBottom: 10 }} />}

      <div style={{ display: "flex", gap: 8 }}>
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleKeyPress}
          placeholder="Type a message..."
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ flex: 1 }}
        />
        <Button type="primary" onClick={sendMessage} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
