import React, { useState, useEffect } from 'react';
import {
  api,
  ABSAssessmentInput,
  ABSAssessmentResult,
  UserSession
} from '../api/client.js';
import { ConfidenceBadge } from './ConfidenceBadge.js';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  FileText,
  Building,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ABSComplianceWorkflowProps {
  session: UserSession;
  onOpenFacilitator?: () => void;
}

export const ABSComplianceWorkflow: React.FC<ABSComplianceWorkflowProps> = ({
  session,
  onOpenFacilitator
}) => {
  // Derive automatic initial values from active product profile / classification
  const activeClass = session.classificationResult;
  const activeAnswers = session.classificationAnswers;

  const [formData, setFormData] = useState<ABSAssessmentInput>(() => ({
    biologicalResourceUsed: activeAnswers?.ingredients || activeClass?.product_name || '',
    scientificName: '',
    commonName: '',
    sourceLocation:
      activeAnswers?.q5_biological_resource_source === 'cultivated'
        ? 'Cultivated in India'
        : activeAnswers?.q5_biological_resource_source === 'wild_collected'
        ? 'Wild harvested in India'
        : activeAnswers?.q5_biological_resource_source === 'imported'
        ? 'Imported outside India'
        : activeAnswers?.q5_biological_resource_source === 'indian_supplier'
        ? 'Sourced from Indian Supplier'
        : 'India',
    associatedTKInvolved: activeClass?.category === 'Classical Ayurvedic Medicine' ? 'yes' : 'unspecified',
    accessedInIndia: 'yes',
    purposeOfAccess: 'commercial_utilisation',
    intendedUseType: 'commercial',
    entityType: 'indian_company_no_foreign',
    commercializationStatus: 'commercialized',
    targetJurisdiction: session.jurisdiction || 'India',
    productName: activeClass?.product_name || '',
    productCategory: activeClass?.category || ''
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ABSAssessmentResult | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);

  // Sync jurisdiction if user toggles header
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      targetJurisdiction: session.jurisdiction
    }));
  }, [session.jurisdiction]);

  // When active product changes, sync product attributes
  useEffect(() => {
    if (activeClass?.product_name && !formData.productName) {
      setFormData((prev) => ({
        ...prev,
        productName: activeClass.product_name,
        productCategory: activeClass.category,
        biologicalResourceUsed: prev.biologicalResourceUsed || activeAnswers?.ingredients || activeClass.product_name || ''
      }));
    }
  }, [activeClass, activeAnswers]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.abs.assess({
        ...formData,
        targetJurisdiction: session.jurisdiction
      });
      setResult(res);
    } catch (err: any) {
      console.error('ABS Assessment failed:', err);
      setError(err?.message || 'Failed to complete ABS assessment. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      biologicalResourceUsed: activeAnswers?.ingredients || activeClass?.product_name || '',
      scientificName: '',
      commonName: '',
      sourceLocation: 'India',
      associatedTKInvolved: 'unspecified',
      accessedInIndia: 'yes',
      purposeOfAccess: 'commercial_utilisation',
      intendedUseType: 'commercial',
      entityType: 'indian_company_no_foreign',
      commercializationStatus: 'commercialized',
      targetJurisdiction: session.jurisdiction,
      productName: activeClass?.product_name || '',
      productCategory: activeClass?.category || ''
    });
    setResult(null);
    setError(null);
  };

  const getStatusBadge = (status: ABSAssessmentResult['status']) => {
    switch (status) {
      case 'ABS_RELEVANT':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>Potentially Applicable (ABS Provisions Identified)</span>
          </span>
        );
      case 'ABS_MAY_APPLY_ADDITIONAL_INFO_REQUIRED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
            <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
            <span>Further Verification Required (Additional Info Needed)</span>
          </span>
        );
      case 'ABS_NOT_IDENTIFIED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>No Relevant Provision Identified in Retrieved Sources</span>
          </span>
        );
      case 'HUMAN_FACILITATOR_REVIEW_REQUIRED':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-900 border border-purple-300">
            <Scale className="w-3.5 h-3.5 text-purple-700" />
            <span>Human Review Recommended</span>
          </span>
        );
    }
  };

  return (
    <div id="abs-compliance-workflow" className="space-y-4">
      {/* Header card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Preliminary ABS Assessment Helper</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
              BD Act 2002 / 2023 & Nagoya Protocol
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Statutory decision-support assessment for Access and Benefit Sharing (ABS) applicability, National Biodiversity Authority (NBA) requirements, and traditional knowledge considerations.
          </p>
          {activeClass?.product_name && (
            <div className="mt-2 text-[11px] text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200 inline-flex items-center space-x-1.5">
              <span>Active Product Profile:</span>
              <strong className="font-bold">{activeClass.product_name}</strong>
              <span>({activeClass.category})</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-red-600 flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 transition shrink-0"
          title="Reset ABS Form"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Guided Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Field 1: Biological Resource Used */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-900 block">
            1. Biological Resource Used
          </label>
          <p className="text-[11px] text-slate-500">
            What biological resource (plant, herb, animal byproduct, or microorganism) does your product use?
          </p>
          <input
            type="text"
            value={formData.biologicalResourceUsed}
            onChange={(e) => setFormData({ ...formData, biologicalResourceUsed: e.target.value })}
            placeholder="e.g. Ashwagandha (Withania somnifera), Amla, Brahmi, Curcuma longa"
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Field 2: Traditional Knowledge */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-900 block">
            2. Associated Traditional Knowledge (TK)
          </label>
          <p className="text-[11px] text-slate-500">
            Does the formulation or therapeutic indication involve associated traditional knowledge or classical treatise recipes?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'yes', label: 'Yes (Classical / Indigenous)' },
              { key: 'no', label: 'No (Modern Independent)' },
              { key: 'unspecified', label: 'Unspecified / Uncertain' }
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFormData({ ...formData, associatedTKInvolved: opt.key as any })}
                className={`py-2 px-2 text-center rounded-lg border text-xs transition ${
                  formData.associatedTKInvolved === opt.key
                    ? 'bg-amber-500/15 border-amber-500 text-slate-950 font-bold shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Field 3: Source / Origin of Biological Resource */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-900 block">
            3. Source & Location of Biological Resource
          </label>
          <p className="text-[11px] text-slate-500">
            Where was the biological resource obtained or harvested?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'Wild harvested in India', label: 'Wild harvested in India (Forest lands)' },
              { key: 'Cultivated in India', label: 'Cultivated in India (Agricultural farm)' },
              { key: 'Sourced from Indian Supplier', label: 'Procured from Indian Trader / Mandi' },
              { key: 'Imported outside India', label: 'Imported outside India (Ex-situ / Foreign)' },
              { key: 'Unknown / Undocumented', label: 'Unknown / Source Not Documented' }
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFormData({ ...formData, sourceLocation: opt.key })}
                className={`py-1.5 px-2 text-left rounded-lg border text-xs transition ${
                  formData.sourceLocation === opt.key
                    ? 'bg-amber-500/15 border-amber-500 text-slate-950 font-bold shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Field 4: Purpose & Commercialization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 block">
              4. Purpose of Access / Use
            </label>
            <select
              value={formData.purposeOfAccess}
              onChange={(e) => setFormData({ ...formData, purposeOfAccess: e.target.value as any })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:outline-none bg-white"
            >
              <option value="commercial_utilisation">Commercial Utilisation (Manufacturing / Sale)</option>
              <option value="research">Non-commercial Academic Research</option>
              <option value="bio_survey">Bio-survey and Bio-utilisation</option>
              <option value="other">Other / Personal Use</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 block">
              5. Entity / Applicant Type
            </label>
            <select
              value={formData.entityType}
              onChange={(e) => setFormData({ ...formData, entityType: e.target.value as any })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:outline-none bg-white"
            >
              <option value="indian_company_no_foreign">Indian Entity (No Foreign Shareholding)</option>
              <option value="indian_individual">Indian Citizen / Individual Vaidya</option>
              <option value="foreign_entity_or_foreign_participation">Foreign Entity / NRI / Foreign Shareholding (Sec 3)</option>
            </select>
          </div>
        </div>

        {/* Field 5: Market / Target Jurisdiction */}
        <div className="space-y-1 pt-1">
          <label className="text-xs font-bold text-slate-900 block">
            6. Target Jurisdiction / Market Scope
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600">Active Jurisdiction:</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300">
              {session.jurisdiction}
            </span>
            <span className="text-[11px] text-slate-500">
              (Use the header toggle to switch between India Domestic BDA and International Nagoya/CBD frameworks)
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#0F2A4A] hover:bg-[#1a3d66] text-white shadow-xs flex items-center space-x-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span>Analyzing Statutory Obligations...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Assess ABS Requirements</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Page / Box */}
      {result && (
        <div id="abs-assessment-result-panel" className="bg-white p-4 rounded-xl border-2 border-amber-500/60 shadow-md space-y-4">
          {/* Status Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                ABS Assessment Status
              </span>
              <div className="mt-1 flex items-center space-x-2">
                {getStatusBadge(result.status)}
                <span className="text-xs text-slate-600 font-medium">
                  ({result.jurisdictionApplied} Framework)
                </span>
              </div>
            </div>
            <ConfidenceBadge confidence={result.confidence} />
          </div>

          {/* Why ABS Flagged */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-900 block">
              Why ABS Was Assessed:
            </span>
            <ul className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {result.whyFlagged.map((why, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{why}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Applicable Frameworks */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-700" />
              <span>Applicable Statutory Framework:</span>
            </span>
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-950 space-y-1">
              {result.applicableFrameworks.map((fw, i) => (
                <div key={i} className="font-medium">• {fw}</div>
              ))}
            </div>
          </div>

          {/* Required Actions */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Required Statutory Actions:</span>
            </span>
            <ul className="space-y-1.5 text-xs text-slate-800 bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
              {result.requiredActions.map((action, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span className="leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Authority and Process */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-slate-600" />
                <span>Authority to Consult:</span>
              </span>
              <p className="text-[11px] text-slate-700">{result.possibleAuthority}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Statutory Process:</span>
              </span>
              <p className="text-[11px] text-slate-700">{result.possibleProcess}</p>
            </div>
          </div>

          {/* Next Recommended Compliance Step */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1">
            <span className="font-bold text-amber-900 block">
              Next Recommended Compliance Step:
            </span>
            <p className="leading-relaxed text-[11px]">{result.nextComplianceStep}</p>
          </div>

          {/* Missing Information / Questions (Safe Uncertainty Handling) */}
          {result.questionsForUser && result.questionsForUser.length > 0 && (
            <div className="p-3 bg-orange-50/80 rounded-lg border border-orange-200 text-xs text-orange-950 space-y-1.5">
              <span className="font-bold text-orange-900 flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-orange-700" />
                <span>Targeted Clarifications Required (Statutory Non-Guessing):</span>
              </span>
              <ul className="space-y-1 text-[11px]">
                {result.questionsForUser.map((q, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="font-bold text-orange-700">?</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Authoritative Citations from Qdrant RAG */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Authoritative Legal Citations ({result.citations.length} verified)
              </span>
              <button
                type="button"
                onClick={() => setShowEvidence(!showEvidence)}
                className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center space-x-1"
              >
                <span>{showEvidence ? 'Hide Evidence' : 'View Evidence'}</span>
                {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showEvidence && (
              <div className="grid grid-cols-1 gap-2 pt-1">
                {result.citations.map((cite, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{cite.source}</span>
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          {cite.section}
                        </span>
                      </div>
                      {cite.sourceUrl && (
                        <a
                          href={cite.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-700 hover:text-amber-900 text-[11px] flex items-center space-x-1 ml-2 shrink-0"
                        >
                          <span>Official Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-700 font-medium">{cite.heading}</p>
                    <p className="text-[10px] text-slate-500">
                      Authority: {cite.authority} | Version: {cite.version} | Effective: {cite.effectiveDate}
                    </p>
                    {cite.textSnippet && (
                      <p className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 italic mt-1">
                        "{cite.textSnippet}..."
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons: View Evidence / Ask Facilitator */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowEvidence(!showEvidence)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              {showEvidence ? 'Collapse Evidence' : 'View Evidence'}
            </button>

            {onOpenFacilitator && (
              <button
                type="button"
                onClick={onOpenFacilitator}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs flex items-center space-x-1.5 transition"
              >
                <span>Ask Facilitator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
