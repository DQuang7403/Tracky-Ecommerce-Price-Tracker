import { useEffect, useRef, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { BotMessageSquare, Send, X } from "lucide-react";
import axios from "../api/axios";

type ChatProps = {
  isLoading: boolean;
  context: string;
};
type messages = {
  id: string;
  createdAt: Date | undefined;
  content: string;
  tool_call_id: string | undefined;
  role: "function" | "system" | "user" | "assistant" | "data" | "tool";
}[];

export default function Chat({ context, isLoading }: ChatProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<messages>([]);
  const [input, setInput] = useState<string>("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMessage = {
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      content: input,
      tool_call_id: "",
      role: "user",
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages as messages);
    setInput("");

    const res = await axios.post("/chatbot/chat", {
      messages: updatedMessages, 
      context: context,
    });

    setMessages([
      ...updatedMessages as messages,
      {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date(),
        content: res.data.message,
        tool_call_id: "",
        role: "assistant",
      },
    ]);
  };

  const chatParent = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="fixed bottom-6 right-6 z-[9999]">
      <div
        className={` ${
          open ? "scale-1" : "scale-0"
        } transition-transform duration-300 origin-bottom-right aspect-[5/6] rounded-md   bg-[#014C86] w-[350px]`}
      >
        <div className="flex justify-between px-4 py-2 text-white">
          <h1 className="text-lg ">Ask me anything</h1>
          <span
            className=" cursor-pointer hover:text-slate-300"
            onClick={() => setOpen(false)}
          >
            <X />
          </span>
        </div>
        <div className="h-full flex flex-col flex-grow gap-4 mx-auto ">
          <ul
            ref={chatParent}
            className="h-1 p-4 flex-grow bg-muted/90 overflow-y-auto flex flex-col gap-2 text-sm"
          >
            {messages.map((m, index) => (
              <div key={index}>
                {m.role === "user" ? (
                  <li key={m.id} className="flex flex-row-reverse">
                    <div className="rounded-xl p-2 bg-[#009ef6]  shadow-md flex">
                      <p className="text-primary text-white">{m.content}</p>
                    </div>
                  </li>
                ) : (
                  <li key={m.id} className="flex flex-row bg-line">
                    <div className="rounded-xl p-2 bg-background shadow-md flex w-3/4">
                      <p className="text-primary">{m.content}</p>
                    </div>
                  </li>
                )}
              </div>
            ))}
          </ul>
        </div>
        <div className="p-4">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl mx-auto items-center"
          >
            <Input
              className="flex-1 min-h-[40px]"
              placeholder="Type your question here..."
              type="text"
              value={input}
              onChange={handleInputChange}
            />
            <Button className="ml-2" type="submit" disabled={input === ""}>
              <Send />
            </Button>
          </form>
        </div>
      </div>
      <Button
        onClick={() => setOpen(true)}
        className={`${open ? "hidden" : "block"}  fixed bottom-4 right-4`}
        disabled={isLoading}
      >
        <BotMessageSquare />
      </Button>
    </section>
  );
}
