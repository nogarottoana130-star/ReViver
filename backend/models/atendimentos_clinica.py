from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class AtendimentosClinicaEntrada(BaseModel):
    # O cadastro recebe apenas data e ID do atendimento escolhido.
    model_config = ConfigDict(extra="forbid")

    data_entrada: date
    previsao_saida: date
    data_saida: date
    id_clinica: int = Field(gt=0)
    id_usuario: int = Field(gt=0)


class AtendimentosClinicaSaida(AtendimentosClinicaEntrada):
    id_atendimento: int
    status_atendimento: str
