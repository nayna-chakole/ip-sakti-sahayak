"""
ABS & Regulatory Compliance Data Models
Defines structured schema for:
1. Biodiversity / ABS Assessment
2. NBA Approval Assessment
3. Traditional Knowledge / TKDL Assessment
4. Product Regulatory Requirements
"""

from typing import List, Dict, Any, Optional

STATUS_APPLICABLE = "Applicable"
STATUS_POTENTIALLY_APPLICABLE = "Potentially Applicable"
STATUS_NOT_INDICATED = "Not Indicated"
STATUS_NEEDS_HUMAN_REVIEW = "Needs Human Review"

ALL_STATUSES = [
    STATUS_APPLICABLE,
    STATUS_POTENTIALLY_APPLICABLE,
    STATUS_NOT_INDICATED,
    STATUS_NEEDS_HUMAN_REVIEW
]

OFFICIAL_AUTHORITIES = {
    "nba": {
        "name": "National Biodiversity Authority (NBA, Chennai)",
        "url": "https://nbaindia.org"
    },
    "sbb": {
        "name": "State Biodiversity Boards (SBB)",
        "url": "https://nbaindia.org/content/17/16/1/sbb.html"
    },
    "tkdl": {
        "name": "Traditional Knowledge Digital Library (CSIR-TKDL)",
        "url": "https://www.csir.res.in/tkdl"
    },
    "cgpdtm": {
        "name": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM)",
        "url": "https://ipindia.gov.in"
    },
    "ayush_sla": {
        "name": "State Ayush Licensing Authorities (SLA)",
        "url": "https://ayush.gov.in"
    },
    "fssai": {
        "name": "Food Safety and Standards Authority of India (FSSAI)",
        "url": "https://fssai.gov.in"
    },
    "cdsco": {
        "name": "Central Drugs Standard Control Organisation (CDSCO)",
        "url": "https://cdsco.gov.in"
    },
    "fda": {
        "name": "US Food and Drug Administration (FDA)",
        "url": "https://www.fda.gov"
    },
    "ema": {
        "name": "European Medicines Agency (EMA / HMPC)",
        "url": "https://www.ema.europa.eu"
    },
    "cbd_nagoya": {
        "name": "Convention on Biological Diversity (CBD) / Nagoya ABS Clearing-House",
        "url": "https://absch.cbd.int"
    },
    "wipo": {
        "name": "World Intellectual Property Organization (WIPO)",
        "url": "https://www.wipo.int"
    }
}
