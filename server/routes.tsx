import { Response, Router, Request } from 'express';
import { AuthenticatedRequest, requireAuth, optionalAuth } from './auth.js';
import { requireRole } from './roleGuard.js';
import { db, WizardAnswers } from './db.js';
import { executePythonBackend } from './pythonBridge.js';

export const apiRouter = Router();

// Preset classifications for fast demonstration
export const CLASSIFICATION_PRESETS = [
  {
    id: 'preset-chyawanprash',
    title: 'Classical Ayurvedic Formulation (e.g., Chyawanprash Avaleha)',
    description: 'Classical formulation documented in Charaka Samhita. Section 3(p) non-patentability bar applies due to TKDL prior art.',
    answers: {
      product_name: 'Chyawanprash Avaleha',
      ingredients: 'Amla (Phyllanthus emblica), Dashamoola, Pippali, Honey, Ghee',
      is_classical_based: 'yes_fully',
      is_new_formulation: 'no',
      q1_intended_use: 'treat/prevent disease',
      q2_formulation_origin: 'classical',
      q3_ingredient_form: 'whole_herb',
      q4_novelty_claim: 'none',
      q5_biological_resource_source: 'cultivated',
      q6_target_market: 'both'
    }
  },
  {
    id: 'preset-standardized-extract',
    title: 'Phytopharmaceutical Drug / Standardized Extract',
    description: 'Standardized fraction of Withania somnifera with defined biomarkers. Section 3(e) synergistic evaluation required.',
    answers: {
      product_name: 'Withania Standardized Fraction (WS-40)',
      ingredients: 'Withania somnifera (Ashwagandha) standardized fraction',
      is_classical_based: 'no_proprietary',
      is_new_formulation: 'yes',
      q1_intended_use: 'treat/prevent disease',
      q2_formulation_origin: 'purified_fraction',
      q3_ingredient_form: 'standardized_extract',
      q4_novelty_claim: 'new_process',
      q5_biological_resource_source: 'indian_supplier',
      q6_target_market: 'both'
    }
  },
  {
    id: 'preset-ayurveda-aahar',
    title: 'Ayurveda Aahar (Dietary Wellness / Herbal Tea)',
    description: 'Ayurvedic health tea regulated under FSSAI Ayurveda Aahar Regulations 2022. Non-medicinal label mandatory.',
    answers: {
      product_name: 'Ayush Kwath Wellness Tea Infusion',
      ingredients: 'Tulsi, Dalchini, Sunthi, Krishna Marich',
      is_classical_based: 'yes_fully',
      is_new_formulation: 'no',
      q1_intended_use: 'dietary supplement/Ayurveda Aahar',
      q2_formulation_origin: 'classical',
      q3_ingredient_form: 'whole_herb',
      q4_novelty_claim: 'none',
      q5_biological_resource_source: 'cultivated',
      q6_target_market: 'both'
    }
  }
];

// =========================================================================
// SESSION & CLASSIFICATION ROUTES
// =========================================================================

// Get active session data for user or guest
apiRouter.get('/session', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest_session';
  const session = db.getUserSession(userId);
  return res.json({ session });
});

// Update jurisdiction (India vs International)
apiRouter.put('/session/jurisdiction', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest_session';
  const { jurisdiction } = req.body;
  if (jurisdiction !== 'India' && jurisdiction !== 'International') {
    return res.status(400).json({ error: 'Jurisdiction must be India or International' });
  }

  const updated = db.updateUserSession(userId, { jurisdiction });
  return res.json({ session: updated });
});

// Update ABS Checklist status
apiRouter.put('/session/abs-checklist', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest_session';
  const { resourceIdentified, sourceDocumented, nbaApprovalStatus, markedAsReviewed } = req.body;

  const session = db.getUserSession(userId);
  const checklist = {
    resourceIdentified: Boolean(resourceIdentified ?? session.absChecklist?.resourceIdentified),
    sourceDocumented: Boolean(sourceDocumented ?? session.absChecklist?.sourceDocumented),
    nbaApprovalStatus: Boolean(nbaApprovalStatus ?? session.absChecklist?.nbaApprovalStatus),
    markedAsReviewed: Boolean(markedAsReviewed ?? session.absChecklist?.markedAsReviewed)
  };

  const updated = db.updateUserSession(userId, { absChecklist: checklist });
  return res.json({ absChecklist: updated.absChecklist });
});

