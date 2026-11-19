from pydantic import BaseModel, Field


class ClinicaProfissionalEntrada(BaseModel):
    id_profissional: int = Field(gt=0)


class ClinicaProfissionalSaida(ClinicaProfissionalEntrada):
    id_clinica: int