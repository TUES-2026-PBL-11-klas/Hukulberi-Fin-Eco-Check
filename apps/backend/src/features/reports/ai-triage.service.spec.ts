import { ConfigService } from '@nestjs/config';
import { AiTriageService } from './ai-triage.service';

const createGeminiPayload = (text: string) => ({
  candidates: [
    {
      content: {
        parts: [{ text }],
      },
    },
  ],
});

describe('AiTriageService', () => {
  const originalFetch = global.fetch;
  let service: AiTriageService;
  let configService: { get: jest.Mock };
  let fetchMock: jest.Mock<ReturnType<typeof fetch>, Parameters<typeof fetch>>;

  const input = {
    title: 'Overflowing garbage bins',
    description: 'Bins are full and trash is spreading on the street',
    location: 'Sofia, Mladost',
  };

  beforeEach(() => {
    configService = { get: jest.fn().mockReturnValue('test-api-key') };
    service = new AiTriageService(configService as unknown as ConfigService);

    fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should throw when GEMINI_API_KEY is missing', async () => {
    configService.get.mockReturnValue(undefined);

    await expect(service.classify(input)).rejects.toThrow(
      'GEMINI_API_KEY is missing',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should parse valid JSON response from Gemini', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve(
          createGeminiPayload(
            JSON.stringify({
              category: 'WASTE',
              urgency: 'HIGH',
              confidence: '87%',
              reasoning:
                'Bins are clearly overflowing and require quick action.',
            }),
          ),
        ),
    } as unknown as Response);

    const result = await service.classify(input);

    expect(result).toEqual({
      category: 'WASTE',
      urgency: 'HIGH',
      confidence: 0.87,
      reasoning: 'Bins are clearly overflowing and require quick action.',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should parse fenced JSON and map aliases', async () => {
    const fencedJson = `\`\`\`json\n{"category":"POTHOLE","urgency":"URGENT","confidence":"95%","reasoning":"Large road hole near bus stop."}\n\`\`\``;

    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createGeminiPayload(fencedJson)),
    } as unknown as Response);

    const result = await service.classify(input);

    expect(result.category).toBe('ROAD_INFRASTRUCTURE');
    expect(result.urgency).toBe('HIGH');
    expect(result.confidence).toBe(0.95);
    expect(result.reasoning).toContain('Large road hole');
  });

  it('should use fallback triage on quota errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve('quota exceeded'),
    } as unknown as Response);

    const fallbackResult = await service.classify({
      title: 'Major water leak',
      description: 'Flood near pipe, urgent risk for pedestrians',
      location: 'Sofia Center',
    });

    expect(fallbackResult.category).toBe('WATER_SEWER');
    expect(['HIGH', 'CRITICAL']).toContain(fallbackResult.urgency);
    expect(fallbackResult.confidence).toBeGreaterThanOrEqual(0);
    expect(fallbackResult.confidence).toBeLessThanOrEqual(1);
    expect(fallbackResult.reasoning).toContain('Gemini quota exceeded (429)');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('should throw when all models fail with non-quota errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('internal error'),
    } as unknown as Response);

    await expect(service.classify(input)).rejects.toThrow(
      /Gemini triage failed for all models/i,
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('should throw for invalid urgency values', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve(
          createGeminiPayload(
            JSON.stringify({
              category: 'WASTE',
              urgency: 'IMMEDIATELY',
              confidence: 0.92,
              reasoning: 'Bad urgency enum from model.',
            }),
          ),
        ),
    } as unknown as Response);

    await expect(service.classify(input)).rejects.toThrow(
      /Invalid urgency from Gemini/i,
    );
  });

  it('should default confidence to 0.5 when confidence is not numeric', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve(
          createGeminiPayload(
            JSON.stringify({
              category: 'GREENERY',
              urgency: 'MEDIUM',
              confidence: 'unknown',
              reasoning: '',
            }),
          ),
        ),
    } as unknown as Response);

    const result = await service.classify(input);

    expect(result.category).toBe('GREENERY');
    expect(result.urgency).toBe('MEDIUM');
    expect(result.confidence).toBe(0.5);
    expect(result.reasoning).toBe('No reasoning provided by Gemini');
  });
});
