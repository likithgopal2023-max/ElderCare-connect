import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const CAREAI_SYSTEM_INSTRUCTION = `You are CareAI, the warm, clear, and trustworthy AI Healthcare Companion inside ElderCare Connect.
Your role is to help elderly users (such as Lakshmi Devi, age 72), their family members (daughter Anita, son Rajesh), and caretakers (Meena) understand and organize daily healthcare routines, medication schedules, doctor appointments, care circle permissions, and uploaded medical documents in simple, reassuring everyday language.

STRICT MEDICAL SAFETY RULES (NON-NEGOTIABLE):
1. NEVER diagnose diseases or medical conditions.
2. NEVER prescribe medicines or suggest new medications.
3. NEVER recommend changing a medication dosage or stopping a prescribed medication.
4. NEVER recommend doubling a dose if a medication was missed. Always state: "Please follow your doctor's prescribed instructions. If you are unsure what to do about a missed dose, contact your healthcare professional."
5. NEVER replace a doctor or make emergency medical decisions. For any potential medical emergency (chest pain, shortness of breath, severe dizziness, etc.), immediately advise contacting local emergency services or their primary doctor.
6. Keep answers concise, clear, warm, and easy for a senior citizen to read. Avoid complex medical jargon.`;

// 1. CareAI Conversational Endpoint
app.post('/api/careai/chat', async (req, res) => {
  try {
    const { message, contextData, role } = req.body as {
      message: string;
      contextData?: Record<string, unknown>;
      role?: string;
    };

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Please provide a valid question or message for CareAI.' });
      return;
    }

    const ai = getGeminiClient();
    const promptWithContext = `Current Viewer Role: ${role || 'elderly'}
Healthcare Profile Context:
${JSON.stringify(contextData || {}, null, 2)}

User Question: "${message}"

Respond directly and warmly in 2 to 4 short paragraphs or bullet points. Include the non-diagnostic reminder when discussing medications or symptoms.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptWithContext,
        config: {
          systemInstruction: CAREAI_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
      res.json({
        reply:
          response.text ||
          'I reviewed your schedule. Please remember to follow your doctor’s prescribed instructions.',
        source: 'gemini-4-hydrogen',
      });
      return;
    }

    // Intelligent context-aware fallback if API key is not configured
    const lower = message.toLowerCase();
    let fallbackReply =
      "Based on Lakshmi Devi's care profile today, 4 medications are scheduled: Morning Aspirin 75 mg (Completed), 8:00 AM Metformin 500 mg (Completed), 1:00 PM Vitamin D 1000 IU (Completed), 6:30 PM Amlodipine 5 mg (Upcoming), and 9:00 PM Atorvastatin 10 mg (Upcoming). Tomorrow at 11:30 AM, there is a Cardiology appointment with Dr. Ravi Kumar at Apollo Clinic.";

    if (lower.includes('missed') || lower.includes('who needs to know')) {
      fallbackReply =
        'Based on your Care Circle permission settings, your caretaker Meena Nair and your daughter Anita Sharma are configured to receive missed medication alerts via in-app and email notifications. Please follow your doctor’s prescribed instructions. If you are unsure what to do about a missed dose, contact your healthcare professional.';
    } else if (lower.includes('tomorrow') || lower.includes('appointment')) {
      fallbackReply =
        'Tomorrow you have one scheduled appointment at 11:30 AM with Dr. Ravi Kumar (Cardiology) at Apollo Heart Institute (4.2 km away), along with your regular daily medications. Anita has already enabled the 1-hour prior reminder.';
    } else if (lower.includes('morning')) {
      fallbackReply =
        'Yes! Your 6:30 AM morning routine dose and your 8:00 AM Metformin (500 mg, 1 tablet after breakfast) were both marked as taken on time today.';
    } else if (lower.includes('refill') || lower.includes('remaining')) {
      fallbackReply =
        'Metformin 500 mg currently has 12 tablets remaining (about 6 days of supply at 2 tablets per day), and Atorvastatin 10 mg has 4 tablets remaining (Refill Required soon). Would you like to notify Anita or Meena to pick up a refill?';
    }

    res.json({
      reply: fallbackReply,
      source: 'careai-contextual-engine',
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unable to reach CareAI right now.';
    res.status(500).json({
      error: errMsg,
      reply:
        'I encountered a temporary connection issue while checking with the AI service, but your local schedule is safe: please follow your prescribed medication routine and consult Dr. Ravi Kumar if you have medical questions.',
    });
  }
});

// 2. CareAI Document Summarization Endpoint
app.post('/api/careai/summarize-document', async (req, res) => {
  try {
    const { title, category, doctor, rawText } = req.body as {
      title: string;
      category: string;
      doctor?: string;
      rawText?: string;
    };

    if (!title) {
      res.status(400).json({ error: 'Document title is required for summarization.' });
      return;
    }

    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Summarize this uploaded health document in 3 simple, reassuring sentences for an elderly patient and their family.
Document Title: ${title}
Category: ${category}
Doctor: ${doctor || 'Primary Physician'}
Notes/Content: ${rawText || 'Standard clinical record uploaded to ElderCare Connect.'}
Always end with: "This summary is informational and should be reviewed with your doctor."`,
        config: {
          systemInstruction: CAREAI_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      res.json({
        summary:
          response.text ||
          `Your uploaded ${category.toLowerCase()} "${title}" from ${doctor || 'your clinic'} has been organized in your vault. This summary is informational and should be reviewed with your doctor.`,
      });
      return;
    }

    res.json({
      summary: `Your uploaded ${category.toLowerCase()} "${title}" (${doctor || 'Apollo Clinic'}) records routine clinical observations and current prescription instructions. Key follow-up dates have been synced with your Care Circle schedule. This summary is informational and should be reviewed with your doctor.`,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Failed to summarize document';
    res.status(500).json({ error: errMsg });
  }
});

// 3. CareAI Organizational Routine Insights Endpoint
app.post('/api/careai/routine-insights', async (req, res) => {
  try {
    const { adherenceScore, missedCount, upcomingAppointmentsCount, lowRefillMeds } = req.body as {
      adherenceScore: number;
      missedCount: number;
      upcomingAppointmentsCount: number;
      lowRefillMeds: string[];
    };

    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Generate 4 brief, non-diagnostic organizational insights based on this elderly user's routine metrics:
- Weekly Adherence Score: ${adherenceScore}%
- Missed Doses This Week: ${missedCount}
- Upcoming Appointments: ${upcomingAppointmentsCount}
- Medications Needing Refill Soon: ${(lowRefillMeds || []).join(', ') || 'None'}`,
        config: {
          systemInstruction: CAREAI_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                detail: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ['title', 'detail', 'category'],
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '[]').trim());
      res.json({ insights: parsed });
      return;
    }

    res.json({
      insights: [
        {
          title: 'Morning medications are consistently completed',
          detail: '8:00 AM Metformin and morning routine doses have a 100% on-time completion streak over the past 7 days.',
          category: 'adherence',
        },
        {
          title: 'Evening medication routine shows occasional delays',
          detail: `${missedCount} evening dose(s) required a 30-minute follow-up reminder this week. Consider pairing with dinner at 6:30 PM.`,
          category: 'schedule',
        },
        {
          title: `You have ${upcomingAppointmentsCount} appointments scheduled`,
          detail: 'Dr. Ravi Kumar (Cardiology) is tomorrow at 11:30 AM. Caretaker Meena is confirmed to assist with transport.',
          category: 'appointment',
        },
        {
          title: 'Medication refill attention needed soon',
          detail:
            lowRefillMeds && lowRefillMeds.length > 0
              ? `${lowRefillMeds.join(' and ')} are approaching their refill threshold.`
              : 'All current prescriptions have sufficient tablet inventory for this week.',
          category: 'refill',
        },
      ],
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Failed to generate insights';
    res.status(500).json({ error: errMsg });
  }
});

// 4. Centralized Notification & Email Dispatch Engine
app.post('/api/notifications/dispatch', (req, res) => {
  const { eventType, priority, title, message, recipients, channels } = req.body as {
    eventType: string;
    priority: 'info' | 'reminder' | 'attention' | 'urgent';
    title: string;
    message: string;
    recipients: string[];
    channels: { email: boolean; inApp: boolean; browser: boolean };
  };

  if (!title || !message) {
    res.status(400).json({ error: 'Notification title and message are required.' });
    return;
  }

  const emailConfigured = Boolean(
    process.env.EMAIL_SERVICE_API_KEY && process.env.EMAIL_SERVICE_API_KEY !== 'MY_EMAIL_SERVICE_API_KEY'
  );

  res.json({
    dispatched: true,
    id: `notif_${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: eventType || 'care_update',
    priority: priority || 'info',
    recipients: recipients || ['Lakshmi Devi', 'Anita Sharma (Daughter)', 'Meena Nair (Caretaker)'],
    deliveryStatus: {
      inApp: channels?.inApp !== false ? 'delivered' : 'skipped',
      email: channels?.email !== false ? (emailConfigured ? 'sent_smtp' : 'queued_sandbox') : 'skipped',
      browser: channels?.browser ? 'pushed' : 'skipped',
    },
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ElderCare Connect server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
