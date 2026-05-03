import {
  validateECICitation,
  extractECICitations,
  validateNonPartisan,
  validateIncludesNextSteps,
  validateGeminiResponse,
  validateSearchGroundingEnabled,
  generateValidationReport,
  geminiResponseSchema,
} from '@/lib/google-services-validator';

describe('Google Services Validator', () => {
  describe('validateECICitation', () => {
    it('should detect citations to voters.eci.gov.in', () => {
      const response =
        'According to voters.eci.gov.in, you can check your registration status.';
      expect(validateECICitation(response)).toBe(true);
    });

    it('should detect citations to eci.gov.in', () => {
      const response = 'Visit eci.gov.in for official election information.';
      expect(validateECICitation(response)).toBe(true);
    });

    it('should detect citations to nvsp.in', () => {
      const response = 'Use NVSP at nvsp.in to verify your voter status.';
      expect(validateECICitation(response)).toBe(true);
    });

    it('should detect full URLs to ECI domains', () => {
      const response =
        'You can check your status at https://voters.eci.gov.in/formDownload.';
      expect(validateECICitation(response)).toBe(true);
    });

    it('should return false for missing ECI citations', () => {
      const response = 'To register to vote, you need to submit a form.';
      expect(validateECICitation(response)).toBe(false);
    });

    it('should be case-insensitive', () => {
      const response = 'Visit VOTERS.ECI.GOV.IN for details.';
      expect(validateECICitation(response)).toBe(true);
    });
  });

  describe('extractECICitations', () => {
    it('should extract single citation', () => {
      const response = 'According to voters.eci.gov.in, ...';
      const citations = extractECICitations(response);
      expect(citations).toContain('voters.eci.gov.in');
    });

    it('should extract multiple citations', () => {
      const response =
        'voters.eci.gov.in and eci.gov.in are official sources. Also see nvsp.in.';
      const citations = extractECICitations(response);
      expect(citations.length).toBeGreaterThanOrEqual(3);
      expect(citations.some((c) => c.includes('voters.eci.gov.in'))).toBe(true);
      expect(citations.some((c) => c.includes('nvsp.in'))).toBe(true);
    });

    it('should deduplicate citations', () => {
      const response =
        'voters.eci.gov.in says... voters.eci.gov.in also mentions...';
      const citations = extractECICitations(response);
      expect(citations.length).toBe(1);
    });

    it('should return empty array for no citations', () => {
      const response = 'This response has no official sources.';
      const citations = extractECICitations(response);
      expect(citations).toEqual([]);
    });
  });

  describe('validateNonPartisan', () => {
    it('should pass non-partisan responses', () => {
      const response =
        'The election process involves voter registration and polling day participation.';
      expect(validateNonPartisan(response)).toBe(true);
    });

    it('should reject responses with "support" for candidate', () => {
      const response = 'You should support this candidate in the election.';
      expect(validateNonPartisan(response)).toBe(false);
    });

    it('should reject responses with "vote for"', () => {
      const response = 'Vote for the best candidate in the upcoming elections.';
      expect(validateNonPartisan(response)).toBe(false);
    });

    it('should reject responses with "endorse"', () => {
      const response = 'We endorse this political party for your consideration.';
      expect(validateNonPartisan(response)).toBe(false);
    });

    it('should be case-insensitive', () => {
      const response = 'You should SUPPORT this candidate.';
      expect(validateNonPartisan(response)).toBe(false);
    });
  });

  describe('validateIncludesNextSteps', () => {
    it('should detect "Next Steps:" section', () => {
      const response = 'Here is the information. Next Steps: Visit the portal...';
      expect(validateIncludesNextSteps(response)).toBe(true);
    });

    it('should detect "Next Step:" (singular)', () => {
      const response = 'Next Step: Submit your application.';
      expect(validateIncludesNextSteps(response)).toBe(true);
    });

    it("should detect \"What's next\" phrase", () => {
      const response = "What's next? You should verify your details.";
      expect(validateIncludesNextSteps(response)).toBe(true);
    });

    it('should detect "Proceed with" guidance', () => {
      const response = 'After verification, proceed with visiting the booth.';
      expect(validateIncludesNextSteps(response)).toBe(true);
    });

    it('should detect "following step" guidance', () => {
      const response = 'The following step is to check your electoral roll status.';
      expect(validateIncludesNextSteps(response)).toBe(true);
    });

    it('should return false when no next steps mentioned', () => {
      const response = 'Voter registration is required for all citizens.';
      expect(validateIncludesNextSteps(response)).toBe(false);
    });

    it('should be case-insensitive', () => {
      const response = 'NEXT STEPS: Do this first.';
      expect(validateIncludesNextSteps(response)).toBe(true);
    });
  });

  describe('validateGeminiResponse', () => {
    it('should validate correct response format', () => {
      const response =
        'According to voters.eci.gov.in, you can check your registration status. Next Steps: Visit the official portal.';
      const result = validateGeminiResponse(response);
      expect(result.success).toBe(true);
    });

    it('should fail for missing ECI citations', () => {
      const response =
        'To register, visit a local office. Next Steps: Bring identification.';
      const result = validateGeminiResponse(response);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.flatten().formErrors?.join(' ') || 
                             result.error.flatten().fieldErrors?.content?.join(' ') ||
                             '';
        expect(errorMessages.toLowerCase()).toContain('eci');
      }
    });

    it('should include citation data in successful response', () => {
      const response =
        'According to voters.eci.gov.in, registration steps include... Next Steps: Verify status on nvsp.in.';
      const result = validateGeminiResponse(response);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.citations).toBeDefined();
        expect(result.data.citations?.length).toBeGreaterThan(0);
      }
    });

    it('should detect next steps in validated response', () => {
      const response =
        'According to eci.gov.in, elections happen biannually. Next Steps: Check your state portal.';
      const result = validateGeminiResponse(response);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hasNextSteps).toBe(true);
      }
    });
  });

  describe('validateSearchGroundingEnabled', () => {
    it('should detect googleSearch tool', () => {
      const config = [{ googleSearch: {} }];
      expect(validateSearchGroundingEnabled(config)).toBe(true);
    });

    it('should return false if googleSearch not present', () => {
      const config = [{ functionCalling: {} }];
      expect(validateSearchGroundingEnabled(config)).toBe(false);
    });

    it('should handle empty tools array', () => {
      expect(validateSearchGroundingEnabled([])).toBe(false);
    });

    it('should handle undefined tools', () => {
      expect(validateSearchGroundingEnabled(undefined)).toBe(false);
    });

    it('should handle null-like values', () => {
      expect(validateSearchGroundingEnabled(null as unknown as Array<Record<string, unknown>>)).toBe(false);
    });

    it('should detect googleSearch among multiple tools', () => {
      const config = [
        { functionCalling: {} },
        { googleSearch: {} },
        { codeExecution: {} },
      ];
      expect(validateSearchGroundingEnabled(config)).toBe(true);
    });
  });

  describe('generateValidationReport', () => {
    it('should generate passing report for valid response', () => {
      const response =
        'According to voters.eci.gov.in, you can register online. Next Steps: Visit the portal.';
      const report = generateValidationReport(response);

      expect(report.isValid).toBe(true);
      expect(report.hasCitations).toBe(true);
      expect(report.isNonPartisan).toBe(true);
      expect(report.hasNextSteps).toBe(true);
      expect(report.errors).toHaveLength(0);
    });

    it('should identify missing citations', () => {
      const response = 'Register to vote today! Next Steps: Get started now.';
      const report = generateValidationReport(response);

      expect(report.isValid).toBe(false);
      expect(report.hasCitations).toBe(false);
      expect(report.errors).toContain('Missing ECI source citations');
    });

    it('should identify partisan language', () => {
      const response =
        'According to eci.gov.in, you should support this candidate. Next Steps: Vote for them.';
      const report = generateValidationReport(response);

      expect(report.isValid).toBe(false);
      expect(report.isNonPartisan).toBe(false);
      expect(report.errors).toContain('Response contains partisan language');
    });

    it('should identify missing next steps', () => {
      const response =
        'According to voters.eci.gov.in, registration requires proof of residence.';
      const report = generateValidationReport(response);

      expect(report.isValid).toBe(false);
      expect(report.hasNextSteps).toBe(false);
      expect(report.errors).toContain('Response missing "Next Steps" guidance');
    });

    it('should list all citations found', () => {
      const response =
        'voters.eci.gov.in and eci.gov.in both mention... Next Steps: Check nvsp.in.';
      const report = generateValidationReport(response);

      expect(report.citations.length).toBeGreaterThan(0);
    });
  });

  describe('geminiResponseSchema', () => {
    it('should validate schema with all required fields', () => {
      const data = {
        content:
          'According to voters.eci.gov.in, registration is open. Next Steps: Visit online.',
        role: 'assistant' as const,
      };
      const result = geminiResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if content too short', () => {
      const data = {
        content: 'Short.',
        role: 'assistant' as const,
      };
      const result = geminiResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should enforce ECI citation requirement via schema', () => {
      const data = {
        content: 'Register to vote at your local office. Next Steps: Do it.',
        role: 'assistant' as const,
      };
      const result = geminiResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.flatten().fieldErrors?.content?.join(' ') || '';
        expect(errorMessages.toLowerCase()).toContain('eci');
      }
    });
  });
});
