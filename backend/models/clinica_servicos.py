from pydantic import BaseModel, Field


class ClinicaServicoEntrada(BaseModel):
    id_servico: int = Field(gt=0)


class ClinicaServicoSaida(ClinicaServicoEntrada):
    id_clinica: int