"""
IP Protection Analysis Module
Exposes the IPAnalyzer and product-specific IP evaluation across 7 IP categories.
"""

from .ip_analyzer import analyze_product_ip
from .ip_models import (
    ALL_IP_CATEGORIES,
    IP_STATUS_RELEVANT,
    IP_STATUS_POTENTIALLY_RELEVANT,
    IP_STATUS_NOT_INDICATED,
    IP_STATUS_NEEDS_HUMAN_REVIEW
)

__all__ = [
    "analyze_product_ip",
    "ALL_IP_CATEGORIES",
    "IP_STATUS_RELEVANT",
    "IP_STATUS_POTENTIALLY_RELEVANT",
    "IP_STATUS_NOT_INDICATED",
    "IP_STATUS_NEEDS_HUMAN_REVIEW"
]
