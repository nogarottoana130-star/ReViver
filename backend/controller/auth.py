from secrets import compare_digest

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import supabase

router = APIRouter(prefix="/auth", tags=["Autenticação"])


class LoginEntrada(BaseModel):
    email: str = Field(min_length=1, max_length=150)
    senha: str = Field(min_length=4, max_length=12)


@router.post("/login")
def entrar(dados: LoginEntrada):
    resposta = (
        supabase.table("usuarios")
        .select("id_usuario, nome, email, senha")
        .eq("email", dados.email.strip())
        .limit(1)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos.",
        )

    usuario = resposta.data[0]
    senha_salva = usuario.get("senha") or ""

    if not compare_digest(
        dados.senha.encode("utf-8"),
        senha_salva.encode("utf-8"),
    ):
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos.",
        )

    return {
        "mensagem": "Login realizado com sucesso.",
        "usuario": {
            "id_usuario": usuario["id_usuario"],
            "nome": usuario["nome"],
            "email": usuario["email"],
        },
    }