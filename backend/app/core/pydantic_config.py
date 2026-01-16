"""
Configuration Pydantic pour désactiver la validation stricte
"""
from pydantic import ConfigDict

# Configuration pour éviter les erreurs de validation avec Python 3.13
PYDANTIC_CONFIG = ConfigDict(
    arbitrary_types_allowed=True,
    validate_assignment=False,
    use_enum_values=True,
)
