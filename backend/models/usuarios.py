from datetime import date
from pydantic import BaseModel, Field, field_validator

class UsuarioEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=150)
    data_nascimento: date
    cpf: str = Field(min_length=1, max_length=14)
    email: str = Field(min_length=1, max_length=150)
    telefone: str = Field(min_length=1, max_length=15)
    
    @field_validator("nome")
    @classmethod
    def validar_usuario(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "O nome do usuário não pode ficar vazio."
            )
        return valor

class UsuarioSaida(UsuarioEntrada):
    id_usuario: int