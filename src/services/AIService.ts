import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE = '@uwb_openai_key';
const CHAT_HISTORY_STORAGE = '@uwb_chat_history';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

const SYSTEM_PROMPT = `你是 UWB Card 的 AI 助手。你帮助用户：
1. 生成和优化个人名片内容
2. 编写简历（Markdown格式）
3. 推荐餐厅和菜品
4. 解答关于UWB近场通信、卡片共享、文件分享等功能的问题
5. 提供简洁、专业、友好的回答

回复请使用中文，保持简洁。`;

class AIServiceImpl {
  private apiKey: string = '';
  private chatHistory: ChatMessage[] = [];

  async init(): Promise<void> {
    const key = await AsyncStorage.getItem(API_KEY_STORAGE);
    if (key) this.apiKey = key;
    const history = await AsyncStorage.getItem(CHAT_HISTORY_STORAGE);
    if (history) this.chatHistory = JSON.parse(history);
  }

  async setApiKey(key: string): Promise<void> {
    this.apiKey = key;
    await AsyncStorage.setItem(API_KEY_STORAGE, key);
  }

  getApiKey(): string {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.apiKey) {
      return '请先在设置中配置 OpenAI API Key';
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    this.chatHistory.push(userMsg);
    await this.saveHistory();

    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...this.chatHistory.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API 错误: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || '抱歉，无法生成回复。';

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
      };
      this.chatHistory.push(assistantMsg);
      await this.saveHistory();

      return assistantContent;
    } catch (error: any) {
      const errorMsg = `请求失败: ${error.message}`;
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMsg,
        timestamp: Date.now(),
      };
      this.chatHistory.push(assistantMsg);
      await this.saveHistory();
      return errorMsg;
    }
  }

  async generateResume(info: { name: string; position: string; skills: string[]; experience: string }): Promise<string> {
    if (!this.apiKey) return '';

    const prompt = `请为以下信息生成一份专业的 Markdown 格式简历：

姓名：${info.name}
目标职位：${info.position}
技能：${info.skills.join('、')}
工作经历：${info.experience || '无'}

请生成包含以下部分的简历：
- 基本信息
- 求职意向
- 专业技能
- 工作经历（根据提供的信息扩展）
- 教育背景（留空待填）
- 自我评价

使用标准 Markdown 格式，标题用 #，列表用 -，粗体用 **。内容要专业、具体、有亮点。`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: '你是一位专业的简历撰写顾问，擅长生成高质量的 Markdown 格式简历。' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('API 请求失败');
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch {
      return '';
    }
  }

  async clearHistory(): Promise<void> {
    this.chatHistory = [];
    await AsyncStorage.removeItem(CHAT_HISTORY_STORAGE);
  }

  getHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  private async saveHistory(): Promise<void> {
    await AsyncStorage.setItem(CHAT_HISTORY_STORAGE, JSON.stringify(this.chatHistory));
  }
}

export const AIService = new AIServiceImpl();
