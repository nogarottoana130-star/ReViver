from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.clinica_profissionais import (
    ClinicaProfissionalEntrada,
    ClinicaProfissionalSaida,
)

router = APIRouter(
    prefix="/clinicas/{id_clinica}/profissionais",
    tags=["Profissionais da clínica"],
)


# Cadastrar vínculo entre clínica e profissional
@router.post(
    "",
    response_model=ClinicaProfissionalSaida,
    status_code=status.HTTP_201_CREATED,
)
def cadastrar_clinica_profissional(
    id_clinica: int, dados: ClinicaProfissionalEntrada
):
    existente = (
        supabase.table("clinica_profissionais")
        .select("*")
        .eq("id_clinica", id_clinica)
        .eq("id_profissional", dados.id_profissional)
        .execute()
    )
    if existente.data:
        raise HTTPException(
            status_code=409,
            detail="Profissional já vinculado a esta clínica.",
        )

    conteudo = {
        "id_clinica": id_clinica,
        "id_profissional": dados.id_profissional,
    }
    resposta = (
        supabase.table("clinica_profissionais")
        .insert(conteudo)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou o vínculo cadastrado.",
        )
    return resposta.data[0]


# Listar todos os profissionais vinculados a uma clínica
@router.get("", response_model=list[ClinicaProfissionalSaida])
def listar_clinica_profissionais(id_clinica: int):
    resposta = (
        supabase.table("clinica_profissionais")
        .select("*")
        .eq("id_clinica", id_clinica)
        .order("id_profissional")
        .execute()
    )
    return resposta.data


# Consultar um vínculo específico
@router.get("/{id_profissional}", response_model=ClinicaProfissionalSaida)
def consultar_clinica_profissional(id_clinica: int, id_profissional: int):
    resposta = (
        supabase.table("clinica_profissionais")
        .select("*")
        .eq("id_clinica", id_clinica)
        .eq("id_profissional", id_profissional)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Vínculo entre clínica e profissional não encontrado.",
        )
    return resposta.data[0]


# Excluir vínculo
@router.delete("/{id_profissional}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_clinica_profissional(id_clinica: int, id_profissional: int):
    resposta = (
        supabase.table("clinica_profissionais")
        .delete()
        .eq("id_clinica", id_clinica)
        .eq("id_profissional", id_profissional)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Vínculo entre clínica e profissional não encontrado.",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)