import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Generate upload URL
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create resume record
export const createResume = mutation({
  args: {
    userId: v.string(),
    jobDescriptionId: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const resumeId = await ctx.db.insert("resumes", {
      ...args,
      uploadedAt: Date.now(),
      analyzed: false,
    });
    return resumeId;
  },
});

// Get resumes by job
export const getResumesByJob = query({
  args: {
    userId: v.string(),
    jobDescriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.jobDescriptionId) {
      return [];
    }

    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_user_and_job", (q) =>
        q.eq("userId", args.userId).eq("jobDescriptionId", args.jobDescriptionId!)
      )
      .order("desc")
      .collect();
    return resumes;
  },
});

// Save analysis
export const saveAnalysis = mutation({
  args: {
    resumeId: v.string(),
    analysisData: v.string(),
    score: v.number(),
    atsScore: v.number(),
    jobMatchScore: v.number(),
  },
  handler: async (ctx, args) => {
    const analysisId = await ctx.db.insert("resumeAnalyses", {
      ...args,
      analyzedAt: Date.now(),
    });

    // Mark resume as analyzed
    const resumes = await ctx.db
      .query("resumes")
      .collect();
    
    const resume = resumes.find(r => r._id === args.resumeId);
    if (resume) {
      await ctx.db.patch(resume._id, { analyzed: true });
    }

    return analysisId;
  },
});

// Get analysis by resume ID
export const getAnalysisByResumeId = query({
  args: {
    resumeId: v.string(),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db
      .query("resumeAnalyses")
      .withIndex("by_resume", (q) => q.eq("resumeId", args.resumeId))
      .first();
    return analysis;
  },
});

