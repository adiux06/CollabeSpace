import { Request, Response, NextFunction } from 'express';
import Groq from 'groq-sdk';
import { Task } from '../models/Task';
import { AppError } from '../utils/errorHandler';

export const chatWithAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, workspaceId } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return next(new AppError('AI Chat is currently unavailable (Missing API Key)', 503));
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    if (!message) {
      return next(new AppError('Message is required', 400));
    }

    // Fetch all tasks in the workspace to provide context to the AI
    const tasks = await Task.find({ workspaceId }).select('title description status priority tags');
    
    const taskContext = tasks.map(t => ({
      name: t.title,
      desc: t.description,
      status: t.status,
      priority: t.priority
    }));

    const systemPrompt = `
      You are CollabSpace AI, a helpful task management assistant. 
      You have access to the following tasks in the current workspace:
      ${JSON.stringify(taskContext, null, 2)}

      Your job is to:
      1. Answer questions about these tasks.
      2. Help the user break down tasks into subtasks or suggest descriptions.
      3. Provide advice on task prioritization.
      
      Keep your answers concise, professional, and friendly. 
      If a user asks about a task, refer to it by its name.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiMessage = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    res.json({ message: aiMessage });
  } catch (error) {
    next(error);
  }
};
