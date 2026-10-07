import pdfParse from 'pdf-parse';
import { geminiService } from './gemini.service.js';
import { buildResumePrompt } from '../prompts/resumePrompt.js';
import { AppError } from '../middleware/errorHandler.js';

class ResumeService {
  /**
   * Extracts text from PDF buffer in memory and parses with Gemini
   * @param {Buffer} pdfBuffer 
   * @returns {Promise<Object>}
   */
  async parseResume(pdfBuffer) {
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
      throw new AppError('Invalid or empty PDF file provided', 400, 'INVALID_FILE');
    }

    let parsedPdf;
    try {
      // Process PDF strictly in memory
      parsedPdf = await pdfParse(pdfBuffer);
    } catch (err) {
      throw new AppError(
        'Could not parse PDF file. The file may be corrupt or password-protected.',
        400,
        'PDF_PARSE_ERROR'
      );
    }

    const rawText = (parsedPdf.text || '').trim();

    // Check if PDF contains meaningful readable text (reject scanned / blank PDFs)
    const alphanumericCount = (rawText.match(/[a-zA-Z0-9]/g) || []).length;
    if (alphanumericCount < 40) {
      throw new AppError(
        'The uploaded PDF appears to be empty, image-scanned, or lacks readable text. Please upload a text-selectable PDF resume.',
        400,
        'EMPTY_OR_SCANNED_PDF'
      );
    }

    // Limit text to avoid prompt abuse (e.g. max 20,000 characters)
    const cappedText = rawText.slice(0, 20000);

    const prompt = buildResumePrompt(cappedText);
    const resumeData = await geminiService.generateJSON(prompt);

    return {
      name: resumeData.name || 'Candidate',
      education: Array.isArray(resumeData.education) ? resumeData.education : [],
      skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
      technologies: Array.isArray(resumeData.technologies) ? resumeData.technologies : [],
      projects: Array.isArray(resumeData.projects) ? resumeData.projects : [],
      experience: Array.isArray(resumeData.experience) ? resumeData.experience : []
    };
  }
}

export const resumeService = new ResumeService();
