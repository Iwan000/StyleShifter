from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import time
from datetime import datetime

from config import config
from services.style_learner import StyleLearner
from services.style_actor import StyleActor
from services.pdf_processor import PDFProcessor

# Initialize FastAPI app
app = FastAPI(
    title="Text Voice Changer API",
    description="API for training and using text style transformation models",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
style_learner = StyleLearner()
style_actor = StyleActor()
pdf_processor = PDFProcessor(max_file_size_mb=10)

# Request/Response Models
class TrainRequest(BaseModel):
    corpus: str

class TrainResponse(BaseModel):
    success: bool
    report_id: str
    message: str

class SaveModelRequest(BaseModel):
    report_id: str
    model_name: str

class SaveModelResponse(BaseModel):
    success: bool
    model_name: str

class ModelInfo(BaseModel):
    name: str
    created_at: str
    file_path: str

class TransformRequest(BaseModel):
    model_name: str
    text: str

class TransformResponse(BaseModel):
    transformed_text: str

class DeleteResponse(BaseModel):
    success: bool
    message: str

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Text Voice Changer API",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/train": "Analyze corpus and generate style report",
            "POST /api/save-model": "Save and name a trained model",
            "GET /api/models": "List all available models",
            "POST /api/transform": "Transform text using a model",
            "DELETE /api/models/{name}": "Delete a model"
        }
    }

@app.post("/api/train", response_model=TrainResponse)
async def train(request: TrainRequest):
    """
    Analyze a text corpus and generate a style report.
    """
    try:
        # Validate corpus
        if not request.corpus or len(request.corpus.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Corpus must be at least 50 characters long"
            )

        # Analyze the corpus
        report_id, style_report = style_learner.analyze_corpus(request.corpus)

        return TrainResponse(
            success=True,
            report_id=report_id,
            message="Style analysis complete"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-model", response_model=SaveModelResponse)
async def save_model(request: SaveModelRequest):
    """
    Save and name a trained model.
    """
    try:
        # Validate model name
        if not request.model_name or len(request.model_name.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Model name cannot be empty"
            )

        # Clean model name (remove special characters)
        clean_name = "".join(c for c in request.model_name if c.isalnum() or c in (' ', '-', '_'))
        clean_name = clean_name.strip()

        if not clean_name:
            raise HTTPException(
                status_code=400,
                detail="Model name must contain alphanumeric characters"
            )

        # Save the model
        style_learner.save_model(request.report_id, clean_name)

        return SaveModelResponse(
            success=True,
            model_name=clean_name
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models", response_model=List[ModelInfo])
async def list_models():
    """
    List all available trained models.
    """
    try:
        models = style_actor.list_models()

        # Format the response
        formatted_models = []
        for model in models:
            formatted_models.append(ModelInfo(
                name=model["name"],
                created_at=datetime.fromtimestamp(model["created_at"]).isoformat() + "Z",
                file_path=model["file_path"]
            ))

        return formatted_models

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transform", response_model=TransformResponse)
async def transform(request: TransformRequest):
    """
    Transform text using a trained style model.
    """
    try:
        # Validate input
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Input text cannot be empty"
            )

        if not request.model_name:
            raise HTTPException(
                status_code=400,
                detail="Model name is required"
            )

        # Transform the text
        transformed_text = style_actor.transform_text(
            request.model_name,
            request.text
        )

        return TransformResponse(transformed_text=transformed_text)

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/models/{model_name}", response_model=DeleteResponse)
async def delete_model(model_name: str):
    """
    Delete a trained model.
    """
    try:
        # Delete the model
        style_actor.delete_model(model_name)

        return DeleteResponse(
            success=True,
            message=f"Model '{model_name}' deleted successfully"
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# PDF Endpoints

@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    """
    Extract text from a PDF file
    """
    try:
        # Read file content
        content = await file.read()

        # Validate PDF
        validation = pdf_processor.validate_pdf(content)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation["error"])

        # Extract text
        result = pdf_processor.extract_text_with_structure(content)

        return {
            "text": result["text"],
            "pages": result["pages"],
            "paragraph_count": len(result["paragraphs"]),
            "success": True
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@app.post("/api/transform-pdf")
async def transform_pdf(
    file: UploadFile = File(...),
    model_name: str = Form(...),
    output_format: str = Form("text")
):
    """
    Transform PDF content using a trained model

    output_format: "text" or "pdf"
    """
    try:
        # Read and validate PDF
        content = await file.read()
        validation = pdf_processor.validate_pdf(content)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation["error"])

        # Extract text
        result = pdf_processor.extract_text_with_structure(content)

        # Transform each paragraph
        transformed_paragraphs = []
        for paragraph in result["paragraphs"]:
            transformed = style_actor.transform_text(model_name, paragraph)
            transformed_paragraphs.append(transformed)

        transformed_text = "\n\n".join(transformed_paragraphs)

        # Return based on output format
        if output_format == "pdf":
            # Generate PDF
            pdf_buffer = pdf_processor.generate_pdf(transformed_text)
            return StreamingResponse(
                pdf_buffer,
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=transformed.pdf"}
            )
        else:
            # Return as text
            return {
                "transformed_text": transformed_text,
                "pages_processed": result["pages"],
                "success": True
            }

    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to transform PDF: {str(e)}")

@app.post("/api/train-pdf")
async def train_pdf(file: UploadFile = File(...)):
    """
    Train a model using PDF as corpus
    """
    try:
        # Read and validate PDF
        content = await file.read()
        validation = pdf_processor.validate_pdf(content)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation["error"])

        # Extract text
        result = pdf_processor.extract_text_with_structure(content)

        # Train with extracted text
        report_id, style_report = style_learner.analyze_corpus(result["text"])

        return TrainResponse(
            success=True,
            report_id=report_id,
            message=f"Style analysis complete ({result['pages']} pages processed)"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to train from PDF: {str(e)}")

# Startup event
@app.on_event("startup")
async def startup_event():
    """Validate configuration on startup"""
    try:
        config.validate()
        print("✓ Configuration validated")
        print(f"✓ Using model: {config.MODEL_NAME}")
        print(f"✓ Models directory: {config.MODELS_DIR}")
    except ValueError as e:
        print(f"✗ Configuration error: {e}")
        print("Please set OPENAI_API_KEY in your .env file")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
