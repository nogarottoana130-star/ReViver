from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ConversasEntrada(BaseModel):
    # O cadastro recebe apenas data e ID da conversa escolhida.
    model_config = ConfigDict(extra="forbid")

    data_hora: datetime
    id_usuario: int = Field(gt=0)
    categoria_pergunta: str
    nivel_de_urgencia: str
    necessita_profissional: str
    encaminhamento_realizado: str
    pergunta_usuario: str = Field(min_length=10, max_length=5000, strip_whitespace=True)


class ConversasSaida(ConversasEntrada):
    id_conversa: int
    nome: str
