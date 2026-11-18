from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.clinicas import ClinicaEntrada, ClinicaSaida

router = APIRouter(prefix="/clinicas", tags=["Clinicas"])

# Cadastrar: o banco gera o ID.
@router.post("", response_model=ClinicaSaida,
             status_code=status.HTTP_201_CREATED)
def cadastrar_clinica(dados: ClinicaEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("clinicas")
        .insert(conteudo)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou a clínica cadastrada.",
        )
    return resposta.data[0]

# Listar os registros acessíveis, ordenados pelo ID.
@router.get("", response_model=list[ClinicaSaida])
def listar_clinicas():
    resposta = (
        supabase.table("clinicas")
        .select("*")
        .order("id_clinica")
        .execute()
    )
    return resposta.data
@router.get("/{id_clinicas}", response_model=ClinicaSaida)
def consultar_clinica(id_clinica: int):
    resposta = (
        supabase.table("clinicas")
        .select("*")
        .eq("id_clinica", id_clinica)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Clínica não encontrada.")
    return resposta.data[0]

@router.put("/{id_clinica}", response_model=ClinicaSaida)
def atualizar_clinica(id_clinica: int, dados: ClinicaEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("clinicas")
        .update(conteudo)
        .eq("id_clinica", id_clinica)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Clínica não encontrada.")
    return resposta.data[0]

@router.delete("/{id_clinica}",
               status_code=status.HTTP_204_NO_CONTENT)
def excluir_clinica(id_clinica: int):
    resposta = (
        supabase.table("clinicas")
        .delete()
        .eq("id_clinica", id_clinica)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Clínica não encontrada.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
