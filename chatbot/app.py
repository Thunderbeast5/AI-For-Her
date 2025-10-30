import os
import logging
import traceback
import json
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import pickle
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try imports with graceful fallbacks
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
    logger.info("✅ Google Generative AI imported successfully")
except ImportError as e:
    logger.error(f"❌ Google Generative AI not available: {e}")
    GENAI_AVAILABLE = False

try:
    from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.messages import HumanMessage, SystemMessage
    LANGCHAIN_AVAILABLE = True
    logger.info("✅ LangChain imported successfully")
except ImportError as e:
    logger.error(f"❌ LangChain not available: {e}")
    LANGCHAIN_AVAILABLE = False

try:
    from deep_translator import GoogleTranslator
    TRANSLATION_AVAILABLE = True
    logger.info("✅ Translation library imported successfully")
except ImportError as e:
    logger.error(f"❌ Translation not available: {e}")
    TRANSLATION_AVAILABLE = False

# Web scraping and vector store imports
try:
    import requests
    from bs4 import BeautifulSoup
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain_core.documents import Document
    # Note: In LangChain 1.0+, chains are handled differently
    # We'll use direct retriever and LLM calls instead
    WEB_SCRAPING_AVAILABLE = True
    logger.info("✅ Web scraping libraries imported successfully")
except ImportError as e:
    logger.error(f"❌ Web scraping libraries not available: {e}")
    WEB_SCRAPING_AVAILABLE = False

app = Flask(__name__)
# Configure CORS to allow requests from React frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

