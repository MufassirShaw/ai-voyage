import { Test, TestingModule } from '@nestjs/testing';

import { TextExtractionService } from './text-extraction.service';

jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({
    getText: jest.fn().mockResolvedValue({ text: 'extracted pdf text' }),
    destroy: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('TextExtractionService', () => {
  let service: TextExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextExtractionService],
    }).compile();

    service = module.get<TextExtractionService>(TextExtractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract text from a PDF buffer', async () => {
    const buffer = Buffer.from('%PDF-1.4 fake pdf content');
    const result = await service.extract(buffer);
    expect(result).toBe('extracted pdf text');
  });
});
