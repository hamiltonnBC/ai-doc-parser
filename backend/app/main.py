from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.routes import documents, cases, chat, summary, entities

app = FastAPI(
    title="Demo API",
    description="Medical document processing demo",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(cases.router, prefix="/api/cases", tags=["cases"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(summary.router, prefix="/api/summary", tags=["summary"])
app.include_router(entities.router, prefix="/api/entities", tags=["entities"])

@app.get("/")
def read_root():
    return {"message": "Demo API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
