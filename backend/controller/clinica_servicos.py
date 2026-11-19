from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.clinica_servicos import (
    ClinicaServicoEntrada,
    ClinicaServicoSaida,
)

router = APIRouter(
    prefix="/clinicas/{id_clinica}/servicos",
    tags=["Serviços da clínica"],
)


# Cadastrar vínculo entre clínica e serviço
@router.post(
    "",
    response_model=ClinicaServicoSaida,
    status_code=status.HTTP_201_CREATED,
)
def cadastrar_clinica_servico(
    id_clinica: int, dados: ClinicaServicoEntrada
):
    existente = (
        supabase.table("clinica_servicos")
        .select("*")
        .eq("id_clinica", id_clinica)
        .eq("id_servico", dados.id_servico)
        .execute()
    )
    if existente.data:
        raise HTTPException(
            status_code=409,
            detail="Serviço já vinculado a esta clínica.",
        )

    conteudo = {
        "id_clinica": id_clinica,
        "id_servico": dados.id_servico,
    }
    resposta = (
        supabase.table("clinica_servicos")
        .insert(conteudo)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou o vínculo cadastrado.",
        )
    return resposta.data[0]


# Listar todos os serviços vinculados a uma clínica
@router.get("", response_model=list[ClinicaServicoSaida])
def listar_clinica_servicos(id_clinica: int):
    resposta = (
        supabase.table("clinica_servicos")
        .select("*")
        .eq("id_clinica", id_clinica)
        .order("id_servico")
        .execute()
    )
    return resposta.data


# Consultar um vínculo específico
@router.get("/{id_servico}", response_model=ClinicaServicoSaida)
def consultar_clinica_servico(id_clinica: int, id_servico: int):
    resposta = (
        supabase.table("clinica_servicos")
        .select("*")
        .eq("id_clinica", id_clinica)
        .eq("id_servico", id_servico)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Vínculo entre clínica e serviço não encontrado.",
        )
    return resposta.data[0]


# Excluir vínculo
@router.delete("/{id_servico}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_clinica_servico(id_clinica: int, id_servico: int):
    resposta = (
        supabase.table("clinica_servicos")
        .delete()
        .eq("id_clinica", id_clinica)
        .eq("id_servico", id_servico)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Vínculo entre clínica e serviço não encontrado.",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)