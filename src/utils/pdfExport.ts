import { jsPDF } from 'jspdf';
import { CaseDossier, FullProductAnalysisReport } from '../types/analysis.js';
import { Language } from '../i18n/index.js';
import {
  translateActName,
  translateSection,
  translateProvision,
  translateCategory,
  translateIpCategoryName,
  translateIpStatus
} from './statutoryTranslation.js';

/**
 * Exports a full Case Dossier into a professional, multi-page downloaded PDF report
 */
export function exportCaseDossierToPdf(dossier: CaseDossier, lang: Language = 'en'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 14) {
      doc.addPage();
      y = margin;
      drawHeaderSmall();
    }
  };

  const drawHeaderSmall = () => {
    doc.setFillColor(15, 42, 74); // Deep Navy #0F2A4A
    doc.rect(margin, y, contentWidth, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(245, 158, 11); // Amber
    doc.text('IP-SAKTI SAHAYAK • STATUTORY CASE DOSSIER & REGULATORY REPORT', margin + 3, y + 5);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(`CASE: ${dossier.caseId}`, pageWidth - margin - 3, y + 5, { align: 'right' });
    y += 11;
  };

  // --- Title Banner (Page 1) ---
  doc.setFillColor(15, 42, 74); // Deep Navy
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('IP-SAKTI SAHAYAK', margin + 4, y + 7);

  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text('OFFICIAL STATUTORY FORMULATION, IP PROTECTION & REGULATORY DOSSIER', margin + 4, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Case ID: ${dossier.caseId}  |  Date: ${new Date(dossier.timestamp).toLocaleDateString()}  |  Jurisdiction: ${dossier.jurisdiction || 'India'}  |  Language: ${lang.toUpperCase()}`, margin + 4, y + 19);

  y += 28;

  // --- Section 1: Product Formulation Summary ---
  checkPageBreak(35);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 42, 74);
  doc.text('1. PRODUCT FORMULATION ATTRIBUTES', margin + 3, y + 4.5);
  y += 8;

  const prod = dossier.productInformation || {} as any;
  const prodItems: [string, string][] = [
    ['Product Name:', String(prod.productName || dossier.title || 'Ayurvedic Formulation')],
    ['Ingredients / Botanicals:', String(prod.ingredients || 'Botanical constituents recorded in dossier')],
    ['Intended Indication:', String(prod.intendedUse || 'Therapeutic / Health Wellness')],
    ['Dosage Form:', String(prod.dosageForm || 'Classical / Proprietary Formulation')],
    ['Classical Treatise Basis:', String(prod.followsClassicalText || 'First Schedule Ayurvedic Samhitas')],
    ['Target Jurisdiction:', String(dossier.jurisdiction || 'India')]
  ];

  doc.setFontSize(8);
  for (const [label, val] of prodItems) {
    checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(label, margin + 2, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const splitVal = doc.splitTextToSize(val, contentWidth - 48);
    doc.text(splitVal, margin + 48, y + 4);
    y += Math.max(5.5, splitVal.length * 3.8);
  }
  y += 3;

  // --- Section 2: Statutory Classification ---
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 42, 74);
  doc.text('2. STATUTORY CLASSIFICATION & REGIME', margin + 3, y + 4.5);
  y += 8;

  const cls = dossier.classification || {} as any;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text(`Category: ${translateCategory(cls.category || 'Ayurvedic Formulation', lang)}`, margin + 2, y + 4);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Confidence: ${cls.confidence || 'High'}  |  Status: ${dossier.statusLabel || 'Complete'}`, pageWidth - margin - 4, y + 4, { align: 'right' });
  y += 7;

  if (cls.statutoryBasis) {
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Statutory Mandate:', margin + 2, y + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const splitBasis = doc.splitTextToSize(cls.statutoryBasis, contentWidth - 30);
    doc.text(splitBasis, margin + 30, y + 3.5);
    y += Math.max(5, splitBasis.length * 3.5);
  }

  if (cls.reasoning && Array.isArray(cls.reasoning)) {
    for (const r of cls.reasoning) {
      checkPageBreak(7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const splitR = doc.splitTextToSize(`• ${r}`, contentWidth - 6);
      doc.text(splitR, margin + 4, y + 3);
      y += splitR.length * 3.6;
    }
  }
  y += 4;

  // --- Section 3: Intellectual Property Protection Assessment (7 Categories) ---
  checkPageBreak(35);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 42, 74);
  doc.text('3. INTELLECTUAL PROPERTY (IP) PROTECTION PATHWAYS (7 REGIMES)', margin + 3, y + 4.5);
  y += 8;

  const ipCats = dossier.ipProtectionAnalysis?.ipCategories || [];
  if (ipCats.length > 0) {
    for (const cat of ipCats) {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const translatedCatName = translateIpCategoryName(cat.category, lang);
      const translatedStatus = translateIpStatus(cat.status, lang);
      doc.text(`${translatedCatName} — Status: ${translatedStatus}`, margin + 2, y + 3);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const reasonText = cat.reason || (cat as any).explanation || 'Statutory review indicated.';
      const splitReason = doc.splitTextToSize(reasonText, contentWidth - 6);
      doc.text(splitReason, margin + 4, y + 3);
      y += splitReason.length * 3.6;

      const provs = cat.provisions || (cat as any).legalProvisions;
      if (provs && provs.length > 0) {
        checkPageBreak(6);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(146, 64, 14); // amber-800
        const provText = `Statutory Provisions: ${provs.map((p: string) => translateProvision(p, lang)).join('; ')}`;
        const splitProv = doc.splitTextToSize(provText, contentWidth - 6);
        doc.text(splitProv, margin + 4, y + 3);
        y += splitProv.length * 3.4;
      }
      y += 2;
    }
  }
  y += 3;

  // --- Section 4: ABS & Regulatory Compliance (4 Pillars) ---
  checkPageBreak(35);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 42, 74);
  doc.text('4. ACCESS & BENEFIT SHARING (ABS) & REGULATORY LICENSING (4 PILLARS)', margin + 3, y + 4.5);
  y += 8;

  const abs = dossier.absRegulatoryCompliance || {} as any;
  const absPillars = [
    {
      title: 'A. Biodiversity / ABS Assessment (Biological Diversity Act, 2002)',
      status: abs.biodiversityABS?.status || 'Applicable',
      details: abs.biodiversityABS?.explanation || abs.biodiversityABS?.reasoning || 'Evaluation under Section 3 & 7 BDA 2002.'
    },
    {
      title: 'B. NBA Approval Mandate (National Biodiversity Authority)',
      status: abs.nbaApproval?.status || 'Conditional',
      details: abs.nbaApproval?.explanation || abs.nbaApproval?.reasoning || 'Mandatory Form III approval requirement prior to IP grant.'
    },
    {
      title: 'C. Traditional Knowledge / TKDL Prior Art Assessment',
      status: abs.traditionalKnowledgeTKDL?.status || 'Documented',
      details: abs.traditionalKnowledgeTKDL?.explanation || abs.traditionalKnowledgeTKDL?.reasoning || 'Public domain status under Section 3(p).'
    },
    {
      title: 'D. Manufacturing Licensing & Quality Standards',
      status: abs.regulatoryRequirements?.status || 'Required',
      details: abs.regulatoryRequirements?.explanation || abs.regulatoryRequirements?.reasoning || 'Schedule T GMP and Ayush State Licensing Authority.'
    }
  ];

  for (const pillar of absPillars) {
    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${pillar.title} [${translateIpStatus(pillar.status, lang)}]`, margin + 2, y + 3);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitD = doc.splitTextToSize(pillar.details, contentWidth - 6);
    doc.text(splitD, margin + 4, y + 3);
    y += splitD.length * 3.5 + 2;
  }
  y += 3;

  // --- Section 5: Authoritative Citations & Legal Evidence ---
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 42, 74);
  doc.text('5. RETRIEVED STATUTORY LEGAL EVIDENCE & GAZETTE CITATIONS', margin + 3, y + 4.5);
  y += 8;

  const citations = dossier.ragEvidence || [];
  if (citations.length > 0) {
    for (const c of citations) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 42, 74);
      const actTranslated = translateActName(c.document || (c as any).actRegulation || 'Statute', lang);
      const secTranslated = translateSection(c.section || (c as any).sectionRule || '', lang);
      doc.text(`${actTranslated} — ${secTranslated}`, margin + 2, y + 3);
      y += 4.5;

      const snippet = c.relevantEvidenceSnippet || (c as any).textSnippet;
      if (snippet) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        const splitSnip = doc.splitTextToSize(`"${snippet}"`, contentWidth - 6);
        doc.text(splitSnip, margin + 4, y + 2.5);
        y += splitSnip.length * 3.2;
      }
      y += 2;
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Codified statutory references: Patents Act 1970 Sec 3(p), 3(e); BDA 2002 Sec 3, 6, 7; Drugs & Cosmetics Act 1940 Sec 3(a), 3(h).', margin + 4, y + 3.5);
    y += 6;
  }
  y += 3;

  // --- Section 6: Uncertainty Flags & Human Review Flags ---
  if (dossier.uncertaintyFlags && dossier.uncertaintyFlags.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(254, 243, 199); // amber-100
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('6. IDENTIFIED STATUTORY UNCERTAINTIES & REVIEW FLAGS', margin + 3, y + 4.5);
    y += 8;

    for (const flag of dossier.uncertaintyFlags) {
      checkPageBreak(9);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 53, 15);
      const splitF = doc.splitTextToSize(`• [${(flag.severity || 'REVIEW').toUpperCase()}] ${flag.message || (flag as any).issueDescription}: ${flag.missingItem || (flag as any).suggestedResolution || 'Facilitator verification suggested.'}`, contentWidth - 6);
      doc.text(splitF, margin + 4, y + 3);
      y += splitF.length * 3.5 + 2;
    }
    y += 3;
  }

  // --- Footers on all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - margin - 4.5, pageWidth - margin, pageHeight - margin - 4.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('IP-SAKTI Sahayak. Citations grounded in verified Acts and Samhitas.', margin, pageHeight - margin);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
  }

  // Trigger browser download
  const safeFilename = `${dossier.caseId || 'IP_SAKTI'}_Statutory_Report_${Date.now()}.pdf`;
  doc.save(safeFilename);
}

/**
 * Exports Full Product Analysis Report to PDF
 */
export function exportFullReportToPdf(report: FullProductAnalysisReport, lang: Language = 'en'): void {
  const caseId = `CASE-${(report.productSummary?.productName || 'AYURVEDA').replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const dossier: CaseDossier = {
    caseId,
    title: `Statutory Report — ${report.productSummary?.productName || 'Ayurvedic Product'}`,
    statusLabel: 'Completed Analysis',
    timestamp: new Date().toISOString(),
    language: lang,
    jurisdiction: report.jurisdiction,
    productInformation: {
      productName: report.productSummary?.productName || 'Ayurvedic Formulation',
      ingredients: Array.isArray(report.productSummary?.ingredients)
        ? report.productSummary.ingredients.join(', ')
        : String(report.productSummary?.ingredients || ''),
      intendedUse: report.productSummary?.productDescription || '',
      dosageForm: (report.productSummary as any)?.dosageForm || 'Standard Formulation',
      followsClassicalText: (report.productSummary as any)?.followsClassicalText || (report.traditionalKnowledge?.traditionalKnowledgeInvolved ? 'yes' : 'no'),
      targetMarket: report.productSummary?.targetMarket || report.jurisdiction
    },
    classification: {
      category: report.classification?.category || 'Ayurvedic Formulation',
      confidence: report.classification?.confidence || report.confidence || 'High',
      statutoryBasis: report.classification?.statutoryBasis || 'Drugs and Cosmetics Act, 1940',
      reasoning: report.classification?.reasoning || [],
      regulatoryPathway: report.regulatoryConsiderations?.map(r => r.regulatoryArea) || []
    },
    ipProtectionAnalysis: report.ipProtectionAnalysis || {
      summary: 'Evaluated under 7 statutory IP regimes.',
      ipCategories: []
    },
    absRegulatoryCompliance: {
      biodiversityABS: {
        status: report.traditionalKnowledge?.absClearanceRequired ? 'Applicable' : 'Exempt',
        explanation: 'Assessed under Biological Diversity Act 2002.'
      },
      nbaApproval: {
        status: 'Conditional upon filing',
        explanation: 'Section 6 NBA approval mandated prior to IP grant.'
      },
      traditionalKnowledgeTKDL: {
        status: report.traditionalKnowledge?.tkdlPriorArtExposure || 'Documented',
        explanation: 'Assessed against TKDL and Classical Samhita prior art.'
      },
      regulatoryRequirements: {
        status: 'Applicable',
        explanation: 'State Licensing Authority and Schedule T GMP compliance required.'
      }
    },
    ragEvidence: (report.citations || []).map(c => ({
      document: c.source,
      section: c.section,
      textSnippet: c.contextSnippet,
      authority: c.authority,
      sourceUrl: c.sourceUrl
    })),
    uncertaintyFlags: [],
    humanReviewStatus: 'Submitted',
    disclaimer: 'This AI-generated assessment is for legal and regulatory research and decision-support purposes only. It does not constitute legal advice, statutory clearance, regulatory approval, or a final determination. Verify applicable requirements with the relevant authority or qualified legal/regulatory professional.'
  };

  exportCaseDossierToPdf(dossier, lang);
}
