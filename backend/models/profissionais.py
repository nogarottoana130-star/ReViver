from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ProfissionaisEntrada(BaseModel):
    # O cadastro recebe apenas data e ID do profissional escolhido.
    model_config = ConfigDict(extra="forbid")

    id_especialidade: int = Field(gt=0)
    nome_profissional: str

class ProfissionaisSaida(ProfissionaisEntrada):
    id_profissional: int
    nome_especialidade: str
