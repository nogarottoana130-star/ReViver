from fastapi import APIRouter, HTTPException, Response, status # type: ignore
from database import supabase
from models.atendimentos_clinica import (
    AtendimentosClinicaEntrada,
    AtendimentosClinicaSaida,
)

router = APIRouter(
    prefix="/atendimentos_clinica", 
    tags=["Atendimentos Clínica"]
)

# O relacionamento permite buscar o nome da clínica e o nome do usuário.
COLUNAS = (
    "id_atendimento, id_clinica, id_usuario, data_entrada, previsao_saida, "
    "data_saida, status_atendimento, clinicas(nome_clinica:nome), usuarios(nome_usuario:nome)"
)

def validar_clinica(id_clinica: str):
    resposta = (
        supabase.table("clinicas")
        .select("id_clinica")
        .eq("id_clinica", id_clinica)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=400,
            detail="Clínica não encontrada. Consulte uma clínica cadastrada.",
        )

def validar_usuario(id_usuario: int):
    if id_usuario is not None:
        resposta = (
            supabase.table("usuarios")
            .select("id_usuario")
            .eq("id_usuario", id_usuario)
            .execute()
        )
        if not resposta.data:
            raise HTTPException(
                status_code=400,
                detail="Usuário não encontrado. Consulte um usuário cadastrado.",
            )

def preparar_saida(registro):
    clinica = registro.get("clinicas")
    usuario = registro.get("usuarios")

    if isinstance(clinica, list) and len(clinica) > 0:
        clinica = clinica[0]
    if isinstance(usuario, list) and len(usuario) > 0:
        usuario = usuario[0]

    if not clinica:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível consultar os dados da clínica referente ao atendimento.",
        )

    return {
        "id_atendimento": registro["id_atendimento"],
        "id_clinica": registro["id_clinica"],
        "nome_clinica": clinica.get("nome_clinica"),
        "id_usuario": registro.get("id_usuario"),
        "nome_usuario": usuario.get("nome_usuario") if usuario else None,
        "data_entrada": registro.get("data_entrada"),
        "previsao_saida": registro.get("previsao_saida"),
        "data_saida": registro.get("data_saida"),
        "status_atendimento": registro.get("status_atendimento"),
    }

def buscar_atendimento(id_atendimento: int):
    resposta = (
        supabase.table("atendimentos_clinica")
        .select(COLUNAS)
        .eq("id_atendimento", id_atendimento)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=404, 
            detail="Atendimento não encontrado."
        )
    return preparar_saida(resposta.data[0])

@router.post(
    "", 
    response_model=AtendimentosClinicaSaida, 
    status_code=201
)
def cadastrar_atendimento(dados: AtendimentosClinicaEntrada):
    validar_clinica(dados.id_clinica)
    validar_usuario(dados.id_usuario)

    resposta = (
        supabase.table("atendimentos_clinica")
        .insert(dados.model_dump(mode="json"))
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou o atendimento cadastrado.",
        )

    id_novo = resposta.data[0]["id_atendimento"]
    return buscar_atendimento(id_novo)

@router.get(
    "", 
    response_model=list[AtendimentosClinicaSaida]
)
def listar_atendimentos():
    resposta = (
        supabase.table("atendimentos_clinica")
        .select(COLUNAS)
        .order("id_atendimento")
        .execute()
    )
    return [
        preparar_saida(registro) 
        for registro in resposta.data
    ]

@router.get(
    "/{id_atendimento}", 
    response_model=AtendimentosClinicaSaida
)
def consultar_atendimento(id_atendimento: int):
    return buscar_atendimento(id_atendimento)

@router.put(
    "/{id_atendimento}", 
    response_model=AtendimentosClinicaSaida
)
def atualizar_atendimento(
    id_atendimento: int, 
    dados: AtendimentosClinicaEntrada
):
    buscar_atendimento(id_atendimento)
    validar_clinica(dados.id_clinica)
    validar_usuario(dados.id_usuario)

    resposta = (
        supabase.table("atendimentos_clinica")
        .update(dados.model_dump(mode="json"))
        .eq("id_atendimento", id_atendimento)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Atendimento não encontrado ou nenhuma alteração realizada.",
        )

    return buscar_atendimento(id_atendimento)

@router.delete(
    "/{id_atendimento}", 
    status_code=status.HTTP_204_NO_CONTENT
)
def excluir_atendimento(id_atendimento: int):
    resposta = (
        supabase.table("atendimentos_clinica")
        .delete()
        .eq("id_atendimento", id_atendimento)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404, 
            detail="Atendimento não encontrado."
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)