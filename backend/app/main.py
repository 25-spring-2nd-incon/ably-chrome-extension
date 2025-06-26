from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db import SessionLocal, engine
from .models import Base, ProductOpinion
import logging

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중 전체 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello FastAPI"}


@app.get("/opinion/{product_ID}")
def get_opinion(product_ID: str):
    db = SessionLocal()
    try:
        rows = db.query(ProductOpinion).filter(ProductOpinion.product_ID == product_ID).all()
        if not rows:
            raise HTTPException(status_code=404, detail="Review not found!")
        
        opinions = []
        for row in rows:
            opinions.append({
                "product_ID": product_ID,
                "aspect_span": row.aspect_span,
                "cleaned_opinion_span": row.cleaned_opinion_span,
                "sentiment": (row.sentiment or "").strip(),
                "category": (row.category or "").strip()
            })

        return {
            "product_ID": product_ID,
            "opinion_count": len(opinions),
            "opinions": opinions
        }
    
    finally:
        db.close()