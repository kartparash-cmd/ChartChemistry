"""Pytest configuration for astro-service tests."""

import warnings

# Suppress known FastAPI/Pydantic v2 interaction warning where FastAPI internally
# wraps model fields in Annotated[type, FieldInfo], causing Pydantic to emit
# UnsupportedFieldAttributeWarning for alias attributes. The aliases function
# correctly despite the warning.
try:
    from pydantic._internal._generate_schema import UnsupportedFieldAttributeWarning
    warnings.filterwarnings("ignore", category=UnsupportedFieldAttributeWarning)
except ImportError:
    warnings.filterwarnings(
        "ignore",
        message=".*alias.*attribute.*Field.*function.*no effect",
        category=UserWarning,
    )
