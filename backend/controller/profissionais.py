from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.profissionais import ProfissionaisEntrada, ProfissionaisSaida

router = APIRouter(
    prefix="/profissionais",
    tags=["Profissionais"]
)

# O relacionamento permite buscar o nome na tabela especialidade.
COLUNAS = (
    "id_profissional, nome_profissional, id_especialidade, "
    "especialidade:especialidade(nome_specialidade)" 
)

def validar_especialidade(id_especialidade: int):
    resposta = (
        supabase.table("especialidade")
        .select("id_especialidade")
        .eq("id_especialidade", id_especialidade)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=400,
            detail="Especialidade não encontrada. Consulte uma especialidade cadastrada.",
        )

def preparar_saida(registro) -> dict:
    # O Supabase devolve o nome dentro do objeto/lista especialidade.
    especialidade = registro.get("especialidade")
    
    # Tratativa caso o Supabase retorne a relação como uma lista de 1 elemento
    if isinstance(especialidade, list) and len(especialidade) > 0:
        especialidade = especialidade[0]

    if not especialidade:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível consultar a especialidade do profissional.",
        )
    return {
        "id_profissional": registro["id_profissional"],
        "nome_profissional": registro["nome_profissional"],
        "id_especialidade": registro["id_especialidade"],
        "nome_especialidade": especialidade["nome_especialidade"],
    }

def buscar_profissional(id_profissional: int):
    resposta = (
        supabase.table("profissionais")
        .select(COLUNAS)
        .eq("id_profissional", id_profissional)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=404, 
            detail="Profissional não encontrado."
        )
    return preparar_saida(resposta.data[0])

@router.post(
    "", 
    response_model=ProfissionaisSaida, 
    status_code=201
)
def cadastrar_profissional(dados: ProfissionaisEntrada):
    validar_especialidade(dados.id_especialidade)
    
    # Executa o insert. 
    resposta = (
        supabase.table("profissionais")
        .insert(dados.model_dump(mode="json"))
        .execute()
    )
    
    if not resposta.data:
        raise HTTPException(
            status_code=502, 
            detail="O Supabase não retornou o profissional cadastrado."
        )
        
    id_novo = resposta.data[0]["id_profissional"]
    return buscar_profissional(id_novo)

@router.get(
    "", 
    response_model=list[ProfissionaisSaida]
)
def listar_profissionais():
    resposta = (
        supabase.table("profissionais")
        .select(COLUNAS)
        .order("id_profissional")
        .execute()
    )
    return [
        preparar_saida(registro) 
        for registro in resposta.data
    ]

@router.get(
    "/{id_profissional}", 
    response_model=ProfissionaisSaida
)
def consultar_profissional(id_profissional: int):
    return buscar_profissional(id_profissional)

@router.put(
    "/{id_profissional}", 
    response_model=ProfissionaisSaida
)
def atualizar_profissional(
    id_profissional: int, 
    dados: ProfissionaisEntrada
):
    # Verifica se o profissional existe antes de atualizar
    buscar_profissional(id_profissional)
    validar_especialidade(dados.id_especialidade)
    
    resposta = (
        supabase.table("profissionais")
        .update(dados.model_dump(mode="json"))
        .eq("id_profissional", id_profissional)
        .execute()
    )
    
    if not resposta.data:
        raise HTTPException(
            status_code=404, 
            detail="Profissional não encontrado ou nenhuma alteração realizada."
        )
        
    return buscar_profissional(id_profissional)

@router.delete(
    "/{id_profissional}", 
    status_code=status.HTTP_204_NO_CONTENT
)
def excluir_profissional(id_profissional: int):
    # O delete no Supabase retorna o item deletado se ele existir
    resposta = (
        supabase.table("profissionais")
        .delete()
        .eq("id_profissional", id_profissional)
        .execute()
    )
    
    if not resposta.data:
        raise HTTPException(
            status_code=404, 
            detail="Profissional não encontrado."
        )
        
    return Response(status_code=status.HTTP_204_NO_CONTENT)