class WomenStartupChatbot:
    def __init__(self, api_key=None):
        """Initialize the Women Startup Ideas Chatbot"""
        try:
            logger.info("🔄 Initializing Women Startup Assistant...")
            
            # Set the API key
            self.api_key = api_key or "AIzaSyDIp_PVkNFRHEUuEIGZdZDKGFqWgmiTQDk"
            
            if not self.api_key:
                raise ValueError("❌ Google AI API key not provided.")
            
            self.model = None
            self.langchain_model = None
            self.conversation_history = []
            self.vector_store = None
            self.embeddings = None
            self.retrieval_chain = None
            
            # Website URLs for scraping
            self.websites = [
                "https://startupsavant.com/best-startup-ideas",
                "https://startupsavant.com/best-online-startup-ideas", 
                "https://www.shopify.com/blog/online-business-ideas",
                "https://startupsavant.com/best-startup-ideas/agriculture"
            ]
            
            # Initialize services
            self._initialize_genai()
            self._initialize_langchain()
            self._initialize_vector_store()
            
            logger.info("✅ Women Startup Assistant initialized successfully!")
            
        except Exception as e:
            logger.error(f"❌ Critical error initializing chatbot: {e}")
            logger.error(traceback.format_exc())
    
    def _initialize_genai(self):
        """Initialize Google Generative AI"""
        try:
            if not GENAI_AVAILABLE:
                logger.warning("⚠️  Google Generative AI not available")
                return False
                
            genai.configure(api_key=self.api_key)
            
            # Try to initialize with available models
            try:
                self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
                logger.info("✅ GenAI model initialized with gemini-2.0-flash-exp")
            except Exception as e:
                logger.error(f"❌ Failed to initialize gemini-2.0-flash-exp: {e}")
                try:
                    self.model = genai.GenerativeModel('gemini-1.5-flash')
                    logger.info("✅ GenAI model initialized with gemini-1.5-flash fallback")
                except Exception as e2:
                    try:
                        self.model = genai.GenerativeModel('gemini-pro')
                        logger.info("✅ GenAI model initialized with gemini-pro fallback")
                    except Exception as e3:
                        logger.error(f"❌ All GenAI model initialization failed: {e3}")
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to configure Generative AI: {e}")
            return False
    
    def _initialize_langchain(self):
        """Initialize LangChain with Google Generative AI"""
        try:
            if not LANGCHAIN_AVAILABLE:
                logger.warning("⚠️  LangChain not available")
                return False
            
            # Try different model names
            model_names = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-pro']
            
            for model_name in model_names:
                try:
                    self.langchain_model = ChatGoogleGenerativeAI(
                        model=model_name,
                        google_api_key=self.api_key,
                        temperature=0.7,
                        convert_system_message_to_human=True,
                        max_output_tokens=2048
                    )
                    logger.info(f"✅ LangChain model initialized with {model_name}")
                    break
                except Exception as e:
                    logger.warning(f"⚠️  Failed to initialize {model_name}: {e}")
                    continue
            
            if not self.langchain_model:
                logger.error("❌ Failed to initialize any LangChain model")
                return False
            
            # Skip embeddings initialization to avoid quota issues
            # We'll use text-based search instead
            logger.info("ℹ️  Skipping embeddings initialization to avoid quota issues")
            self.embeddings = None
            
            logger.info("✅ LangChain model initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize LangChain: {e}")
            return False
    
    def _initialize_vector_store(self):
        """Initialize vector store with scraped website data using text-based search"""
        try:
            if not WEB_SCRAPING_AVAILABLE:
                logger.warning("⚠️  Vector store not available - web scraping dependencies missing")
                return False
            
            # Skip vector store initialization to avoid embedding quota issues
            # Instead, we'll store scraped content as plain text for keyword search
            logger.info("ℹ️  Using text-based knowledge base instead of vector store to avoid quota issues")
            
            # Check if knowledge base already exists
            knowledge_base_path = "startup_knowledge_base.json"
            if os.path.exists(knowledge_base_path):
                try:
                    with open(knowledge_base_path, 'r', encoding='utf-8') as f:
                        self.knowledge_base = json.load(f)
                    logger.info("✅ Loaded existing text-based knowledge base")
                    return True
                except Exception as e:
                    logger.warning(f"⚠️  Failed to load existing knowledge base: {e}")
            
            # Create new knowledge base
            logger.info("🔄 Creating new text-based knowledge base from websites...")
            documents = self._scrape_websites()
            
            if documents:
                # Store as text-based knowledge base
                self.knowledge_base = []
                for doc in documents:
                    self.knowledge_base.append({
                        'content': doc.page_content,
                        'source': doc.metadata.get('source', 'Unknown'),
                        'title': doc.metadata.get('title', 'Startup Ideas'),
                        'chunk_id': doc.metadata.get('chunk_id', 0)
                    })
                
                # Save knowledge base
                with open(knowledge_base_path, 'w', encoding='utf-8') as f:
                    json.dump(self.knowledge_base, f, ensure_ascii=False, indent=2)
                
                logger.info("✅ Text-based knowledge base created and saved successfully")
                return True
            else:
                logger.warning("⚠️  No documents scraped, knowledge base not created")
                self.knowledge_base = []
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize knowledge base: {e}")
            self.knowledge_base = []
            return False
    
    def _scrape_websites(self):
        """Scrape content from startup websites"""
        documents = []
        
        for url in self.websites:
            try:
                logger.info(f"🔄 Scraping {url}...")
                
                # Use requests and BeautifulSoup for scraping
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                response = requests.get(url, headers=headers, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style", "nav", "footer", "header"]):
                    script.decompose()
                
                # Extract text content
                text_content = soup.get_text()
                
                # Clean up the text
                lines = (line.strip() for line in text_content.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                
                if len(text) > 500:  # Only process if we got substantial content
                    # Split text into chunks
                    text_splitter = RecursiveCharacterTextSplitter(
                        chunk_size=1000,
                        chunk_overlap=200,
                        length_function=len
                    )
                    
                    chunks = text_splitter.split_text(text)
                    
                    # Create documents with metadata
                    for i, chunk in enumerate(chunks):
                        doc = Document(
                            page_content=chunk,
                            metadata={
                                "source": url,
                                "chunk_id": i,
                                "title": soup.title.string if soup.title else "Startup Ideas"
                            }
                        )
                        documents.append(doc)
                    
                    logger.info(f"✅ Scraped {len(chunks)} chunks from {url}")
                else:
                    logger.warning(f"⚠️  Insufficient content from {url}")
                    
            except Exception as e:
                logger.error(f"❌ Failed to scrape {url}: {e}")
                continue
        
        logger.info(f"📚 Total documents scraped: {len(documents)}")
        return documents
    
    def _search_knowledge_base_text(self, query, top_k=3):
        """Search knowledge base using text similarity (fallback for vector search)"""
        try:
            if not hasattr(self, 'knowledge_base') or not self.knowledge_base:
                return []
            
            query_lower = query.lower()
            scored_docs = []
            
            for doc in self.knowledge_base:
                content_lower = doc['content'].lower()
                
                # Simple keyword matching score
                score = 0
                query_words = query_lower.split()
                
                for word in query_words:
                    if len(word) > 2:  # Skip short words
                        score += content_lower.count(word)
                
                # Boost score for title matches
                title_lower = doc['title'].lower()
                for word in query_words:
                    if len(word) > 2 and word in title_lower:
                        score += 2
                
                if score > 0:
                    scored_docs.append((score, doc))
            
            # Sort by score and return top k
            scored_docs.sort(key=lambda x: x[0], reverse=True)
            return [doc for score, doc in scored_docs[:top_k]]
            
        except Exception as e:
            logger.error(f"❌ Error in text-based search: {e}")
            return []

    def _setup_retrieval_chain(self):
        """Setup retrieval chain for Q&A (modified for text-based search)"""
        try:
            # Since we're not using embeddings, we'll implement text-based retrieval
            # This method is kept for compatibility but uses text search
            logger.info("ℹ️  Using text-based retrieval instead of vector search")
            return True
                
        except Exception as e:
            logger.error(f"❌ Failed to setup retrieval chain: {e}")
            return False
    
    def get_startup_suggestions(self, user_input, user_profile=None, language='en'):
        """Get personalized startup suggestions using LangChain and text-based knowledge search"""
        try:
            # Check for greeting/initial interaction
            if self._is_greeting_or_intro(user_input):
                return self._get_quick_greeting(language)
            
            # Validate input
            if not user_input or not user_input.strip():
                return {
                    'success': False,
                    'error': 'Empty input provided',
                    'type': 'startup_suggestion'
                }
            
            # Translate input if needed
            should_translate = language != 'en' and TRANSLATION_AVAILABLE
            query_text = user_input
            if should_translate:
                try:
                    query_text = self._translate_text(user_input, language, 'en')
                except Exception:
                    query_text = user_input
                    should_translate = False
            
            # Try to use text-based knowledge search first
            knowledge_context = ""
            if hasattr(self, 'knowledge_base') and self.knowledge_base:
                try:
                    logger.info("🤖 Searching text-based knowledge base...")
                    
                    # Search knowledge base
                    relevant_docs = self._search_knowledge_base_text(query_text, top_k=3)
                    
                    if relevant_docs:
                        knowledge_context = "\n\nRelevant startup information from knowledge base:\n"
                        for i, doc in enumerate(relevant_docs, 1):
                            knowledge_context += f"\n{i}. From {doc['source']}:\n{doc['content'][:500]}...\n"
                        
                        logger.info(f"✅ Found {len(relevant_docs)} relevant documents")
                    
                except Exception as e:
                    logger.error(f"❌ Knowledge base search failed: {e}")
            
            # Use LangChain with knowledge context
            return self._get_startup_suggestions_langchain_with_context(
                user_input, query_text, knowledge_context, user_profile, language, should_translate
            )
        
        except Exception as e:
            logger.error(f"❌ Error getting startup suggestions: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'fallback_response': self._get_fallback_startup_suggestions(user_input),
                'type': 'startup_suggestion'
            }
    
    def _get_startup_suggestions_langchain_with_context(self, original_input, query_text, knowledge_context, user_profile=None, language='en', should_translate=False):
        """Get startup suggestions using LangChain with knowledge context"""
        try:
            # Check if LangChain model is available
            if not self.langchain_model:
                # Fallback to direct GenAI
                return self._get_startup_suggestions_genai(original_input, user_profile, language)
            
            # Create profile context
            profile_context = ""
            if user_profile:
                profile_context = f"""
User Background Information:
- Education: {user_profile.get('education', 'Not specified')}
- Work Experience: {user_profile.get('experience', 'Not specified')}
- Industry Interests: {user_profile.get('interests', 'Not specified')}
- Skills: {user_profile.get('skills', 'Not specified')}
- Location: {user_profile.get('location', 'Not specified')}
- Investment Budget: {user_profile.get('budget', 'Not specified')}
- Time Availability: {user_profile.get('time_commitment', 'Not specified')}
"""
            
            # Create comprehensive startup suggestion prompt with knowledge context
            system_prompt = """You are an expert startup advisor and business mentor specializing in helping women entrepreneurs. Your role is to provide personalized, practical, and actionable startup ideas based on individual backgrounds, skills, and circumstances.

Your expertise includes:
- Women-centric business opportunities
- Market analysis and validation
- Low-investment startup ideas
- Scalable business models
- Work-life balance considerations
- Online and offline business opportunities
- Social impact ventures
- Technology-enabled businesses

Provide comprehensive, encouraging, and realistic advice that empowers women to start their entrepreneurial journey."""

            human_prompt = f"""Based on the user's query, background, and relevant startup information, provide 3-5 personalized startup ideas for women entrepreneurs.

{profile_context}

User Query: {original_input}

{knowledge_context}

For each startup idea, please provide:

1. **Business Concept**: Clear description of the business idea
2. **Why It's Perfect for You**: How it matches your background/skills
3. **Target Market**: Who would be your customers
4. **Starting Requirements**: Initial investment, skills needed, time commitment
5. **Revenue Model**: How you'll make money
6. **Growth Potential**: Scalability and expansion opportunities
7. **First Steps**: Immediate actions to get started

Focus on:
- Practical and achievable ideas
- Consideration of work-life balance
- Women-centric market opportunities
- Both online and offline options
- Various investment levels (from low to medium)
- Current market trends and demands
- Use information from the knowledge base when relevant

Make the response encouraging, detailed, and actionable. Include specific examples and real-world applications."""

            try:
                logger.info("🤖 Generating startup suggestions using LangChain with knowledge context...")
                
                # Create messages
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=human_prompt)
                ]
                
                # Generate response with timeout
                result = {'response': None, 'error': None}
                
                def generate_with_timeout():
                    try:
                        response = self.langchain_model.invoke(messages)
                        if hasattr(response, 'content'):
                            result['response'] = response.content.strip()
                        else:
                            result['response'] = str(response).strip()
                    except Exception as e:
                        result['error'] = str(e)
                
                # Run with timeout (reduced for faster response)
                generation_thread = threading.Thread(target=generate_with_timeout)
                generation_thread.daemon = True
                generation_thread.start()
                generation_thread.join(timeout=20)  # Increased timeout slightly for knowledge processing
                
                if generation_thread.is_alive():
                    logger.error("❌ LangChain generation timed out")
                    return {
                        'success': False,
                        'error': 'Response generation timed out. Please try again.',
                        'fallback_response': self._get_fallback_startup_suggestions(original_input),
                        'type': 'startup_suggestion'
                    }
                
                if result['error']:
                    logger.error(f"❌ LangChain generation failed: {result['error']}")
                    return self._get_startup_suggestions_genai(original_input, user_profile, language)
                
                if result['response']:
                    response_text = result['response']
                    
                    # Store in conversation history
                    try:
                        self.conversation_history.append({
                            'user': original_input,
                            'assistant': response_text,
                            'timestamp': datetime.now().isoformat(),
                            'language': language,
                            'profile': user_profile,
                            'used_knowledge_base': bool(knowledge_context)
                        })
                    except:
                        pass
                    
                    # Translate back if needed
                    final_response = response_text
                    if should_translate:
                        try:
                            # For long responses, provide summary for translation
                            if len(response_text) > 2000:
                                summary_prompt = f"Provide a concise summary of these startup suggestions in 3-4 key points: {response_text[:1000]}"
                                try:
                                    summary_messages = [HumanMessage(content=summary_prompt)]
                                    summary_response = self.langchain_model.invoke(summary_messages)
                                    summary_text = summary_response.content if hasattr(summary_response, 'content') else str(summary_response)
                                    final_response = self._translate_text(summary_text, 'en', language)
                                except:
                                    final_response = self._translate_text(response_text[:1000], 'en', language)
                            else:
                                final_response = self._translate_text(response_text, 'en', language)
                        except:
                            final_response = response_text
                    
                    enhanced = bool(knowledge_context)
                    logger.info(f"✅ Startup suggestions generated successfully using LangChain {'with knowledge base' if enhanced else ''}")
                    return {
                        'success': True,
                        'response': final_response,
                        'type': 'startup_suggestion',
                        'enhanced': enhanced
                    }
                else:
                    return {
                        'success': False,
                        'error': 'No response generated',
                        'fallback_response': self._get_fallback_startup_suggestions(original_input),
                        'type': 'startup_suggestion'
                    }
                    
            except Exception as generation_error:
                logger.error(f"❌ LangChain generation failed: {generation_error}")
                return self._get_startup_suggestions_genai(original_input, user_profile, language)
        
        except Exception as e:
            logger.error(f"❌ Error in LangChain suggestions with context: {str(e)}")
            return self._get_startup_suggestions_genai(original_input, user_profile, language)
    
    def _get_startup_suggestions_langchain(self, user_input, user_profile=None, language='en'):
        """Get startup suggestions using regular LangChain (fallback method)"""
        try:
            # Check if LangChain model is available
            if not self.langchain_model:
                # Fallback to direct GenAI
                return self._get_startup_suggestions_genai(user_input, user_profile, language)
            
            # Create profile context
            profile_context = ""
            if user_profile:
                profile_context = f"""
User Background Information:
- Education: {user_profile.get('education', 'Not specified')}
- Work Experience: {user_profile.get('experience', 'Not specified')}
- Industry Interests: {user_profile.get('interests', 'Not specified')}
- Skills: {user_profile.get('skills', 'Not specified')}
- Location: {user_profile.get('location', 'Not specified')}
- Investment Budget: {user_profile.get('budget', 'Not specified')}
- Time Availability: {user_profile.get('time_commitment', 'Not specified')}
"""
            
            # Create comprehensive startup suggestion prompt
            system_prompt = """You are an expert startup advisor and business mentor specializing in helping women entrepreneurs. Your role is to provide personalized, practical, and actionable startup ideas based on individual backgrounds, skills, and circumstances.

Your expertise includes:
- Women-centric business opportunities
- Market analysis and validation
- Low-investment startup ideas
- Scalable business models
- Work-life balance considerations
- Online and offline business opportunities
- Social impact ventures
- Technology-enabled businesses

Provide comprehensive, encouraging, and realistic advice that empowers women to start their entrepreneurial journey."""

            human_prompt = f"""Based on the user's query and background, provide 3-5 personalized startup ideas for women entrepreneurs.

{profile_context}

User Query: {user_input}

For each startup idea, please provide:

1. **Business Concept**: Clear description of the business idea
2. **Why It's Perfect for You**: How it matches your background/skills
3. **Target Market**: Who would be your customers
4. **Starting Requirements**: Initial investment, skills needed, time commitment
5. **Revenue Model**: How you'll make money
6. **Growth Potential**: Scalability and expansion opportunities
7. **First Steps**: Immediate actions to get started

Focus on:
- Practical and achievable ideas
- Consideration of work-life balance
- Women-centric market opportunities
- Both online and offline options
- Various investment levels (from low to medium)
- Current market trends and demands

Make the response encouraging, detailed, and actionable. Include specific examples and real-world applications."""

            try:
                logger.info("🤖 Generating startup suggestions using LangChain...")
                
                # Create messages
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=human_prompt)
                ]
                
                # Generate response with timeout
                result = {'response': None, 'error': None}
                
                def generate_with_timeout():
                    try:
                        response = self.langchain_model.invoke(messages)
                        if hasattr(response, 'content'):
                            result['response'] = response.content.strip()
                        else:
                            result['response'] = str(response).strip()
                    except Exception as e:
                        result['error'] = str(e)
                
                # Run with timeout (reduced for faster response)
                generation_thread = threading.Thread(target=generate_with_timeout)
                generation_thread.daemon = True
                generation_thread.start()
                generation_thread.join(timeout=15)  # Reduced from 30 to 15 seconds
                
                if generation_thread.is_alive():
                    logger.error("❌ LangChain generation timed out")
                    return {
                        'success': False,
                        'error': 'Response generation timed out. Please try again.',
                        'fallback_response': self._get_fallback_startup_suggestions(user_input),
                        'type': 'startup_suggestion'
                    }
                
                if result['error']:
                    logger.error(f"❌ LangChain generation failed: {result['error']}")
                    return self._get_startup_suggestions_genai(user_input, user_profile, language)
                
                if result['response']:
                    response_text = result['response']
                    
                    # Store in conversation history
                    try:
                        self.conversation_history.append({
                            'user': user_input,
                            'assistant': response_text,
                            'timestamp': datetime.now().isoformat(),
                            'language': language,
                            'profile': user_profile,
                            'used_vector_store': False
                        })
                    except:
                        pass
                    
                    # Translate back if needed
                    final_response = response_text
                    if language != 'en' and TRANSLATION_AVAILABLE:
                        try:
                            # For long responses, provide summary for translation
                            if len(response_text) > 2000:
                                summary_prompt = f"Provide a concise summary of these startup suggestions in 3-4 key points: {response_text[:1000]}"
                                try:
                                    summary_messages = [HumanMessage(content=summary_prompt)]
                                    summary_response = self.langchain_model.invoke(summary_messages)
                                    summary_text = summary_response.content if hasattr(summary_response, 'content') else str(summary_response)
                                    final_response = self._translate_text(summary_text, 'en', language)
                                except:
                                    final_response = self._translate_text(response_text[:1000], 'en', language)
                            else:
                                final_response = self._translate_text(response_text, 'en', language)
                        except:
                            final_response = response_text
                    
                    logger.info("✅ Startup suggestions generated successfully using LangChain")
                    return {
                        'success': True,
                        'response': final_response,
                        'type': 'startup_suggestion'
                    }
                else:
                    return {
                        'success': False,
                        'error': 'No response generated',
                        'fallback_response': self._get_fallback_startup_suggestions(user_input),
                        'type': 'startup_suggestion'
                    }
                    
            except Exception as generation_error:
                logger.error(f"❌ LangChain generation failed: {generation_error}")
                return self._get_startup_suggestions_genai(user_input, user_profile, language)
        
        except Exception as e:
            logger.error(f"❌ Error in LangChain suggestions: {str(e)}")
            return self._get_startup_suggestions_genai(user_input, user_profile, language)
    
    def _get_startup_suggestions_genai(self, user_input, user_profile=None, language='en'):
        """Fallback method using direct GenAI"""
        try:
            if not self.model:
                return {
                    'success': False,
                    'error': 'AI model not available',
                    'fallback_response': self._get_fallback_startup_suggestions(user_input),
                    'type': 'startup_suggestion'
                }
            
            # Create profile context
            profile_context = ""
            if user_profile:
                profile_context = f"User Profile: {json.dumps(user_profile, indent=2)}\n"
            
            prompt = f"""You are an expert startup advisor for women entrepreneurs. Based on the user's query and background, provide 3-5 personalized startup ideas.

{profile_context}

User Query: {user_input}

Provide detailed startup suggestions with business concepts, target markets, starting requirements, revenue models, and first steps. Focus on women-centric opportunities and practical implementation."""
            
            response = self.model.generate_content(prompt)
            if response and response.text:
                return {
                    'success': True,
                    'response': response.text.strip(),
                    'type': 'startup_suggestion'
                }
            else:
                return {
                    'success': False,
                    'error': 'No response generated',
                    'fallback_response': self._get_fallback_startup_suggestions(user_input),
                    'type': 'startup_suggestion'
                }
                
        except Exception as e:
            logger.error(f"❌ GenAI fallback failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback_response': self._get_fallback_startup_suggestions(user_input),
                'type': 'startup_suggestion'
            }
    
    def _translate_text(self, text, source_lang, target_lang):
        """Translate text between languages"""
        try:
            if source_lang == target_lang or not TRANSLATION_AVAILABLE:
                return text
            
            if not text or len(text.strip()) < 3:
                return text
            
            # Limit translation length for performance
            if len(text) > 1500:
                return text
            
            translator = GoogleTranslator(source=source_lang, target=target_lang)
            return translator.translate(text)
            
        except Exception as e:
            logger.warning(f"Translation failed: {e}")
            return text
    
    def _get_fallback_startup_suggestions(self, user_input):
        """Provide fallback startup suggestions when AI is unavailable"""
        return """🚀 **Women Entrepreneur Startup Ideas**

Here are some popular startup ideas for women:

**1. Online Consulting/Coaching**
- Leverage your professional expertise
- Flexible schedule, work from home
- Low startup costs, high scalability

**2. E-commerce/Online Store**
- Sell products you're passionate about
- Utilize platforms like Shopify, Amazon
- Start small, scale gradually

**3. Content Creation & Digital Marketing**
- Blog, YouTube, Social Media Management
- Growing demand for digital content
- Monetize through ads, sponsorships, courses

**4. Health & Wellness Services**
- Nutrition counseling, fitness coaching
- High demand in women's health sector
- Can start as side business

**5. Educational Services/Tutoring**
- Online courses, skill development
- Flexible timing, good for work-life balance
- Growing e-learning market

**Next Steps:**
1. Identify your skills and interests
2. Research your target market
3. Start small with minimal investment
4. Build online presence
5. Network with other women entrepreneurs

Would you like more specific suggestions based on your background?"""
    
    def _is_greeting_or_intro(self, user_input):
        """Check if user input is a greeting or introduction (more specific)"""
        input_lower = user_input.lower().strip()
        
        # More specific greeting patterns that don't include business queries
        greeting_patterns = [
            'hello', 'hi', 'hey', 'hiya', 'namaste', 'namaskar',
            'good morning', 'good afternoon', 'good evening',
            'how are you', 'who are you', 'what are you',
            'what can you do', 'what do you do', 'how do you work'
        ]
        
        # Check for exact matches or very simple greetings
        if len(input_lower) <= 10 and any(greeting in input_lower for greeting in ['hi', 'hello', 'hey']):
            return True
        
        # Check for specific introduction questions
        intro_questions = [
            'what can you do', 'what do you do', 'who are you', 'what are you',
            'how do you work', 'what is this', 'how are you'
        ]
        
        return any(intro in input_lower for intro in intro_questions)
    
    def _get_quick_greeting(self, language='en'):
        """Provide quick greeting response"""
        greetings = {
            'en': """👋 **Hello! I'm your AI Startup Advisor for Women Entrepreneurs!**

🚀 **I can help you with:**
- Personalized startup ideas based on your background
- Business planning and market analysis
- Industry insights and trends
- Funding and investment guidance
- Work-life balance considerations

💡 **To get started, tell me:**
- What type of business interests you?
- Your educational background or skills
- Available time and budget
- Your location or target market

**Example questions:**
- "I'm a software engineer looking for tech startup ideas"
- "I want to start a business from home with $5000"
- "Show me health and wellness business opportunities"

What would you like to explore today? 🌟""",
            
            'hi': """नमस्ते! मैं महिला उद्यमियों के लिए आपकी AI स्टार्टअप सलाहकार हूं!

मैं आपकी सहायता कर सकती हूं:
- व्यक्तिगत स्टार्टअप आइडिया
- व्यवसाय योजना और बाजार विश्लेषण
- उद्योग की जानकारी
- फंडिंग मार्गदर्शन

आज आप क्या जानना चाहेंगी?""",
            
            'es': """¡Hola! Soy tu asesora de startups para mujeres emprendedoras.

Puedo ayudarte con ideas de negocio personalizadas, planificación empresarial y orientación sobre financiación.

¿En qué te gustaría que te ayude hoy?""",
            
            'fr': """Bonjour! Je suis votre conseillère en startups pour femmes entrepreneures.

Je peux vous aider avec des idées d'entreprise personnalisées, la planification d'affaires et les conseils de financement.

Comment puis-je vous aider aujourd'hui?"""
        }
        
        greeting_text = greetings.get(language, greetings['en'])
        
        return {
            'success': True,
            'response': greeting_text,
            'type': 'greeting',
            'quick_response': True
        }
    
    def get_supported_languages(self):
        """Get list of supported languages"""
        return [
            {'code': 'en', 'name': 'English'},
            {'code': 'hi', 'name': 'Hindi'},
            {'code': 'mr', 'name': 'Marathi'},
            {'code': 'ta', 'name': 'Tamil'},
            {'code': 'te', 'name': 'Telugu'},
            {'code': 'bn', 'name': 'Bengali'},
            {'code': 'gu', 'name': 'Gujarati'},
            {'code': 'pa', 'name': 'Punjabi'},
            {'code': 'es', 'name': 'Spanish'},
            {'code': 'fr', 'name': 'French'}
        ]
    
    def clear_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
        return {'success': True, 'message': 'Conversation cleared'}
    
    def refresh_knowledge_base(self):
        """Refresh the knowledge base by re-scraping websites"""
        try:
            logger.info("🔄 Refreshing knowledge base...")
            
            # Remove existing knowledge base file
            knowledge_base_path = "startup_knowledge_base.json"
            if os.path.exists(knowledge_base_path):
                os.remove(knowledge_base_path)
            
            # Re-initialize knowledge base
            success = self._initialize_vector_store()  # This now creates text-based knowledge base
            
            if success:
                logger.info("✅ Knowledge base refreshed successfully")
                return {
                    'success': True,
                    'message': 'Knowledge base refreshed successfully'
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to refresh knowledge base'
                }
                
        except Exception as e:
            logger.error(f"❌ Error refreshing knowledge base: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def search_knowledge_base(self, query, top_k=3):
        """Search the knowledge base for relevant information"""
        try:
            if not hasattr(self, 'knowledge_base') or not self.knowledge_base:
                return {
                    'success': False,
                    'error': 'Knowledge base not available'
                }
            
            # Use text-based search
            docs = self._search_knowledge_base_text(query, top_k)
            
            results = []
            for doc in docs:
                results.append({
                    'content': doc['content'],
                    'source': doc['source'],
                    'title': doc['title']
                })
            
            return {
                'success': True,
                'results': results
            }
            
        except Exception as e:
            logger.error(f"❌ Error searching knowledge base: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def health_check(self):
        """Check service health"""
        return {
            'success': True,
            'healthy': True,
            'services': {
                'genai_available': GENAI_AVAILABLE and self.model is not None,
                'langchain_available': LANGCHAIN_AVAILABLE and self.langchain_model is not None,
                'translation_available': TRANSLATION_AVAILABLE,
                'web_scraping_available': WEB_SCRAPING_AVAILABLE,
                'knowledge_base_available': hasattr(self, 'knowledge_base') and bool(self.knowledge_base),
                'knowledge_base_size': len(self.knowledge_base) if hasattr(self, 'knowledge_base') else 0,
                'vector_store_available': False,  # Disabled to avoid quota issues
                'retrieval_chain_available': False,  # Using text-based search instead
                'embeddings_available': False  # Disabled to avoid quota issues
            },
            'websites_scraped': len(self.websites),
            'message': 'Women Startup Assistant is operational with text-based knowledge search (quota-friendly)'
        }

chatbot = WomenStartupChatbot()

@app.route('/')
def index():
    return jsonify({
        'success': True,
        'message': 'AI for Her - Women Startup Assistant API',
        'version': '1.0',
        'endpoints': {
            'chat': '/api/chat',
            'health': '/api/health',
            'languages': '/api/languages',
            'clear': '/api/clear',
            'refresh_knowledge': '/api/refresh-knowledge',
            'search_knowledge': '/api/search-knowledge',
            'vector_store_status': '/api/vector-store-status'
        }
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        language = data.get('language', 'en')
        user_profile = data.get('profile')
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            })
        
        # Get startup suggestions
        result = chatbot.get_startup_suggestions(message, user_profile, language)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Chat API error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'fallback_response': 'I apologize, but I encountered an error. Please try again.'
        })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify(chatbot.health_check())

