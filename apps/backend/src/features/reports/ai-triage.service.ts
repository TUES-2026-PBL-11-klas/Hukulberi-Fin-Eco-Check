import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AiCategory =
  | 'WASTE'
  | 'GREENERY'
  | 'ROAD_INFRASTRUCTURE'
  | 'ILLEGAL_PARKING'
  | 'WATER_SEWER'
  | 'OTHER';

type AiUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type TriageInput = {
  title: string;
  description: string;
  location: string;
};

type TriageResult = {
  category: AiCategory;
  urgency: AiUrgency;
  confidence: number;
  reasoning: string;
};

type GeminiCandidatePart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiCandidatePart[];
    };
  }>;
};

@Injectable()
export class AiTriageService {
  constructor(private readonly configService: ConfigService) {}

  async classify(input: TriageInput): Promise<TriageResult> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'change_me') {
      throw new Error('GEMINI_API_KEY is missing');
    }

    const prompt = this.buildPrompt(input);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generationConfig: {
            responseMimeType: 'application/json',
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as GeminiResponse;
    const rawText = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!rawText) {
      throw new Error('Gemini returned an empty response');
    }

    const parsed = this.parseJson(rawText) as {
      category?: string;
      urgency?: string;
      confidence?: number;
      reasoning?: string;
    };

    return {
      category: this.mapCategory(parsed.category),
      urgency: this.mapUrgency(parsed.urgency),
      confidence: this.normalizeConfidence(parsed.confidence),
      reasoning: this.normalizeReasoning(parsed.reasoning),
    };
  }

  private buildPrompt(input: TriageInput): string {
    return [
      'Classify this city issue report for Sofia municipality triage.',
      'Return ONLY JSON with keys: category, urgency, confidence, reasoning.',
      'Allowed category values: WASTE, GREENERY, ROAD_INFRASTRUCTURE, ILLEGAL_PARKING, WATER_SEWER, OTHER.',
      'Allowed urgency values: LOW, MEDIUM, HIGH, CRITICAL.',
      'confidence must be a number between 0 and 1.',
      'reasoning should be short (max 220 chars).',
      `title: ${input.title}`,
      `description: ${input.description}`,
      `location: ${input.location}`,
    ].join('\n');
  }

  private parseJson(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fencedMatch?.[1]) {
        return JSON.parse(fencedMatch[1]);
      }

      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(raw.slice(start, end + 1));
      }

      throw new Error('Could not parse JSON from Gemini response');
    }
  }

  private mapCategory(value?: string): AiCategory {
    const normalized = (value ?? '').trim().toUpperCase();

    const map: Record<string, AiCategory> = {
      WASTE: 'WASTE',
      TRASH: 'WASTE',
      GARBAGE: 'WASTE',
      GREENERY: 'GREENERY',
      TREES: 'GREENERY',
      ROAD_INFRASTRUCTURE: 'ROAD_INFRASTRUCTURE',
      ROAD: 'ROAD_INFRASTRUCTURE',
      POTHOLE: 'ROAD_INFRASTRUCTURE',
      ILLEGAL_PARKING: 'ILLEGAL_PARKING',
      PARKING: 'ILLEGAL_PARKING',
      WATER_SEWER: 'WATER_SEWER',
      WATER: 'WATER_SEWER',
      SEWER: 'WATER_SEWER',
      OTHER: 'OTHER',
    };

    return map[normalized] ?? 'OTHER';
  }

  private mapUrgency(value?: string): AiUrgency {
    const normalized = (value ?? '').trim().toUpperCase();

    const map: Record<string, AiUrgency> = {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      CRITICAL: 'CRITICAL',
      VERY_HIGH: 'CRITICAL',
      URGENT: 'HIGH',
    };

    if (!map[normalized]) {
      throw new Error(`Invalid urgency from Gemini: ${value ?? 'undefined'}`);
    }

    return map[normalized];
  }

  private normalizeConfidence(value?: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 0.5;
    }

    if (value > 1 && value <= 100) {
      return Math.max(0, Math.min(1, value / 100));
    }

    return Math.max(0, Math.min(1, value));
  }

  private normalizeReasoning(value?: string): string {
    const text = (value ?? '').trim();
    if (!text) {
      return 'No reasoning provided by Gemini';
    }

    return text.slice(0, 220);
  }
}
