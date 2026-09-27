"""
IP Protection Analysis Data Models
Defines structured schema for the 7 IP categories and analysis results.
"""

from typing import List, Dict, Any, Optional

IP_STATUS_RELEVANT = "Relevant"
IP_STATUS_POTENTIALLY_RELEVANT = "Potentially Relevant"
IP_STATUS_NOT_INDICATED = "Not Indicated"
IP_STATUS_NEEDS_HUMAN_REVIEW = "Needs Human Review"

# Standard 7 IP Categories
CATEGORY_PATENT = "Patent"
CATEGORY_TRADEMARK = "Trademark"
CATEGORY_GI = "Geographical Indication (GI)"
CATEGORY_COPYRIGHT = "Copyright"
CATEGORY_DESIGN = "Industrial Design"
CATEGORY_PLANT_VARIETY = "Plant Variety Protection"
CATEGORY_TK_PRIOR_ART = "Traditional Knowledge / Prior Art"

ALL_IP_CATEGORIES = [
    CATEGORY_PATENT,
    CATEGORY_TRADEMARK,
    CATEGORY_GI,
    CATEGORY_COPYRIGHT,
    CATEGORY_DESIGN,
    CATEGORY_PLANT_VARIETY,
    CATEGORY_TK_PRIOR_ART
]

# Official Government / Statutory Links
OFFICIAL_SOURCE_LINKS = {
    CATEGORY_PATENT: [
        {"title": "CGPDTM Patents Portal (India)", "url": "https://ipindia.gov.in/patents.htm"},
        {"title": "WIPO Patent Cooperation Treaty (PCT)", "url": "https://www.wipo.int/pct/en/"}
    ],
    CATEGORY_TRADEMARK: [
        {"title": "Trade Marks Registry (India)", "url": "https://ipindia.gov.in/trade-marks.htm"},
        {"title": "WIPO Madrid System for Trademarks", "url": "https://www.wipo.int/madrid/en/"}
    ],
    CATEGORY_GI: [
        {"title": "Geographical Indications Registry (India)", "url": "https://ipindia.gov.in/geographical-indications.htm"},
        {"title": "WIPO Lisbon System for GIs", "url": "https://www.wipo.int/lisbon/en/"}
    ],
    CATEGORY_COPYRIGHT: [
        {"title": "Copyright Office, DPIIT (India)", "url": "https://copyright.gov.in/"}
    ],
    CATEGORY_DESIGN: [
        {"title": "Designs Office, CGPDTM (India)", "url": "https://ipindia.gov.in/designs.htm"},
        {"title": "WIPO Hague System for Designs", "url": "https://www.wipo.int/hague/en/"}
    ],
    CATEGORY_PLANT_VARIETY: [
        {"title": "Protection of Plant Varieties & Farmers' Rights Authority (PPV&FR)", "url": "https://plantauthority.gov.in/"}
    ],
    CATEGORY_TK_PRIOR_ART: [
        {"title": "Traditional Knowledge Digital Library (TKDL / CSIR)", "url": "https://www.csir.res.in/tkdl"},
        {"title": "National Biodiversity Authority (NBA)", "url": "https://nbaindia.org/"},
        {"title": "WIPO Traditional Knowledge Treaty", "url": "https://www.wipo.int/tk/en/"}
    ]
}
