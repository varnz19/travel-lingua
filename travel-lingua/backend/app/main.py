import time
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.api.v1.api import api_router
from app.api.websockets.voice_stream import router as websocket_router

# Configure Application Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("travel-lingua")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend & Real-Time API Gateway for Travel-Lingua Mobile App",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Process Time Logging Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    logger.info(f"{request.method} {request.url.path} - Completed in {process_time:.4f}s with status {response.status_code}")
    return response


# Global Error Handling Middleware
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "details": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Server Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error occurred",
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
        }
    )


# Mandatory Health Check Endpoint
@app.get("/health", tags=["Health Check"], summary="Service Health Check")
async def health_check():
    """
    Returns service health status and project identifier.
    Required response format:
    {
      "status": "ok",
      "service": "travel-lingua-backend"
    }
    """
    return {
        "status": "ok",
        "service": "travel-lingua-backend"
    }


# Include API Version 1 Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Include WebSocket Router
app.include_router(websocket_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
