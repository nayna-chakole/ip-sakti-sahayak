"""
Top-level main dispatcher forwarding to src.ai.rag.main
"""
import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.ai.rag.main import main, classify_product, assess_abs, extract_attributes

if __name__ == "__main__":
    main()