// Main AI Analysis Action
export const analyzeResumeWithAI = action({
  args: {
    resumeId: v.string(),
    resumeText: v.string(),
    jobDescriptionId: v.string(),
  },
  handler: async (ctx, args): Promise<{ analysisId: string; result: any }> => {
    // Get job description
    const jobDesc = await ctx.runQuery(api.jobDescriptions.getJobDescriptionById, {
      id: args.jobDescriptionId as any,
    });

    if (!jobDesc) throw new Error("Job description not found");

    // Enhanced cleaning function
    const clean = (s: string) => {
      if (!s || typeof s !== 'string') return '';
      return s
        .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };
    
    const resumeText = clean(args.resumeText).slice(0, 15000);
    const jobTitle = clean(jobDesc.title || "");
    const company = clean(jobDesc.company || "N/A");
    const description = clean(jobDesc.description || "");
    const skills = Array.isArray(jobDesc.skills) 
      ? jobDesc.skills.map((s: string) => clean(s)).filter(Boolean).join(", ")
      : "N/A";
    const requirements = Array.isArray(jobDesc.requirements)
      ? jobDesc.requirements.map((r: string) => clean(r)).filter(Boolean).join(", ")
      : "N/A";

    // Validate inputs
    if (!resumeText) {
      throw new Error("Resume text is empty");
    }

    // IMPROVED PROMPT
    const prompt = `Analyze this resume against the job description and return ONLY valid JSON.

Job Title: ${jobTitle}
Company: ${company}
Description: ${description}
Skills: ${skills}
Requirements: ${requirements}

Resume:
${resumeText}

CRITICAL INSTRUCTIONS:
1. Return ONLY the JSON object below
2. NO markdown, NO code blocks, NO explanations
3. NO text before or after the JSON
4. Ensure all strings are properly quoted
5. NO trailing commas
6. All scores must be integers 0-100

Return this exact structure:
{
  "score": 85,
  "atsCompatibility": {
    "score": 80,
    "issues": ["Issue 1", "Issue 2"],
    "recommendations": ["Rec 1", "Rec 2"]
  },
  "jobMatch": {
    "score": 75,
    "strengths": ["Strength 1", "Strength 2"],
    "gaps": ["Gap 1", "Gap 2"]
  },
  "writingFormatting": {
    "score": 90,
    "issues": ["Issue 1", "Issue 2"],
    "recommendations": ["Rec 1", "Rec 2"]
  },
  "contentAnalysis": {
    "keywords": ["Keyword1", "Keyword2", "Keyword3"]
  },
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured. Run: npx convex env set GEMINI_API_KEY your_key");
      }

      console.log("Starting Gemini API call...");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 5000,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini API Error:", errorBody);
        
        try {
          const errorJson = JSON.parse(errorBody);
          throw new Error(`Gemini API error: ${errorJson?.error?.message || errorBody}`);
        } catch {
          throw new Error(`Gemini API error ${response.status}: ${errorBody.slice(0, 200)}`);
        }
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      console.log("=== RAW AI RESPONSE ===");
      console.log(text.substring(0, 500));
      console.log("======================");

      // IMPROVED JSON EXTRACTION
      let jsonStr = text.trim();
      
      // Remove markdown
      jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      
      // Extract JSON object
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON object found in AI response");
      }
      
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);

      // Fix common JSON issues
      const fixJSON = (str: string): string => {
        return str
          .replace(/,(\s*[}\]])/g, '$1') // trailing commas
          .replace(/'/g, '"') // single quotes
          .replace(/"([^"]*)\n([^"]*)"/g, '"$1 $2"') // newlines in strings
          .replace(/"\s*\n\s*"/g, '",\n"'); // missing commas
      };

      let result;
      let attempts = 0;

      // Try parsing with multiple strategies
      while (attempts < 3) {
        try {
          if (attempts === 0) {
            result = JSON.parse(jsonStr);
            console.log("✓ Parsed successfully");
          } else if (attempts === 1) {
            result = JSON.parse(fixJSON(jsonStr));
            console.log("✓ Parsed after fixes");
          } else {
            // Aggressive cleaning
            const aggressive = jsonStr
              .replace(/,(\s*[}\]])/g, '$1')
              .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
              .replace(/:\s*'([^']*)'/g, ': "$1"')
              .replace(/\n/g, ' ')
              .replace(/\r/g, '')
              .replace(/\t/g, ' ');
            result = JSON.parse(aggressive);
            console.log("✓ Parsed after aggressive cleaning");
          }
          break;
        } catch (err) {
          attempts++;
          if (attempts >= 3) {
            console.error("Failed to parse JSON:", err);
            console.error("Attempted:", jsonStr.substring(0, 300));
            throw new Error(`Invalid JSON after ${attempts} attempts: ${err}`);
          }
        }
      }

      // Validate result
      if (!result || typeof result !== 'object') {
        throw new Error("Parsed result is not a valid object");
      }

      // Normalize and validate
      const validatedResult = {
        score: Number(result.score) || 0,
        atsCompatibility: {
          score: Number(result.atsCompatibility?.score) || 0,
          issues: Array.isArray(result.atsCompatibility?.issues) 
            ? result.atsCompatibility.issues.filter((i: any) => i && typeof i === 'string')
            : ["No issues detected"],
          recommendations: Array.isArray(result.atsCompatibility?.recommendations)
            ? result.atsCompatibility.recommendations.filter((r: any) => r && typeof r === 'string')
            : ["No recommendations"],
        },
        jobMatch: {
          score: Number(result.jobMatch?.score) || 0,
          strengths: Array.isArray(result.jobMatch?.strengths)
            ? result.jobMatch.strengths.filter((s: any) => s && typeof s === 'string')
            : ["No strengths identified"],
          gaps: Array.isArray(result.jobMatch?.gaps)
            ? result.jobMatch.gaps.filter((g: any) => g && typeof g === 'string')
            : ["No gaps identified"],
        },
        writingFormatting: {
          score: Number(result.writingFormatting?.score) || 0,
          issues: Array.isArray(result.writingFormatting?.issues)
            ? result.writingFormatting.issues.filter((i: any) => i && typeof i === 'string')
            : ["No issues detected"],
          recommendations: Array.isArray(result.writingFormatting?.recommendations)
            ? result.writingFormatting.recommendations.filter((r: any) => r && typeof r === 'string')
            : ["No recommendations"],
        },
        contentAnalysis: {
          keywords: Array.isArray(result.contentAnalysis?.keywords)
            ? result.contentAnalysis.keywords.filter((k: any) => k && typeof k === 'string')
            : ["No keywords extracted"],
        },
        suggestions: Array.isArray(result.suggestions) 
          ? result.suggestions.filter((s: any) => s && typeof s === 'string')
          : ["No suggestions available"],
      };

      console.log("✓ Validation complete");

      // Save to database
      const analysisId = await ctx.runMutation(api.resume.saveAnalysis, {
        resumeId: args.resumeId,
        analysisData: JSON.stringify(validatedResult),
        score: validatedResult.score,
        atsScore: validatedResult.atsCompatibility.score,
        jobMatchScore: validatedResult.jobMatch.score,
      });

      return { analysisId, result: validatedResult };
      
    } catch (err) {
      console.error("=== AI ANALYSIS ERROR ===");
      console.error(err);
      throw new Error(`Analysis failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
});