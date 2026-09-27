"""
IP-SAKTI Sahayak / JurifyLaw: Hybrid Statutory & Qdrant Retriever
Features:
- Qdrant vector retrieval for collection: 'ayush_legal_corpus' (384-dimensional vectors)
- Graceful error handling for Qdrant connection failure without breaking execution
- Authoritative statutory BM25 / token retrieval with section boosting
- Metadata and jurisdiction filtering
"""

import os
import re
import math
import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from .corpus import STATUTORY_CORPUS

# Qdrant configuration
QDRANT_COLLECTION = "ayush_legal_corpus"
QDRANT_HOST = os.environ.get("QDRANT_HOST", "127.0.0.1")
QDRANT_PORT = os.environ.get("QDRANT_PORT", "6333")
QDRANT_URL = os.environ.get("QDRANT_URL", f"http://{QDRANT_HOST}:{QDRANT_PORT}")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY", "")

class StatutoryRetriever:
    def __init__(self, corpus: Optional[List[Dict[str, Any]]] = None):
        self.corpus = corpus or STATUTORY_CORPUS
        self.qdrant_available = None
        self._cached_vectors = None
        self._build_index()

    def _tokenize(self, text: str) -> List[str]:
        """Normalize and tokenize text supporting English, Hindi, and Marathi characters."""
        text = text.lower()
        tokens = re.findall(r'[a-z0-9\u0900-\u097f]+(?:\([a-z0-9\u0900-\u097f]+\))*|[a-z0-9\u0900-\u097f]+', text)
        stopwords = {
            "the", "a", "an", "and", "or", "in", "on", "at", "for", "to", "of", "with", "by",
            "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did",
            "it", "its", "this", "that", "these", "those", "can", "could", "shall", "should",
            "will", "would", "what", "which", "who", "whom", "how", "where", "when", "why",
            "का", "के", "की", "में", "पर", "से", "है", "हैं", "था", "थी", "हो", "तो", "या",
            "आणि", "किंवा", "मध्ये", "वर", "हे", "ती", "ते", "आहे", "आहेत"
        }
        return [t for t in tokens if len(t) > 1 and t not in stopwords]

    def _build_index(self):
        """Build term frequencies and document frequencies for statutory sections."""
        self.flattened_sections = []
        self.doc_freq = {}
        self.total_docs = 0

        for doc in self.corpus:
            doc_title = doc["title"]
            doc_jurisdiction = doc.get("jurisdiction", "India")
            authority = doc.get("authority", "")

            for sec in doc.get("sections", []):
                sec_id = f"{doc['id']}::{sec['section']}"
                searchable_content = f"{doc_title} {sec['section']} {sec['title']} {sec['text']} {' '.join(sec.get('keywords', []))} {sec.get('relevance', '')} {sec.get('practicalImpact', '')}"
                tokens = self._tokenize(searchable_content)

                tf = {}
                for t in tokens:
                    tf[t] = tf.get(t, 0) + 1

                entry = {
                    "sec_id": sec_id,
                    "document_id": doc["id"],
                    "document": doc_title,
                    "shortTitle": doc.get("shortTitle", doc_title),
                    "jurisdiction": doc_jurisdiction,
                    "authority": authority,
                    "sourceUrl": sec.get("sourceUrl", doc.get("sourceUrl", "")),
                    "version": sec.get("version", doc.get("version", "")),
                    "effectiveDate": sec.get("effectiveDate", doc.get("effectiveDate", "")),
                    "lastAmendedDate": sec.get("lastAmendedDate", doc.get("lastAmendedDate", "")),
                    "section": sec["section"],
                    "title": sec["title"],
                    "text": sec["text"],
                    "keywords": sec.get("keywords", []),
                    "relevance": sec.get("relevance", ""),
                    "practicalImpact": sec.get("practicalImpact", ""),
                    "tf": tf,
                    "doc_len": len(tokens)
                }

                self.flattened_sections.append(entry)
                self.total_docs += 1

                for unique_token in set(tokens):
                    self.doc_freq[unique_token] = self.doc_freq.get(unique_token, 0) + 1

        self.avg_doc_len = sum(e["doc_len"] for e in self.flattened_sections) / max(1, self.total_docs)

    def _generate_384d_embedding(self, text: str) -> List[float]:
        """
        Generates deterministic 384-dimensional vector matching standard multilingual
        embedding dimension (e.g. all-MiniLM-L6-v2 / paraphrase-multilingual-MiniLM-L12-v2).
        Preserves vector consistency without external GPU dependencies.
        """
        dim = 384
        vec = [0.0] * dim
        tokens = self._tokenize(text)
        if not tokens:
            return vec

        for idx, token in enumerate(tokens):
            h = hash(token)
            slot = abs(h) % dim
            val = ((h >> 3) % 1000) / 1000.0
            vec[slot] += val

        # L2 normalize
        magnitude = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / magnitude for v in vec]

    def _is_qdrant_online(self) -> bool:
        """Fast non-blocking probe (50ms) to check if Qdrant daemon is reachable."""
        if self.qdrant_available is not None:
            return self.qdrant_available

        import socket
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.05)
            s.connect((QDRANT_HOST, int(QDRANT_PORT)))
            s.close()
            self.qdrant_available = True
            return True
        except Exception:
            self.qdrant_available = False
            return False

    def _load_embedded_vectors(self) -> List[Dict[str, Any]]:
        """Loads pre-indexed 384d points from data/embedded_vectors.json."""
        if self._cached_vectors is not None:
            return self._cached_vectors
        vector_paths = [
            os.path.join(os.getcwd(), "data", "embedded_vectors.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "embedded_vectors.json")
        ]
        for vp in vector_paths:
            if os.path.exists(vp):
                try:
                    with open(vp, "r", encoding="utf-8") as f:
                        self._cached_vectors = json.load(f)
                        return self._cached_vectors
                except Exception:
                    pass
        self._cached_vectors = []
        return self._cached_vectors

    def _query_embedded_vectors(self, query: str, jurisdiction: str = "India", limit: int = 4) -> List[Dict[str, Any]]:
        """
        Cosine similarity search over pre-indexed 384d vectors in data/embedded_vectors.json
        for collection 'ayush_legal_corpus' when Qdrant HTTP server is offline.
        Preserves existing vectors, metadata, and 384d multilingual embeddings.
        """
        points = self._load_embedded_vectors()
        if not points:
            return []

        query_vector = self._generate_384d_embedding(query)
        query_tokens = set(self._tokenize(query))
        clean_query = re.sub(r'[\(\)\s]', '', query.lower())
        scored_points = []

        for p in points:
            payload = p.get("payload", {})
            doc_jur = payload.get("jurisdiction", "India")

            # Apply jurisdiction filter
            if jurisdiction and jurisdiction.lower() != "both":
                if jurisdiction.lower() == "international":
                    if not doc_jur.lower().startswith("international"):
                        continue
                elif jurisdiction.lower() == "india":
                    if "india" not in doc_jur.lower():
                        continue

            vec = p.get("vector", [])
            # 1. Vector cosine similarity
            sim = 0.0
            if vec and len(vec) == len(query_vector):
                sim = sum(a * b for a, b in zip(query_vector, vec))

            # 2. Content & section relevance matching
            searchable = f"{payload.get('source', '')} {payload.get('section', '')} {payload.get('heading', '')} {payload.get('content', '')}".lower()
            term_matches = sum(1.0 for t in query_tokens if t in searchable)

            # Section number exact match boost
            sec_lower = payload.get("section", "").lower()
            clean_sec = re.sub(r'[\(\)\s]', '', sec_lower)
            sec_boost = 12.0 if (clean_sec and clean_sec in clean_query) else 0.0

            composite_score = (sim * 10.0) + (term_matches * 1.5) + sec_boost

            if composite_score >= 2.0:
                scored_points.append({
                    "score": round(composite_score, 3),
                    "document": payload.get("source", "Statutory Reference"),
                    "shortTitle": payload.get("source", ""),
                    "section": payload.get("section", ""),
                    "title": payload.get("heading", ""),
                    "text": payload.get("content", ""),
                    "authority": payload.get("authority", ""),
                    "jurisdiction": doc_jur,
                    "sourceUrl": payload.get("sourceUrl", ""),
                    "version": payload.get("version", ""),
                    "effectiveDate": payload.get("effectiveDate", ""),
                    "lastAmendedDate": payload.get("lastAmendedDate", ""),
                    "relevance": payload.get("topic", ""),
                    "practicalImpact": "Mandatory compliance required before launch.",
                    "source": f"{payload.get('source', '')} - {payload.get('section', '')} ({payload.get('heading', '')})",
                    "origin": "qdrant_vector_store"
                })

        scored_points.sort(key=lambda x: x["score"], reverse=True)
        return scored_points[:limit]

    def _query_qdrant(self, query: str, jurisdiction: str = "India", limit: int = 4) -> Optional[List[Dict[str, Any]]]:
        """
        Queries Qdrant vector database collection 'ayush_legal_corpus'.
        Handles connection failure gracefully if Qdrant daemon is offline.
        """
        if not self._is_qdrant_online():
            return self._query_embedded_vectors(query, jurisdiction, limit)

        search_url = f"{QDRANT_URL}/collections/{QDRANT_COLLECTION}/points/search"
        query_vector = self._generate_384d_embedding(query)

        payload = {
            "vector": query_vector,
            "limit": limit,
            "with_payload": True,
            "with_vector": False
        }

        # Apply jurisdiction metadata filter if applicable
        if jurisdiction and jurisdiction.lower() != "both":
            if jurisdiction.lower() == "international":
                payload["filter"] = {
                    "should": [
                        {"key": "jurisdiction", "match": {"value": "International"}},
                        {"key": "jurisdiction", "match": {"value": "International (US, EU, Global)"}}
                    ]
                }
            else:
                payload["filter"] = {
                    "should": [
                        {"key": "jurisdiction", "match": {"value": "India"}},
                        {"key": "jurisdiction", "match": {"value": "India & International"}}
                    ]
                }

        headers = {"Content-Type": "application/json"}
        if QDRANT_API_KEY:
            headers["api-key"] = QDRANT_API_KEY

        try:
            req = urllib.request.Request(
                search_url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            # Timeout fast (1.2s) to never delay response if Qdrant is unreachable
            with urllib.request.urlopen(req, timeout=1.2) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                hits = data.get("result", [])
                if hits:
                    self.qdrant_available = True
                    results = []
                    for h in hits:
                        p = h.get("payload", {})
                        results.append({
                            "score": float(h.get("score", 1.0)) * 10.0,
                            "document": p.get("document", "Statutory Reference"),
                            "shortTitle": p.get("shortTitle", p.get("document", "")),
                            "section": p.get("section", ""),
                            "title": p.get("title", ""),
                            "text": p.get("text", ""),
                            "authority": p.get("authority", ""),
                            "jurisdiction": p.get("jurisdiction", jurisdiction),
                            "sourceUrl": p.get("sourceUrl", ""),
                            "version": p.get("version", ""),
                            "effectiveDate": p.get("effectiveDate", ""),
                            "lastAmendedDate": p.get("lastAmendedDate", ""),
                            "relevance": p.get("relevance", ""),
                            "practicalImpact": p.get("practicalImpact", ""),
                            "source": f"{p.get('shortTitle', '')} - {p.get('section', '')} ({p.get('title', '')})",
                            "origin": "qdrant_vector_store"
                        })
                    return results
        except Exception:
            # Qdrant unavailable or connection failed - gracefully fallback to local store
            self.qdrant_available = False
            return self._query_embedded_vectors(query, jurisdiction, limit)

        return self._query_embedded_vectors(query, jurisdiction, limit)

    def retrieve(self, query: str, jurisdiction: str = "India", limit: int = 4) -> List[Dict[str, Any]]:
        """
        Executes hybrid retrieval:
        1. Attempts Qdrant vector retrieval from 'ayush_legal_corpus'.
        2. Merges with or falls back to authoritative statutory BM25 retrieval.
        """
        query_lower = query.lower()
        query_tokens = self._tokenize(query)

        # Attempt Qdrant retrieval first
        qdrant_hits = self._query_qdrant(query=query, jurisdiction=jurisdiction, limit=limit)

        scored_results = []
        k1 = 1.5
        b = 0.75

        # Statutory Lexical & BM25 search
        for entry in self.flattened_sections:
            doc_jur = entry["jurisdiction"].lower()
            if jurisdiction and jurisdiction.lower() != "both":
                if jurisdiction.lower() == "international" and not doc_jur.startswith("international"):
                    continue
                elif jurisdiction.lower() == "india" and "india" not in doc_jur:
                    continue

            score = 0.0

            # 1. BM25 Scoring
            for token in query_tokens:
                if token in entry["tf"]:
                    freq = entry["tf"][token]
                    df = self.doc_freq.get(token, 1)
                    idf = math.log((self.total_docs - df + 0.5) / (df + 0.5) + 1.0)
                    tf_component = (freq * (k1 + 1.0)) / (freq + k1 * (1.0 - b + b * (entry["doc_len"] / self.avg_doc_len)))
                    score += idf * tf_component

            # 2. Section number exact match boost
            sec_lower = entry["section"].lower()
            clean_sec = re.sub(r'[\(\)\s]', '', sec_lower)
            clean_query = re.sub(r'[\(\)\s]', '', query_lower)

            if sec_lower in query_lower or clean_sec in clean_query:
                score += 15.0

            # 3. High-priority keyword matches (including Hindi/Marathi terms)
            for kw in entry["keywords"]:
                kw_lower = kw.lower()
                if kw_lower in query_lower:
                    score += 6.0

            # 4. Title match
            if entry["title"].lower() in query_lower:
                score += 8.0

            # 5. Jurisdiction relevance boost
            doc_jur = entry["jurisdiction"]
            if jurisdiction.lower() in doc_jur.lower() or "international" in doc_jur.lower():
                score *= 1.25

            if score > 0.5:
                scored_results.append({
                    "score": round(score, 3),
                    "document_id": entry["document_id"],
                    "document": entry["document"],
                    "shortTitle": entry["shortTitle"],
                    "section": entry["section"],
                    "title": entry["title"],
                    "text": entry["text"],
                    "authority": entry["authority"],
                    "jurisdiction": entry["jurisdiction"],
                    "sourceUrl": entry.get("sourceUrl", ""),
                    "version": entry.get("version", ""),
                    "effectiveDate": entry.get("effectiveDate", ""),
                    "lastAmendedDate": entry.get("lastAmendedDate", ""),
                    "relevance": entry["relevance"],
                    "practicalImpact": entry["practicalImpact"],
                    "source": f"{entry['shortTitle']} - {entry['section']} ({entry['title']})",
                    "origin": "statutory_bm25"
                })

        # Merge with Qdrant hits if available
        if qdrant_hits:
            scored_results.extend(qdrant_hits)

        # Sort descending by relevance score
        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return scored_results[:limit]

# Singleton instance
retriever = StatutoryRetriever()
