from sqlalchemy import Column, Float, Integer, Text

from database.db import Base


class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(Text, nullable=False)
    image1 = Column(Text, nullable=True)
    image2 = Column(Text, nullable=True)
    image3 = Column(Text, nullable=True)
    image4 = Column(Text, nullable=True)
    result = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)
    category = Column(Text, nullable=False)
    shelf_life = Column(Text, nullable=True)
    nutrition = Column(Text, nullable=True)
    storage_tip = Column(Text, nullable=True)
    health_tip = Column(Text, nullable=True)
    raw_json = Column(Text, nullable=False)
