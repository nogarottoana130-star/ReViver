from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.conversas import ConversasEntrada, ConversasSaida

router = APIRouter(
    prefix="/conversas",
    tags=["Conversas"]
)

# O relacionamento permite buscar o nome (ou dados) na tabela usuarios.
COLUNAS = (
    "id_conversa, id_usuario, data_hora, pergunta_usuario, "
    "categoria_pergunta, nivel_de_urgencia, necessita_profissional, "
    "encaminhamento_realizado, usuario:usuarios(nome_usuario)"
)

def validar_usuario(id_usuario: int):
    resposta = (
        supabase.table("usuarios")
        .select("id_usuario, nome_usuario")
        .eq("id_usuario", id_usuario)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=400,
            detail="Usuário não encontrado. Consulte um usuário cadastrado.",
        )

def preparar_saida(registro):
    # O Supabase devolve o objeto usuario relacionado.
    usuario = registro.get("usuario")
    
    # Tratativa caso o Supabase retorne a relação como uma lista de 1 elemento
    if isinstance(usuario, list) and len(usuario) > 0:
        usuario = usuario[0]

    if not usuario:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível consultar o usuário da conversa.",
        )
        
    return {
        "id_conversa": registro["id_conversa"],
        "id_usuario": registro["id_usuario"],
        "nome_usuario": usuario["nome_usuario"],
        "data_hora": registro["data_hora"],
        "pergunta_usuario": registro["pergunta_usuario"],
        "categoria_pergunta": registro.get("categoria_pergunta"),
        "nivel_de_urgencia": registro.get("nivel_de_urgencia"),
        "necessita_profissional": registro.get("necessita_profissional"),
        "encaminhamento_realizado": registro.get("encaminhamento_realizado"),
    }

def buscar_conversa(id_conversa: str):
    resposta = (
        supabase.table("conversas")
        .select(COLUNAS)
        .eq("id_conversa", id_conversa)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Conversa não encontrada."
        )
    return preparar_saida(resposta.data[0])

@router.post(
    "", 
    response_model=ConversasSaida, 
    status_code=201
)
def cadastrar_conversa(dados: ConversasEntrada):
    validar_usuario(dados.id_usuario)
    
    resposta = (
        supabase.table("conversas")
        .insert(dados.model_dump(mode="json"))
        .execute()
    )
    
    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou a conversa cadastrada."
        )
        
    id_novo = resposta.data[0]["id_conversa"]
    return buscar_conversa(id_novo)

@router.get(
    "", 
    response_model=list[ConversasSaida]
)
def listar_conversas():
    resposta = (
        supabase.table("conversas")
        .select(COLUNAS)
        .order("id_conversa")
        .execute()
    )
    return [
        preparar_saida(registro) 
        for registro in resposta.data
    ]

@router.get(
    "/{id_conversa}", 
    response_model=ConversasSaida
)
def consultar_conversa(id_conversa: str):
    return buscar_conversa(id_conversa)

@router.put(
    "/{id_conversa}", 
    response_model=ConversasSaida
)
def atualizar_conversa(
    id_conversa: str, 
    dados: ConversasEntrada
):
    buscar_conversa(id_conversa)
    validar_usuario(dados.id_usuario)
    
    resposta = (
        supabase.table("conversas")
        .update(dados.model_dump(mode="json"))
        .eq("id_conversa", id_conversa)
        .execute()
    )
    
    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Conversa não encontrada ou nenhuma alteração realizada."
        )
        
    return buscar_conversa(id_conversa)

@router.delete(
    "/{id_conversa}", 
    status_code=status.HTTP_204_NO_CONTENT
)
def excluir_conversa(id_conversa: str):
    resposta = (
        supabase.table("conversas")
        .delete()
        .eq("id_conversa", id_conversa)
        .execute()
    )
    
    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Conversa não encontrada."
        )
        
    return Response(status_code=status.HTTP_204_NO_CONTENT)