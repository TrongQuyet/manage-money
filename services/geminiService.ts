
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const getFinancialAdvice = async (state: AppState): Promise<string> => {
  // Always create a new instance with the latest API key from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Hãy đóng vai là một chuyên gia tư vấn tài chính cho hội nhóm. 
    Dưới đây là dữ liệu tài chính hiện tại:
    - Số dư: ${state.currentBalance.toLocaleString('vi-VN')} VND
    - Số lượng thành viên: ${state.members.length}
    - Giao dịch gần đây: ${JSON.stringify(state.transactions.slice(-5))}

    Hãy phân tích ngắn gọn tình hình tài chính của nhóm, nhận xét về các khoản chi tiêu và đưa ra 3 lời khuyên thực tế để tối ưu hóa ngân quỹ. 
    Trả lời bằng tiếng Việt, súc tích, chuyên nghiệp và thân thiện. Sử dụng Markdown.
  `;

  try {
    // Upgraded to gemini-3-pro-preview as financial analysis is a complex reasoning task
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Direct access to the .text property as per latest SDK guidelines
    return response.text || "Không thể lấy phản hồi từ AI vào lúc này.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Có lỗi xảy ra khi kết nối với trí tuệ nhân tạo.";
  }
};
