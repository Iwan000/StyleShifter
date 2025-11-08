from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import time
from datetime import datetime

from config import config
from services.style_learner import StyleLearner
from services.style_actor import StyleActor

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
