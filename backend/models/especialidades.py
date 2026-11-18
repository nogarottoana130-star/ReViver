from pydantic import BaseModel, Field, field_validator

class EspecialidadeEntrada(BaseModel):
    nome_especialidade: str = Field(min_length=1, max_length=150)
    especialidade: str = Field(min_length=1, max_length=150)
    
    @field_validator("nome_especialidade")
    @classmethod
    def validar_especialidade(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "O nome da especialidade não pode ficar vazio."
            )
        return valor

class EspecialidadeSaida(EspecialidadeEntrada):
    id_especialidade: int
