from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.usuarios import UsuarioEntrada, UsuarioSaida

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

# Cadastrar: o banco gera o ID.
@router.post("", response_model=UsuarioSaida,
             status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(dados: UsuarioEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("usuarios")
        .insert(conteudo)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou o usuário cadastrado.",
        )
    return resposta.data[0]

# Listar os registros acessíveis, ordenados pelo ID.
@router.get("", response_model=list[UsuarioSaida])
def listar_usuarios():
    resposta = (
        supabase.table("usuarios")
        .select("*")
        .order("id_usuario")
        .execute()
    )
    return resposta.data
@router.get("/{id_usuario}", response_model=UsuarioSaida)
def consultar_usuario(id_usuario: int):
    resposta = (
        supabase.table("usuarios")
        .select("*")
        .eq("id_usuario", id_usuario)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "usuário não encontrado.")
    return resposta.data[0]

@router.put("/{id_usuario}", response_model=UsuarioSaida)
def atualizar_usuario(id_usuario: int, dados: UsuarioEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("usuarios")
        .update(conteudo)
        .eq("id_usuario", id_usuario)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Usuário não encontrado.")
    return resposta.data[0]

@router.delete("/{id_usuario}",
               status_code=status.HTTP_204_NO_CONTENT)
def excluir_usuario(id_usuario: int):
    resposta = (
        supabase.table("usuarios")
        .delete()
        .eq("id_usuario", id_usuario)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Usuário não encontrado.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)