// Reset user session & chat history
apiRouter.post('/session/reset', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest_session';
  db.resetUserSession(userId);
  const session = db.getUserSession(userId);
  return res.json({ message: 'Session reset successfully', session });
});

// Get preset classification scenarios
apiRouter.get('/classification/presets', (_req, res) => {
  return res.json({ presets: CLASSIFICATION_PRESETS });
});

// Attribute extraction using Python AI module
apiRouter.post(['/classification/extract', '/classification/extract-free-text'], optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const text = req.body.text || req.body.description || '';
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text or description is required' });
  }

  try {
    const pyResult = await executePythonBackend('extract', { text });
    return res.json({
      ...pyResult,
      extractedAnswers: pyResult.answers || pyResult,
      notice: 'Attributes extracted from botanical formulation text'
    });
  } catch (err: any) {
    console.error('Python attribute extraction error:', err);
    return res.status(500).json({ error: 'Failed to extract attributes from formulation' });
  }
});

// Full product classification & analysis through Python Engine (Authenticated)
apiRouter.post(['/analysis/analyze', '/product/analyze'], requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rawBody = req.body || {};
    const language = rawBody.language || (req.headers['x-language'] as string) || 'en';
    const ingredientsArray: string[] = Array.isArray(rawBody.ingredients)
      ? rawBody.ingredients
      : (typeof rawBody.ingredients === 'string' ? rawBody.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    const ingredientsStr = ingredientsArray.join(', ');

    const session = db.getUserSession(userId);
    const jurisdiction = (rawBody.jurisdiction === 'International' || rawBody.targetMarket?.toLowerCase().includes('international') || (!rawBody.jurisdiction && !rawBody.targetMarket && session?.jurisdiction === 'International'))
      ? 'International'
      : 'India';

    const classificationInput = {
      productName: rawBody.productName || 'Ayurvedic Formulation',
      ingredients: ingredientsStr || 'Classical Ayurvedic Botanical Ingredients',
      intendedUse: rawBody.intendedUse || rawBody.productDescription || 'Therapeutic and general Ayurvedic rejuvenation',
      dosageForm: rawBody.formulation || rawBody.dosageForm || 'Classical Herbal Preparation',
      followsClassicalText: (rawBody.followsClassicalText || (rawBody.involvesTraditionalKnowledge ? 'yes_fully' : 'no')) as 'yes_fully' | 'partially' | 'no',
      targetMarket: rawBody.targetMarket || jurisdiction,
      claimsMade: rawBody.claimedBenefits || rawBody.claimsMade || '',
      resourceOrigin: rawBody.sourceOfIngredients || rawBody.resourceOrigin || rawBody.origin || '',
      sourceOfIngredients: rawBody.sourceOfIngredients || rawBody.resourceOrigin || rawBody.origin || ''
    };

    // 1. Run Python deterministic classification with language support
    const classification = await executePythonBackend('classify', { input: classificationInput, jurisdiction, language });

    // 2. Run Python ABS assessment
    const absResult = await executePythonBackend('abs', {
      jurisdiction,
      resourceOrigin: classificationInput.resourceOrigin,
      sourceOfIngredients: classificationInput.sourceOfIngredients,
      isForeignParticipant: Boolean(rawBody.isForeignParticipant),
      isPatentFiling: true,
      isValueAddedProduct: false,
      isCommercialUtilization: true
    });

    const synthesis = `The formulation "${classificationInput.productName}" is classified as ${classification.category} with ${classification.confidence} confidence under ${jurisdiction} regulatory statutory regimes. ${classification.classificationFactors?.[0] || ''}`;

    const caseId = rawBody.caseId || `CASE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const analysisReport = {
      id: `analysis_${Date.now()}`,
      caseId,
      category: classification.category,
      localizedCategory: classification.localizedCategory || classification.category,
      confidence: classification.confidence,
      classificationFactors: classification.classificationFactors || [],
      regulatoryFramework: classification.regulatoryFramework || [],
      ipImplications: classification.ipImplications || [],
      absRelevance: absResult.statutoryMandates || absResult.legalFindings || [],
      citations: jurisdiction === 'International' ? [
        {
          document: 'Patent Cooperation Treaty (PCT) & Traditional Medicine Search Guidelines',
          section: 'PCT Chapter 21',
          title: 'Traditional Knowledge Non-Patentability & Prior Art Examination',
          relevance: 'Examiners scrutinize herbal formulations against traditional knowledge databases (TKDL)',
          sourceUrl: 'https://www.wipo.int/pct/en/',
          jurisdiction: 'International'
        }
      ] : [
        {
          document: 'The Patents Act, 1970 (as amended)',
          section: 'Section 3(p)',
          title: 'Traditional Knowledge Non-Patentability Bar',
          relevance: 'Statutory bar preventing patenting of traditional medicinal recipes',
          sourceUrl: 'https://ipindia.gov.in',
          jurisdiction: 'India'
        }
      ],
      groundedSynthesis: synthesis,
      jurisdiction: jurisdiction as any,
      timestamp: new Date().toISOString(),
      productDetailsSummary: {
        productName: classificationInput.productName,
        ingredients: ingredientsArray,
        intendedUse: classificationInput.intendedUse,
        formulation: classificationInput.dosageForm,
        involvesTraditionalKnowledge: Boolean(rawBody.involvesTraditionalKnowledge),
        targetMarket: jurisdiction,
        claimedBenefits: classificationInput.claimsMade
      },
      absWorkflowStatus: {
        accessApprovalRequired: jurisdiction === 'International'
          ? (Boolean(classificationInput.resourceOrigin && /india|indian|domestic|bharat/i.test(classificationInput.resourceOrigin)) && Boolean(absResult.absRequired))
          : Boolean(absResult.absRequired),
        benefitSharingLevyEstimate: jurisdiction === 'International'
          ? (Boolean(classificationInput.resourceOrigin && /india|indian|domestic|bharat/i.test(classificationInput.resourceOrigin))
              ? 'Applicable (NBA export access guidelines for Indian resources)'
              : 'Subject to provider country ABS legislation (if Nagoya member)')
          : (absResult.absRequired ? 'Applicable (NBA / SBB standard guidelines)' : 'Exempt'),
        riskLevel: absResult.absRequired ? 'Medium' : 'Low',
        nextSteps: absResult.statutoryMandates || ['Proceed with regulatory licensing']
      }
    };

    // Run IP Protection Analysis across the 7 IP categories
    try {
      const ipResult = await executePythonBackend('ip_analyze', {
        productContext: {
          productName: classificationInput.productName,
          category: classification.category,
          productClassification: classification.category,
          regulatoryCategory: classification.category,
          ingredients: classificationInput.ingredients,
          intendedUse: classificationInput.intendedUse,
          dosageForm: classificationInput.dosageForm,
          claimsMade: classificationInput.claimsMade,
          indications: rawBody.indications || classificationInput.intendedUse,
          followsClassicalText: classificationInput.followsClassicalText,
          classical_text_basis: classificationInput.followsClassicalText,
          resourceOrigin: classificationInput.resourceOrigin,
          sourceOfIngredients: classificationInput.sourceOfIngredients,
          destinationMarket: rawBody.targetMarket || jurisdiction,
          targetMarket: rawBody.targetMarket || jurisdiction,
          jurisdiction: jurisdiction,
          confidence: classification.confidence,
          uncertaintyStatus: classification.confidence === 'High' ? 'Resolved' : 'Uncertainty Flagged'
        },
        jurisdiction,
        language
      });
      (analysisReport as any).ipProtectionAnalysis = ipResult;
    } catch (ipErr) {
      console.warn('IP Protection Analysis generation warning:', ipErr);
    }

    // Run ABS & Regulatory Compliance Analysis across the 4 pillars
    try {
      const complianceResult = await executePythonBackend('compliance_analyze', {
        productContext: {
          productName: classificationInput.productName,
          category: classification.category,
          productClassification: classification.category,
          regulatoryCategory: classification.category,
          ingredients: classificationInput.ingredients,
          intendedUse: classificationInput.intendedUse,
          dosageForm: classificationInput.dosageForm,
          followsClassicalText: classificationInput.followsClassicalText,
          classical_text_basis: classificationInput.followsClassicalText,
          resourceOrigin: classificationInput.resourceOrigin,
          sourceOfIngredients: classificationInput.sourceOfIngredients,
          destinationMarket: rawBody.targetMarket || jurisdiction,
          targetMarket: rawBody.targetMarket || jurisdiction,
          jurisdiction: jurisdiction,
          confidence: classification.confidence,
          uncertaintyStatus: classification.confidence === 'High' ? 'Resolved' : 'Uncertainty Flagged'
        },
        jurisdiction,
        language
      });
      (analysisReport as any).complianceAnalysis = complianceResult;
    } catch (compErr) {
      console.warn('Compliance Analysis generation warning:', compErr);
    }

    // Update user session in store
    db.updateUserSession(userId, {
      jurisdiction,
      classificationResult: {
        product_name: classificationInput.productName,
        category: classification.category,
        intended_use: classificationInput.intendedUse,
        formulation_basis: classificationInput.dosageForm,
        why_assigned: (classification.classificationFactors || []).join(' '),
        patent_potential: classification.patentPotential || 'Requires patentability assessment',
        ip_considerations: (classification.ipImplications || []).join(' | '),
        regulatory_considerations: (classification.regulatoryFramework || []).join(' | '),
        abs_status: (absResult.statutoryMandates || []).join(' | '),
        abs_required: Boolean(absResult.absRequired),
        tkdl_3p_risk: classification.category === 'Classical Ayurvedic Medicine' ? 'High' : 'Low',
        confidence: classification.confidence,
        classificationTimestamp: new Date().toISOString()
      }
    });

    // Save to user's isolated history
    const auditMetadata = {
      event: 'FORMULATION_IP_STATUTORY_ANALYSIS',
      analyzedAt: analysisReport.timestamp,
      jurisdictionApplied: jurisdiction,
      language: language,
      corpusVersion: '2026.1-statutory-ayush',
      securityClassification: 'CONFIDENTIAL_RESTRICTED',
      psCompliance: 'SIH_PS_26045_COMPLIANT',
      abstentionFlag: (analysisReport as any).confidence === 'Low' || (analysisReport as any).category?.includes('Uncertain')
    };
    (analysisReport as any).auditMetadata = auditMetadata;

    const historyItem = {
      id: analysisReport.id || caseId,
      caseId,
      timestamp: analysisReport.timestamp,
      productName: classificationInput.productName,
      category: classification.category,
      intendedUse: classificationInput.intendedUse,
      ingredients: ingredientsStr,
      dosageForm: classificationInput.dosageForm,
      confidence: classification.confidence,
      targetMarket: jurisdiction,
      language,
      ipStatus: (analysisReport as any).ipProtectionAnalysis?.ipCategories?.find((c: any) => c.category === 'Patent')?.status || (classification.ipImplications?.[0] || 'Evaluated'),
      absStatus: absResult.statutoryMandates?.[0] || (absResult.absRequired ? 'ABS Required' : 'Exempt'),
      humanReviewStatus: 'Analysis Completed',
      auditMetadata,
      input: {
        productName: classificationInput.productName,
        ingredients: ingredientsStr,
        intendedUse: classificationInput.intendedUse,
        dosageForm: classificationInput.dosageForm,
        followsClassicalText: classificationInput.followsClassicalText,
        targetMarket: jurisdiction,
        claimsMade: classificationInput.claimsMade
      },
      result: analysisReport
    };
    db.saveAnalysisRecord(userId, historyItem);

    return res.json(analysisReport);
  } catch (err: any) {
    console.error('[API /analysis/analyze] Error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to complete formulation analysis' });
  }
});

// Fast classification endpoint
apiRouter.post(['/analysis/classify', '/product/classify'], optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawBody = req.body || {};
    const classification = await executePythonBackend('classify', {
      input: rawBody,
      jurisdiction: rawBody.jurisdiction || 'India'
    });

    return res.json({
      category: classification.category,
      confidence: classification.confidence,
      statutoryBasis: classification.regulatoryFramework?.[0] || 'Drugs and Cosmetics Act, 1940',
      reasoning: classification.classificationFactors || [],
      clarificationQuestions: [],
      isUnambiguous: classification.confidence === 'High'
    });
  } catch (err: any) {
    console.error('[API /analysis/classify] Error:', err);
    return res.status(500).json({ error: err?.message || 'Classification failed' });
  }
});

// ABS Assessment Endpoint
apiRouter.post('/abs/assess', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await executePythonBackend('abs', req.body);
    return res.json(result);
  } catch (err: any) {
    console.error('[API /abs/assess] Error:', err);
    return res.status(500).json({ error: err?.message || 'ABS assessment failed' });
  }
});

// =========================================================================
// PRODUCT-SPECIFIC IP PROTECTION ANALYSIS ENDPOINT (7 IP CATEGORIES)
// =========================================================================
apiRouter.post(['/ip/analyze', '/ip-analysis/analyze'], optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawBody = req.body || {};
    const language = rawBody.language || (req.headers['x-language'] as string) || 'en';
    const session = req.user ? db.getUserSession(req.user.id) : null;
    const jurisdiction = (
      rawBody.jurisdiction === 'International' ||
      rawBody.productContext?.targetMarket?.toLowerCase?.()?.includes('international') ||
      rawBody.productContext?.jurisdiction === 'International' ||
      (!rawBody.jurisdiction && !rawBody.productContext?.targetMarket && session?.jurisdiction === 'International')
    ) ? 'International' : (rawBody.jurisdiction || rawBody.productContext?.targetMarket || rawBody.productContext?.jurisdiction || 'India');

    const productContext = rawBody.productContext || rawBody.classification || rawBody;

    const ipResult = await executePythonBackend('ip_analyze', {
      productContext,
      jurisdiction,
      language
    });

    return res.json(ipResult);
  } catch (err: any) {
    console.error('[API /ip/analyze] Error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to complete IP protection analysis' });
  }
});

// =========================================================================
// ABS & REGULATORY COMPLIANCE ANALYSIS ENDPOINT (4 PILLARS)
// 1. Biodiversity / ABS Assessment
// 2. NBA Approval Assessment
// 3. Traditional Knowledge / TKDL Assessment
// 4. Product Regulatory Requirements
// =========================================================================
apiRouter.post(['/compliance/analyze', '/abs-regulatory/analyze'], optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawBody = req.body || {};
    const language = rawBody.language || (req.headers['x-language'] as string) || 'en';
    const session = req.user ? db.getUserSession(req.user.id) : null;
    const jurisdiction = (
      rawBody.jurisdiction === 'International' ||
      rawBody.productContext?.targetMarket?.toLowerCase?.()?.includes('international') ||
      rawBody.productContext?.jurisdiction === 'International' ||
      (!rawBody.jurisdiction && !rawBody.productContext?.targetMarket && session?.jurisdiction === 'International')
    ) ? 'International' : (rawBody.jurisdiction || rawBody.productContext?.targetMarket || rawBody.productContext?.jurisdiction || 'India');

    const productContext = rawBody.productContext || rawBody.classification || rawBody;

    const complianceResult = await executePythonBackend('compliance_analyze', {
      productContext,
      jurisdiction,
      language
    });

    return res.json(complianceResult);
  } catch (err: any) {
    console.error('[API /compliance/analyze] Error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to complete ABS & regulatory compliance analysis' });
  }
});

// =========================================================================
// CHAT & STATUTORY RAG PIPELINE (POWERED BY PYTHON BACKEND)
// =========================================================================

apiRouter.post(['/chat', '/chat/message'], optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest_session';
  const query = req.body.query;
  const language = req.body.language || (req.headers['x-language'] as string) || 'en';

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Question query is required' });
  }

  const session = db.getUserSession(userId);
  const jurisdiction = req.body.jurisdiction || session.jurisdiction || 'India';
  const classification = session.classificationResult;

  try {
    // Execute central Python RAG pipeline
    const ragResult = await executePythonBackend('chat', {
      query: query.trim(),
      jurisdiction,
      language,
      classificationCategory: classification?.category || 'General Ayurvedic Product',
      classificationDetails: classification ? {
        category: classification.category,
        productName: classification.product_name,
        ingredients: (classification as any).ingredients,
        intendedUse: classification.intended_use,
        dosageForm: classification.formulation_basis,
        formulationBasis: classification.formulation_basis,
        targetMarket: jurisdiction,
        regulatoryCategory: classification.category,
        uncertaintyStatus: classification.confidence === 'High' ? 'Clear' : 'Uncertainty Flagged',
        patentPotential: classification.patent_potential,
        ipConsiderations: classification.ip_considerations,
        regulatoryConsiderations: classification.regulatory_considerations,
        absStatus: classification.abs_status,
        confidence: classification.confidence
      } : null
    });

    const userMessage = {
      id: `msg_${Date.now()}_user`,
      sender: 'user' as const,
      content: query.trim(),
      timestamp: new Date().toISOString()
    };

    const assistantMessage = {
      id: `msg_${Date.now()}_ast`,
      sender: 'assistant' as const,
      content: ragResult.answer,
      timestamp: new Date().toISOString(),
      citations: ragResult.citations || [],
      confidence: ragResult.confidence || 'High',
      out_of_scope: ragResult.outOfScope || false,
      abstained: ragResult.outOfScope || Boolean(ragResult.abstained),
      explanationDetails: ragResult.explanationDetails
    };

    const newHistory = [...session.chatHistory, userMessage, assistantMessage];
    db.updateUserSession(userId, { chatHistory: newHistory });

    return res.json({
      message: assistantMessage,
      chatHistory: newHistory
    });
  } catch (err: any) {
    console.error('Error during Python RAG query execution:', err);
    return res.status(500).json({
      error: 'Failed to process inquiry via statutory RAG pipeline.',
      details: err?.message
    });
  }
});

// Dedicated RAG Query endpoint for floating chatbot and legal analysis assistant
apiRouter.post('/rag/query', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in or register to consult the statutory RAG assistant.',
      requiresAuth: true
    });
  }

  const userId = req.user.id;
  const { query, jurisdiction: reqJur, language: reqLang, productContext } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const session = db.getUserSession(userId);
  const jurisdiction = reqJur || productContext?.targetMarket || session.jurisdiction || 'India';
  const language = reqLang || (req.headers['x-language'] as string) || 'en';
  const classification = productContext || session.classificationResult;

  try {
    const classificationDetails = classification ? {
      category: classification.category || 'General Ayurvedic Product',
      productName: classification.productName || classification.product_name,
      ingredients: Array.isArray(classification.ingredients) ? classification.ingredients.join(', ') : classification.ingredients,
      intendedUse: classification.intendedUse || classification.intended_use,
      dosageForm: classification.dosageForm || classification.formulationBasis || classification.formulation_basis,
      formulationBasis: classification.dosageForm || classification.formulationBasis || classification.formulation_basis,
      targetMarket: classification.targetMarket || jurisdiction,
      jurisdiction: jurisdiction,
      regulatoryCategory: classification.category,
      uncertaintyStatus: classification.confidence === 'High' ? 'Clear' : 'Uncertainty Flagged',
      patentPotential: classification.patentPotential || classification.patent_potential,
      ipConsiderations: classification.ipConsiderations || classification.ip_considerations,
      regulatoryConsiderations: classification.regulatoryConsiderations || classification.regulatory_considerations,
      absStatus: classification.absStatus || classification.abs_status,
      confidence: classification.confidence || 'High'
    } : null;

    const ragResult = await executePythonBackend('chat', {
      query: query.trim(),
      jurisdiction,
      language,
      classificationCategory: classification?.category,
      classificationDetails
    });

    const isAbstained = ragResult.outOfScope || Boolean(ragResult.abstained);

    return res.json({
      answer: ragResult.answer,
      citations: ragResult.citations || [],
      evidenceCount: (ragResult.citations || []).length,
      evidence: ragResult.citations || [],
      confidence: ragResult.confidence || 'High',
      jurisdiction: ragResult.explanationDetails?.jurisdictionUsed || jurisdiction,
      language: ragResult.explanationDetails?.languageDetected || language,
      abstained: isAbstained,
      abstentionReason: isAbstained ? 'Insufficient authoritative evidence found.' : undefined,
      explanationDetails: ragResult.explanationDetails
    });
  } catch (error: any) {
    console.error('Error in Python /rag/query endpoint:', error);
    return res.status(500).json({ error: error?.message || 'RAG execution failed' });
  }
});

// Direct test endpoint
apiRouter.post('/rag/test', async (req: Request, res: Response) => {
  const { query, jurisdiction = 'India', classificationCategory } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const result = await executePythonBackend('chat', {
      query: query.trim(),
      jurisdiction,
      classificationCategory
    });
    return res.json(result);
  } catch (error: any) {
    console.error('Error in Python RAG test endpoint:', error);
    return res.status(500).json({ error: error?.message || 'RAG execution failed' });
  }
});

// =========================================================================
// ANALYSIS HISTORY ROUTES (USER ISOLATED & AUTHENTICATED)
// =========================================================================

apiRouter.get('/analysis/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const history = db.getAnalysisHistory(userId);
  return res.json({ history });
});

apiRouter.post('/analysis/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const item = req.body;
  if (!item || !item.productName) {
    return res.status(400).json({ error: 'Valid history item is required' });
  }
  db.saveAnalysisRecord(userId, item);
  return res.json({ message: 'History record saved', item });
});

apiRouter.delete('/analysis/history/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const deleted = db.deleteAnalysisRecord(userId, id);
  return res.json({ success: deleted, message: deleted ? 'Record deleted successfully' : 'Record not found' });
});

apiRouter.delete('/analysis/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  db.clearAnalysisHistory(userId);
  return res.json({ success: true, message: 'All analysis history cleared for user' });
});

// =========================================================================
// ADMIN — USER MANAGEMENT (admin-only)
// =========================================================================

apiRouter.get('/admin/users', requireAuth, requireRole('admin'), (_req: AuthenticatedRequest, res: Response) => {
  const users = (db as unknown as { getUsers: () => unknown[] }).getUsers();
  return res.json({ users });
});

// Change another user's accessRole. Deliberately NOT allowed to target req.user's own
// id here — an admin demoting themselves via this bulk endpoint, especially the last
// remaining admin, would lock everyone out of admin functionality.
apiRouter.patch('/admin/users/:id/access-role', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { accessRole } = req.body;
  const validRoles = ['admin', 'expert', 'user'];

  if (!accessRole || !validRoles.includes(accessRole)) {
    return res.status(400).json({ error: `accessRole must be one of: ${validRoles.join(', ')}` });
  }

  if (id === req.user!.id) {
    return res.status(400).json({ error: 'Use a second admin account to change your own access role.' });
  }

  const target = db.findUserById(id);
  if (!target) {
    return res.status(404).json({ error: 'User not found' });
  }

  if ((target as unknown as { accessRole?: string }).accessRole === 'admin' && accessRole !== 'admin' && (db as unknown as { getUsers: () => Array<{ accessRole: string }> }).getUsers().filter(user => user.accessRole === 'admin').length <= 1) {
    return res.status(400).json({ error: 'Cannot remove the last remaining admin account.' });
  }

  const updated = (db as unknown as {
    setAccessRole: (userId: string, role: string) =>
      | { id: string; name: string; email: string; accessRole: string }
      | undefined;
  }).setAccessRole(id, accessRole);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    message: 'Access role updated',
    user: { id: updated.id, name: updated.name, email: updated.email, accessRole }
  });
});

// =========================================================================
// KNOWLEDGE BASE & STATUTES
// =========================================================================

// READ: any authenticated user (user/expert/admin) can see which statutory documents
// are currently loaded — this is informational/transparency data shown alongside
// citations, not a privileged action.
apiRouter.get('/knowledge/documents', requireAuth, async (_req, res) => {
  try {
    const data = await executePythonBackend('knowledge');
    const loadedState = db.getKnowledgeLoadedState();
    const docs = (data.documents || []).map((d: any) => ({
      ...d,
      isLoaded: loadedState[d.id] !== undefined ? loadedState[d.id] : (d.isLoaded !== false)
    }));
    return res.json({ documents: docs });
  } catch (err: any) {
    console.error('Knowledge retrieval error:', err);
    return res.status(500).json({ error: 'Failed to retrieve statutory documents' });
  }
});

// WRITE: this flips a document on/off for EVERY user of the app (it's global,
// shared state in store.json), so it is admin-only. Previously this endpoint had
// no auth check at all — this was the most critical finding in the audit.
apiRouter.post('/knowledge/toggle', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentId, loaded } = req.body;
    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
    }
    db.setKnowledgeLoadedState(documentId, Boolean(loaded));
    const data = await executePythonBackend('knowledge');
    const loadedState = db.getKnowledgeLoadedState();
    const docs = (data.documents || []).map((d: any) => ({
      ...d,
      isLoaded: loadedState[d.id] !== undefined ? loadedState[d.id] : (d.isLoaded !== false)
    }));
    return res.json({ message: 'Document loaded state updated', documents: docs });
  } catch (err: any) {
    console.error('Knowledge toggle error:', err);
    return res.status(500).json({ error: 'Failed to toggle document loaded state' });
  }
});

// Human facilitator review dossier export (Legacy endpoint preserved)
apiRouter.get('/facilitator/dossier', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user || {
    id: 'usr_guest',
    name: 'Guest Applicant',
    email: 'guest@aiia.gov.in',
    role: 'Ayurvedic Practitioner'
  };
  const session = db.getUserSession(user.id);

  const dossier = {
    exportDate: new Date().toISOString(),
    system: 'IP-SAKTI Sahayak - Ayurvedic Intellectual Property & Regulatory Guidance System (Python RAG Engine)',
    applicant: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    jurisdiction: session.jurisdiction || 'India',
    classificationAnswers: session.classificationAnswers || null,
    classificationResult: session.classificationResult || null,
    absChecklist: session.absChecklist || null,
    chatTranscript: session.chatHistory || [],
    disclaimer:
      'Information and decision support only — not legal advice. Based on loaded statutory reference documents. Consult a registered patent agent or AYUSH regulatory legal professional before filing or commercial launch.'
  };

  return res.json({ dossier });
});

// =========================================================================
// FINAL CASE DOSSIER & HUMAN FACILITATOR REVIEW ENDPOINTS (AUTHENTICATED)
// =========================================================================
const facilitatorReviewStore = new Map<string, any>();

apiRouter.post('/dossier/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawBody = req.body || {};
    const user = req.user!;

    const dossier = await executePythonBackend('dossier_create', {
      ...rawBody,
      applicant: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      language: rawBody.language || (req.headers['x-language'] as string) || 'en'
    });

    return res.json({ dossier });
  } catch (err: any) {
    console.error('Error generating case dossier:', err);
    return res.status(500).json({ error: err?.message || 'Failed to generate case dossier' });
  }
});

apiRouter.post('/dossier/export', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawBody = req.body || {};
    const result = await executePythonBackend('dossier_export', rawBody);
    return res.json(result);
  } catch (err: any) {
    console.error('Error exporting case dossier:', err);
    return res.status(500).json({ error: err?.message || 'Failed to export case dossier' });
  }
});

apiRouter.post('/facilitator/review', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawBody = req.body || {};
    const ticket = await executePythonBackend('facilitator_review', {
      ...rawBody,
      applicant: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role
      }
    });
    if (ticket && ticket.reviewId) {
      facilitatorReviewStore.set(ticket.reviewId, {
        ...ticket,
        userId: req.user!.id
      });
    }
    return res.json({ ticket });
  } catch (err: any) {
    console.error('Error submitting facilitator review:', err);
    return res.status(500).json({ error: err?.message || 'Failed to submit facilitator review' });
  }
});

apiRouter.get('/facilitator/review/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const ticket = facilitatorReviewStore.get(id);
  if (!ticket || ticket.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Review request not found or unauthorized' });
  }
  return res.json({ ticket });
});

// =========================================================================
// RAG BENCHMARK & EVALUATION SUITE (SIH PS 26045 COMPLIANCE)
// =========================================================================

// Internal eval/benchmark tooling — not a normal-user feature, and each call spawns
// a Python process, so it's restricted to admin to avoid unauthenticated compute
// triggering / abuse.
apiRouter.get('/rag/benchmark', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const report = await executePythonBackend('benchmark');
    return res.json(report);
  } catch (err: any) {
    console.error('Benchmark execution error:', err);
    return res.status(500).json({ error: 'Failed to run RAG benchmark evaluation' });
  }
});

apiRouter.post('/rag/evaluate', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const report = await executePythonBackend('evaluate');
    return res.json(report);
  } catch (err: any) {
    console.error('Evaluation execution error:', err);
    return res.status(500).json({ error: 'Failed to run RAG evaluation suite' });
  }
});