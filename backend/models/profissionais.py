from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ProfissionaisEntrada(BaseModel):
    # O cadastro recebe apenas data e ID do profissional escolhido.
    model_config = ConfigDict(extra="forbid")

    id_especialidade: int = Field(gt=0)


class ProfissionaisSaida(ProfissionaisEntrada):
    id_profisssional: int
    nome_profissional: str
