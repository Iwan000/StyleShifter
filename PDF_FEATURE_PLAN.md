# PDF Support Feature Implementation Plan

## Requirements Summary

✅ **Upload Location:** Both Train and Transform pages
✅ **File Size Limit:** 10MB maximum
✅ **Output Format:** User chooses (Text display OR PDF download)
✅ **Processing Strategy:** Paragraph-by-paragraph with smart header/footer removal
✅ **Structure Preservation:** Basic structure (headings, paragraphs)
✅ **Progress Feedback:** Yes, show processing progress
✅ **Scanned PDFs:** Skip/error message (no OCR support)
✅ **Multiple Files:** One PDF at a time

---

## Backend Implementation

### 1. New Dependencies

```python
pdfplumber==0.11.0      # PDF text extraction with layout
reportlab==4.0.7        # PDF generation
pypdf==4.0.0           # PDF manipulation
```

### 2. New Service: `pdf_processor.py`

**Class: PDFProcessor**

Methods:
- `extract_text_with_structure(pdf_file)` → Returns structured text
- `detect_repeated_headers(pages)` → Identifies page headers/footers
- `clean_text(pages, repeated_elements)` → Removes headers/footers
- `split_into_paragraphs(text)` → Split by paragraph breaks
- `generate_pdf(text, structure)` → Create PDF from transformed text
- `validate_pdf(file)` → Check if PDF is text-based (not scanned)

**Smart Header Detection Algorithm:**
```python
1. Extract first/last 3 lines from each page
2. Count frequency of each line across pages
3. If line appears on >80% of pages → It's a header/footer
4. Remove these lines before processing
```

### 3. New API Endpoints

**POST `/api/extract-pdf`**
```python
Input: PDF file (multipart/form-data)
Output: {
    "text": "extracted text",
    "pages": 50,
    "has_text": true,
    "structure": {...}
}
```

**POST `/api/transform-pdf`**
```python
Input: 
    - file: PDF (multipart/form-data)
    - model_name: string
    - output_format: "text" | "pdf"
    
Output (text format):
    {
        "transformed_text": "...",
        "pages_processed": 50
    }
    
Output (pdf format):
    Binary PDF file download
```

**Modify POST `/api/train`**
```python
Accept both:
    - corpus: string (existing)
    - file: PDF (new)
    
If PDF provided, extract text first then train
```

### 4. File Upload Handling

- Max size: 10MB
- Allowed types: application/pdf
- Validation: Check for text content (reject scanned images)
- Temporary storage: Delete after processing

---

## Frontend Implementation

### 1. New Components

**`FileUploadZone.jsx`**
- Drag & drop area
- Click to browse
- File validation (type, size)
- Upload progress bar
- File preview (name, size, pages)
- Remove file button

**`OutputFormatSelector.jsx`**
- Radio buttons: "Display as Text" / "Download as PDF"
- Only shown when PDF input is used
- Default: Display as Text

**`ProgressIndicator.jsx`**
- Show: "Processing page X of Y..."
- Progress bar
- Used during PDF transformation

### 2. Train Page Updates

**Layout:**
```
┌─────────────────────────────────────┐
│  Train Your Style Model             │
├─────────────────────────────────────┤
│  [ Paste Text ] [ Upload PDF ]      │  ← Tab Switcher
├─────────────────────────────────────┤
│                                      │
│  [Tab Content: Textarea OR Upload]  │
│                                      │
├─────────────────────────────────────┤
│  [ Analyze Style ]                  │
└─────────────────────────────────────┘
```

**Tab 1: Paste Text** (existing)
**Tab 2: Upload PDF** (new)
- File upload zone
- Shows extracted text preview (first 500 chars)
- Character/word count

### 3. Transform Page Updates