@app.route('/api/languages', methods=['GET'])
def languages():
    return jsonify({
        'success': True,
        'languages': chatbot.get_supported_languages()
    })

@app.route('/api/clear', methods=['POST'])
def clear_conversation():
    return jsonify(chatbot.clear_conversation())

@app.route('/api/refresh-knowledge', methods=['POST'])
def refresh_knowledge():
    """Refresh the knowledge base by re-scraping websites"""
    return jsonify(chatbot.refresh_knowledge_base())

@app.route('/api/search-knowledge', methods=['POST'])
def search_knowledge():
    """Search the knowledge base for specific information"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        top_k = data.get('top_k', 3)
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query is required'
            })
        
        result = chatbot.search_knowledge_base(query, top_k)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Search knowledge API error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        })

@app.route('/api/vector-store-status', methods=['GET'])
def vector_store_status():
    """Get knowledge base status and statistics"""
    try:
        status = {
            'knowledge_base_available': hasattr(chatbot, 'knowledge_base') and bool(chatbot.knowledge_base),
            'knowledge_base_type': 'text-based',
            'vector_store_available': False,  # Disabled to avoid quota issues
            'retrieval_chain_available': False,  # Using text-based search instead
            'websites_configured': len(chatbot.websites),
            'websites': chatbot.websites
        }
        
        if hasattr(chatbot, 'knowledge_base') and chatbot.knowledge_base:
            status['knowledge_base_size'] = len(chatbot.knowledge_base)
            # Count unique sources
            sources = set(doc['source'] for doc in chatbot.knowledge_base)
            status['sources_count'] = len(sources)
        else:
            status['knowledge_base_size'] = 0
            status['sources_count'] = 0
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Knowledge base status API error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)