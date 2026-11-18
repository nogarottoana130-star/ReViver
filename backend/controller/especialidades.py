from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.especialidades import EspecialidadeEntrada, EspecialidadeSaida

router = APIRouter(prefix="/especialidades", tags=["Especialidades"])

# Cadastrar: o banco gera o ID.
@router.post("", response_model=EspecialidadeSaida,
             status_code=status.HTTP_201_CREATED)
def cadastrar_especialidade(dados: EspecialidadeEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("especialidades")
        .insert(conteudo)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou a especialidade cadastrada.",
        )
    return resposta.data[0]

# Listar os registros acessíveis, ordenados pelo ID.
@router.get("", response_model=list[EspecialidadeSaida])
def listar_especialidades():
    resposta = (
        supabase.table("especialidades")
        .select("*")
        .order("id_especialidade")
        .execute()
    )
    return resposta.data
@router.get("/{id_especialidades}", response_model=EspecialidadeSaida)
def consultar_especialidade(id_especialidade: int):
    resposta = (
        supabase.table("especialidades")
        .select("*")
        .eq("id_especialidade", id_especialidade)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Especialidade não encontrada.")
    return resposta.data[0]

@router.put("/{id_especialidade}", response_model=EspecialidadeSaida)
def atualizar_especialidade(id_especialidade: int, dados: EspecialidadeEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("especialidades")
        .update(conteudo)
        .eq("id_especialidade", id_especialidade)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Especialidade não encontrada.")
    return resposta.data[0]

@router.delete("/{id_especialidade}",
               status_code=status.HTTP_204_NO_CONTENT)
def excluir_especialidade(id_especialidade: int):
    resposta = (
        supabase.table("especialidades")
        .delete()
        .eq("id_especialidade", id_especialidade)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Especialidade não encontrada.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
