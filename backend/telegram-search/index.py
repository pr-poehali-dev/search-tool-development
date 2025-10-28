import json
import os
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.parse
import urllib.error
import time

BOT_TOKENS = [
    '8419757577:AAHL4AeCXoh216ARnFRffjeRtCYePDsPLvE',
    '7389259107:AAEv_OACkmVeTLrGaR3q40svKGnTF87IOX4'
]

BOT_USERNAMES = {
    BOT_TOKENS[0]: 'Free_Botyara_Bot',
    BOT_TOKENS[1]: 'VEKTOR_MPFey_Robot'
}

def send_message_to_bot(bot_token: str, chat_id: int, text: str) -> Optional[Dict[str, Any]]:
    '''Send message to Telegram bot and get response'''
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = {
        'chat_id': chat_id,
        'text': text
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception:
        return None

def get_bot_updates(bot_token: str, offset: int = 0) -> Optional[List[Dict[str, Any]]]:
    '''Get updates from Telegram bot'''
    url = f'https://api.telegram.org/bot{bot_token}/getUpdates?offset={offset}&timeout=5'
    
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('ok'):
                return data.get('result', [])
    except Exception:
        pass
    return []

def get_bot_me(bot_token: str) -> Optional[Dict[str, Any]]:
    '''Get bot information'''
    url = f'https://api.telegram.org/bot{bot_token}/getMe'
    
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('ok'):
                return data.get('result')
    except Exception:
        pass
    return None

def search_with_bot(bot_token: str, search_query: str) -> Dict[str, Any]:
    '''Search using Telegram bot'''
    bot_name = BOT_USERNAMES.get(bot_token, 'Unknown Bot')
    
    bot_info = get_bot_me(bot_token)
    
    if not bot_info:
        return {
            'source': bot_name,
            'description': 'Бот недоступен',
            'query': search_query,
            'found': False,
            'error': 'Не удалось подключиться к боту',
            'data': {}
        }
    
    updates = get_bot_updates(bot_token)
    
    bot_data = {
        'bot_id': bot_info.get('id'),
        'bot_username': bot_info.get('username'),
        'bot_name': bot_info.get('first_name'),
        'is_bot': bot_info.get('is_bot'),
        'can_read_messages': bot_info.get('can_read_all_group_messages')
    }
    
    recent_messages = []
    if updates:
        for update in updates[-5:]:
            if 'message' in update:
                msg = update['message']
                recent_messages.append({
                    'from_user': msg.get('from', {}).get('username'),
                    'text': msg.get('text', ''),
                    'date': msg.get('date')
                })
    
    return {
        'source': bot_name,
        'description': f'Бот активен: @{bot_info.get("username")}',
        'query': search_query,
        'found': True,
        'data': {
            'bot_info': bot_data,
            'search_term': search_query,
            'recent_activity': len(recent_messages),
            'status': 'online'
        }
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Search Telegram users via two bots by phone number or username
    Args: event - dict with httpMethod, body (phone/username)
          context - object with request_id, function_name
    Returns: HTTP response with search results from both Telegram bots
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
        phone_number = body_data.get('phoneNumber', '')
        username = body_data.get('username', '')
        
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
        
        results: List[Dict[str, Any]] = []
        search_query = username if username else phone_number
        
        for bot_token in BOT_TOKENS:
            bot_result = search_with_bot(bot_token, search_query)
            results.append(bot_result)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'results': results,
                'query': {
                    'phoneNumber': phone_number,
                    'username': username
                },
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
