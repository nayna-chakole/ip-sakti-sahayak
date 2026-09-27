"""
IP-SAKTI Sahayak / JurifyLaw: Context Builder
Structures retrieved legal evidence and product classification context into clean,
hierarchical context blocks for statutory synthesis and formal legal opinion generation.
"""

from typing import List, Dict, Any, Optional
from .corpus import STATUTORY_KNOWLEDGE_RELATIONSHIPS

class ContextBuilder:
    def __init__(self, max_chars: int = 12000):
        self.max_chars = max_chars
        self.relationships = STATUTORY_KNOWLEDGE_RELATIONSHIPS

    def build_context(
        self,
        evidence: List[Dict[str, Any]],
        processed_query: Dict[str, Any],
        classification_context: Optional[Any] = None
    ) -> Dict[str, Any]:
        """Constructs an organized context envelope from statutory sections, product classification data, and legal knowledge relationships."""
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        authorities = set()
        matched_sections = {item.get("section", "").strip().lower() for item in evidence if item.get("section")}

        for item in evidence:
            act_title = item.get("document", "Unknown Act")
            if act_title not in grouped:
                grouped[act_title] = []
            grouped[act_title].append(item)
            if item.get("authority"):
                authorities.add(item["authority"])

        # Extract structured classification metadata if provided
        prod_category = ""
        prod_name = ""
        prod_ingredients = ""
        prod_use = ""
        prod_form = ""
        prod_jurisdiction = ""
        prod_reg_category = ""
        prod_uncertainty = ""
        prod_ip = ""
        prod_abs = ""
        prod_confidence = ""

        if isinstance(classification_context, dict):
            prod_category = classification_context.get("category", "")
            prod_name = classification_context.get("productName", "")
            prod_ingredients = classification_context.get("ingredients", "")
            prod_use = classification_context.get("intendedUse", "")
            prod_form = classification_context.get("formulationBasis", classification_context.get("dosageForm", ""))
            prod_jurisdiction = classification_context.get("targetMarket", classification_context.get("jurisdiction", ""))
            prod_reg_category = classification_context.get("regulatoryCategory", prod_category)
            prod_uncertainty = classification_context.get("uncertaintyStatus", "Clear" if classification_context.get("confidence") == "High" else "Uncertainty Flagged")
            prod_ip = classification_context.get("ipConsiderations", "")
            prod_abs = classification_context.get("absStatus", "")
            prod_confidence = classification_context.get("confidence", "High")
        elif isinstance(classification_context, str) and classification_context.strip():
            prod_category = classification_context

        # Construct structured statutory text block
        blocks = []
        total_len = 0

        # Include product classification context block if available
        if prod_category or prod_name:
            classification_block = (
                "=== CLASSIFIED PRODUCT CONTEXT ===\n"
                f"• Category: {prod_category or 'General Ayurvedic Product'}\n"
                f"• Product: {prod_name or 'N/A'}\n"
                f"• Ingredients: {prod_ingredients or 'Botanical blend'}\n"
                f"• Intended Use: {prod_use or 'General wellness/therapeutic'}\n"
                f"• Dosage / Form: {prod_form or 'Classical/Proprietary'}\n"
                f"• Jurisdiction: {prod_jurisdiction or 'India'}\n"
                f"• Relevant Regulatory Category: {prod_reg_category or prod_category}\n"
                f"• Uncertainty Status: {prod_uncertainty or 'Clear'}\n"
                f"• IP Profile: {prod_ip or 'Subject to Section 3'}\n"
                f"• ABS Status: {prod_abs or 'Mandatory statutory evaluation'}\n"
                f"• Classification Confidence: {prod_confidence or 'High'}\n"
            )
            blocks.append(classification_block)
            total_len += len(classification_block)

        # Identify applicable multi-source legal relationships
        applicable_relationships = []
        for rel in self.relationships:
            src = rel["sourceSection"].strip().lower()
            tgt = rel["targetSection"].strip().lower()
            if any(src in ms or ms in src for ms in matched_sections) or any(tgt in ms or ms in tgt for ms in matched_sections):
                applicable_relationships.append(rel)

        if applicable_relationships:
            rel_block_lines = ["=== STATUTORY CROSS-ACT RELATIONSHIPS ==="]
            for rel in applicable_relationships:
                rel_block_lines.append(
                    f"• [{rel['relationshipType']}] {rel['sourceAct']} ({rel['sourceSection']}) ↔ {rel['targetAct']} ({rel['targetSection']}): {rel['legalNexus']}"
                )
            rel_block = "\n".join(rel_block_lines)
            if total_len + len(rel_block) < self.max_chars:
                blocks.append(rel_block)
                total_len += len(rel_block)

        for act_title, sections in grouped.items():
            act_header = f"=== ACT: {act_title} ==="
            blocks.append(act_header)
            total_len += len(act_header)

            for sec in sections:
                sec_entry = (
                    f"[{sec['section']} — {sec['title']}]\n"
                    f"Authority: {sec.get('authority', 'Statutory Authority')}\n"
                    f"Jurisdiction: {sec.get('jurisdiction', 'India')}\n"
                    f"Statutory Text: \"{sec['text']}\"\n"
                    f"Relevance Note: {sec.get('relevance', 'Statutory compliance mandate')}\n"
                    f"Enforcement Rule: {sec.get('practicalImpact', 'Mandatory compliance required before launch.')}\n"
                )
                if total_len + len(sec_entry) < self.max_chars:
                    blocks.append(sec_entry)
                    total_len += len(sec_entry)

        return {
            "grouped_by_act": grouped,
            "statutory_text_block": "\n".join(blocks),
            "total_sections": len(evidence),
            "authorities_involved": sorted(list(authorities)),
            "formulation_category": prod_category,
            "applicable_relationships": applicable_relationships,
            "product_context": {
                "category": prod_category,
                "productName": prod_name,
                "intendedUse": prod_use,
                "dosageForm": prod_form,
                "confidence": prod_confidence
            }
        }

# Singleton instance
context_builder = ContextBuilder()
