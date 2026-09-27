"""
Human Facilitator Review System
Submits and logs human facilitator review requests for complex or flagged Ayurvedic cases.
Status is maintained as 'Submitted' without simulating artificial review completion.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid

from .dossier_models import REVIEW_STATUS_SUBMITTED

def submit_human_facilitator_review(
    dossier: Dict[str, Any],
    review_notes: str = "",
    urgency: str = "Standard"
) -> Dict[str, Any]:
    """
    Creates a formal review ticket for human AYUSH facilitators.
    Strictly sets status to 'Submitted'.
    """
    case_id = dossier.get("caseId", "CASE-UNKNOWN")
    review_id = f"REV-{case_id.replace('CASE-', '')}"
    timestamp = datetime.now(timezone.utc).isoformat()
    language = dossier.get("language", "en")

    product_info = dossier.get("productInformation", {})
    classification = dossier.get("classification", {})
    uncertainty_flags = dossier.get("uncertaintyFlags", [])

    # Localized messages
    if language == "hi":
        confirmation_msg = "केस मानवीय सुगमकर्ता (Human Facilitator) समीक्षा हेतु सफलतापूर्वक जमा कर दिया गया है।"
        review_role = "आयुष विधिक एवं विनियामक सुगमकर्ता प्रकोष्ठ"
    elif language == "mr":
        confirmation_msg = "केस मानवी सुलभकर्ता (Human Facilitator) पुनरावलोकनासाठी यशस्वीरीत्या सादर केला गेला आहे."
        review_role = "आयुष कायदेशीर आणि विनियामक सहाय्य कक्ष"
    else:
        confirmation_msg = "Case submitted for human facilitator review."
        review_role = "AYUSH IP & Regulatory Facilitation Cell"

    human_review_reasons = [u.get("message") for u in uncertainty_flags if u.get("message")]
    if not human_review_reasons:
        human_review_reasons = ["Statutory review requested by applicant for verified regulatory filing compliance."]

    review_ticket = {
        "reviewId": review_id,
        "caseId": case_id,
        "status": REVIEW_STATUS_SUBMITTED,
        "timestamp": timestamp,
        "language": language,
        "confirmationMessage": confirmation_msg,
        "assignedCell": review_role,
        "urgency": urgency,
        "applicantNotes": review_notes or "Applicant requested formal human review of statutory findings.",
        "productInformation": product_info,
        "classificationResult": classification,
        "ipAnalysis": dossier.get("ipProtectionAnalysis", {}),
        "absRegulatoryAnalysis": dossier.get("absRegulatoryCompliance", {}),
        "ragCitations": dossier.get("ragEvidence", []),
        "uncertaintyFlags": uncertainty_flags,
        "humanReviewReasons": human_review_reasons,
        "caseSummary": {
            "productName": product_info.get("productName"),
            "category": classification.get("category"),
            "confidence": classification.get("confidence"),
            "uncertaintyFlagCount": len(uncertainty_flags)
        },
        "dossierSnapshot": {
            "caseId": case_id,
            "productInformation": product_info,
            "classification": classification,
            "ipCategoriesCount": len(dossier.get("ipProtectionAnalysis", {}).get("ipCategories", [])),
            "citationsCount": len(dossier.get("ragEvidence", []))
        }
    }

    return review_ticket
