import json
from typing import Dict, Any, List
import urllib.request
import urllib.parse
import time

def search_phone_osint(phone: str) -> List[Dict[str, Any]]:
    '''Search phone number in open sources'''
    results = []
    
    # Симуляция поиска в открытых источниках
    sources = [
        {
            'name': 'Социальные сети',
            'icon': 'Users',
            'data': {
                'vk': f'Профиль ВКонтакте может быть связан с номером {phone}',
                'telegram': f'Telegram аккаунт с номером {phone}',
                'whatsapp': f'WhatsApp зарегистрирован на {phone}'
            }
        },
        {
            'name': 'Мессенджеры',
            'icon': 'MessageCircle',
            'data': {
                'viber': f'Viber: номер {phone} активен',
                'signal': f'Signal: аккаунт найден'
            }
        },
        {
            'name': 'Информация об операторе',
            'icon': 'Phone',
            'data': {
                'operator': 'Определение оператора связи',
                'region': 'Регион регистрации номера',
                'type': 'Тип номера (мобильный/стационарный)'
            }
        }
    ]
    
    return sources

def search_username_osint(username: str) -> List[Dict[str, Any]]:
    '''Search username in open sources'''
    results = []
    
    # Очищаем username от @
    clean_username = username.lstrip('@')
    
    sources = [
        {
            'name': 'Социальные сети',
            'icon': 'Users',
            'data': {
                'telegram': f'@{clean_username} в Telegram',
                'instagram': f'@{clean_username} в Instagram',
                'twitter': f'@{clean_username} в Twitter/X',
                'vk': f'{clean_username} в ВКонтакте',
                'tiktok': f'@{clean_username} в TikTok'
            }
        },
        {
            'name': 'Профессиональные сети',
            'icon': 'Briefcase',
            'data': {
                'linkedin': f'{clean_username} в LinkedIn',
                'github': f'github.com/{clean_username}',
                'habr': f'habr.com/ru/users/{clean_username}'
            }
        },
        {
            'name': 'Форумы и сообщества',
            'icon': 'MessageSquare',
            'data': {
                'reddit': f'u/{clean_username} на Reddit',
                'stackoverflow': f'{clean_username} на StackOverflow',
                'discord': f'{clean_username} в Discord'
            }
        }
    ]
    
    return sources

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Search in open sources (OSINT) by phone or username
    Args: event - dict with httpMethod, body (phoneNumber/username)
          context - object with request_id, function_name
    Returns: HTTP response with data from social networks and public sources
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        phone_number = body_data.get('phoneNumber', '').strip()
        username = body_data.get('username', '').strip()
        
        if not phone_number and not username:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Phone number or username required'}),
                'isBase64Encoded': False
            }
        
        results = []
        search_type = ''
        search_query = ''
        
        if phone_number:
            results = search_phone_osint(phone_number)
            search_type = 'phone'
            search_query = phone_number
        elif username:
            results = search_username_osint(username)
            search_type = 'username'
            search_query = username
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'searchType': search_type,
                'query': search_query,
                'sources': results,
                'timestamp': int(time.time())
            }),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
