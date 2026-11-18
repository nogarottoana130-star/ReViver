from pydantic import BaseModel, Field, field_validator

class ServicoEntrada(BaseModel):
    nome_servico: str = Field(min_length=1, max_length=150)
    servico: str = Field(min_length=1, max_length=150)

    @field_validator("nome_servico")
    @classmethod
    def validar_servico(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "O nome do serviço não pode ficar vazio."
            )
        return valor

class ServicoSaida(ServicoEntrada):
    id_servico: int
