
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { EBookTier, Chapter, BonusAsset, SkoolAssets } from "../types";

const getLangName = (lang: string) => {
  const map: Record<string, string> = { es: 'Spanish', en: 'English', pt: 'Portuguese' };
  return map[lang] || 'English';
};

const ensureString = (val: any): string => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join('\n\n');
  if (val === null || val === undefined) return '';
  return String(val);
};

export const geminiService = {
  // Generates diagnosis questions for the eBook customization process
  generateNicheQuestions: async (niche: string, tier: EBookTier, lang: 'es' | 'en' | 'pt') => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langName = getLangName(lang);
    const config = {
      [EBookTier.TIER_1]: { count: 3, focus: 'emotional hooks and immediate desires' },
      [EBookTier.TIER_2]: { count: 6, focus: 'workflow obstacles and methodology gaps' },
      [EBookTier.TIER_3]: { count: 10, focus: 'KPIs, advanced systems, and long-term scaling architecture' }
    }[tier];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a diagnostic expert in ${niche}. For a ${tier} premium program, generate ${config.count} high-level questions in ${langName} to extract the user's personal context. Focus on ${config.focus}. Return ONLY a JSON array of strings.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  },

  // Generates high-quality eBook chapters with advanced reasoning
  generateChapter: async (title: string, niche: string, tier: EBookTier, userData: any, lang: 'es' | 'en' | 'pt') => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { name, personalContext } = userData;
    const langName = getLangName(lang);

    // AI Ghostwriter prompt
    const systemInstruction = `You are "Renovación Real", the world's most sophisticated AI Ghostwriter for high-ticket mentors.
    TONE: Professional, luxury, authoritative, yet transformational.
    TIER LOGIC: 
    - Tier 1: Focus on quick wins and emotional connection.
    - Tier 2: Focus on the "Unique Mechanism" and step-by-step implementation.
    - Tier 3: Focus on systems, scaling, advanced psychological shifts, and institutional-grade frameworks.
    Always use beautiful Markdown with bold highlights.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Write the chapter "${title}" for a ${tier} eBook titled for ${name}. 
      Niche: ${niche}. 
      Client Context: ${personalContext}. 
      Language: ${langName}.
      Return a JSON object with: 
      "content": "Full markdown content (minimum 1500 words for Tier 3, 800 for Tier 2)", 
      "imagePrompt": "A cinematic high-end visual description for an image generator representing this chapter's soul."`,
      config: { 
        systemInstruction,
        thinkingConfig: { thinkingBudget: 25000 },
        responseMimeType: "application/json" 
      }
    });
    const data = JSON.parse(response.text || '{}');
    return {
      content: ensureString(data.content),
      imagePrompt: ensureString(data.imagePrompt)
    };
  },

  // Generates supplementary bonuses for the eBook
  generateBonuses: async (title: string, niche: string, tier: EBookTier, lang: 'es' | 'en' | 'pt') => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langName = getLangName(lang);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create 3 elite companion assets for the Masterpiece "${title}" (${niche}). 
      Tier: ${tier}. Language: ${langName}. 
      The bonuses must be: a Checklist, a System Worksheet, and a 90-day Roadmap.
      Return ONLY a JSON array of objects: [{type, title, content (detailed markdown)}].`,
      config: { responseMimeType: "application/json" }
    });
    const data = JSON.parse(response.text || '[]');
    return data.map((b: any) => ({
      ...b,
      content: ensureString(b.content)
    }));
  },

  // Generates cinematic visuals for eBook chapters
  generateChapterImage: async (prompt: string, tier: EBookTier) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `Masterpiece Art for a ${tier} book. Style: Luxury, minimal, 8k, dramatic lighting, obsidian and gold accents. ${prompt}` }] },
      config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });
    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  },

  // Generates a complete sales landing page HTML
  generateLandingPage: async (title: string, niche: string, prices: any, links: any, lang: 'es' | 'en' | 'pt') => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langName = getLangName(lang);
    
    const prompt = `Create a high-converting, luxury, minimal single-file HTML/CSS landing page for an eBook titled "${title}" in the ${niche} niche.
    Language: ${langName}.
    Include pricing sections: Tier 1 at $${prices.tier1}, Tier 2 at $${prices.tier2}, Tier 3 at $${prices.tier3}.
    Checkout links: Tier 1 (${links.tier1}), Tier 2 (${links.tier2}), Tier 3 (${links.tier3}).
    Use Tailwind CSS (via CDN) and FontAwesome.
    The design must be dramatic, with dark backgrounds, gold and blue highlights, and high-end typography.
    Return ONLY the raw HTML code starting with <!DOCTYPE html>.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 15000 }
      }
    });
    return response.text;
  },

  // Generates marketing strategy and community assets for Skool
  generateSkoolStrategy: async (niche: string, target: string): Promise<SkoolAssets> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a comprehensive Skool community launch strategy for the niche "${niche}" targeting "${target}".
      The strategy must include:
      1. A high-converting "About Page" description.
      2. A "Welcome Post" to pin at the top.
      3. 3 DM scripts for closing clients.
      4. 3 Ad copy variants.
      5. A 30-day growth roadmap.
      
      Return as a JSON object matching this schema:
      {
        "aboutPage": "markdown string",
        "welcomePost": "markdown string",
        "dmScripts": ["script 1", "script 2", "script 3"],
        "adCopy": ["ad 1", "ad 2", "ad 3"],
        "growthPlan": "markdown string"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aboutPage: { type: Type.STRING },
            welcomePost: { type: Type.STRING },
            dmScripts: { type: Type.ARRAY, items: { type: Type.STRING } },
            adCopy: { type: Type.ARRAY, items: { type: Type.STRING } },
            growthPlan: { type: Type.STRING }
          },
          required: ["aboutPage", "welcomePost", "dmScripts", "adCopy", "growthPlan"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      aboutPage: ensureString(data.aboutPage),
      welcomePost: ensureString(data.welcomePost),
      dmScripts: Array.isArray(data.dmScripts) ? data.dmScripts.map(ensureString) : [],
      adCopy: Array.isArray(data.adCopy) ? data.adCopy.map(ensureString) : [],
      growthPlan: ensureString(data.growthPlan)
    };
  }
};
