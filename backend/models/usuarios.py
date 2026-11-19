from datetime import date
from pydantic import BaseModel, Field, field_validator

class UsuarioEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=150)
    data_nascimento: date
    cpf: str = Field(min_length=1, max_length=14)
    email: str = Field(min_length=1, max_length=150)
    telefone: str = Field(min_length=1, max_length=15)
    senha: str = Field(min_length=4, max_length=12)
    
    @field_validator("nome")
    @classmethod
    def validar_usuario(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "O nome do usuário não pode ficar vazio."
            )
        return valor
    
    @field_validator("senha")
    @classmethod
    def validar_senha(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "A senha do usuário não pode ficar vazia."
            )
        return valor

class UsuarioSaida(UsuarioEntrada):
    id_usuario: int