"""
Base Agent Interface
Every agent inherits from BaseAgent to ensure modularity and traceable orchestration.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseAgent(ABC):
    """
    Standard interface for all 5 specialized agents.
    """

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    @abstractmethod
    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes input state context and returns updated agent output.
        """
        pass
