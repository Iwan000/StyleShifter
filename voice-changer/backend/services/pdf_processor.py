import pdfplumber
from io import BytesIO
from collections import Counter
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class PDFProcessor:
    """Service for processing PDF files"""

    def __init__(self, max_file_size_mb=10):
        self.max_file_size_mb = max_file_size_mb
        self.max_file_size_bytes = max_file_size_mb * 1024 * 1024

    def validate_pdf(self, file_content: bytes) -> dict:
        """
        Validate if PDF is processable

        Returns:
            dict: {
                "valid": bool,
                "error": str or None,
                "has_text": bool,
                "pages": int
            }
        """
        # Check file size
        if len(file_content) > self.max_file_size_bytes:
            return {
                "valid": False,
                "error": f"File exceeds {self.max_file_size_mb}MB limit",
                "has_text": False,
                "pages": 0
            }

        try:
            with pdfplumber.open(BytesIO(file_content)) as pdf:
                pages = len(pdf.pages)

                # Check if PDF has extractable text (not just scanned images)
                has_text = False
                for page in pdf.pages[:min(3, pages)]:  # Check first 3 pages
                    text = page.extract_text()
                    if text and len(text.strip()) > 50:  # At least 50 chars
                        has_text = True
                        break

                if not has_text:
                    return {
                        "valid": False,
                        "error": "This PDF appears to be scanned images. Please use a text-based PDF.",
                        "has_text": False,
                        "pages": pages
                    }

                return {
                    "valid": True,
                    "error": None,
                    "has_text": True,
                    "pages": pages
                }

        except Exception as e:
            return {
                "valid": False,
                "error": f"Unable to read PDF file: {str(e)}",
                "has_text": False,
                "pages": 0
            }

    def extract_text_with_structure(self, file_content: bytes) -> dict:
        """
        Extract text from PDF with structure preservation

        Returns:
            dict: {
                "text": str,
                "pages": int,
                "paragraphs": list[str]
            }
        """
        with pdfplumber.open(BytesIO(file_content)) as pdf:
            pages_text = []

            # Extract text from each page
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)

            # Detect and remove repeated headers/footers
            cleaned_pages = self._remove_repeated_elements(pages_text)

            # Join pages with double newline
            full_text = "\n\n".join(cleaned_pages)

            # Split into paragraphs
            paragraphs = self._split_into_paragraphs(full_text)

            return {
                "text": full_text,
                "pages": len(pdf.pages),
                "paragraphs": paragraphs
            }

    def _remove_repeated_elements(self, pages_text: list[str]) -> list[str]:
        """
        Remove repeated headers/footers from pages

        Strategy:
        1. Extract first 3 and last 3 lines from each page
        2. Find lines that appear on >80% of pages
        3. Remove those lines
        """
        if len(pages_text) <= 2:
            return pages_text

        # Collect potential headers and footers
        headers = []
        footers = []

        for page_text in pages_text:
            lines = page_text.split('\n')
            if len(lines) > 6:
                # First 3 lines (potential headers)
                headers.extend(lines[:3])
                # Last 3 lines (potential footers)
                footers.extend(lines[-3:])

        # Count frequency
        header_counts = Counter(headers)
        footer_counts = Counter(footers)

        # Find repeated elements (appear on >80% of pages)
        threshold = len(pages_text) * 0.8
        repeated_headers = {line for line, count in header_counts.items() if count > threshold}
        repeated_footers = {line for line, count in footer_counts.items() if count > threshold}

        # Remove repeated elements from each page
        cleaned_pages = []
        for page_text in pages_text:
            lines = page_text.split('\n')

            # Remove headers
            while lines and lines[0].strip() in repeated_headers:
                lines.pop(0)

            # Remove footers
            while lines and lines[-1].strip() in repeated_footers:
                lines.pop()

            cleaned_pages.append('\n'.join(lines))

        return cleaned_pages

    def _split_into_paragraphs(self, text: str) -> list[str]:
        """Split text into paragraphs"""
        # Split by double newlines or more
        paragraphs = []
        current = []

        for line in text.split('\n'):
            line = line.strip()
            if line:
                current.append(line)
            elif current:
                paragraphs.append(' '.join(current))
                current = []

        if current:
            paragraphs.append(' '.join(current))

        return [p for p in paragraphs if len(p) > 20]  # Filter short paragraphs

    def generate_pdf(self, text: str, filename: str = "transformed.pdf") -> BytesIO:
        """
        Generate a PDF from transformed text

        Args:
            text: The transformed text
            filename: Output filename

        Returns:
            BytesIO: PDF file content
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)

        # Container for the 'Flowable' objects
        elements = []

        # Define styles
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='CustomBody',
                                   parent=styles['BodyText'],
                                   fontSize=11,
                                   leading=16,
                                   spaceBefore=6,
                                   spaceAfter=6))

        # Split text into paragraphs
        paragraphs = text.split('\n\n')

        for para_text in paragraphs:
            if para_text.strip():
                # Clean the text for reportlab
                clean_text = para_text.replace('<', '&lt;').replace('>', '&gt;')

                # Create paragraph
                para = Paragraph(clean_text, styles['CustomBody'])
                elements.append(para)
                elements.append(Spacer(1, 0.1 * inch))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
