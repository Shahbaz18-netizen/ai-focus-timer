from pydantic import BaseModel, Field
import os
# Purana galat import:
# from langchain import ChatPromptTemplate 

# Naya sahi import:
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser

# 1. Structured Output ke liye Schema define karo
class AIAnalysis(BaseModel):
    focus_score: int = Field(description="Focus score from 1-10")
    feedback: str = Field(description="A short, encouraging feedback for the user")
    suggestion: str = Field(description="One actionable tip for the next session")

class AIService:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
        self.parser = JsonOutputParser(pydantic_object=AIAnalysis)

    def analyze_journal(self, content: str):
        prompt = ChatPromptTemplate.from_template(
            "You are a smart Productivity Coach. Analyze this user's post-session journal: '{content}'. "
            "Provide a focus score (1-10), a short feedback, and one tip for the next session. "
            "{format_instructions}"
        )
        
        chain = prompt | self.llm | self.parser
        
        # AI ko batana ki output JSON format mein chahiye
        response = chain.invoke({
            "content": content,
            "format_instructions": self.parser.get_format_instructions()
        })
        return response
    
    # AIService class ke andar analyze_journal method ko update karo
    def analyze_journal(self, content: str, past_context: list):
        context_str = "\n".join(past_context) if past_context else "No past history found."
        
        prompt = ChatPromptTemplate.from_template(
            "You are a Productivity Coach. \n"
            "PAST HISTORY: {context}\n"
            "CURRENT SESSION: '{content}'\n"
            "Analyze the current session and see if there are repeating patterns from the past history. "
            "Provide score, feedback, and tip. {format_instructions}"
        )
        
        chain = prompt | self.llm | self.parser
        return chain.invoke({
            "content": content, 
            "context": context_str,
            "format_instructions": self.parser.get_format_instructions()
        })