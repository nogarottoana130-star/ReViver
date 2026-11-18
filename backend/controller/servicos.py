from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.servicos import ServicoEntrada, ServicoSaida

router = APIRouter(prefix="/servicos", tags=["Servicos"])

# Cadastrar: o banco gera o ID.
@router.post("", response_model=ServicoSaida,
             status_code=status.HTTP_201_CREATED)
def cadastrar_servico(dados: ServicoEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("servicos")
        .insert(conteudo)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou o servico cadastrado.",
        )
    return resposta.data[0]

# Listar os registros acessíveis, ordenados pelo ID.
@router.get("", response_model=list[ServicoSaida])
def listar_servicos():
    resposta = (
        supabase.table("servicos")
        .select("*")
        .order("id_servico")
        .execute()
    )
    return resposta.data
@router.get("/{id_servicos}", response_model=ServicoSaida)
def consultar_servico(id_servico: int):
    resposta = (
        supabase.table("servicos")
        .select("*")
        .eq("id_servico", id_servico)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Serviço não encontrado.")
    return resposta.data[0]

@router.put("/{id_servico}", response_model=ServicoSaida)
def atualizar_servico(id_servico: int, dados: ServicoEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("servicos")
        .update(conteudo)
        .eq("id_servico", id_servico)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Serviço não encontrado.")
    return resposta.data[0]

@router.delete("/{id_servico}",
               status_code=status.HTTP_204_NO_CONTENT)
def excluir_servico(id_servico: int):
    resposta = (
        supabase.table("servicos")
        .delete()
        .eq("id_servico", id_servico)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Serviço não encontrado.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
