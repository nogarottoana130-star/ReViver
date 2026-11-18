from pydantic import BaseModel, Field, field_validator

class ClinicaEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=150)
    endereco: str = Field(min_length=1, max_length=350)
    cidade: str = Field(min_length=1, max_length=150)
    telefone: str = Field(min_length=1, max_length=16)
    vagas_disponiveis: int

    @field_validator("nome")
    @classmethod
    def validar_clinica(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "O nome clínica não pode ficar vazio."
            )
        return valor

class ClinicaSaida(ClinicaEntrada):
    id_clinica: int