**Layout:**
```
┌─────────────────────────────────────┐
│  Transform Your Text                │
├─────────────────────────────────────┤
│  Model: [Dropdown]     [ Delete ]   │
├─────────────────────────────────────┤
│  Input Type:                        │
│  [ Paste Text ] [ Upload PDF ]      │  ← Tab Switcher
├─────────────────────────────────────┤
│  Left Column          Right Column  │
│  ┌─────────────┐     ┌────────────┐│
│  │ Input       │     │ Output     ││
│  │ (Text/PDF)  │     │            ││
│  └─────────────┘     └────────────┘│
├─────────────────────────────────────┤
│  Output Format (if PDF input):      │
│  ○ Display Text  ○ Download PDF    │
├─────────────────────────────────────┤
│  [ Transform ]                      │
└─────────────────────────────────────┘
```

---

## Processing Flow

### Training with PDF:

```
1. User uploads PDF on Train page
2. Frontend: Validate file (type, size)
3. Frontend → Backend: Send PDF to /api/train
4. Backend: Extract text with structure
5. Backend: Remove repeated headers/footers
6. Backend: Train model with extracted text
7. Backend → Frontend: Return success
8. Frontend: Show naming dialog
```

### Transforming with PDF:

```
1. User uploads PDF on Transform page
2. User selects output format (text/PDF)
3. Frontend → Backend: Send PDF + model + format
4. Backend: Extract text from PDF
5. Backend: Remove headers/footers
6. Backend: Split into paragraphs
7. Backend: Transform each paragraph
8. Backend: If PDF output:
   - Generate new PDF with transformed text
   - Return binary file
   Else:
   - Return JSON with transformed text
9. Frontend: Display or trigger download
```

---

## Implementation Steps

### Phase 1: Backend Core (Day 1)
1. ✅ Install PDF dependencies
2. ✅ Create PDFProcessor class
3. ✅ Implement text extraction
4. ✅ Implement header detection algorithm
5. ✅ Test with sample PDFs

### Phase 2: Backend Endpoints (Day 1-2)
6. ✅ Add /api/extract-pdf endpoint
7. ✅ Add /api/transform-pdf endpoint
8. ✅ Modify /api/train for PDF support
9. ✅ Add file upload handling
10. ✅ Test all endpoints

### Phase 3: Frontend Components (Day 2)
11. ✅ Create FileUploadZone component
12. ✅ Create OutputFormatSelector component
13. ✅ Create ProgressIndicator component
14. ✅ Test components in isolation

### Phase 4: Integration (Day 2-3)
15. ✅ Update Train page with tabs
16. ✅ Update Transform page with tabs
17. ✅ Connect to backend endpoints
18. ✅ Add loading states & error handling

### Phase 5: Testing & Polish (Day 3)
19. ✅ Test with various PDF types
20. ✅ Test large PDFs (near 10MB)
21. ✅ Test PDFs with headers/footers
22. ✅ Test scanned PDF rejection
23. ✅ Polish UI/UX

---

## Error Handling

**Frontend:**
- File too large (>10MB): "File exceeds 10MB limit"
- Wrong file type: "Please upload a PDF file"
- Upload failed: "Failed to upload file. Please try again"

**Backend:**
- Scanned PDF (no text): "This PDF appears to be scanned images. Please use a text-based PDF."
- Corrupted PDF: "Unable to read PDF file. File may be corrupted."
- Processing timeout: "PDF processing timed out. Try a smaller file."

---

## Testing Scenarios

1. Small PDF (1 page, 50KB)
2. Medium PDF (10 pages, 500KB)
3. Large PDF (100 pages, 9MB)
4. PDF with headers/footers (book)
5. PDF with mixed formatting
6. Scanned PDF (should fail gracefully)
7. Corrupted PDF (should fail gracefully)
8. Non-PDF file (should reject)

---

## Success Criteria

✅ User can upload PDF on Train page
✅ User can upload PDF on Transform page
✅ Headers/footers are automatically removed
✅ Transformed text preserves paragraph structure
✅ User can choose text or PDF output
✅ Progress is shown for large PDFs
✅ Errors are handled gracefully
✅ File size limit is enforced
✅ Scanned PDFs are rejected with clear message

