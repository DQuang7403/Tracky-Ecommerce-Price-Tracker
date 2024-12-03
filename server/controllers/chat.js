import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import dotenv from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
const formatMessage = (message) => {
  return `${message.role}: ${message.content}`;
};
dotenv.config();

const TEMPLATE = `
Bạn là một trợ lý hữu ích của trang web Tracky được giao nhiệm vụ trích xuất thông tin cụ thể từ nội dung văn bản của trang sản phẩm và trả lời các câu hỏi của người dùng chỉ dựa trên ngữ cảnh sau. Vui lòng làm theo các hướng dẫn sau một cách cẩn thận:

1. **Ngữ cảnh** Trả lời thông tin khớp trực tiếp phù hợp với ngữ cảnh: {context}.
2. **Phản hồi trống:** Nếu câu trả lời không phù hợp với ngữ cảnh, hãy trả lời một cách lịch sự rằng nhà sản xuất không cung cấp thông tin đó.
3. **Chỉ dữ liệu trực tiếp:** Đầu ra của bạn chỉ được chứa dữ liệu được yêu cầu rõ ràng, không có văn bản nào khác.
4. **Giá cả:** Đối với các câu hỏi về giá cả, hãy trả lời giá cả chính xác nhất có thể. Thường là giá đầu tiên của sản phẩm hoặc giá bán lẻ.
5. **Ngôn ngữ** Trả lời bằng ngôn ngữ mà người dùng sử dụng để đặt câu hỏi. Thường là bằng tiếng Việt.
==============================
Current conversation: {chat_history}
==============================
user: {question}
assistant:
`;
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-8b-8192",
  temperature: 0.8,
  streaming: true,
});
export const dynamic = "force-dynamic";
export const chat = async (req, res, next) => { 
  try {
    const { messages, context } = await req.body;
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessage = messages.at(-1).content;
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: () => context,
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);
    const result = await chain.invoke({
      context: context,
      chat_history: formattedPreviousMessages.join("\n"),
      question: currentMessage,
    });
    return res.status(200).json({ message: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

