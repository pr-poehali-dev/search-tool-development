import json
from typing import Dict, Any, List
import urllib.request
import urllib.parse
import time

def search_phone_osint(phone: str) -> List[Dict[str, Any]]:
    '''Search phone number in open sources'''
    # Очищаем номер для использования в URL
    clean_phone = phone.replace('+', '').replace(' ', '').replace('-', '')
    
    sources = [
        {
            'name': 'Социальные сети',
            'icon': 'Users',
            'data': {
                'VKontakte': {
                    'text': f'Поиск по номеру {phone} в ВКонтакте',
                    'url': f'https://vk.com/search?c[section]=people&c[q]={phone}'
                },
                'Telegram': {
                    'text': f'Telegram аккаунт с номером {phone}',
                    'url': f'https://t.me/{clean_phone}'
                },
                'WhatsApp': {
                    'text': f'WhatsApp чат с номером {phone}',
                    'url': f'https://wa.me/{clean_phone}'
                }
            }
        },
        {
            'name': 'Мессенджеры',
            'icon': 'MessageCircle',
            'data': {
                'Viber': {
                    'text': f'Viber: номер {phone}',
                    'url': f'viber://chat?number={clean_phone}'
                },
                'Skype': {
                    'text': f'Skype поиск по номеру',
                    'url': f'skype:{clean_phone}?call'
                }
            }
        },
        {
            'name': 'Поисковики',
            'icon': 'Search',
            'data': {
                'Google': {
                    'text': f'Поиск {phone} в Google',
                    'url': f'https://www.google.com/search?q={urllib.parse.quote(phone)}'
                },
                'Yandex': {
                    'text': f'Поиск {phone} в Яндекс',
                    'url': f'https://yandex.ru/search/?text={urllib.parse.quote(phone)}'
                }
            }
        }
    ]
    
    return sources

def search_username_osint(username: str) -> List[Dict[str, Any]]:
    '''Search username in open sources'''
    # Очищаем username от @
    clean_username = username.lstrip('@')
    
    sources = [
        {
            'name': 'Социальные сети',
            'icon': 'Users',
            'data': {
                'Telegram': {
                    'text': f'@{clean_username} в Telegram',
                    'url': f'https://t.me/{clean_username}'
                },
                'Instagram': {
                    'text': f'@{clean_username} в Instagram',
                    'url': f'https://instagram.com/{clean_username}'
                },
                'Twitter/X': {
                    'text': f'@{clean_username} в Twitter/X',
                    'url': f'https://twitter.com/{clean_username}'
                },
                'VKontakte': {
                    'text': f'{clean_username} в ВКонтакте',
                    'url': f'https://vk.com/{clean_username}'
                },
                'TikTok': {
                    'text': f'@{clean_username} в TikTok',
                    'url': f'https://tiktok.com/@{clean_username}'
                }
            }
        },
        {
            'name': 'Профессиональные сети',
            'icon': 'Briefcase',
            'data': {
                'LinkedIn': {
                    'text': f'{clean_username} в LinkedIn',
                    'url': f'https://linkedin.com/in/{clean_username}'
                },
                'GitHub': {
                    'text': f'{clean_username} на GitHub',
                    'url': f'https://github.com/{clean_username}'
                },
                'Habr': {
                    'text': f'{clean_username} на Habr',
                    'url': f'https://habr.com/ru/users/{clean_username}'
                }
            }
        },
        {
            'name': 'Форумы и сообщества',
            'icon': 'MessageSquare',
            'data': {
                'Reddit': {
                    'text': f'u/{clean_username} на Reddit',
                    'url': f'https://reddit.com/user/{clean_username}'
                },
                'StackOverflow': {
                    'text': f'{clean_username} на StackOverflow',
                    'url': f'https://stackoverflow.com/users/{clean_username}'
                },
                'YouTube': {
                    'text': f'@{clean_username} на YouTube',
                    'url': f'https://youtube.com/@{clean_username}'
                }
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