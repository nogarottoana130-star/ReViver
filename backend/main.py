import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from httpx import RequestError
from postgrest.exceptions import APIError
from fastapi.middleware.cors import CORSMiddleware
from controller.clinicas import router as clinicas_router
from controller.especialidades import router as  especialidades_router
from controller.servicos import router as servicos_router
from controller.usuarios import router as usuarios_router
from controller.conversas import router as conversas_router
from controller.profissionais import router as profissionais_router
from controller.atendimento_clinica import router as atendumento_clinica_router

logger = logging.getLogger("uvicorn.error")
app = FastAPI(
    title="ReViver - API rede de apoio ao dependente químico",
    description="CRUD com Supabase por HTTPS.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)

@app.exception_handler(APIError)
async def tratar_erro_supabase(request: Request, erro: APIError):
    logger.error("Erro na operação do Supabase: %s", erro)
    if erro.code == "23503":
        return JSONResponse(
            status_code=409,
            content={"detail": (
                "Operação bloqueada por um vínculo entre tabelas. "
                "Confira o cliente da compra. Um cliente com compras "
                "vinculadas não pode ser excluído."
            )},
        )
    return JSONResponse(
        status_code=502,
        content={"detail": (
            "O Supabase recusou a operação. Confira o terminal."
        )},
    )

@app.exception_handler(RequestError)
async def tratar_erro_rede(request: Request, erro: RequestError):
    logger.error("Falha de comunicação: %s", type(erro).__name__)
    return JSONResponse(
        status_code=503,
        content={"detail": (
            "Não foi possível acessar o Supabase. "
            "Verifique a conexão com a internet."
        )},
    )

app.include_router(clinicas_router)
app.include_router(especialidades_router)
app.include_router(servicos_router)
app.include_router(usuarios_router)
app.include_router(conversas_router)
app.include_router(profissionais_router)
app.include_router(atendumento_clinica_router)