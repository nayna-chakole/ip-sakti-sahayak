"""
Case Dossier & Human Review Data Models
Defines schema for final case dossiers and facilitator review records.
"""

from typing import List, Dict, Any, Optional

# Standard real human review and dossier status values
STATUS_ANALYSIS_COMPLETED = "Analysis Completed"
STATUS_DOSSIER_GENERATED = "Dossier Generated"
STATUS_REVIEW_REQUESTED = "Review Requested"
STATUS_SUBMITTED = "Submitted"
STATUS_UNDER_REVIEW = "Under Review"
STATUS_REVIEWED_CLOSED = "Reviewed/Closed"

# Legacy aliases for backward compatibility
REVIEW_STATUS_SUBMITTED = STATUS_SUBMITTED
REVIEW_STATUS_UNDER_REVIEW = STATUS_UNDER_REVIEW
REVIEW_STATUS_COMPLETED = STATUS_REVIEWED_CLOSED

ALL_REVIEW_STATUSES = [
    STATUS_ANALYSIS_COMPLETED,
    STATUS_DOSSIER_GENERATED,
    STATUS_REVIEW_REQUESTED,
    STATUS_SUBMITTED,
    STATUS_UNDER_REVIEW,
    STATUS_REVIEWED_CLOSED
]
