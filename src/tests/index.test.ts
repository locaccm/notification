import { generateEmailTemplate } from '../services/emailService';
import {params} from '../index'

describe('generateEmailTemplate', () => {
    it('should return a valid email string when given valid params', () => {
        const result = generateEmailTemplate(params);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('Alice');
        expect(result).toContain('This is a personalized notification.');
    });
});
